package entity

import "time"

type Category struct {
	ID           int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Name         string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"name"`
	CategoryType string    `gorm:"type:varchar(10);not null;index" json:"category_type"`
	Icon         string    `gorm:"type:varchar(50)" json:"icon"`
	IsSystem     bool      `gorm:"default:true" json:"is_system"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`

	// Relationships
	Transactions []Transaction `gorm:"foreignKey:CategoryID" json:"-"`
}

// TableName sets the table name for Category
func (Category) TableName() string {
	return "categories"
}

// CategoryType constants
const (
	CategoryTypeIncome   = "Income"
	CategoryTypeExpense  = "Expense"
	CategoryTypeTransfer = "Transfer"
)
