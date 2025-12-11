-- +goose Up
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
DELETE FROM categories WHERE is_system = TRUE;