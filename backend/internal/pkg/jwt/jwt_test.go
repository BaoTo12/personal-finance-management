package jwt_test

import (
	"pfn-backend/internal/pkg/jwt"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupJWTManager() *jwt.JWTManager {
	return jwt.NewJWTManager(
		"test-access-secret-key-min-32-chars",
		"test-refresh-secret-key-min-32-chars",
		"test-issuer",
		15*time.Minute,
		168*time.Hour,
		1*time.Hour,
	)
}

func TestJWTManager_GenerateAccessToken(t *testing.T) {
	manager := setupJWTManager()
	userID := uuid.New()
	email := "test@example.com"

	t.Run("generates valid access token", func(t *testing.T) {
		token, err := manager.GenerateAccessToken(userID, email)

		require.NoError(t, err)
		assert.NotEmpty(t, token)
	})

	t.Run("token contains correct claims", func(t *testing.T) {
		token, _ := manager.GenerateAccessToken(userID, email)

		claims, err := manager.ValidateAccessToken(token)

		require.NoError(t, err)
		assert.Equal(t, userID, claims.UserID)
		assert.Equal(t, email, claims.Email)
		assert.Equal(t, "access", claims.Type)
	})
}

func TestJWTManager_GenerateRefreshToken(t *testing.T) {
	manager := setupJWTManager()
	userID := uuid.New()
	email := "test@example.com"

	t.Run("generates valid refresh token", func(t *testing.T) {
		token, err := manager.GenerateRefreshToken(userID, email)

		require.NoError(t, err)
		assert.NotEmpty(t, token)
	})

	t.Run("refresh token has longer expiry", func(t *testing.T) {
		token, _ := manager.GenerateRefreshToken(userID, email)

		claims, err := manager.ValidateRefreshToken(token)

		require.NoError(t, err)
		assert.True(t, claims.ExpiresAt.Time.After(time.Now().Add(100*time.Hour)))
	})
}

func TestJWTManager_GenerateResetToken(t *testing.T) {
	manager := setupJWTManager()
	userID := uuid.New()
	email := "test@example.com"

	t.Run("generates valid reset token", func(t *testing.T) {
		token, err := manager.GenerateResetToken(userID, email)

		require.NoError(t, err)
		assert.NotEmpty(t, token)
	})

	t.Run("reset token type is correct", func(t *testing.T) {
		token, _ := manager.GenerateResetToken(userID, email)

		claims, err := manager.ValidateResetToken(token)

		require.NoError(t, err)
		assert.Equal(t, "reset", claims.Type)
	})
}

func TestJWTManager_GenerateTokenPair(t *testing.T) {
	manager := setupJWTManager()
	userID := uuid.New()
	email := "test@example.com"

	t.Run("generates both tokens", func(t *testing.T) {
		pair, err := manager.GenerateTokenPair(userID, email)

		require.NoError(t, err)
		assert.NotEmpty(t, pair.AccessToken)
		assert.NotEmpty(t, pair.RefreshToken)
	})

	t.Run("tokens are different", func(t *testing.T) {
		pair, _ := manager.GenerateTokenPair(userID, email)

		assert.NotEqual(t, pair.AccessToken, pair.RefreshToken)
	})
}

func TestJWTManager_ValidateAccessToken(t *testing.T) {
	manager := setupJWTManager()
	userID := uuid.New()
	email := "test@example.com"

	t.Run("validates correct token", func(t *testing.T) {
		token, _ := manager.GenerateAccessToken(userID, email)

		claims, err := manager.ValidateAccessToken(token)

		require.NoError(t, err)
		assert.Equal(t, userID, claims.UserID)
	})

	t.Run("rejects invalid token", func(t *testing.T) {
		_, err := manager.ValidateAccessToken("invalid.token.here")

		assert.Error(t, err)
	})

	t.Run("rejects wrong token type", func(t *testing.T) {
		refreshToken, _ := manager.GenerateRefreshToken(userID, email)

		_, err := manager.ValidateAccessToken(refreshToken)

		assert.Error(t, err)
		assert.Contains(t, err.Error(), "invalid token type")
	})

	t.Run("rejects expired token", func(t *testing.T) {
		// Create manager with very short expiry
		shortManager := jwt.NewJWTManager(
			"test-access-secret-key-min-32-chars",
			"test-refresh-secret-key-min-32-chars",
			"test-issuer",
			1*time.Millisecond,
			168*time.Hour,
			1*time.Hour,
		)

		token, _ := shortManager.GenerateAccessToken(userID, email)
		time.Sleep(10 * time.Millisecond)

		_, err := shortManager.ValidateAccessToken(token)

		assert.Error(t, err)
	})
}

func TestJWTManager_ValidateRefreshToken(t *testing.T) {
	manager := setupJWTManager()
	userID := uuid.New()
	email := "test@example.com"

	t.Run("validates correct refresh token", func(t *testing.T) {
		token, _ := manager.GenerateRefreshToken(userID, email)

		claims, err := manager.ValidateRefreshToken(token)

		require.NoError(t, err)
		assert.Equal(t, "refresh", claims.Type)
	})

	t.Run("rejects access token as refresh token", func(t *testing.T) {
		accessToken, _ := manager.GenerateAccessToken(userID, email)

		_, err := manager.ValidateRefreshToken(accessToken)

		assert.Error(t, err)
	})
}
