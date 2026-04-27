package knowledge

import "time"

type EntryStatus string

const (
	StatusCurated EntryStatus = "curated"
	StatusDraft   EntryStatus = "draft"
	StatusRaw     EntryStatus = "raw"
)

type EntryCategory string

const (
	CategoryConstraint EntryCategory = "constraint"
	CategoryLandmark   EntryCategory = "landmark"
	CategorySkill      EntryCategory = "skill"
)

type Entry struct {
	ID        string        `json:"id"`
	Title     string        `json:"title"`
	Status    EntryStatus   `json:"status"`
	Tags      []string      `json:"tags"`
	Content   string        `json:"content"`
	Category  EntryCategory `json:"category"`
	Severity  string        `json:"severity,omitempty"`
	CreatedAt time.Time     `json:"createdAt"`
}
