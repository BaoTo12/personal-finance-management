package repository

import (
	"context"
	"pfn-backend/internal/app/entity"
)

// CategoryRepository defines the interface for category data access
type CategoryRepository interface {
	FindAll(ctx context.Context) ([]entity.Category, error)
	FindByType(ctx context.Context, categoryType string) ([]entity.Category, error)
	FindByID(ctx context.Context, id int64) (*entity.Category, error)
}
