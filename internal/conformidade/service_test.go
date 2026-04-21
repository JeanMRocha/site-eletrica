package conformidade

import (
	"context"
	"errors"
	"testing"

	"github.com/JeanMRocha/site-eletrica/internal/standards"
)

func TestAssessConforme(t *testing.T) {
	service := NewService(standards.NewInMemoryService(standards.DefaultCatalog()))

	verdict, err := service.Assess(context.Background(), AssessmentInput{
		StudyID:            "ST-1",
		CircuitID:          "C1",
		CurrentProjectA:    17.3,
		ConductorMM2:       2.5,
		BreakerA:           20,
		VoltageDropPercent: 3.1,
		StandardCode:       "NBR-5410",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if verdict.Status != StatusConforme {
		t.Fatalf("expected conforme, got %s", verdict.Status)
	}

	if verdict.StandardCode != "NBR-5410" {
		t.Fatalf("expected standard code, got %s", verdict.StandardCode)
	}
}

func TestAssessNaoConformeByBreaker(t *testing.T) {
	service := NewService(standards.NewInMemoryService(standards.DefaultCatalog()))

	verdict, err := service.Assess(context.Background(), AssessmentInput{
		StudyID:            "ST-1",
		CircuitID:          "C1",
		CurrentProjectA:    17.3,
		ConductorMM2:       2.5,
		BreakerA:           10,
		VoltageDropPercent: 3.1,
		StandardCode:       "NR-10",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if verdict.Status != StatusNaoConforme {
		t.Fatalf("expected nao_conforme, got %s", verdict.Status)
	}

	if verdict.Severity != SeverityHigh {
		t.Fatalf("expected high severity, got %s", verdict.Severity)
	}
}

func TestAssessIncomplete(t *testing.T) {
	service := NewService(standards.NewInMemoryService(standards.DefaultCatalog()))

	verdict, err := service.Assess(context.Background(), AssessmentInput{
		StudyID:      "ST-1",
		CircuitID:    "C1",
		BreakerA:     20,
		StandardCode: "NBR-5410",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if verdict.Status != StatusIncompleto {
		t.Fatalf("expected incomplete, got %s", verdict.Status)
	}

	if !verdict.RequiresHumanReview {
		t.Fatalf("expected human review requirement")
	}
}

func TestAssessInvalidPayload(t *testing.T) {
	service := NewService(standards.NewInMemoryService(standards.DefaultCatalog()))

	_, err := service.Assess(context.Background(), AssessmentInput{})
	if !errors.Is(err, ErrInvalidPayload) {
		t.Fatalf("expected invalid payload error, got %v", err)
	}
}
