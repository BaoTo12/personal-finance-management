package entity

import "github.com/google/uuid"

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email        string    `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"not null" json:"-"`
	FirstName    string    `gorm:"not null" json:"first_name"`
	LastName     string    `gorm:"not null" json:"last_name"`
	IsActive     bool      `gorm:"default:true" json:"is_active"`
}

// TableName sets the table name for User
func (User) TableName() string {
	return "users"
}

// FullName returns the user's full name
func (u *User) FullName() string {
	return u.FirstName + " " + u.LastName
}
