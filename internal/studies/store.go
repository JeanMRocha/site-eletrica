package studies

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/JeanMRocha/site-eletrica/internal/conformidade"
	"github.com/JeanMRocha/site-eletrica/internal/shared/id"
	_ "modernc.org/sqlite"
)

type Repository interface {
	ListStudies(ctx context.Context) ([]Study, error)
	CreateStudy(ctx context.Context, input CreateStudyInput) (Study, error)
	UpdateStudy(ctx context.Context, id string, input UpdateStudyInput) (Study, error)
	DeleteStudy(ctx context.Context, id string) error
	GetStudy(ctx context.Context, id string) (Study, error)
	ListAssessments(ctx context.Context, studyID string) ([]AssessmentRecord, error)
	SaveAssessment(ctx context.Context, record AssessmentRecord) (AssessmentRecord, error)
	UpsertStudy(ctx context.Context, study Study) error
	Close() error
}

type SQLiteStore struct {
	db *sql.DB
}

func NewSQLiteStore(path string) (*SQLiteStore, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, err
	}

	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(1)

	store := &SQLiteStore{db: db}
	if err := store.migrate(); err != nil {
		_ = db.Close()
		return nil, err
	}

	return store, nil
}

func (s *SQLiteStore) Close() error {
	return s.db.Close()
}

func (s *SQLiteStore) migrate() error {
	stmts := []string{
		`PRAGMA foreign_keys = ON;`,
		`CREATE TABLE IF NOT EXISTS studies (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			city TEXT NOT NULL DEFAULT '',
			state TEXT NOT NULL DEFAULT '',
			location TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS assessments (
			id TEXT PRIMARY KEY,
			study_id TEXT NOT NULL,
			input_json TEXT NOT NULL,
			verdict_json TEXT NOT NULL,
			status TEXT NOT NULL,
			severity TEXT NOT NULL,
			standard_code TEXT NOT NULL,
			created_at TEXT NOT NULL,
			FOREIGN KEY(study_id) REFERENCES studies(id) ON DELETE CASCADE
		);`,
		`CREATE INDEX IF NOT EXISTS idx_assessments_study_created_at ON assessments(study_id, created_at DESC);`,
		`CREATE TABLE IF NOT EXISTS sync_queue (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			action TEXT NOT NULL,
			entity_type TEXT NOT NULL,
			entity_id TEXT NOT NULL,
			payload TEXT NOT NULL,
			created_at TEXT NOT NULL
		);`,
	}

	for _, stmt := range stmts {
		if _, err := s.db.Exec(stmt); err != nil {
			return err
		}
	}

	if err := s.ensureStudyColumn("city", "TEXT NOT NULL DEFAULT ''"); err != nil {
		return err
	}
	if err := s.ensureStudyColumn("state", "TEXT NOT NULL DEFAULT ''"); err != nil {
		return err
	}
	if err := s.ensureStudyColumn("metadata", "TEXT NOT NULL DEFAULT ''"); err != nil {
		return err
	}

	if err := s.backfillStudyLocations(); err != nil {
		return err
	}

	return nil
}

func (s *SQLiteStore) ListStudies(ctx context.Context) ([]Study, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT id, name, city, state, location, metadata, created_at, updated_at
		FROM studies
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var studies []Study
	for rows.Next() {
		study, err := scanStudy(rows)
		if err != nil {
			return nil, err
		}
		studies = append(studies, study)
	}

	return studies, rows.Err()
}

func (s *SQLiteStore) CreateStudy(ctx context.Context, input CreateStudyInput) (Study, error) {
	if err := validateStudyInput(input); err != nil {
		return Study{}, err
	}

	now := time.Now().UTC()
	study := Study{
		ID:        id.Base62(8),
		Name:      strings.TrimSpace(input.Name),
		City:      strings.TrimSpace(input.City),
		State:     strings.ToUpper(strings.TrimSpace(input.State)),
		Location:  buildLocation(input.City, input.State),
		Metadata:  input.Metadata,
		CreatedAt: now,
		UpdatedAt: now,
	}

	_, err := s.db.ExecContext(ctx, `
		INSERT INTO studies (id, name, city, state, location, metadata, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, study.ID, study.Name, study.City, study.State, study.Location, study.Metadata, study.CreatedAt.Format(time.RFC3339Nano), study.UpdatedAt.Format(time.RFC3339Nano))
	if err != nil {
		return Study{}, err
	}

	return study, nil
}

func (s *SQLiteStore) UpdateStudy(ctx context.Context, id string, input UpdateStudyInput) (Study, error) {
	if err := validateStudyInput(CreateStudyInput(input)); err != nil {
		return Study{}, err
	}

	current, err := s.GetStudy(ctx, id)
	if err != nil {
		return Study{}, err
	}

	updated := Study{
		ID:        current.ID,
		Name:      strings.TrimSpace(input.Name),
		City:      strings.TrimSpace(input.City),
		State:     strings.ToUpper(strings.TrimSpace(input.State)),
		Location:  buildLocation(input.City, input.State),
		Metadata:  input.Metadata,
		CreatedAt: current.CreatedAt,
		UpdatedAt: time.Now().UTC(),
	}

	_, err = s.db.ExecContext(ctx, `
		UPDATE studies
		SET name = ?, city = ?, state = ?, location = ?, metadata = ?, updated_at = ?
		WHERE id = ?
	`, updated.Name, updated.City, updated.State, updated.Location, updated.Metadata, updated.UpdatedAt.Format(time.RFC3339Nano), id)
	if err != nil {
		return Study{}, err
	}

	return updated, nil
}

func (s *SQLiteStore) DeleteStudy(ctx context.Context, id string) error {
	result, err := s.db.ExecContext(ctx, `DELETE FROM studies WHERE id = ?`, id)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return ErrStudyNotFound
	}

	return nil
}

func (s *SQLiteStore) GetStudy(ctx context.Context, id string) (Study, error) {
	row := s.db.QueryRowContext(ctx, `
		SELECT id, name, city, state, location, metadata, created_at, updated_at
		FROM studies
		WHERE id = ?
	`, id)

	study, err := scanStudyRow(row)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Study{}, ErrStudyNotFound
		}
		return Study{}, err
	}

	return study, nil
}

func (s *SQLiteStore) ListAssessments(ctx context.Context, studyID string) ([]AssessmentRecord, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT id, study_id, input_json, verdict_json, created_at
		FROM assessments
		WHERE study_id = ?
		ORDER BY created_at DESC
	`, studyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var assessments []AssessmentRecord
	for rows.Next() {
		var (
			id, storedStudyID, inputJSON, verdictJSON, createdAt string
		)
		if err := rows.Scan(&id, &storedStudyID, &inputJSON, &verdictJSON, &createdAt); err != nil {
			return nil, err
		}

		record, err := decodeAssessment(id, storedStudyID, inputJSON, verdictJSON, createdAt)
		if err != nil {
			return nil, err
		}
		assessments = append(assessments, record)
	}

	return assessments, rows.Err()
}

func (s *SQLiteStore) SaveAssessment(ctx context.Context, record AssessmentRecord) (AssessmentRecord, error) {
	inputJSON, err := json.Marshal(record.Input)
	if err != nil {
		return AssessmentRecord{}, err
	}
	verdictJSON, err := json.Marshal(record.Verdict)
	if err != nil {
		return AssessmentRecord{}, err
	}

	if record.ID == "" {
		record.ID = id.Base62(8)
	}
	if record.CreatedAt.IsZero() {
		record.CreatedAt = time.Now().UTC()
	}

	_, err = s.db.ExecContext(ctx, `
		INSERT INTO assessments (id, study_id, input_json, verdict_json, status, severity, standard_code, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, record.ID, record.StudyID, string(inputJSON), string(verdictJSON), string(record.Verdict.Status), string(record.Verdict.Severity), record.Verdict.StandardCode, record.CreatedAt.Format(time.RFC3339Nano))
	if err != nil {
		return AssessmentRecord{}, err
	}

	return record, nil
}

func (s *SQLiteStore) UpsertStudy(ctx context.Context, study Study) error {
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO studies (id, name, city, state, location, metadata, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET
			name = excluded.name,
			city = excluded.city,
			state = excluded.state,
			location = excluded.location,
			metadata = excluded.metadata,
			updated_at = excluded.updated_at
	`, study.ID, study.Name, study.City, study.State, study.Location, study.Metadata, study.CreatedAt.Format(time.RFC3339Nano), study.UpdatedAt.Format(time.RFC3339Nano))
	return err
}

func validateStudyInput(input CreateStudyInput) error {
	if strings.TrimSpace(input.Name) == "" || strings.TrimSpace(input.City) == "" || strings.TrimSpace(input.State) == "" {
		return ErrInvalidStudyInput
	}

	return nil
}

func scanStudy(rows *sql.Rows) (Study, error) {
	var (
		id, name, city, state, location, metadata, createdAt, updatedAt string
	)
	if err := rows.Scan(&id, &name, &city, &state, &location, &metadata, &createdAt, &updatedAt); err != nil {
		return Study{}, err
	}

	return buildStudy(id, name, city, state, location, metadata, createdAt, updatedAt)
}

func scanStudyRow(row *sql.Row) (Study, error) {
	var (
		id, name, city, state, location, metadata, createdAt, updatedAt string
	)
	if err := row.Scan(&id, &name, &city, &state, &location, &metadata, &createdAt, &updatedAt); err != nil {
		return Study{}, err
	}

	return buildStudy(id, name, city, state, location, metadata, createdAt, updatedAt)
}

func buildStudy(id, name, city, state, location, metadata, createdAt, updatedAt string) (Study, error) {
	created, err := time.Parse(time.RFC3339Nano, createdAt)
	if err != nil {
		return Study{}, err
	}
	updated, err := time.Parse(time.RFC3339Nano, updatedAt)
	if err != nil {
		return Study{}, err
	}

	city = strings.TrimSpace(city)
	state = strings.ToUpper(strings.TrimSpace(state))
	if city == "" && state == "" {
		parsedCity, parsedState := splitLocation(location)
		city = parsedCity
		state = parsedState
	}

	if location == "" {
		location = buildLocation(city, state)
	}

	return Study{
		ID:        id,
		Name:      name,
		City:      city,
		State:     state,
		Location:  location,
		Metadata:  metadata,
		CreatedAt: created,
		UpdatedAt: updated,
	}, nil
}

func buildLocation(city, state string) string {
	city = strings.TrimSpace(city)
	state = strings.ToUpper(strings.TrimSpace(state))
	if city == "" && state == "" {
		return ""
	}
	if city == "" {
		return state
	}
	if state == "" {
		return city
	}
	return fmt.Sprintf("%s/%s", city, state)
}

func splitLocation(location string) (string, string) {
	location = strings.TrimSpace(location)
	if location == "" {
		return "", ""
	}

	if city, state, ok := strings.Cut(location, "/"); ok {
		return strings.TrimSpace(city), strings.ToUpper(strings.TrimSpace(state))
	}
	if city, state, ok := strings.Cut(location, " - "); ok {
		return strings.TrimSpace(city), strings.ToUpper(strings.TrimSpace(state))
	}

	return location, ""
}

func (s *SQLiteStore) ensureStudyColumn(name, definition string) error {
	rows, err := s.db.Query(`PRAGMA table_info(studies)`)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var (
			cid, notNull, pk       int
			columnName, columnType string
			defaultValue           sql.NullString
		)
		if err := rows.Scan(&cid, &columnName, &columnType, &notNull, &defaultValue, &pk); err != nil {
			return err
		}
		if columnName == name {
			return nil
		}
	}

	_, err = s.db.Exec(fmt.Sprintf(`ALTER TABLE studies ADD COLUMN %s %s`, name, definition))
	return err
}

func (s *SQLiteStore) backfillStudyLocations() error {
	rows, err := s.db.Query(`SELECT id, city, state, location FROM studies`)
	if err != nil {
		return err
	}

	type locationBackfill struct {
		id    string
		city  string
		state string
		loc   string
	}

	var backfills []locationBackfill

	for rows.Next() {
		var id, city, state, location string
		if err := rows.Scan(&id, &city, &state, &location); err != nil {
			_ = rows.Close()
			return err
		}
		if strings.TrimSpace(city) != "" && strings.TrimSpace(state) != "" {
			continue
		}

		parsedCity, parsedState := splitLocation(location)
		if parsedCity == "" && parsedState == "" {
			continue
		}

		backfills = append(backfills, locationBackfill{
			id:    id,
			city:  parsedCity,
			state: parsedState,
			loc:   buildLocation(parsedCity, parsedState),
		})
	}

	if err := rows.Close(); err != nil {
		return err
	}
	if err := rows.Err(); err != nil {
		return err
	}

	for _, backfill := range backfills {
		if _, err := s.db.Exec(`UPDATE studies SET city = COALESCE(NULLIF(city, ''), ?), state = COALESCE(NULLIF(state, ''), ?), location = COALESCE(NULLIF(location, ''), ?) WHERE id = ?`, backfill.city, backfill.state, backfill.loc, backfill.id); err != nil {
			return err
		}
	}

	return nil
}

func decodeAssessment(id, studyID, inputJSON, verdictJSON, createdAt string) (AssessmentRecord, error) {
	var input conformidade.AssessmentInput
	if err := json.Unmarshal([]byte(inputJSON), &input); err != nil {
		return AssessmentRecord{}, err
	}

	var verdict conformidade.Verdict
	if err := json.Unmarshal([]byte(verdictJSON), &verdict); err != nil {
		return AssessmentRecord{}, err
	}

	created, err := time.Parse(time.RFC3339Nano, createdAt)
	if err != nil {
		return AssessmentRecord{}, err
	}

	return AssessmentRecord{
		ID:        id,
		StudyID:   studyID,
		Input:     input,
		Verdict:   verdict,
		CreatedAt: created,
	}, nil
}
