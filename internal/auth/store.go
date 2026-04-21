package auth

import "sync"

type Store interface {
	FindUserByEmail(email string) (UserRecord, bool)
	CreateSession(record *sessionRecord)
	UpdateSessionTokens(sessionID string, token TokenPair) bool
	SessionByAccessToken(accessToken string) (*sessionRecord, bool)
	SessionByRefreshToken(refreshToken string) (*sessionRecord, bool)
	SessionByID(sessionID string) (*sessionRecord, bool)
}

type InMemoryStore struct {
	mu           sync.RWMutex
	users        map[string]UserRecord
	sessions     map[string]*sessionRecord
	accessIndex  map[string]string
	refreshIndex map[string]string
}

func NewInMemoryStore(users []UserRecord) *InMemoryStore {
	userIndex := make(map[string]UserRecord, len(users))
	for _, user := range users {
		userIndex[normalizeEmail(user.User.Email)] = user
	}

	return &InMemoryStore{
		users:        userIndex,
		sessions:     make(map[string]*sessionRecord),
		accessIndex:  make(map[string]string),
		refreshIndex: make(map[string]string),
	}
}

func (s *InMemoryStore) FindUserByEmail(email string) (UserRecord, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	record, ok := s.users[normalizeEmail(email)]
	return record, ok
}

func (s *InMemoryStore) CreateSession(record *sessionRecord) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.sessions[record.Session.ID] = record
	s.accessIndex[record.Token.AccessToken] = record.Session.ID
	s.refreshIndex[record.Token.RefreshToken] = record.Session.ID
}

func (s *InMemoryStore) UpdateSessionTokens(sessionID string, token TokenPair) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	record, ok := s.sessions[sessionID]
	if !ok {
		return false
	}

	delete(s.accessIndex, record.Token.AccessToken)
	delete(s.refreshIndex, record.Token.RefreshToken)

	record.Token = token
	s.accessIndex[token.AccessToken] = sessionID
	s.refreshIndex[token.RefreshToken] = sessionID
	return true
}

func (s *InMemoryStore) SessionByAccessToken(accessToken string) (*sessionRecord, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	sessionID, ok := s.accessIndex[accessToken]
	if !ok {
		return nil, false
	}

	record, ok := s.sessions[sessionID]
	return record, ok
}

func (s *InMemoryStore) SessionByRefreshToken(refreshToken string) (*sessionRecord, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	sessionID, ok := s.refreshIndex[refreshToken]
	if !ok {
		return nil, false
	}

	record, ok := s.sessions[sessionID]
	return record, ok
}

func (s *InMemoryStore) SessionByID(sessionID string) (*sessionRecord, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	record, ok := s.sessions[sessionID]
	return record, ok
}
