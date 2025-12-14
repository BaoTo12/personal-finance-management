package repository

import (
	"context"
	"pfn-backend/internal/app/entity"

	"github.com/google/uuid"
)

// CardRepository defines the interface for card data access
type CardRepository interface {
	Create(ctx context.Context, card *entity.Card) error
	FindByID(ctx context.Context, id int64) (*entity.Card, error)
	FindByUserID(ctx context.Context, userID uuid.UUID) ([]entity.Card, error)
	Update(ctx context.Context, card *entity.Card) error
	Delete(ctx context.Context, id int64) error
	UpdateBalance(ctx context.Context, id int64, amount int64) error
	ToggleFreeze(ctx context.Context, id int64) error
}
