package standards

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCatalogHTTP(t *testing.T) {
	handler := NewHandler(NewInMemoryService(DefaultCatalog()))

	req := httptest.NewRequest(http.MethodGet, "/v1/standards/catalog", nil)
	resp := httptest.NewRecorder()
	handler.Routes().ServeHTTP(resp, req)

	if resp.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", resp.Code)
	}

	var payload Catalog
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}

	if len(payload.Standards) == 0 {
		t.Fatalf("expected standards in catalog")
	}
}

func TestFindStandardHTTP(t *testing.T) {
	handler := NewHandler(NewInMemoryService(DefaultCatalog()))

	req := httptest.NewRequest(http.MethodGet, "/v1/standards/catalog/NBR-5410", nil)
	resp := httptest.NewRecorder()
	handler.Routes().ServeHTTP(resp, req)

	if resp.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", resp.Code)
	}

	var payload map[string]Standard
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}

	if payload["standard"].Code != "NBR-5410" {
		t.Fatalf("expected NBR-5410, got %s", payload["standard"].Code)
	}
}

func TestFindStandardHTTPNotFound(t *testing.T) {
	handler := NewHandler(NewInMemoryService(DefaultCatalog()))

	req := httptest.NewRequest(http.MethodGet, "/v1/standards/catalog/UNKNOWN", nil)
	resp := httptest.NewRecorder()
	handler.Routes().ServeHTTP(resp, req)

	if resp.Code != http.StatusNotFound {
		t.Fatalf("expected status 404, got %d", resp.Code)
	}
}

func TestHierarchyHTTP(t *testing.T) {
	handler := NewHandler(NewInMemoryService(DefaultCatalog()))

	req := httptest.NewRequest(http.MethodGet, "/v1/standards/hierarchy", nil)
	resp := httptest.NewRecorder()
	handler.Routes().ServeHTTP(resp, req)

	if resp.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", resp.Code)
	}
}

func TestResolveHTTP(t *testing.T) {
	handler := NewHandler(NewInMemoryService(DefaultCatalog()))

	body := []byte(`{"left":{"ruleId":"ABNT_001","originType":"normative","originName":"ABNT NBR 5410"},"right":{"ruleId":"NR_001","originType":"regulation","originName":"NR-10"}}`)
	req := httptest.NewRequest(http.MethodPost, "/v1/standards/resolve", bytes.NewReader(body))
	resp := httptest.NewRecorder()
	handler.Routes().ServeHTTP(resp, req)

	if resp.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", resp.Code)
	}
}
