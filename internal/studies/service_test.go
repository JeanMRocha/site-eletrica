package studies

import (
	"context"
	"testing"

	"github.com/JeanMRocha/site-eletrica/internal/conformidade"
	"github.com/JeanMRocha/site-eletrica/internal/standards"
)

func TestStudyLifecycleWithAssessment(t *testing.T) {
	store := newTestStore(t)
	defer func() { _ = store.Close() }()

	service := NewService(store, conformidade.NewService(standards.NewInMemoryService(standards.DefaultCatalog())))

	study, err := service.CreateStudy(context.Background(), CreateStudyInput{
		Name:  "Cliente teste",
		City:  "Campinas",
		State: "SP",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	studiesList, err := service.ListStudies(context.Background())
	if err != nil {
		t.Fatalf("unexpected list error: %v", err)
	}

	if len(studiesList) != 1 {
		t.Fatalf("expected 1 study, got %d", len(studiesList))
	}

	record, err := service.AssessStudy(context.Background(), study.ID, conformidade.AssessmentInput{
		CircuitID:          "C1",
		CurrentProjectA:    17.3,
		ConductorMM2:       2.5,
		BreakerA:           20,
		VoltageDropPercent: 3.1,
		StandardCode:       "NBR-5410",
	})
	if err != nil {
		t.Fatalf("unexpected assessment error: %v", err)
	}

	if record.Verdict.Status != conformidade.StatusConforme {
		t.Fatalf("expected conforme verdict, got %s", record.Verdict.Status)
	}

	detail, err := service.GetStudy(context.Background(), study.ID)
	if err != nil {
		t.Fatalf("unexpected detail error: %v", err)
	}

	if len(detail.Assessments) != 1 {
		t.Fatalf("expected 1 assessment, got %d", len(detail.Assessments))
	}
}

func TestStudyCrud(t *testing.T) {
	store := newTestStore(t)
	defer func() { _ = store.Close() }()

	service := NewService(store, conformidade.NewService(standards.NewInMemoryService(standards.DefaultCatalog())))

	study, err := service.CreateStudy(context.Background(), CreateStudyInput{
		Name:  "Cliente Alfa",
		City:  "Sorocaba",
		State: "SP",
	})
	if err != nil {
		t.Fatalf("create: %v", err)
	}

	updated, err := service.UpdateStudy(context.Background(), study.ID, UpdateStudyInput{
		Name:  "Cliente Beta",
		City:  "Campinas",
		State: "SP",
	})
	if err != nil {
		t.Fatalf("update: %v", err)
	}

	if updated.Name != "Cliente Beta" || updated.City != "Campinas" || updated.State != "SP" {
		t.Fatalf("unexpected updated study: %+v", updated)
	}

	if err := service.DeleteStudy(context.Background(), study.ID); err != nil {
		t.Fatalf("delete: %v", err)
	}

	if _, err := service.GetStudy(context.Background(), study.ID); err == nil {
		t.Fatal("expected not found after delete")
	}
}

func newTestStore(t *testing.T) Repository {
	t.Helper()

	store, err := NewSQLiteStore(t.TempDir() + "/studies.db")
	if err != nil {
		t.Fatalf("new store: %v", err)
	}

	return store
}
