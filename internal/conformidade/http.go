package conformidade

import (
	"encoding/json"
	"errors"
	"net/http"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /v1/conformidade/assess", h.handleAssess)
	return mux
}

func (h *Handler) handleAssess(w http.ResponseWriter, r *http.Request) {
	var req AssessmentInput
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_payload", "Invalid JSON payload.")
		return
	}

	verdict, err := h.service.Assess(r.Context(), req)
	if err != nil {
		writeConformidadeError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, verdict)
}

func writeConformidadeError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrInvalidPayload):
		writeError(w, http.StatusBadRequest, "invalid_payload", "Invalid payload.")
	case errors.Is(err, ErrStandardResolution):
		writeError(w, http.StatusUnprocessableEntity, "standard_resolution_failed", "Could not resolve the selected standard.")
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
