package repository

import (
	"context"
	"pfn-backend/internal/app/entity"
	"time"

	"github.com/google/uuid"
)

// TransactionFilter contains filtering parameters for transactions
type TransactionFilter struct {
	TransactionType *string
	CategoryID      *int64
	StartDate       *time.Time
	EndDate         *time.Time
	Limit           int
	Offset          int
}

// TransactionStats contains aggregated transaction statistics
type TransactionStats struct {
	TotalIncome   int64
	TotalExpense  int64
	TotalTransfer int64
	Count         int64
}

// TransactionRepository defines the interface for transaction data access
type TransactionRepository interface {
	Create(ctx context.Context, transaction *entity.Transaction) error
	FindByID(ctx context.Context, id int64) (*entity.Transaction, error)
	FindByUserID(ctx context.Context, userID uuid.UUID, filter TransactionFilter) ([]entity.Transaction, error)
	Update(ctx context.Context, transaction *entity.Transaction) error
	Delete(ctx context.Context, id int64) error
	Count(ctx context.Context, userID uuid.UUID, filter TransactionFilter) (int64, error)
	GetStats(ctx context.Context, userID uuid.UUID, startDate, endDate *time.Time) (*TransactionStats, error)
}
