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
	_ "modernc.org/sqlite"
)

type Store struct {
	db *sql.DB
}

func NewSQLiteStore(path string) (*Store, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, err
	}

	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(1)

	store := &Store{db: db}
	if err := store.migrate(); err != nil {
		_ = db.Close()
		return nil, err
	}

	return store, nil
}

func (s *Store) Close() error {
	return s.db.Close()
}

func (s *Store) migrate() error {
	stmts := []string{
		`PRAGMA foreign_keys = ON;`,
		`CREATE TABLE IF NOT EXISTS studies (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			client_name TEXT NOT NULL,
			location TEXT NOT NULL,
			project_type TEXT NOT NULL,
			voltage TEXT NOT NULL,
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
	}

	for _, stmt := range stmts {
		if _, err := s.db.Exec(stmt); err != nil {
			return err
		}
	}

	return nil
}

func (s *Store) ListStudies(ctx context.Context) ([]Study, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT id, name, client_name, location, project_type, voltage, created_at, updated_at
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

func (s *Store) CreateStudy(ctx context.Context, input CreateStudyInput) (Study, error) {
	if err := validateStudyInput(input); err != nil {
		return Study{}, err
	}

	now := time.Now().UTC()
	study := Study{
		ID:          randomID("stu"),
		Name:        strings.TrimSpace(input.Name),
		ClientName:  strings.TrimSpace(input.ClientName),
		Location:    strings.TrimSpace(input.Location),
		ProjectType: strings.TrimSpace(input.ProjectType),
		Voltage:     strings.TrimSpace(input.Voltage),
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	_, err := s.db.ExecContext(ctx, `
		INSERT INTO studies (id, name, client_name, location, project_type, voltage, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, study.ID, study.Name, study.ClientName, study.Location, study.ProjectType, study.Voltage, study.CreatedAt.Format(time.RFC3339Nano), study.UpdatedAt.Format(time.RFC3339Nano))
	if err != nil {
		return Study{}, err
	}

	return study, nil
}

func (s *Store) GetStudy(ctx context.Context, id string) (Study, error) {
	row := s.db.QueryRowContext(ctx, `
		SELECT id, name, client_name, location, project_type, voltage, created_at, updated_at
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

func (s *Store) ListAssessments(ctx context.Context, studyID string) ([]AssessmentRecord, error) {
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

func (s *Store) SaveAssessment(ctx context.Context, record AssessmentRecord) (AssessmentRecord, error) {
	inputJSON, err := json.Marshal(record.Input)
	if err != nil {
		return AssessmentRecord{}, err
	}
	verdictJSON, err := json.Marshal(record.Verdict)
	if err != nil {
		return AssessmentRecord{}, err
	}

	if record.ID == "" {
		record.ID = randomID("ass")
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

func validateStudyInput(input CreateStudyInput) error {
	if strings.TrimSpace(input.Name) == "" || strings.TrimSpace(input.ClientName) == "" || strings.TrimSpace(input.Location) == "" {
		return ErrInvalidStudyInput
	}

	return nil
}

func scanStudy(rows *sql.Rows) (Study, error) {
	var (
		id, name, clientName, location, projectType, voltage, createdAt, updatedAt string
	)
	if err := rows.Scan(&id, &name, &clientName, &location, &projectType, &voltage, &createdAt, &updatedAt); err != nil {
		return Study{}, err
	}

	return buildStudy(id, name, clientName, location, projectType, voltage, createdAt, updatedAt)
}

func scanStudyRow(row *sql.Row) (Study, error) {
	var (
		id, name, clientName, location, projectType, voltage, createdAt, updatedAt string
	)
	if err := row.Scan(&id, &name, &clientName, &location, &projectType, &voltage, &createdAt, &updatedAt); err != nil {
		return Study{}, err
	}

	return buildStudy(id, name, clientName, location, projectType, voltage, createdAt, updatedAt)
}

func buildStudy(id, name, clientName, location, projectType, voltage, createdAt, updatedAt string) (Study, error) {
	created, err := time.Parse(time.RFC3339Nano, createdAt)
	if err != nil {
		return Study{}, err
	}
	updated, err := time.Parse(time.RFC3339Nano, updatedAt)
	if err != nil {
		return Study{}, err
	}

	return Study{
		ID:          id,
		Name:        name,
		ClientName:  clientName,
		Location:    location,
		ProjectType: projectType,
		Voltage:     voltage,
		CreatedAt:   created,
		UpdatedAt:   updated,
	}, nil
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

func randomID(prefix string) string {
	now := time.Now().UTC().UnixNano()
	return fmt.Sprintf("%s_%d", prefix, now)
}
