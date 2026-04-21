package standards

import (
	"sort"
	"strings"
	"sync"
)

type Store interface {
	List() []Standard
	FindByCode(code string) (Standard, bool)
}

type InMemoryStore struct {
	mu        sync.RWMutex
	standards map[string]Standard
	order     []string
}

func NewInMemoryStore(seed []Standard) *InMemoryStore {
	items := make(map[string]Standard, len(seed))
	order := make([]string, 0, len(seed))
	seen := make(map[string]struct{}, len(seed))

	for _, standard := range seed {
		code := normalizeCode(standard.Code)
		if code == "" {
			continue
		}
		if _, exists := seen[code]; exists {
			continue
		}

		standard.Code = code
		items[code] = standard
		order = append(order, code)
		seen[code] = struct{}{}
	}

	sort.Strings(order)

	return &InMemoryStore{
		standards: items,
		order:     order,
	}
}

func (s *InMemoryStore) List() []Standard {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]Standard, 0, len(s.order))
	for _, code := range s.order {
		if standard, ok := s.standards[code]; ok {
			result = append(result, standard)
		}
	}

	return result
}

func (s *InMemoryStore) FindByCode(code string) (Standard, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	standard, ok := s.standards[normalizeCode(code)]
	return standard, ok
}

func normalizeCode(code string) string {
	return strings.ToUpper(strings.TrimSpace(code))
}
