package postgres

import (
	"context"
	"fmt"
	"pfn-backend/internal/app/entity"
	"pfn-backend/internal/app/repository"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type cardRepository struct {
	db *gorm.DB
}

// NewCardRepository creates a new PostgreSQL implementation of CardRepository
func NewCardRepository(db *gorm.DB) repository.CardRepository {
	return &cardRepository{db: db}
}

func (r *cardRepository) Create(ctx context.Context, card *entity.Card) error {
	if err := r.db.WithContext(ctx).Create(card).Error; err != nil {
		return fmt.Errorf("failed to create card: %w", err)
	}
	return nil
}

func (r *cardRepository) FindByID(ctx context.Context, id int64) (*entity.Card, error) {
	var card entity.Card
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&card).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("card not found")
		}
		return nil, fmt.Errorf("failed to find card: %w", err)
	}
	return &card, nil
}

func (r *cardRepository) FindByUserID(ctx context.Context, userID uuid.UUID) ([]entity.Card, error) {
	var cards []entity.Card
	if err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&cards).Error; err != nil {
		return nil, fmt.Errorf("failed to find cards: %w", err)
	}
	return cards, nil
}

func (r *cardRepository) Update(ctx context.Context, card *entity.Card) error {
	if err := r.db.WithContext(ctx).Save(card).Error; err != nil {
		return fmt.Errorf("failed to update card: %w", err)
	}
	return nil
}

func (r *cardRepository) Delete(ctx context.Context, id int64) error {
	if err := r.db.WithContext(ctx).Where("id = ?", id).Delete(&entity.Card{}).Error; err != nil {
		return fmt.Errorf("failed to delete card: %w", err)
	}
	return nil
}

func (r *cardRepository) UpdateBalance(ctx context.Context, id int64, amount int64) error {
	if err := r.db.WithContext(ctx).
		Model(&entity.Card{}).
		Where("id = ?", id).
		UpdateColumn("balance", gorm.Expr("balance + ?", amount)).
		Error; err != nil {
		return fmt.Errorf("failed to update card balance: %w", err)
	}
	return nil
}

func (r *cardRepository) ToggleFreeze(ctx context.Context, id int64) error {
	if err := r.db.WithContext(ctx).
		Model(&entity.Card{}).
		Where("id = ?", id).
		UpdateColumn("is_frozen", gorm.Expr("NOT is_frozen")).
		Error; err != nil {
		return fmt.Errorf("failed to toggle card freeze: %w", err)
	}
	return nil
}
