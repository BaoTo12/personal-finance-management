-- +goose Up
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    currency_code VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);


CREATE INDEX idx_users_email ON users(email);

CREATE TABLE cards (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_number VARCHAR(19) NOT NULL,
    card_number_last4 VARCHAR(4) NOT NULL,
    holder_name VARCHAR(100) NOT NULL,
    expiry_date VARCHAR(7) NOT NULL,
    card_type VARCHAR(20) NOT NULL DEFAULT 'Visa',
    alias VARCHAR(100),
    balance BIGINT NOT NULL DEFAULT 0,
    color VARCHAR(100) NOT NULL DEFAULT 'from-[#667eea] to-[#764ba2]',
    is_frozen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT card_type_valid CHECK (card_type IN ('Visa', 'MasterCard'))
);

CREATE INDEX idx_cards_user_id ON cards(user_id);

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

CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id BIGINT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    transaction_type VARCHAR(10) NOT NULL,
    amount BIGINT NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT transaction_type_valid CHECK (transaction_type IN ('Income', 'Expense', 'Transfer')),
    CONSTRAINT amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_card_id ON transactions(card_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);

CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash) WHERE NOT revoked;

INSERT INTO categories (name, category_type, icon, is_system) VALUES
-- Income
('Salary', 'Income', 'briefcase', TRUE),
('Freelance', 'Income', 'code', TRUE),
('Investment', 'Income', 'trending-up', TRUE),
('Gift', 'Income', 'gift', TRUE),
('Other Income', 'Income', 'dollar-sign', TRUE),

-- Expense
('Shopping', 'Expense', 'shopping-bag', TRUE),
('Groceries', 'Expense', 'shopping-cart', TRUE),
('Subscription', 'Expense', 'repeat', TRUE),
('Dining', 'Expense', 'utensils', TRUE),
('Transportation', 'Expense', 'car', TRUE),
('Utilities', 'Expense', 'zap', TRUE),
('Entertainment', 'Expense', 'film', TRUE),
('Healthcare', 'Expense', 'heart-pulse', TRUE),
('Travel', 'Expense', 'plane', TRUE),
('Other Expense', 'Expense', 'more-horizontal', TRUE),

-- Transfer
('Transfer', 'Transfer', 'arrow-right-left', TRUE);
-- +goose Down
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS refresh_tokens;
DELETE FROM categories WHERE is_system = TRUE;