package entity

import (
	"time"

	"github.com/google/uuid"
)

type RefreshToken struct {
	ID        int64     `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	TokenHash string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"token_hash"`
	ExpiresAt time.Time `gorm:"not null" json:"expires_at"`
	Revoked   bool      `gorm:"default:false" json:"revoked"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`

	// Relationships
	User User `gorm:"foreignKey:UserID;references:ID" json:"-"`
}

// TableName sets the table name for RefreshToken
func (RefreshToken) TableName() string {
	return "refresh_tokens"
}

// IsExpired checks if the refresh token has expired
func (rt *RefreshToken) IsExpired() bool {
	return time.Now().After(rt.ExpiresAt)
}

// IsValid checks if the refresh token is valid (not expired and not revoked)
func (rt *RefreshToken) IsValid() bool {
	return !rt.IsExpired() && !rt.Revoked
}
