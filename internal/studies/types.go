package studies

import (
	"time"

	"github.com/JeanMRocha/site-eletrica/internal/conformidade"
)

type Study struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	ClientName  string    `json:"client_name"`
	Location    string    `json:"location"`
	ProjectType string    `json:"project_type"`
	Voltage     string    `json:"voltage"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateStudyInput struct {
	Name        string
	ClientName  string
	Location    string
	ProjectType string
	Voltage     string
}

type AssessmentRecord struct {
	ID        string                       `json:"id"`
	StudyID   string                       `json:"study_id"`
	Input     conformidade.AssessmentInput `json:"input"`
	Verdict   conformidade.Verdict         `json:"verdict"`
	CreatedAt time.Time                    `json:"created_at"`
}

type StudyDetail struct {
	Study       Study
	Assessments []AssessmentRecord
}
