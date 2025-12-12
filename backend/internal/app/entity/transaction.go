package entity

import (
	"time"

	"github.com/google/uuid"
)

type Transaction struct {
	ID              int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID          uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	CardID          int64     `gorm:"not null" json:"card_id"`
	CategoryID      *int64    `gorm:"index" json:"category_id"`
	TransactionType string    `gorm:"type:varchar(10);not null" json:"transaction_type"`
	Amount          int64     `gorm:"not null" json:"amount"`
	TransactionDate time.Time `gorm:"type:date;not null" json:"transaction_date"`
	Description     string    `gorm:"type:text" json:"description"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relationships
	User     User      `gorm:"foreignKey:UserID;references:ID" json:"-"`
	Card     Card      `gorm:"foreignKey:CardID;references:ID" json:"-"`
	Category *Category `gorm:"foreignKey:CategoryID;references:ID" json:"category,omitempty"`
}

// TableName sets the table name for Transaction
func (Transaction) TableName() string {
	return "transactions"
}

// TransactionType constants
const (
	TransactionTypeIncome   = "Income"
	TransactionTypeExpense  = "Expense"
	TransactionTypeTransfer = "Transfer"
)
