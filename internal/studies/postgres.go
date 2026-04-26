package studies

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"time"

	"github.com/JeanMRocha/site-eletrica/internal/shared/id"
	_ "github.com/lib/pq"
)

type PostgresStore struct {
	db *sql.DB
}

func NewPostgresStore(connStr string) (*PostgresStore, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	store := &PostgresStore{db: db}
	if err := store.migrate(); err != nil {
		_ = db.Close()
		return nil, err
	}

	return store, nil
}

func (s *PostgresStore) Close() error {
	return s.db.Close()
}

func (s *PostgresStore) migrate() error {
	stmts := []string{
		`CREATE TABLE IF NOT EXISTS studies (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			city TEXT NOT NULL DEFAULT '',
			state TEXT NOT NULL DEFAULT '',
			location TEXT NOT NULL DEFAULT '',
			created_at TIMESTAMP WITH TIME ZONE NOT NULL,
			updated_at TIMESTAMP WITH TIME ZONE NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS assessments (
			id TEXT PRIMARY KEY,
			study_id TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
			input_json JSONB NOT NULL,
			verdict_json JSONB NOT NULL,
			status TEXT NOT NULL,
			severity TEXT NOT NULL,
			standard_code TEXT NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE NOT NULL
		);`,
		`CREATE INDEX IF NOT EXISTS idx_assessments_study_created_at ON assessments(study_id, created_at DESC);`,
	}

	for _, stmt := range stmts {
		if _, err := s.db.Exec(stmt); err != nil {
			return err
		}
	}

	return nil
}

func (s *PostgresStore) ListStudies(ctx context.Context) ([]Study, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT id, name, city, state, location, created_at, updated_at
		FROM studies
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var studies []Study
	for rows.Next() {
		var study Study
		if err := rows.Scan(&study.ID, &study.Name, &study.City, &study.State, &study.Location, &study.CreatedAt, &study.UpdatedAt); err != nil {
			return nil, err
		}
		studies = append(studies, study)
	}

	return studies, rows.Err()
}

func (s *PostgresStore) CreateStudy(ctx context.Context, input CreateStudyInput) (Study, error) {
	if err := validateStudyInput(input); err != nil {
		return Study{}, err
	}

	now := time.Now().UTC()
	study := Study{
		ID:        id.Base62(8),
		Name:      input.Name,
		City:      input.City,
		State:     input.State,
		Location:  buildLocation(input.City, input.State),
		CreatedAt: now,
		UpdatedAt: now,
	}

	_, err := s.db.ExecContext(ctx, `
		INSERT INTO studies (id, name, city, state, location, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, study.ID, study.Name, study.City, study.State, study.Location, study.CreatedAt, study.UpdatedAt)
	if err != nil {
		return Study{}, err
	}

	return study, nil
}

func (s *PostgresStore) UpdateStudy(ctx context.Context, id string, input UpdateStudyInput) (Study, error) {
	current, err := s.GetStudy(ctx, id)
	if err != nil {
		return Study{}, err
	}

	updated := Study{
		ID:        current.ID,
		Name:      input.Name,
		City:      input.City,
		State:     input.State,
		Location:  buildLocation(input.City, input.State),
		CreatedAt: current.CreatedAt,
		UpdatedAt: time.Now().UTC(),
	}

	_, err = s.db.ExecContext(ctx, `
		UPDATE studies
		SET name = $1, city = $2, state = $3, location = $4, updated_at = $5
		WHERE id = $6
	`, updated.Name, updated.City, updated.State, updated.Location, updated.UpdatedAt, id)
	if err != nil {
		return Study{}, err
	}

	return updated, nil
}

func (s *PostgresStore) DeleteStudy(ctx context.Context, id string) error {
	result, err := s.db.ExecContext(ctx, `DELETE FROM studies WHERE id = $1`, id)
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

func (s *PostgresStore) GetStudy(ctx context.Context, id string) (Study, error) {
	var study Study
	err := s.db.QueryRowContext(ctx, `
		SELECT id, name, city, state, location, created_at, updated_at
		FROM studies
		WHERE id = $1
	`, id).Scan(&study.ID, &study.Name, &study.City, &study.State, &study.Location, &study.CreatedAt, &study.UpdatedAt)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Study{}, ErrStudyNotFound
		}
		return Study{}, err
	}

	return study, nil
}

func (s *PostgresStore) ListAssessments(ctx context.Context, studyID string) ([]AssessmentRecord, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT id, study_id, input_json, verdict_json, created_at
		FROM assessments
		WHERE study_id = $1
		ORDER BY created_at DESC
	`, studyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var assessments []AssessmentRecord
	for rows.Next() {
		var (
			record                             AssessmentRecord
			inputBytes, verdictBytes           []byte
		)
		if err := rows.Scan(&record.ID, &record.StudyID, &inputBytes, &verdictBytes, &record.CreatedAt); err != nil {
			return nil, err
		}

		if err := json.Unmarshal(inputBytes, &record.Input); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(verdictBytes, &record.Verdict); err != nil {
			return nil, err
		}

		assessments = append(assessments, record)
	}

	return assessments, rows.Err()
}

func (s *PostgresStore) SaveAssessment(ctx context.Context, record AssessmentRecord) (AssessmentRecord, error) {
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
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, record.ID, record.StudyID, inputJSON, verdictJSON, string(record.Verdict.Status), string(record.Verdict.Severity), record.Verdict.StandardCode, record.CreatedAt)
	if err != nil {
		return AssessmentRecord{}, err
	}

	return record, nil
}

func (s *PostgresStore) UpsertStudy(ctx context.Context, study Study) error {
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO studies (id, name, city, state, location, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT(id) DO UPDATE SET
			name = EXCLUDED.name,
			city = EXCLUDED.city,
			state = EXCLUDED.state,
			location = EXCLUDED.location,
			updated_at = EXCLUDED.updated_at
	`, study.ID, study.Name, study.City, study.State, study.Location, study.CreatedAt, study.UpdatedAt)
	return err
}
