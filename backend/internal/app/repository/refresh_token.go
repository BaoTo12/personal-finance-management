package repository

import (
	"context"
	"pfn-backend/internal/app/entity"

	"github.com/google/uuid"
)

// RefreshTokenRepository defines the interface for refresh token data access
type RefreshTokenRepository interface {
	Create(ctx context.Context, token *entity.RefreshToken) error
	FindByToken(ctx context.Context, tokenHash string) (*entity.RefreshToken, error)
	RevokeToken(ctx context.Context, tokenHash string) error
	RevokeByUserID(ctx context.Context, userID uuid.UUID) error
	DeleteExpired(ctx context.Context) error
}
