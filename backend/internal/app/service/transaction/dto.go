package transaction

import (
	"time"

	"github.com/google/uuid"
)

// CreateTransactionRequest contains transaction creation data
type CreateTransactionRequest struct {
	CardID          int64     `json:"card_id" binding:"required"`
	CategoryID      *int64    `json:"category_id" binding:"omitempty"`
	TransactionType string    `json:"transaction_type" binding:"required,oneof=Income Expense Transfer"`
	Amount          int64     `json:"amount" binding:"required,min=1"`
	TransactionDate time.Time `json:"transaction_date" binding:"required"`
	Description     string    `json:"description" binding:"omitempty"`
}

// TransactionFilter contains filtering parameters
type TransactionFilter struct {
	TransactionType *string    `form:"transaction_type" binding:"omitempty,oneof=Income Expense Transfer"`
	CategoryID      *int64     `form:"category_id" binding:"omitempty"`
	StartDate       *time.Time `form:"start_date" binding:"omitempty"`
	EndDate         *time.Time `form:"end_date" binding:"omitempty"`
	Limit           int        `form:"limit" binding:"omitempty,min=1,max=100"`
	Offset          int        `form:"offset" binding:"omitempty,min=0"`
}

// TransactionResponse contains transaction data with category
type TransactionResponse struct {
	ID              int64         `json:"id"`
	UserID          uuid.UUID     `json:"user_id"`
	CardID          int64         `json:"card_id"`
	CategoryID      *int64        `json:"category_id,omitempty"`
	Category        *CategoryInfo `json:"category,omitempty"`
	TransactionType string        `json:"transaction_type"`
	Amount          int64         `json:"amount"`
	TransactionDate time.Time     `json:"transaction_date"`
	Description     string        `json:"description,omitempty"`
	CreatedAt       time.Time     `json:"created_at"`
}

// CategoryInfo contains basic category information
type CategoryInfo struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
	Icon string `json:"icon,omitempty"`
}

// StatsResponse contains transaction statistics
type StatsResponse struct {
	TotalIncome   int64 `json:"total_income"`
	TotalExpense  int64 `json:"total_expense"`
	TotalTransfer int64 `json:"total_transfer"`
	NetIncome     int64 `json:"net_income"`
	Count         int64 `json:"count"`
}

// TransactionListResponse contains paginated transactions
type TransactionListResponse struct {
	Transactions []TransactionResponse `json:"transactions"`
	Total        int64                 `json:"total"`
	Limit        int                   `json:"limit"`
	Offset       int                   `json:"offset"`
}
