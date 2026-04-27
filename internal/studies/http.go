package studies

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/JeanMRocha/site-eletrica/internal/conformidade"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /", h.handleListStudies)
	mux.HandleFunc("POST /", h.handleCreateStudy)
	mux.HandleFunc("GET /{id}", h.handleGetStudy)
	mux.HandleFunc("PUT /{id}", h.handleUpdateStudy)
	mux.HandleFunc("PATCH /{id}", h.handleUpdateStudy)
	mux.HandleFunc("DELETE /{id}", h.handleDeleteStudy)
	mux.HandleFunc("POST /{id}/assessments", h.handleAssessStudy)
	return mux
}

func (h *Handler) handleListStudies(w http.ResponseWriter, r *http.Request) {
	studies, err := h.service.ListStudies(r.Context())
	if err != nil {
		writeStudyError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"studies": studies})
}

func (h *Handler) handleCreateStudy(w http.ResponseWriter, r *http.Request) {
	var req CreateStudyInput
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_payload", "Invalid JSON payload.")
		return
	}

	study, err := h.service.CreateStudy(r.Context(), req)
	if err != nil {
		writeStudyError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]Study{"study": study})
}

func (h *Handler) handleUpdateStudy(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimSpace(r.PathValue("id"))
	if id == "" {
		writeError(w, http.StatusBadRequest, "invalid_id", "Study id is required.")
		return
	}

	var req UpdateStudyInput
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_payload", "Invalid JSON payload.")
		return
	}

	study, err := h.service.UpdateStudy(r.Context(), id, req)
	if err != nil {
		writeStudyError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]Study{"study": study})
}

func (h *Handler) handleDeleteStudy(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimSpace(r.PathValue("id"))
	if id == "" {
		writeError(w, http.StatusBadRequest, "invalid_id", "Study id is required.")
		return
	}

	if err := h.service.DeleteStudy(r.Context(), id); err != nil {
		writeStudyError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"deleted": id})
}

func (h *Handler) handleGetStudy(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimSpace(r.PathValue("id"))
	if id == "" {
		writeError(w, http.StatusBadRequest, "invalid_id", "Study id is required.")
		return
	}

	detail, err := h.service.GetStudy(r.Context(), id)
	if err != nil {
		writeStudyError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, detail)
}

func (h *Handler) handleAssessStudy(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimSpace(r.PathValue("id"))
	if id == "" {
		writeError(w, http.StatusBadRequest, "invalid_id", "Study id is required.")
		return
	}

	var req conformidade.AssessmentInput
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_payload", "Invalid JSON payload.")
		return
	}

	record, err := h.service.AssessStudy(r.Context(), id, req)
	if err != nil {
		switch {
		case errors.Is(err, ErrStudyNotFound):
			writeError(w, http.StatusNotFound, "study_not_found", "Study not found.")
		case errors.Is(err, ErrInvalidAssessment):
			writeError(w, http.StatusBadRequest, "invalid_assessment", "Invalid assessment input.")
		case errors.Is(err, conformidade.ErrInvalidPayload):
			writeError(w, http.StatusBadRequest, "invalid_assessment", "Invalid assessment input.")
		default:
			writeError(w, http.StatusInternalServerError, "internal_error", "Internal server error.")
		}
		return
	}

	writeJSON(w, http.StatusCreated, map[string]AssessmentRecord{"assessment": record})
}

func writeStudyError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrStudyNotFound):
		writeError(w, http.StatusNotFound, "study_not_found", "Study not found.")
	case errors.Is(err, ErrInvalidStudyInput):
		writeError(w, http.StatusBadRequest, "invalid_study_input", "Invalid study input.")
	case errors.Is(err, ErrInvalidAssessment):
		writeError(w, http.StatusBadRequest, "invalid_assessment", "Invalid assessment input.")
	default:
		writeError(w, http.StatusInternalServerError, "internal_error", "Internal server error.")
	}
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, map[string]any{
		"error": map[string]string{
			"code":    code,
			"message": message,
		},
	})
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func decodeJSON(r *http.Request, v any) error {
	defer r.Body.Close()
	return json.NewDecoder(r.Body).Decode(v)
}
