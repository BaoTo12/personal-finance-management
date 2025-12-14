package password_test

import (
	"pfn-backend/internal/pkg/password"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestHash(t *testing.T) {
	tests := []struct {
		name     string
		password string
	}{
		{"simple password", "password123"},
		{"complex password", "P@ssw0rd!123"},
		{"long password", "ThisIsAVeryLongPasswordWithManyCharacters123!@#"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			hashed, err := password.Hash(tt.password)

			require.NoError(t, err)
			assert.NotEmpty(t, hashed)
			assert.NotEqual(t, tt.password, hashed)
			assert.Greater(t, len(hashed), 50) // Bcrypt hashes are ~60 chars
		})
	}
}

func TestVerify(t *testing.T) {
	t.Run("correct password validates", func(t *testing.T) {
		plain := "mypassword"
		hashed, _ := password.Hash(plain)

		err := password.Verify(hashed, plain)

		assert.NoError(t, err)
	})

	t.Run("incorrect password fails", func(t *testing.T) {
		plain := "mypassword"
		hashed, _ := password.Hash(plain)

		err := password.Verify(hashed, "wrongpassword")

		assert.Error(t, err)
	})
}

func TestValidateStrength(t *testing.T) {
	tests := []struct {
		name      string
		password  string
		wantValid bool
		wantScore int
	}{
		{
			name:      "weak password - too short",
			password:  "Pass1!",
			wantValid: false,
			wantScore: 2,
		},
		{
			name:      "weak password - no uppercase",
			password:  "password123!",
			wantValid: false,
			wantScore: 3,
		},
		{
			name:      "weak password - no lowercase",
			password:  "PASSWORD123!",
			wantValid: false,
			wantScore: 3,
		},
		{
			name:      "weak password - no number",
			password:  "Password!",
			wantValid: false,
			wantScore: 3,
		},
		{
			name:      "medium password - no special char",
			password:  "Password123",
			wantValid: true,
			wantScore: 4,
		},
		{
			name:      "strong password",
			password:  "P@ssw0rd123!",
			wantValid: true,
			wantScore: 5,
		},
		{
			name:      "very strong password",
			password:  "MyC0mpl3x!P@ssw0rd",
			wantValid: true,
			wantScore: 5,
		},
		{
			name:      "common password detected",
			password:  "Password123",
			wantValid: true,
			wantScore: 4, // Still valid but flagged
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			strength := password.ValidateStrength(tt.password)

			assert.NotNil(t, strength)
			assert.Equal(t, tt.wantValid, strength.IsValid, "IsValid mismatch")
			assert.Equal(t, tt.wantScore, strength.Score, "Score mismatch")

			if !strength.IsValid {
				assert.NotEmpty(t, strength.Feedback, "Should have feedback for invalid password")
			}
		})
	}
}

func TestGenerateResetToken(t *testing.T) {
	t.Run("generates unique tokens", func(t *testing.T) {
		token1, err1 := password.GenerateResetToken()
		token2, err2 := password.GenerateResetToken()

		require.NoError(t, err1)
		require.NoError(t, err2)
		assert.NotEmpty(t, token1)
		assert.NotEmpty(t, token2)
		assert.NotEqual(t, token1, token2)
		assert.Len(t, token1, 64) // 32 bytes hex encoded = 64 chars
	})
}

func TestHashToken(t *testing.T) {
	t.Run("hashes token consistently", func(t *testing.T) {
		token := "test-token-123"

		hash1 := password.HashToken(token)
		hash2 := password.HashToken(token)

		assert.Equal(t, hash1, hash2)
		assert.NotEqual(t, token, hash1)
		assert.Len(t, hash1, 64) // SHA256 hex = 64 chars
	})

	t.Run("different tokens produce different hashes", func(t *testing.T) {
		hash1 := password.HashToken("token1")
		hash2 := password.HashToken("token2")

		assert.NotEqual(t, hash1, hash2)
	})
}
