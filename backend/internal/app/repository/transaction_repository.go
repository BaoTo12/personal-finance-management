package repository

import (
	"context"
	"fmt"
	"pfn-backend/internal/app/entity"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TransactionFilter struct {
	TransactionType *string
	CategoryID      *int64
	StartDate       *time.Time
	EndDate         *time.Time
	Limit           int
	Offset          int
}

type TransactionStats struct {
	TotalIncome   int64
	TotalExpense  int64
	TotalTransfer int64
	Count         int64
}

type TransactionRepository interface {
	Create(ctx context.Context, tx *entity.Transaction) error
	FindByID(ctx context.Context, id int64) (*entity.Transaction, error)
	FindByUserID(ctx context.Context, userID uuid.UUID, filter TransactionFilter) ([]entity.Transaction, error)
	GetStats(ctx context.Context, userID uuid.UUID, startDate, endDate *time.Time) (*TransactionStats, error)
	Count(ctx context.Context, userID uuid.UUID, filter TransactionFilter) (int64, error)
}

type transactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) TransactionRepository {
	return &transactionRepository{db: db}
}

func (r *transactionRepository) Create(ctx context.Context, tx *entity.Transaction) error {
	if err := r.db.WithContext(ctx).Create(tx).Error; err != nil {
		return fmt.Errorf("failed to create transaction: %w", err)
	}
	return nil
}

func (r *transactionRepository) FindByID(ctx context.Context, id int64) (*entity.Transaction, error) {
	var tx entity.Transaction
	if err := r.db.WithContext(ctx).
		Preload("Category").
		Where("id = ?", id).
		First(&tx).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("transaction not found")
		}
		return nil, fmt.Errorf("failed to find transaction: %w", err)
	}
	return &tx, nil
}

func (r *transactionRepository) FindByUserID(ctx context.Context, userID uuid.UUID, filter TransactionFilter) ([]entity.Transaction, error) {
	query := r.db.WithContext(ctx).
		Preload("Category").
		Where("user_id = ?", userID)

	// Apply filters
	if filter.TransactionType != nil {
		query = query.Where("transaction_type = ?", *filter.TransactionType)
	}
	if filter.CategoryID != nil {
		query = query.Where("category_id = ?", *filter.CategoryID)
	}
	if filter.StartDate != nil {
		query = query.Where("transaction_date >= ?", *filter.StartDate)
	}
	if filter.EndDate != nil {
		query = query.Where("transaction_date <= ?", *filter.EndDate)
	}

	// Pagination
	if filter.Limit > 0 {
		query = query.Limit(filter.Limit)
	}
	if filter.Offset > 0 {
		query = query.Offset(filter.Offset)
	}

	var transactions []entity.Transaction
	if err := query.Order("transaction_date DESC, created_at DESC").Find(&transactions).Error; err != nil {
		return nil, fmt.Errorf("failed to find transactions: %w", err)
	}

	return transactions, nil
}

func (r *transactionRepository) GetStats(ctx context.Context, userID uuid.UUID, startDate, endDate *time.Time) (*TransactionStats, error) {
	stats := &TransactionStats{}

	query := r.db.WithContext(ctx).Model(&entity.Transaction{}).Where("user_id = ?", userID)

	if startDate != nil {
		query = query.Where("transaction_date >= ?", *startDate)
	}
	if endDate != nil {
		query = query.Where("transaction_date <= ?", *endDate)
	}

	// Get income
	if err := query.
		Where("transaction_type = ?", entity.TransactionTypeIncome).
		Select("COALESCE(SUM(amount), 0) as total").
		Scan(&stats.TotalIncome).Error; err != nil {
		return nil, fmt.Errorf("failed to get income stats: %w", err)
	}

	// Get expense
	if err := query.
		Where("transaction_type = ?", entity.TransactionTypeExpense).
		Select("COALESCE(SUM(amount), 0) as total").
		Scan(&stats.TotalExpense).Error; err != nil {
		return nil, fmt.Errorf("failed to get expense stats: %w", err)
	}

	// Get transfer
	if err := query.
		Where("transaction_type = ?", entity.TransactionTypeTransfer).
		Select("COALESCE(SUM(amount), 0) as total").
		Scan(&stats.TotalTransfer).Error; err != nil {
		return nil, fmt.Errorf("failed to get transfer stats: %w", err)
	}

	// Get count
	if err := query.Count(&stats.Count).Error; err != nil {
		return nil, fmt.Errorf("failed to get transaction count: %w", err)
	}

	return stats, nil
}

func (r *transactionRepository) Count(ctx context.Context, userID uuid.UUID, filter TransactionFilter) (int64, error) {
	query := r.db.WithContext(ctx).Model(&entity.Transaction{}).Where("user_id = ?", userID)

	if filter.TransactionType != nil {
		query = query.Where("transaction_type = ?", *filter.TransactionType)
	}
	if filter.CategoryID != nil {
		query = query.Where("category_id = ?", *filter.CategoryID)
	}
	if filter.StartDate != nil {
		query = query.Where("transaction_date >= ?", *filter.StartDate)
	}
	if filter.EndDate != nil {
		query = query.Where("transaction_date <= ?", *filter.EndDate)
	}

	var count int64
	if err := query.Count(&count).Error; err != nil {
		return 0, fmt.Errorf("failed to count transactions: %w", err)
	}

	return count, nil
}
