package auth

import (
	"context"
	"errors"
	"testing"
	"time"
)

func TestLoginSuccess(t *testing.T) {
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

	response, err := service.Login(context.Background(), Credentials{
		Email:    "operator@example.com",
		Password: "secret",
	})

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if response.Token.AccessToken == "" || response.Token.RefreshToken == "" {
		t.Fatalf("expected tokens to be generated")
	}

	if response.Session.Status != SessionStatusActive {
		t.Fatalf("expected active session, got %s", response.Session.Status)
	}
}

func TestLoginInvalidCredentials(t *testing.T) {
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

	_, err := service.Login(context.Background(), Credentials{
		Email:    "operator@example.com",
		Password: "wrong",
	})

	if !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("expected invalid credentials error, got %v", err)
	}
}

func TestRefreshRotatesTokens(t *testing.T) {
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

	login, err := service.Login(context.Background(), Credentials{
		Email:    "operator@example.com",
		Password: "secret",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	refreshed, err := service.Refresh(context.Background(), login.Token.RefreshToken)
	if err != nil {
		t.Fatalf("unexpected refresh error: %v", err)
	}

	if refreshed.Token.AccessToken == login.Token.AccessToken {
		t.Fatalf("expected access token rotation")
	}

	if refreshed.Token.RefreshToken == login.Token.RefreshToken {
		t.Fatalf("expected refresh token rotation")
	}
}

func TestLogoutRevokesSession(t *testing.T) {
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

	login, err := service.Login(context.Background(), Credentials{
		Email:    "operator@example.com",
		Password: "secret",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	result, err := service.Logout(context.Background(), login.Session.ID)
	if err != nil {
		t.Fatalf("unexpected logout error: %v", err)
	}

	if !result.Revoked {
		t.Fatalf("expected revoked response")
	}

	if _, err := service.Session(context.Background(), login.Token.AccessToken); !errors.Is(err, ErrSessionRevoked) {
		t.Fatalf("expected revoked session error, got %v", err)
	}
}

func TestSessionExpires(t *testing.T) {
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
	service.sessionTTL = time.Millisecond

	login, err := service.Login(context.Background(), Credentials{
		Email:    "operator@example.com",
		Password: "secret",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	time.Sleep(2 * time.Millisecond)

	if _, err := service.Session(context.Background(), login.Token.AccessToken); !errors.Is(err, ErrSessionExpired) {
		t.Fatalf("expected session expired error, got %v", err)
	}
}
