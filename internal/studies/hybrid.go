package studies

import (
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"
)

type HybridStore struct {
	local  *SQLiteStore
	remote Repository // Can be nil if truly offline
	cache  sync.Map   // Simple cache: id -> Study
	mu     sync.RWMutex
	online bool
}

func NewHybridStore(local *SQLiteStore, remote Repository) *HybridStore {
	h := &HybridStore{
		local:  local,
		remote: remote,
		online: remote != nil,
	}

	go h.syncLoop()
	return h
}

func (h *HybridStore) Close() error {
	if h.remote != nil {
		_ = h.remote.Close()
	}
	return h.local.Close()
}

func (h *HybridStore) ListStudies(ctx context.Context) ([]Study, error) {
	// Always try local first for speed, or merge? 
	// For simplicity, let's trust local as the source of truth for the client.
	return h.local.ListStudies(ctx)
}

func (h *HybridStore) CreateStudy(ctx context.Context, input CreateStudyInput) (Study, error) {
	study, err := h.local.CreateStudy(ctx, input)
	if err != nil {
		return Study{}, err
	}

	h.cache.Store(study.ID, study)
	h.enqueue(ctx, "CREATE", "study", study.ID, study)

	return study, nil
}

func (h *HybridStore) UpdateStudy(ctx context.Context, id string, input UpdateStudyInput) (Study, error) {
	study, err := h.local.UpdateStudy(ctx, id, input)
	if err != nil {
		return Study{}, err
	}

	h.cache.Store(study.ID, study)
	h.enqueue(ctx, "UPDATE", "study", study.ID, study)

	return study, nil
}

func (h *HybridStore) DeleteStudy(ctx context.Context, id string) error {
	if err := h.local.DeleteStudy(ctx, id); err != nil {
		return err
	}

	h.cache.Delete(id)
	h.enqueue(ctx, "DELETE", "study", id, nil)

	return nil
}

func (h *HybridStore) GetStudy(ctx context.Context, id string) (Study, error) {
	if val, ok := h.cache.Load(id); ok {
		return val.(Study), nil
	}

	study, err := h.local.GetStudy(ctx, id)
	if err == nil {
		h.cache.Store(id, study)
	}
	return study, err
}

func (h *HybridStore) UpsertStudy(ctx context.Context, study Study) error {
	if err := h.local.UpsertStudy(ctx, study); err != nil {
		return err
	}

	h.cache.Store(study.ID, study)
	h.enqueue(ctx, "UPDATE", "study", study.ID, study)

	return nil
}

func (h *HybridStore) ListAssessments(ctx context.Context, studyID string) ([]AssessmentRecord, error) {
	return h.local.ListAssessments(ctx, studyID)
}

func (h *HybridStore) SaveAssessment(ctx context.Context, record AssessmentRecord) (AssessmentRecord, error) {
	saved, err := h.local.SaveAssessment(ctx, record)
	if err != nil {
		return AssessmentRecord{}, err
	}

	h.enqueue(ctx, "SAVE", "assessment", saved.ID, saved)
	return saved, nil
}

// Queue management

type syncItem struct {
	ID         int
	Action     string
	EntityType string
	EntityID   string
	Payload    string
}

func (h *HybridStore) enqueue(ctx context.Context, action, entityType, entityID string, payload interface{}) {
	data, _ := json.Marshal(payload)
	_, err := h.local.db.ExecContext(ctx, `
		INSERT INTO sync_queue (action, entity_type, entity_id, payload, created_at)
		VALUES (?, ?, ?, ?, ?)
	`, action, entityType, entityID, string(data), time.Now().Format(time.RFC3339))
	if err != nil {
		log.Printf("failed to enqueue sync item: %v", err)
	}
}

func (h *HybridStore) syncLoop() {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		if h.remote == nil {
			continue
		}

		if err := h.processQueue(); err != nil {
			if h.online {
				log.Printf("sync error (push): %v (switching to offline mode)", err)
				h.online = false
			}
		} else {
			if !h.online {
				log.Printf("sync restored (online mode)")
				h.online = true
			}
			
			// Try to pull remote updates if online
			if err := h.pullFromRemote(); err != nil {
				log.Printf("sync error (pull): %v", err)
			}
		}
	}
}

func (h *HybridStore) pullFromRemote() error {
	ctx := context.Background()
	remoteStudies, err := h.remote.ListStudies(ctx)
	if err != nil {
		return err
	}

	for _, rs := range remoteStudies {
		// Simple strategy: If remote is newer, update local
		ls, err := h.local.GetStudy(ctx, rs.ID)
		if err != nil || rs.UpdatedAt.After(ls.UpdatedAt) {
			if err := h.local.UpsertStudy(ctx, rs); err != nil {
				log.Printf("failed to sync study %s from remote: %v", rs.ID, err)
			} else {
				h.cache.Store(rs.ID, rs)
			}
		}
	}

	return nil
}

func (h *HybridStore) processQueue() error {
	rows, err := h.local.db.Query(`SELECT id, action, entity_type, entity_id, payload FROM sync_queue ORDER BY id ASC LIMIT 50`)
	if err != nil {
		return err
	}
	defer rows.Close()

	var items []syncItem
	for rows.Next() {
		var item syncItem
		if err := rows.Scan(&item.ID, &item.Action, &item.EntityType, &item.EntityID, &item.Payload); err != nil {
			return err
		}
		items = append(items, item)
	}

	for _, item := range items {
		if err := h.syncItem(item); err != nil {
			return err // Stop processing and retry later
		}
		_, _ = h.local.db.Exec(`DELETE FROM sync_queue WHERE id = ?`, item.ID)
	}

	return nil
}

func (h *HybridStore) syncItem(item syncItem) error {
	ctx := context.Background()
	
	switch item.EntityType {
	case "study":
		switch item.Action {
		case "CREATE", "UPDATE":
			var s Study
			_ = json.Unmarshal([]byte(item.Payload), &s)
			return h.remote.UpsertStudy(ctx, s)
		case "DELETE":
			return h.remote.DeleteStudy(ctx, item.EntityID)
		}
	case "assessment":
		var r AssessmentRecord
		_ = json.Unmarshal([]byte(item.Payload), &r)
		_, err := h.remote.SaveAssessment(ctx, r)
		return err
	}
	return nil
}
