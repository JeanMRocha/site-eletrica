package auth

import (
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
)

// HashPassword is a placeholder hash for the initial implementation.
// The production version should move to a stronger password storage strategy.
func HashPassword(password string) string {
	sum := sha256.Sum256([]byte(password))
	return hex.EncodeToString(sum[:])
}

func VerifyPassword(hash, password string) bool {
	expected := HashPassword(password)
	return subtle.ConstantTimeCompare([]byte(hash), []byte(expected)) == 1
}
