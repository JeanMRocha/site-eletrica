package standards

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /v1/standards/catalog", h.handleCatalog)
	mux.HandleFunc("GET /v1/standards/catalog/{code}", h.handleFind)
	mux.HandleFunc("GET /v1/standards/hierarchy", h.handleHierarchy)
	mux.HandleFunc("POST /v1/standards/resolve", h.handleResolve)
	return mux
}

func (h *Handler) handleCatalog(w http.ResponseWriter, r *http.Request) {
	catalog := h.service.Catalog(r.Context())
	writeJSON(w, http.StatusOK, catalog)
}

func (h *Handler) handleFind(w http.ResponseWriter, r *http.Request) {
	code := strings.TrimSpace(r.PathValue("code"))
	if code == "" {
		writeError(w, http.StatusBadRequest, "invalid_code", "Standard code is required.")
		return
	}

	standard, err := h.service.Find(r.Context(), code)
	if err != nil {
		writeStandardError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]Standard{"standard": standard})
}

func (h *Handler) handleHierarchy(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"hierarchy": h.service.Hierarchy(r.Context()),
	})
}

func (h *Handler) handleResolve(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Left  NormRule `json:"left"`
		Right NormRule `json:"right"`
	}
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_payload", "Invalid JSON payload.")
		return
	}

	result := h.service.Resolve(r.Context(), req.Left, req.Right)
	writeJSON(w, http.StatusOK, map[string]NormRule{"winner": result})
}

func writeStandardError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrStandardNotFound):
		writeError(w, http.StatusNotFound, "standard_not_found", "Standard not found.")
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
