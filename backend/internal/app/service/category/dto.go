package category

import "time"

// CategoryResponse contains category data
type CategoryResponse struct {
	ID           int64     `json:"id"`
	Name         string    `json:"name"`
	CategoryType string    `json:"category_type"`
	Icon         string    `json:"icon,omitempty"`
	IsSystem     bool      `json:"is_system"`
	CreatedAt    time.Time `json:"created_at"`
}
