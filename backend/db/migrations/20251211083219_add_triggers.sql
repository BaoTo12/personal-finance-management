-- +goose Up
-- Auto-update card balance
CREATE OR REPLACE FUNCTION update_card_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE cards
        SET balance = balance + 
            CASE 
                WHEN NEW.transaction_type = 'Income' THEN NEW.amount
                WHEN NEW.transaction_type = 'Expense' THEN -NEW.amount
                ELSE 0
            END,
            updated_at = NOW()
        WHERE id = NEW.card_id;
        
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE cards
        SET balance = balance - 
            CASE 
                WHEN OLD.transaction_type = 'Income' THEN OLD.amount
                WHEN OLD.transaction_type = 'Expense' THEN -OLD.amount
                ELSE 0
            END
        WHERE id = OLD.card_id;
        
        UPDATE cards
        SET balance = balance + 
            CASE 
                WHEN NEW.transaction_type = 'Income' THEN NEW.amount
                WHEN NEW.transaction_type = 'Expense' THEN -NEW.amount
                ELSE 0
            END,
            updated_at = NOW()
        WHERE id = NEW.card_id;
        
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE cards
        SET balance = balance - 
            CASE 
                WHEN OLD.transaction_type = 'Income' THEN OLD.amount
                WHEN OLD.transaction_type = 'Expense' THEN -OLD.amount
                ELSE 0
            END,
            updated_at = NOW()
        WHERE id = OLD.card_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_card_balance
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_card_balance();

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_cards_updated_at BEFORE UPDATE ON cards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_transactions_updated_at BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- +goose Down
DROP TRIGGER IF EXISTS trg_update_card_balance ON transactions;
DROP FUNCTION IF EXISTS update_card_balance();
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
DROP TRIGGER IF EXISTS trg_cards_updated_at ON cards;
DROP TRIGGER IF EXISTS trg_transactions_updated_at ON transactions;
DROP FUNCTION IF EXISTS update_updated_at_column();