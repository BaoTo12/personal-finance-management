package postgres

import (
	"context"
	"fmt"
	"pfn-backend/internal/app/entity"
	"pfn-backend/internal/app/repository"

	"gorm.io/gorm"
)

type categoryRepository struct {
	db *gorm.DB
}

// NewCategoryRepository creates a new PostgreSQL implementation of CategoryRepository
func NewCategoryRepository(db *gorm.DB) repository.CategoryRepository {
	return &categoryRepository{db: db}
}

func (r *categoryRepository) FindAll(ctx context.Context) ([]entity.Category, error) {
	var categories []entity.Category
	if err := r.db.WithContext(ctx).Order("name ASC").Find(&categories).Error; err != nil {
		return nil, fmt.Errorf("failed to find categories: %w", err)
	}
	return categories, nil
}

func (r *categoryRepository) FindByType(ctx context.Context, categoryType string) ([]entity.Category, error) {
	var categories []entity.Category
	if err := r.db.WithContext(ctx).
		Where("category_type = ?", categoryType).
		Order("name ASC").
		Find(&categories).Error; err != nil {
		return nil, fmt.Errorf("failed to find categories by type: %w", err)
	}
	return categories, nil
}

func (r *categoryRepository) FindByID(ctx context.Context, id int64) (*entity.Category, error) {
	var category entity.Category
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&category).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("category not found")
		}
		return nil, fmt.Errorf("failed to find category: %w", err)
	}
	return &category, nil
}
