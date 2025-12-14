package category

import (
	"context"
	"fmt"
	"pfn-backend/internal/app/entity"
	"pfn-backend/internal/app/repository"
)

type Service interface {
	ListCategories(ctx context.Context, categoryType *string) ([]CategoryResponse, error)
}

type service struct {
	categoryRepo repository.CategoryRepository
}

func NewService(categoryRepo repository.CategoryRepository) Service {
	return &service{
		categoryRepo: categoryRepo,
	}
}

func (s *service) ListCategories(ctx context.Context, categoryType *string) ([]CategoryResponse, error) {
	var categories []entity.Category
	var err error

	if categoryType != nil && *categoryType != "" {
		categories, err = s.categoryRepo.FindByType(ctx, *categoryType)
	} else {
		categories, err = s.categoryRepo.FindAll(ctx)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get categories: %w", err)
	}

	responses := make([]CategoryResponse, len(categories))
	for i, cat := range categories {
		responses[i] = CategoryResponse{
			ID:           cat.ID,
			Name:         cat.Name,
			CategoryType: cat.CategoryType,
			Icon:         cat.Icon,
			IsSystem:     cat.IsSystem,
			CreatedAt:    cat.CreatedAt,
		}
	}

	return responses, nil
}
