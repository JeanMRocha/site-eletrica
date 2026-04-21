package nodes

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
)

type ErrorResponse struct {
	Error APIError `json:"error"`
}

type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type Handler struct {
	service       *Service
	defaultConfig SSHConfig
}

func NewHandler(service *Service, defaultConfig SSHConfig) *Handler {
	return &Handler{service: service, defaultConfig: defaultConfig}
}

func (h *Handler) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /v1/nodes", h.handleList)
	mux.HandleFunc("GET /v1/nodes/{id}", h.handleGet)
	mux.HandleFunc("POST /v1/nodes/{id}/probe", h.handleProbe)
	return mux
}

func (h *Handler) handleList(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string][]Node{"nodes": h.service.List()})
}

func (h *Handler) handleGet(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimSpace(r.PathValue("id"))
	node, ok := h.service.Get(id)
	if !ok {
		writeError(w, http.StatusNotFound, "node_not_found", "Node not found.")
		return
	}

	writeJSON(w, http.StatusOK, map[string]Node{"node": node})
}

func (h *Handler) handleProbe(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimSpace(r.PathValue("id"))
	node, ok := h.service.Get(id)
	if !ok {
		writeError(w, http.StatusNotFound, "node_not_found", "Node not found.")
		return
	}

	cfg := h.defaultConfig
	if cfg.Host == "" {
		cfg.Host = node.Host
	}
	if cfg.Port == 0 {
		cfg.Port = node.Port
	}
	if cfg.User == "" {
		cfg.User = node.User
	}

	var req struct {
		Host           string `json:"host"`
		Port           int    `json:"port"`
		User           string `json:"user"`
		PrivateKeyPath string `json:"privateKeyPath"`
		KnownHostsPath string `json:"knownHostsPath"`
	}
	if err := decodeOptionalJSON(r, &req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_payload", "Invalid JSON payload.")
		return
	}

	if req.Host == "" {
		req.Host = cfg.Host
	}
	if req.Port == 0 {
		req.Port = cfg.Port
	}
	if req.User == "" {
		req.User = cfg.User
	}
	if req.PrivateKeyPath == "" {
		req.PrivateKeyPath = cfg.PrivateKeyPath
	}
	if req.KnownHostsPath == "" {
		req.KnownHostsPath = cfg.KnownHostsPath
	}

	result, err := h.service.Probe(r.Context(), id, SSHConfig{
		Host:           req.Host,
		Port:           req.Port,
		User:           req.User,
		PrivateKeyPath: req.PrivateKeyPath,
		KnownHostsPath: req.KnownHostsPath,
	})
	if err != nil {
		writeError(w, http.StatusBadGateway, "probe_failed", err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]ProbeResult{"probe": result})
}

func decodeOptionalJSON(r *http.Request, v any) error {
	defer r.Body.Close()
	dec := json.NewDecoder(r.Body)
	if err := dec.Decode(v); err != nil {
		if errors.Is(err, http.ErrBodyNotAllowed) {
			return nil
		}
		if strings.Contains(err.Error(), "EOF") {
			return nil
		}
		return err
	}
	return nil
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
