package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"
)

type Service struct {
	mu           sync.RWMutex
	users        map[string]UserRecord
	sessions     map[string]*sessionRecord
	accessIndex  map[string]string
	refreshIndex map[string]string
	now          func() time.Time
	sessionTTL   time.Duration
}

type sessionRecord struct {
	Session Session
	Token   TokenPair
}

func NewInMemoryService(users []UserRecord) *Service {
	userIndex := make(map[string]UserRecord, len(users))
	for _, user := range users {
		userIndex[normalizeEmail(user.User.Email)] = user
	}

	return &Service{
		users:        userIndex,
		sessions:     make(map[string]*sessionRecord),
		accessIndex:  make(map[string]string),
		refreshIndex: make(map[string]string),
		now:          time.Now,
		sessionTTL:   time.Hour,
	}
}

func (s *Service) Login(_ context.Context, credentials Credentials) (LoginResponse, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	record, ok := s.users[normalizeEmail(credentials.Email)]
	if !ok || !VerifyPassword(record.PasswordHash, credentials.Password) {
		return LoginResponse{}, ErrInvalidCredentials
	}

	now := s.now()
	sessionID := randomID("sess")
	accessToken := randomID("acc")
	refreshToken := randomID("rft")

	session := Session{
		ID:          sessionID,
		UserID:      record.User.ID,
		Email:       record.User.Email,
		Permissions: append([]string(nil), record.User.Permissions...),
		ExpiresAt:   now.Add(s.sessionTTL),
		Status:      SessionStatusActive,
	}

	tokens := TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		TokenType:    "Bearer",
	}

	s.sessions[sessionID] = &sessionRecord{Session: session, Token: tokens}
	s.accessIndex[accessToken] = sessionID
	s.refreshIndex[refreshToken] = sessionID

	return LoginResponse{
		Session: session,
		Token:   tokens,
		User:    record.User,
	}, nil
}

func (s *Service) Refresh(_ context.Context, refreshToken string) (RefreshResponse, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	sessionID, ok := s.refreshIndex[refreshToken]
	if !ok {
		return RefreshResponse{}, ErrTokenInvalid
	}

	record, ok := s.sessions[sessionID]
	if !ok {
		return RefreshResponse{}, ErrSessionNotFound
	}

	if record.Session.Status == SessionStatusRevoked {
		return RefreshResponse{}, ErrSessionRevoked
	}

	if s.now().After(record.Session.ExpiresAt) {
		return RefreshResponse{}, ErrSessionExpired
	}

	delete(s.accessIndex, record.Token.AccessToken)
	delete(s.refreshIndex, record.Token.RefreshToken)

	record.Session.ExpiresAt = s.now().Add(s.sessionTTL)
	record.Token = TokenPair{
		AccessToken:  randomID("acc"),
		RefreshToken: randomID("rft"),
		TokenType:    "Bearer",
	}

	s.accessIndex[record.Token.AccessToken] = sessionID
	s.refreshIndex[record.Token.RefreshToken] = sessionID

	return RefreshResponse{
		Session: record.Session,
		Token:   record.Token,
	}, nil
}

func (s *Service) Logout(_ context.Context, sessionID string) (RevocationResponse, error) {
	return s.revoke(sessionID)
}

func (s *Service) Revoke(_ context.Context, sessionID string) (RevocationResponse, error) {
	return s.revoke(sessionID)
}

func (s *Service) Session(_ context.Context, accessToken string) (Session, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	sessionID, ok := s.accessIndex[accessToken]
	if !ok {
		return Session{}, ErrTokenInvalid
	}

	record, ok := s.sessions[sessionID]
	if !ok {
		return Session{}, ErrSessionNotFound
	}

	if record.Session.Status == SessionStatusRevoked {
		return Session{}, ErrSessionRevoked
	}

	if s.now().After(record.Session.ExpiresAt) {
		return Session{}, ErrSessionExpired
	}

	return record.Session, nil
}

func (s *Service) revoke(sessionID string) (RevocationResponse, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	record, ok := s.sessions[sessionID]
	if !ok {
		return RevocationResponse{}, ErrSessionNotFound
	}

	if record.Session.Status == SessionStatusRevoked {
		return RevocationResponse{}, nil
	}

	now := s.now()
	record.Session.Status = SessionStatusRevoked
	record.Session.RevokedAt = &now

	return RevocationResponse{
		Revoked:   true,
		RevokedAt: record.Session.RevokedAt,
	}, nil
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func randomID(prefix string) string {
	raw := make([]byte, 18)
	if _, err := rand.Read(raw); err != nil {
		panic(fmt.Sprintf("auth: failed to generate random token: %v", err))
	}

	return prefix + "_" + base64.RawURLEncoding.EncodeToString(raw)
}

func mapError(err error) (string, string, int) {
	switch {
	case errors.Is(err, ErrInvalidCredentials):
		return "invalid_credentials", "Invalid email or password.", 401
	case errors.Is(err, ErrSessionNotFound):
		return "session_not_found", "Session not found.", 404
	case errors.Is(err, ErrSessionRevoked):
		return "session_revoked", "Session is revoked.", 401
	case errors.Is(err, ErrSessionExpired):
		return "session_expired", "Session is expired.", 401
	case errors.Is(err, ErrTokenInvalid):
		return "token_invalid", "Token is invalid.", 401
	default:
		return "internal_error", "Internal server error.", 500
	}
}
