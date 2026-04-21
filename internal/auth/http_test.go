package auth

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestLoginAndSessionHTTP(t *testing.T) {
	service := NewInMemoryService([]UserRecord{
		{
			User: User{
				ID:          "usr_1",
				Email:       "operator@example.com",
				DisplayName: "Operator",
				Permissions: []string{"nodes.read"},
			},
			PasswordHash: HashPassword("secret"),
		},
	})

	handler := NewHandler(service)

	loginBody, _ := json.Marshal(Credentials{
		Email:    "operator@example.com",
		Password: "secret",
	})

	loginReq := httptest.NewRequest(http.MethodPost, "/v1/auth/login", bytes.NewReader(loginBody))
	loginResp := httptest.NewRecorder()
	handler.Routes().ServeHTTP(loginResp, loginReq)

	if loginResp.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", loginResp.Code)
	}

	var login LoginResponse
	if err := json.NewDecoder(loginResp.Body).Decode(&login); err != nil {
		t.Fatalf("decode login response: %v", err)
	}

	sessionReq := httptest.NewRequest(http.MethodGet, "/v1/auth/session", nil)
	sessionReq.Header.Set("Authorization", "Bearer "+login.Token.AccessToken)
	sessionResp := httptest.NewRecorder()
	handler.Routes().ServeHTTP(sessionResp, sessionReq)

	if sessionResp.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", sessionResp.Code)
	}

	var payload map[string]Session
	if err := json.NewDecoder(sessionResp.Body).Decode(&payload); err != nil {
		t.Fatalf("decode session response: %v", err)
	}

	if payload["session"].ID != login.Session.ID {
		t.Fatalf("expected session id %s, got %s", login.Session.ID, payload["session"].ID)
	}
}

func TestSessionHTTPUnauthorized(t *testing.T) {
	service := NewInMemoryService(nil)
	handler := NewHandler(service)

	req := httptest.NewRequest(http.MethodGet, "/v1/auth/session", nil)
	resp := httptest.NewRecorder()
	handler.Routes().ServeHTTP(resp, req)

	if resp.Code != http.StatusUnauthorized {
		t.Fatalf("expected status 401, got %d", resp.Code)
	}
}
