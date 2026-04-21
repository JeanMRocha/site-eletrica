package conformidade

import "github.com/JeanMRocha/site-eletrica/internal/standards"

type Status string

const (
	StatusConforme      Status = "conforme"
	StatusNaoConforme   Status = "nao_conforme"
	StatusIncompleto    Status = "incompleto"
	StatusRevisaoHumana Status = "revisao_humana"
)

type Severity string

const (
	SeverityNone   Severity = "none"
	SeverityLow    Severity = "low"
	SeverityMedium Severity = "medium"
	SeverityHigh   Severity = "high"
)

type AssessmentInput struct {
	StudyID            string  `json:"study_id"`
	CircuitID          string  `json:"circuit_id"`
	CurrentProjectA    float64 `json:"current_project_a"`
	ConductorMM2       float64 `json:"conductor_mm2"`
	BreakerA           float64 `json:"breaker_a"`
	VoltageDropPercent float64 `json:"voltage_drop_percent"`
	InstallationMethod string  `json:"installation_method"`
	EnvironmentType    string  `json:"environment_type"`
	StandardCode       string  `json:"standard_code"`
	StandardVersion    string  `json:"standard_version,omitempty"`
}

type AssessmentRule struct {
	RuleID          string               `json:"rule_id"`
	OriginType      standards.SourceType `json:"origin_type"`
	OriginName      string               `json:"origin_name"`
	HierarchyWeight int                  `json:"hierarchy_weight"`
	ConflictType    string               `json:"type_conflict,omitempty"`
	Severity        Severity             `json:"severity"`
	Message         string               `json:"message"`
}

type Verdict struct {
	StudyID             string           `json:"study_id"`
	CircuitID           string           `json:"circuit_id"`
	Status              Status           `json:"status"`
	Severity            Severity         `json:"severity"`
	StandardCode        string           `json:"standard_code"`
	StandardName        string           `json:"standard_name"`
	StandardVersion     string           `json:"standard_version"`
	StandardHierarchy   int              `json:"standard_hierarchy"`
	RulesApplied        []AssessmentRule `json:"rules_applied"`
	Messages            []string         `json:"messages"`
	RequiresHumanReview bool             `json:"requires_human_review"`
}
