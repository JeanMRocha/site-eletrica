package auth

import (
	"context"
	"encoding/json"
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
	mux.HandleFunc("POST /v1/auth/login", h.handleLogin)
	mux.HandleFunc("POST /v1/auth/refresh", h.handleRefresh)
	mux.HandleFunc("POST /v1/auth/logout", h.handleLogout)
	mux.HandleFunc("POST /v1/auth/revoke", h.handleRevoke)
	mux.HandleFunc("GET /v1/auth/session", h.handleSession)
	return mux
}

func (h *Handler) handleLogin(w http.ResponseWriter, r *http.Request) {
	var req Credentials
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_payload", "Invalid JSON payload.")
		return
	}

	response, err := h.service.Login(r.Context(), req)
	if err != nil {
		writeAuthError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, response)
}

func (h *Handler) handleRefresh(w http.ResponseWriter, r *http.Request) {
	var req struct {
		RefreshToken string `json:"refreshToken"`
	}
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_payload", "Invalid JSON payload.")
		return
	}

	response, err := h.service.Refresh(r.Context(), req.RefreshToken)
	if err != nil {
		writeAuthError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, response)
}

func (h *Handler) handleLogout(w http.ResponseWriter, r *http.Request) {
	h.handleRevocationLike(w, r, h.service.Logout)
}

func (h *Handler) handleRevoke(w http.ResponseWriter, r *http.Request) {
	h.handleRevocationLike(w, r, h.service.Revoke)
}

func (h *Handler) handleRevocationLike(w http.ResponseWriter, r *http.Request, fn func(context.Context, string) (RevocationResponse, error)) {
	var req struct {
		SessionID string `json:"sessionId"`
	}
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_payload", "Invalid JSON payload.")
		return
	}

	response, err := fn(r.Context(), req.SessionID)
	if err != nil {
		writeAuthError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, response)
}

func (h *Handler) handleSession(w http.ResponseWriter, r *http.Request) {
	accessToken := bearerToken(r.Header.Get("Authorization"))
	if accessToken == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Missing bearer token.")
		return
	}

	session, err := h.service.Session(r.Context(), accessToken)
	if err != nil {
		writeAuthError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]Session{"session": session})
}

func bearerToken(header string) string {
	if !strings.HasPrefix(header, "Bearer ") {
		return ""
	}

	return strings.TrimSpace(strings.TrimPrefix(header, "Bearer "))
}

func decodeJSON(r *http.Request, v any) error {
	defer r.Body.Close()
	return json.NewDecoder(r.Body).Decode(v)
}

func writeAuthError(w http.ResponseWriter, err error) {
	code, message, status := mapError(err)
	writeError(w, status, code, message)
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, ErrorResponse{
		Error: APIError{
			Code:    code,
			Message: message,
		},
	})
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
