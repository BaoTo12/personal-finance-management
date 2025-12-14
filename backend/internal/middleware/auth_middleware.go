package middleware

import (
	"net/http"
	"pfn-backend/internal/pkg/jwt"
	"pfn-backend/internal/pkg/logger"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AuthMiddleware struct {
	jwtManager *jwt.JWTManager
	logger     *logger.Logger
}

func NewAuthMiddleware(jwtManager *jwt.JWTManager, logger *logger.Logger) *AuthMiddleware {
	return &AuthMiddleware{
		jwtManager: jwtManager,
		logger:     logger,
	}
}

// RequireAuth validates JWT and sets user context
func (m *AuthMiddleware) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing authorization header"})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization format"})
			c.Abort()
			return
		}

		token := parts[1]

		// Validate token
		claims, err := m.jwtManager.ValidateAccessToken(token)
		if err != nil {
			m.logger.Error("Token validation failed", logger.Error(err))
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			c.Abort()
			return
		}

		// Set user context
		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)

		c.Next()
	}
}

// OptionalAuth validates JWT if present but doesn't require it
func (m *AuthMiddleware) OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && parts[0] == "Bearer" {
			token := parts[1]
			claims, err := m.jwtManager.ValidateAccessToken(token)
			if err == nil {
				c.Set("user_id", claims.UserID)
				c.Set("email", claims.Email)
			}
		}

		c.Next()
	}
}

// GetUserIDFromContext extracts user ID from gin context
func GetUserIDFromContext(c *gin.Context) (uuid.UUID, bool) {
	userIDStr, exists := c.Get("user_id")
	if !exists {
		return uuid.Nil, false
	}

	userID, ok := userIDStr.(uuid.UUID)
	if !ok {
		return uuid.Nil, false
	}

	return userID, true
}
