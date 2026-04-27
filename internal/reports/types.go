package reports

import (
	"time"
)

type ReportType string

const (
	ReportConformity ReportType = "CONFORMIDADE"
	ReportMaterials  ReportType = "MATERIAIS"
	ReportTechnical  ReportType = "TECNICO"
)

type Report struct {
	ID        string    `json:"id"`
	ProjectID string    `json:"project_id"`
	Type      ReportType `json:"type"`
	URL       string    `json:"url"`
	CreatedAt time.Time `json:"created_at"`
}

type GenerateReportInput struct {
	ProjectID string     `json:"project_id"`
	Type      ReportType `json:"type"`
}
