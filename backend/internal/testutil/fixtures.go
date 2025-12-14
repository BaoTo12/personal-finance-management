package testutil

import (
	"pfn-backend/internal/app/entity"
	"time"

	"github.com/google/uuid"
)

// Fixtures provides test data
type Fixtures struct{}

// NewFixtures creates a new fixtures instance
func NewFixtures() *Fixtures {
	return &Fixtures{}
}

// CreateUser creates a test user
func (f *Fixtures) CreateUser(email string) *entity.User {
	return &entity.User{
		ID:           uuid.New(),
		Email:        email,
		PasswordHash: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lW3z3cP7xyYa", // "password123"
		FirstName:    "Test",
		LastName:     "User",
		IsActive:     true,
	}
}

// CreateCard creates a test card
func (f *Fixtures) CreateCard(userID uuid.UUID) *entity.Card {
	return &entity.Card{
		UserID:          userID,
		CardNumber:      "1234567890123456",
		CardNumberLast4: "3456",
		HolderName:      "Test User",
		ExpiryDate:      "12/2025",
		CardType:        "Visa",
		Alias:           "Test Card",
		Balance:         100000, // $1,000.00
		Color:           "from-blue-500 to-purple-600",
		IsFrozen:        false,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}
}

// CreateTransaction creates a test transaction
func (f *Fixtures) CreateTransaction(userID uuid.UUID, cardID int64, transactionType string, amount int64) *entity.Transaction {
	return &entity.Transaction{
		UserID:          userID,
		CardID:          cardID,
		TransactionType: transactionType,
		Amount:          amount,
		TransactionDate: time.Now(),
		Description:     "Test transaction",
		CreatedAt:       time.Now(),
	}
}

// CreateCategory creates a test category
func (f *Fixtures) CreateCategory(name, categoryType string) *entity.Category {
	return &entity.Category{
		Name:         name,
		CategoryType: categoryType,
		Icon:         "🏠",
		IsSystem:     false,
		CreatedAt:    time.Now(),
	}
}

// CreateRefreshToken creates a test refresh token
func (f *Fixtures) CreateRefreshToken(userID uuid.UUID, tokenHash string) *entity.RefreshToken {
	return &entity.RefreshToken{
		UserID:    userID,
		TokenHash: tokenHash,
		ExpiresAt: time.Now().Add(24 * time.Hour),
		Revoked:   false,
		CreatedAt: time.Now(),
	}
}
