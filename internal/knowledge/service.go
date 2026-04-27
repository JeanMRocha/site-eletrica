package knowledge

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type Service struct {
	basePath string
}

func NewService(basePath string) *Service {
	return &Service{basePath: basePath}
}

func (s *Service) ListEntries() ([]Entry, error) {
	var entries []Entry

	categories := []EntryCategory{CategoryConstraint, CategoryLandmark, CategorySkill}
	for _, cat := range categories {
		dir := filepath.Join(s.basePath, fmt.Sprintf("%ss", cat))
		files, err := os.ReadDir(dir)
		if err != nil {
			if os.IsNotExist(err) {
				continue
			}
			return nil, fmt.Errorf("read dir %s: %w", dir, err)
		}

		for _, f := range files {
			if f.IsDir() || filepath.Ext(f.Name()) != ".json" {
				continue
			}

			path := filepath.Join(dir, f.Name())
			data, err := os.ReadFile(path)
			if err != nil {
				return nil, fmt.Errorf("read file %s: %w", path, err)
			}

			var entry Entry
			if err := json.Unmarshal(data, &entry); err != nil {
				return nil, fmt.Errorf("unmarshal entry %s: %w", path, err)
			}
			entry.Category = cat
			entries = append(entries, entry)
		}
	}

	return entries, nil
}
