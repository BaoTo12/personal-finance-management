package password

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"regexp"
	"unicode"

	"golang.org/x/crypto/bcrypt"
)

const (
	MinPasswordLength = 8
	MaxPasswordLength = 72 // bcrypt limit
	BCryptCost        = 12
)

// Hash generates a bcrypt hash of the password
func Hash(password string) (string, error) {
	if len(password) < MinPasswordLength {
		return "", fmt.Errorf("password must be at least %d characters", MinPasswordLength)
	}

	if len(password) > MaxPasswordLength {
		return "", fmt.Errorf("password must not exceed %d characters", MaxPasswordLength)
	}

	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), BCryptCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}

	return string(hashedBytes), nil
}

// Verify checks if the password matches the hash
func Verify(password, hash string) error {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		return fmt.Errorf("invalid password")
	}
	return nil
}

// ValidateStrength checks password strength
type PasswordStrength struct {
	MinLength     bool
	HasUppercase  bool
	HasLowercase  bool
	HasNumber     bool
	HasSpecial    bool
	NoCommonWords bool
	IsValid       bool
	Score         int // 0-5
	Feedback      []string
}

func ValidateStrength(password string) *PasswordStrength {
	strength := &PasswordStrength{
		Feedback: make([]string, 0),
	}

	// Check minimum length
	if len(password) >= MinPasswordLength {
		strength.MinLength = true
		strength.Score++
	} else {
		strength.Feedback = append(strength.Feedback, fmt.Sprintf("Password must be at least %d characters", MinPasswordLength))
	}

	// Check for uppercase
	if regexp.MustCompile(`[A-Z]`).MatchString(password) {
		strength.HasUppercase = true
		strength.Score++
	} else {
		strength.Feedback = append(strength.Feedback, "Password must contain at least one uppercase letter")
	}

	// Check for lowercase
	if regexp.MustCompile(`[a-z]`).MatchString(password) {
		strength.HasLowercase = true
		strength.Score++
	} else {
		strength.Feedback = append(strength.Feedback, "Password must contain at least one lowercase letter")
	}

	// Check for numbers
	if regexp.MustCompile(`[0-9]`).MatchString(password) {
		strength.HasNumber = true
		strength.Score++
	} else {
		strength.Feedback = append(strength.Feedback, "Password must contain at least one number")
	}

	// Check for special characters
	hasSpecial := false
	for _, char := range password {
		if unicode.IsPunct(char) || unicode.IsSymbol(char) {
			hasSpecial = true
			break
		}
	}
	if hasSpecial {
		strength.HasSpecial = true
		strength.Score++
	} else {
		strength.Feedback = append(strength.Feedback, "Password should contain at least one special character")
	}

	// Check for common passwords
	commonPasswords := []string{
		"password", "12345678", "qwerty", "abc123", "password123",
		"admin", "letmein", "welcome", "monkey", "dragon",
	}
	strength.NoCommonWords = true
	for _, common := range commonPasswords {
		if regexp.MustCompile(`(?i)` + common).MatchString(password) {
			strength.NoCommonWords = false
			strength.Feedback = append(strength.Feedback, "Password contains common words or patterns")
			break
		}
	}

	// Password is valid if it has minimum requirements
	strength.IsValid = strength.MinLength && strength.HasUppercase && strength.HasLowercase && strength.HasNumber

	return strength
}

// GenerateResetToken creates a random token for password reset
func GenerateResetToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate token: %w", err)
	}
	return hex.EncodeToString(bytes), nil
}

// HashToken creates a SHA-256 hash of a token (for storing refresh tokens)
func HashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}
