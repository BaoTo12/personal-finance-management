package postgres

import (
	"context"
	"fmt"
	"pfn-backend/internal/app/entity"
	"pfn-backend/internal/app/repository"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type transactionRepository struct {
	db *gorm.DB
}

// NewTransactionRepository creates a new PostgreSQL implementation of TransactionRepository
func NewTransactionRepository(db *gorm.DB) repository.TransactionRepository {
	return &transactionRepository{db: db}
}

func (r *transactionRepository) Create(ctx context.Context, transaction *entity.Transaction) error {
	if err := r.db.WithContext(ctx).Create(transaction).Error; err != nil {
		return fmt.Errorf("failed to create transaction: %w", err)
	}
	return nil
}

func (r *transactionRepository) FindByID(ctx context.Context, id int64) (*entity.Transaction, error) {
	var transaction entity.Transaction
	if err := r.db.WithContext(ctx).
		Preload("Category").
		Where("id = ?", id).
		First(&transaction).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("transaction not found")
		}
		return nil, fmt.Errorf("failed to find transaction: %w", err)
	}
	return &transaction, nil
}

func (r *transactionRepository) FindByUserID(ctx context.Context, userID uuid.UUID, filter repository.TransactionFilter) ([]entity.Transaction, error) {
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

func (r *transactionRepository) Update(ctx context.Context, transaction *entity.Transaction) error {
	if err := r.db.WithContext(ctx).Save(transaction).Error; err != nil {
		return fmt.Errorf("failed to update transaction: %w", err)
	}
	return nil
}

func (r *transactionRepository) Delete(ctx context.Context, id int64) error {
	if err := r.db.WithContext(ctx).Where("id = ?", id).Delete(&entity.Transaction{}).Error; err != nil {
		return fmt.Errorf("failed to delete transaction: %w", err)
	}
	return nil
}

func (r *transactionRepository) Count(ctx context.Context, userID uuid.UUID, filter repository.TransactionFilter) (int64, error) {
	query := r.db.WithContext(ctx).
		Model(&entity.Transaction{}).
		Where("user_id = ?", userID)

	// Apply same filters as FindByUserID
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

func (r *transactionRepository) GetStats(ctx context.Context, userID uuid.UUID, startDate, endDate *time.Time) (*repository.TransactionStats, error) {
	query := r.db.WithContext(ctx).
		Model(&entity.Transaction{}).
		Where("user_id = ?", userID)

	if startDate != nil {
		query = query.Where("transaction_date >= ?", *startDate)
	}
	if endDate != nil {
		query = query.Where("transaction_date <= ?", *endDate)
	}

	var stats repository.TransactionStats

	// Get aggregated stats
	err := query.
		Select(`
			COALESCE(SUM(CASE WHEN transaction_type = ? THEN amount ELSE 0 END), 0) as total_income,
			COALESCE(SUM(CASE WHEN transaction_type = ? THEN amount ELSE 0 END), 0) as total_expense,
			COALESCE(SUM(CASE WHEN transaction_type = ? THEN amount ELSE 0 END), 0) as total_transfer,
			COUNT(*) as count
		`, entity.TransactionTypeIncome, entity.TransactionTypeExpense, entity.TransactionTypeTransfer).
		Scan(&stats).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get transaction stats: %w", err)
	}

	return &stats, nil
}
