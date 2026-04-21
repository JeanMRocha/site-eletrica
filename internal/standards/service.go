package standards

import (
	"context"
)

type Service struct {
	store Store
}

func NewInMemoryService(seed []Standard) *Service {
	return &Service{
		store: NewInMemoryStore(seed),
	}
}

func (s *Service) Catalog(_ context.Context) Catalog {
	return Catalog{Standards: s.store.List()}
}

func (s *Service) Find(_ context.Context, code string) (Standard, error) {
	standard, ok := s.store.FindByCode(code)
	if !ok {
		return Standard{}, ErrStandardNotFound
	}

	return standard, nil
}

func (s *Service) Hierarchy(_ context.Context) []HierarchyLevel {
	return append([]HierarchyLevel(nil), DefaultHierarchy...)
}

func (s *Service) Resolve(_ context.Context, a, b NormRule) NormRule {
	left := NormalizeRule(a)
	right := NormalizeRule(b)
	return ResolveByHierarchy(left, right)
}
