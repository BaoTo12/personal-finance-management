package user

import "github.com/google/uuid"

// UpdateProfileRequest contains profile update data
type UpdateProfileRequest struct {
	FirstName string `json:"first_name" binding:"omitempty,min=2"`
	LastName  string `json:"last_name" binding:"omitempty,min=2"`
}

// ProfileResponse contains user profile data
type ProfileResponse struct {
	ID        uuid.UUID `json:"id"`
	Email     string    `json:"email"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	FullName  string    `json:"full_name"`
	IsActive  bool      `json:"is_active"`
}
