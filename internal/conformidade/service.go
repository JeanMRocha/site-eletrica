package conformidade

import (
	"context"
	"fmt"
	"strings"

	"github.com/JeanMRocha/site-eletrica/internal/standards"
)

type StandardLookup interface {
	Find(context.Context, string) (standards.Standard, error)
}

type Service struct {
	standards StandardLookup
}

func NewService(standards StandardLookup) *Service {
	return &Service{standards: standards}
}

func (s *Service) Assess(ctx context.Context, input AssessmentInput) (Verdict, error) {
	if err := validateInput(input); err != nil {
		return Verdict{}, err
	}

	standardCode := normalizeCode(input.StandardCode)
	if standardCode == "" {
		standardCode = "NBR-5410"
	}

	standard, err := s.standards.Find(ctx, standardCode)
	if err != nil {
		return Verdict{}, ErrStandardResolution
	}

	verdict := Verdict{
		StudyID:           input.StudyID,
		CircuitID:         input.CircuitID,
		StandardCode:      standard.Code,
		StandardName:      standard.SourceName,
		StandardVersion:   chooseVersion(input.StandardVersion, standard.Version),
		StandardHierarchy: standard.HierarchyWeight,
	}

	rules := make([]AssessmentRule, 0, 3)
	messages := make([]string, 0, 3)

	if input.BreakerA < input.CurrentProjectA {
		rules = append(rules, AssessmentRule{
			RuleID:          "PROT_DISJ_001",
			OriginType:      standard.SourceType,
			OriginName:      standard.SourceName,
			HierarchyWeight: standard.HierarchyWeight,
			ConflictType:    "seguranca",
			Severity:        SeverityHigh,
			Message:         fmt.Sprintf("Disjuntor de %.1f A insuficiente para corrente de projeto de %.1f A.", input.BreakerA, input.CurrentProjectA),
		})
		messages = append(messages, fmt.Sprintf("Disjuntor de %.1f A insuficiente para corrente de projeto de %.1f A.", input.BreakerA, input.CurrentProjectA))
		verdict.Status = StatusNaoConforme
		verdict.Severity = SeverityHigh
	}

	if input.VoltageDropPercent > 4.0 {
		rules = append(rules, AssessmentRule{
			RuleID:          "QT_TEN_001",
			OriginType:      standard.SourceType,
			OriginName:      standard.SourceName,
			HierarchyWeight: standard.HierarchyWeight,
			ConflictType:    "dimensionamento",
			Severity:        SeverityMedium,
			Message:         fmt.Sprintf("Queda de tensão de %.1f%% acima do limite preliminar de 4.0%%.", input.VoltageDropPercent),
		})
		messages = append(messages, fmt.Sprintf("Queda de tensão de %.1f%% acima do limite preliminar de 4.0%%.", input.VoltageDropPercent))
		if verdict.Status == "" {
			verdict.Status = StatusNaoConforme
			verdict.Severity = SeverityMedium
		} else if verdict.Severity == SeverityNone {
			verdict.Severity = SeverityMedium
		}
	}

	if input.ConductorMM2 <= 0 {
		rules = append(rules, AssessmentRule{
			RuleID:          "COND_SEC_001",
			OriginType:      standard.SourceType,
			OriginName:      standard.SourceName,
			HierarchyWeight: standard.HierarchyWeight,
			ConflictType:    "dimensionamento",
			Severity:        SeverityHigh,
			Message:         "Seção do condutor não informada.",
		})
		messages = append(messages, "Seção do condutor não informada.")
		verdict.Status = StatusIncompleto
		verdict.Severity = SeverityHigh
	}

	if verdict.Status == "" {
		verdict.Status = StatusConforme
		verdict.Severity = SeverityNone
		messages = append(messages, "Resultado preliminar conforme para os dados informados.")
		rules = append(rules, AssessmentRule{
			RuleID:          "CONF_BASE_001",
			OriginType:      standard.SourceType,
			OriginName:      standard.SourceName,
			HierarchyWeight: standard.HierarchyWeight,
			ConflictType:    "seguranca",
			Severity:        SeverityNone,
			Message:         "Resultado preliminar conforme para os dados informados.",
		})
	}

	verdict.RulesApplied = rules
	verdict.Messages = messages
	verdict.RequiresHumanReview = verdict.Status == StatusIncompleto || verdict.Status == StatusRevisaoHumana

	return verdict, nil
}

func validateInput(input AssessmentInput) error {
	if strings.TrimSpace(input.StudyID) == "" || strings.TrimSpace(input.CircuitID) == "" {
		return ErrInvalidPayload
	}

	if input.CurrentProjectA < 0 || input.BreakerA < 0 || input.ConductorMM2 < 0 || input.VoltageDropPercent < 0 {
		return ErrInvalidPayload
	}

	return nil
}

func chooseVersion(preferred, fallback string) string {
	if strings.TrimSpace(preferred) != "" {
		return preferred
	}

	return fallback
}

func normalizeCode(code string) string {
	return strings.ToUpper(strings.TrimSpace(code))
}
