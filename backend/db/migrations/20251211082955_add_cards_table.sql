-- +goose Up
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

-- +goose Down
DROP TABLE IF EXISTS cards;
