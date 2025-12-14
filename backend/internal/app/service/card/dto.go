package card

import (
	"time"

	"github.com/google/uuid"
)

// CreateCardRequest contains card creation data
type CreateCardRequest struct {
	CardNumber string `json:"card_number" binding:"required,len=16"`
	HolderName string `json:"holder_name" binding:"required"`
	ExpiryDate string `json:"expiry_date" binding:"required,len=7"` // MM/YYYY
	CardType   string `json:"card_type" binding:"required,oneof=Visa MasterCard"`
	Alias      string `json:"alias" binding:"omitempty"`
	Balance    int64  `json:"balance" binding:"omitempty,min=0"`
	Color      string `json:"color" binding:"omitempty"`
}

// UpdateCardRequest contains card update data
type UpdateCardRequest struct {
	Alias string `json:"alias" binding:"omitempty"`
	Color string `json:"color" binding:"omitempty"`
}

// CardResponse contains card data (without full card number)
type CardResponse struct {
	ID              int64     `json:"id"`
	UserID          uuid.UUID `json:"user_id"`
	CardNumberLast4 string    `json:"card_number_last4"`
	HolderName      string    `json:"holder_name"`
	ExpiryDate      string    `json:"expiry_date"`
	CardType        string    `json:"card_type"`
	Alias           string    `json:"alias,omitempty"`
	Balance         int64     `json:"balance"`
	Color           string    `json:"color"`
	IsFrozen        bool      `json:"is_frozen"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}
