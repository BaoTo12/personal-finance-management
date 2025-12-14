package jwt

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type Claims struct {
	UserID uuid.UUID `json:"user_id"`
	Email  string    `json:"email"`
	Type   string    `json:"type"` // access, refresh, reset
	jwt.RegisteredClaims
}

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

type JWTManager struct {
	accessSecret  string
	refreshSecret string
	issuer        string
	accessExpiry  time.Duration
	refreshExpiry time.Duration
	resetExpiry   time.Duration
}

func NewJWTManager(accessSecret, refreshSecret, issuer string, accessExpiry, refreshExpiry, resetExpiry time.Duration) *JWTManager {
	return &JWTManager{
		accessSecret:  accessSecret,
		refreshSecret: refreshSecret,
		issuer:        issuer,
		accessExpiry:  accessExpiry,
		refreshExpiry: refreshExpiry,
		resetExpiry:   resetExpiry,
	}
}

// GenerateAccessToken creates a new access token
func (m *JWTManager) GenerateAccessToken(userID uuid.UUID, email string) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID: userID,
		Email:  email,
		Type:   "access",
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    m.issuer,
			Subject:   userID.String(),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(m.accessExpiry)),
			NotBefore: jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(m.accessSecret))
	if err != nil {
		return "", fmt.Errorf("failed to sign access token: %w", err)
	}

	return tokenString, nil
}

// GenerateRefreshToken creates a new refresh token
func (m *JWTManager) GenerateRefreshToken(userID uuid.UUID, email string) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID: userID,
		Email:  email,
		Type:   "refresh",
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    m.issuer,
			Subject:   userID.String(),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(m.refreshExpiry)),
			NotBefore: jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(m.refreshSecret))
	if err != nil {
		return "", fmt.Errorf("failed to sign refresh token: %w", err)
	}

	return tokenString, nil
}

// GenerateResetToken creates a password reset token
func (m *JWTManager) GenerateResetToken(userID uuid.UUID, email string) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID: userID,
		Email:  email,
		Type:   "reset",
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    m.issuer,
			Subject:   userID.String(),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(m.resetExpiry)),
			NotBefore: jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(m.accessSecret))
	if err != nil {
		return "", fmt.Errorf("failed to sign reset token: %w", err)
	}

	return tokenString, nil
}

// GenerateTokenPair creates both access and refresh tokens
func (m *JWTManager) GenerateTokenPair(userID uuid.UUID, email string) (*TokenPair, error) {
	accessToken, err := m.GenerateAccessToken(userID, email)
	if err != nil {
		return nil, err
	}

	refreshToken, err := m.GenerateRefreshToken(userID, email)
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(m.accessExpiry.Seconds()),
	}, nil
}

// ValidateAccessToken validates and parses an access token
func (m *JWTManager) ValidateAccessToken(tokenString string) (*Claims, error) {
	return m.validateToken(tokenString, m.accessSecret, "access")
}

// ValidateRefreshToken validates and parses a refresh token
func (m *JWTManager) ValidateRefreshToken(tokenString string) (*Claims, error) {
	return m.validateToken(tokenString, m.refreshSecret, "refresh")
}

// ValidateResetToken validates and parses a reset token
func (m *JWTManager) ValidateResetToken(tokenString string) (*Claims, error) {
	return m.validateToken(tokenString, m.accessSecret, "reset")
}

func (m *JWTManager) validateToken(tokenString, secret, expectedType string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token claims")
	}

	if claims.Type != expectedType {
		return nil, fmt.Errorf("invalid token type: expected %s, got %s", expectedType, claims.Type)
	}

	return claims, nil
}

// GetAccessExpiry returns the access token expiry duration
func (m *JWTManager) GetAccessExpiry() time.Duration {
	return m.accessExpiry
}

// GetRefreshExpiry returns the refresh token expiry duration
func (m *JWTManager) GetRefreshExpiry() time.Duration {
	return m.refreshExpiry
}
