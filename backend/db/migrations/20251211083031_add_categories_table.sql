-- +goose Up
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category_type VARCHAR(10) NOT NULL,
    icon VARCHAR(50),
    is_system BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT category_type_valid CHECK (category_type IN ('Income', 'Expense', 'Transfer'))
);

CREATE INDEX idx_categories_type ON categories(category_type);

-- +goose Down
DROP TABLE IF EXISTS categories;