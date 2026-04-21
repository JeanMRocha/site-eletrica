package studies

import (
	"time"

	"github.com/JeanMRocha/site-eletrica/internal/conformidade"
)

type Study struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	City      string    `json:"city"`
	State     string    `json:"state"`
	Location  string    `json:"location"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateStudyInput struct {
	Name  string `json:"name"`
	City  string `json:"city"`
	State string `json:"state"`
}

type UpdateStudyInput struct {
	Name  string `json:"name"`
	City  string `json:"city"`
	State string `json:"state"`
}

type AssessmentRecord struct {
	ID        string                       `json:"id"`
	StudyID   string                       `json:"study_id"`
	Input     conformidade.AssessmentInput `json:"input"`
	Verdict   conformidade.Verdict         `json:"verdict"`
	CreatedAt time.Time                    `json:"created_at"`
}

type StudyDetail struct {
	Study       Study              `json:"study"`
	Assessments []AssessmentRecord `json:"assessments"`
}
