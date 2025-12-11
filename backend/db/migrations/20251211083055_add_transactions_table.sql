-- +goose Up
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

-- +goose Down
DROP TABLE IF EXISTS transactions;