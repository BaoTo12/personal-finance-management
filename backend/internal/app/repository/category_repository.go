package repository

import (
	"context"
	"fmt"
	"pfn-backend/internal/app/entity"

	"gorm.io/gorm"
)

type CategoryRepository interface {
	FindAll(ctx context.Context) ([]entity.Category, error)
	FindByType(ctx context.Context, categoryType string) ([]entity.Category, error)
	FindByID(ctx context.Context, id int64) (*entity.Category, error)
}

type categoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) CategoryRepository {
	return &categoryRepository{db: db}
}

func (r *categoryRepository) FindAll(ctx context.Context) ([]entity.Category, error) {
	var categories []entity.Category
	if err := r.db.WithContext(ctx).Order("category_type, name").Find(&categories).Error; err != nil {
		return nil, fmt.Errorf("failed to find categories: %w", err)
	}
	return categories, nil
}

func (r *categoryRepository) FindByType(ctx context.Context, categoryType string) ([]entity.Category, error) {
	var categories []entity.Category
	if err := r.db.WithContext(ctx).
		Where("category_type = ?", categoryType).
		Order("name").
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
