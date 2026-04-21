package auth

import "time"

const (
	// SessionStatusActive marks a session as valid and usable.
	SessionStatusActive = "active"
	// SessionStatusRevoked marks a session as revoked and unusable.
	SessionStatusRevoked = "revoked"
)

type User struct {
	ID          string   `json:"id"`
	Email       string   `json:"email"`
	DisplayName string   `json:"displayName"`
	Permissions []string `json:"permissions"`
}

type Credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type TokenPair struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	TokenType    string `json:"tokenType"`
}

type Session struct {
	ID          string     `json:"id"`
	UserID      string     `json:"userId"`
	Email       string     `json:"email"`
	Permissions []string   `json:"permissions"`
	ExpiresAt   time.Time  `json:"expiresAt"`
	Status      string     `json:"status"`
	RevokedAt   *time.Time `json:"revokedAt,omitempty"`
}

type LoginResponse struct {
	Session Session   `json:"session"`
	Token   TokenPair `json:"token"`
	User    User      `json:"user"`
}

type RefreshResponse struct {
	Session Session   `json:"session"`
	Token   TokenPair `json:"token"`
}

type RevocationResponse struct {
	Revoked   bool       `json:"revoked"`
	RevokedAt *time.Time `json:"revokedAt,omitempty"`
}

type ErrorResponse struct {
	Error APIError `json:"error"`
}

type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type UserRecord struct {
	User         User
	PasswordHash string
}
