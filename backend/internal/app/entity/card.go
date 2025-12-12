package entity

import (
	"time"

	"github.com/google/uuid"
)

type Card struct {
	ID              int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID          uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	CardNumber      string    `gorm:"type:varchar(19);not null" json:"card_number"`
	CardNumberLast4 string    `gorm:"type:varchar(4);not null" json:"card_number_last4"`
	HolderName      string    `gorm:"type:varchar(100);not null" json:"holder_name"`
	ExpiryDate      string    `gorm:"type:varchar(7);not null" json:"expiry_date"`
	CardType        string    `gorm:"type:varchar(20);not null;default:Visa" json:"card_type"`
	Alias           string    `gorm:"type:varchar(100)" json:"alias"`
	Balance         int64     `gorm:"not null;default:0" json:"balance"`
	Color           string    `gorm:"type:varchar(100);not null;default:from-[#667eea] to-[#764ba2]" json:"color"`
	IsFrozen        bool      `gorm:"default:false" json:"is_frozen"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Relationships
	User         User          `gorm:"foreignKey:UserID;references:ID" json:"-"`
	Transactions []Transaction `gorm:"foreignKey:CardID" json:"-"`
}

// TableName sets the table name for Card
func (Card) TableName() string {
	return "cards"
}
