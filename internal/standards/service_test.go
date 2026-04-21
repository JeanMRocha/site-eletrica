package standards

import (
	"context"
	"errors"
	"testing"
)

func TestCatalogListsSeededStandards(t *testing.T) {
	service := NewInMemoryService(DefaultCatalog())

	catalog := service.Catalog(context.Background())

	if len(catalog.Standards) == 0 {
		t.Fatalf("expected standards to be seeded")
	}

	if catalog.Standards[0].Code != "LEI-5194-1966" {
		t.Fatalf("expected list to be sorted by code, got %s", catalog.Standards[0].Code)
	}
}

func TestFindStandardByCode(t *testing.T) {
	service := NewInMemoryService(DefaultCatalog())

	standard, err := service.Find(context.Background(), "nbr-5410")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if standard.Code != "NBR-5410" {
		t.Fatalf("expected normalized code, got %s", standard.Code)
	}
}

func TestFindStandardNotFound(t *testing.T) {
	service := NewInMemoryService(DefaultCatalog())

	_, err := service.Find(context.Background(), "UNKNOWN")
	if !errors.Is(err, ErrStandardNotFound) {
		t.Fatalf("expected not found error, got %v", err)
	}
}

func TestHierarchyOrdersByWeight(t *testing.T) {
	service := NewInMemoryService(DefaultCatalog())

	hierarchy := service.Hierarchy(context.Background())

	if len(hierarchy) == 0 {
		t.Fatalf("expected hierarchy entries")
	}

	if hierarchy[0].ID != "constitution" || hierarchy[0].Weight != 100 {
		t.Fatalf("expected constitution to lead hierarchy, got %+v", hierarchy[0])
	}
}

func TestResolvePrefersHigherHierarchy(t *testing.T) {
	service := NewInMemoryService(DefaultCatalog())

	winner := service.Resolve(context.Background(),
		NormRule{
			RuleID:       "ABNT_001",
			OriginType:   SourceTypeNormative,
			OriginName:   "ABNT NBR 5410",
			ConflictType: "seguranca",
		},
		NormRule{
			RuleID:       "NR_001",
			OriginType:   SourceTypeRegulation,
			OriginName:   "NR-10",
			ConflictType: "seguranca",
		},
	)

	if winner.RuleID != "NR_001" {
		t.Fatalf("expected NR rule to win, got %s", winner.RuleID)
	}

	if winner.HierarchyWeight != 70 {
		t.Fatalf("expected normalized hierarchy weight 70, got %d", winner.HierarchyWeight)
	}
}
