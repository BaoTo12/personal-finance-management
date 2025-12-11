# ChiBao Personal Finance Management — Database Design & Goose Migration Guide

## 1. Overview

This document provides a simplified, production-ready database schema for **ChiBao Personal Finance Management**, designed to support:
- ✅ Multi-card wallet management with freeze functionality
- ✅ Transaction tracking with categories
- ✅ Financial analytics
- ✅ User authentication

**Database:** PostgreSQL 14+  
**Migration Tool:** Goose (SQL-based migrations)  
**Backend:** Go with GORM ORM

---

## 2. Complete Database Schema

### 2.1 ERD (Entity Relationship Diagram)

```
┌──────────┐         ┌────────────┐         ┌──────────────┐
│  users   │────────<│   cards    │         │ transactions │
└──────────┘         └────────────┘         └──────────────┘
     │                     │                        │
     │                     └────────────────────────┘
     │                                               │
     │                                               │
     ▼                                               ▼
┌──────────┐                                  ┌──────────┐
│categories│                                  │   tags   │
└──────────┘                                  └──────────┘
     │                                               │
     └───────────────────────────────────────────────┘
                           │
                           ▼
                   ┌───────────────┐
                   │transaction_tags│
                   └───────────────┘
```

---

### 2.2 Table: users

User accounts and authentication.

```sql
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
```

**Fields:**
- `id` - Primary key
- `email` - Login email (unique)
- `password_hash` - Bcrypt hashed password
- `first_name`, `last_name` - User's name
- `currency_code` - Default currency (USD, EUR, etc.)
- `is_active` - Account status
- `created_at`, `updated_at` - Timestamps

---

### 2.3 Table: cards

Credit/debit cards in wallet.

```sql
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
```

**Fields:**
- `id` - Primary key
- `user_id` - Owner of the card
- `card_number` - Full card number (encrypt in production!)
- `card_number_last4` - Last 4 digits for display (e.g., "4532")
- `holder_name` - Cardholder name (e.g., "JOHN DOE")
- `expiry_date` - Expiry in MM/YY format (e.g., "12/25")
- `card_type` - Visa or MasterCard
- `alias` - Friendly name (e.g., "My Work Card")
- `balance` - Current balance in cents (e.g., 100000 = $1,000.00)
- `color` - Tailwind gradient class for UI (e.g., "from-[#667eea] to-[#764ba2]")
- `is_frozen` - True if card is frozen

**Important:** Store balances as **integers in cents** to avoid floating-point errors!

---

### 2.4 Table: categories

Transaction categories (Income/Expense/Transfer).

```sql
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
```

**Fields:**
- `id` - Primary key
- `name` - Category name (e.g., "Shopping", "Salary")
- `category_type` - Income, Expense, or Transfer
- `icon` - Icon name for UI
- `is_system` - System categories cannot be deleted

**System Categories (pre-seeded):**
- **Income:** Salary, Freelance, Investment, Gift, Other Income
- **Expense:** Shopping, Groceries, Subscription, Dining, Transportation, Utilities, Entertainment, Healthcare, Travel, Other Expense
- **Transfer:** Transfer

---

### 2.5 Table: transactions

All financial transactions.

```sql
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
```

**Fields:**
- `id` - Primary key
- `user_id` - Transaction owner
- `card_id` - Which card this transaction belongs to
- `category_id` - Category (can be NULL)
- `transaction_type` - Income, Expense, or Transfer
- `amount` - Amount in cents (always positive)
- `transaction_date` - When transaction occurred
- `description` - User notes

---

### 2.6 Table: tags (Optional - for advanced filtering)

```sql
CREATE TABLE tags (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, name)
);

CREATE INDEX idx_tags_user_id ON tags(user_id);
```

---

### 2.7 Table: transaction_tags (Optional - many-to-many)

```sql
CREATE TABLE transaction_tags (
    transaction_id BIGINT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (transaction_id, tag_id)
);

CREATE INDEX idx_transaction_tags_tag_id ON transaction_tags(tag_id);
```

---

### 2.8 Table: refresh_tokens (For JWT authentication)

```sql
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
```

---

## 3. Database Triggers

### 3.1 Auto-update card balance when transaction changes

```sql
CREATE OR REPLACE FUNCTION update_card_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Add money for Income, subtract for Expense
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
        -- Revert old transaction
        UPDATE cards
        SET balance = balance - 
            CASE 
                WHEN OLD.transaction_type = 'Income' THEN OLD.amount
                WHEN OLD.transaction_type = 'Expense' THEN -OLD.amount
                ELSE 0
            END
        WHERE id = OLD.card_id;
        
        -- Apply new transaction
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
        -- Revert transaction
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
```

### 3.2 Auto-update timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_cards_updated_at
BEFORE UPDATE ON cards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## 4. Seed Data for System Categories

```sql
INSERT INTO categories (name, category_type, icon, is_system) VALUES
-- Income Categories
('Salary', 'Income', 'briefcase', TRUE),
('Freelance', 'Income', 'code', TRUE),
('Investment', 'Income', 'trending-up', TRUE),
('Gift', 'Income', 'gift', TRUE),
('Other Income', 'Income', 'dollar-sign', TRUE),

-- Expense Categories
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

-- Transfer Category
('Transfer', 'Transfer', 'arrow-right-left', TRUE);
```

---

## 5. Useful SQL Queries

### 5.1 Get user's total balance

```sql
SELECT SUM(balance) AS total_balance
FROM cards
WHERE user_id = $1 AND NOT is_frozen;
```

### 5.2 Get financial analytics (last 12 months)

```sql
SELECT 
    TO_CHAR(DATE_TRUNC('month', transaction_date), 'Mon') AS month,
    SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE 0 END) AS income,
    SUM(CASE WHEN transaction_type = 'Expense' THEN amount ELSE 0 END) AS expense
FROM transactions
WHERE user_id = $1
    AND transaction_date >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', transaction_date)
ORDER BY DATE_TRUNC('month', transaction_date) ASC;
```

### 5.3 Get recent transactions with details

```sql
SELECT 
    t.id,
    t.amount,
    t.transaction_type,
    t.transaction_date,
    t.description,
    c.name AS category_name,
    card.alias AS card_alias,
    card.card_number_last4
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN cards card ON t.card_id = card.id
WHERE t.user_id = $1
ORDER BY t.transaction_date DESC, t.created_at DESC
LIMIT 20;
```

---

# 🎓 GOOSE MIGRATION TUTORIAL: From Beginner to Expert

Welcome to the complete Goose migration course! This is a university-level guide teaching you everything about database migrations in Go.

---

## Chapter 1: What are Database Migrations?

### 1.1 The Problem

Imagine you're building ChiBao. You start with a `users` table. Later, you add `cards`, then `transactions`. How do you:
- **Track** these changes?
- **Apply** them to production databases?
- **Rollback** if something goes wrong?
- **Share** changes with your team?

**Answer:** Database migrations!

### 1.2 What is Goose?

Goose is a database migration tool for Go. It:
- ✅ Manages schema changes with **versioned SQL files**
- ✅ Applies migrations **in order**
- ✅ Supports **rollback** (undo changes)
- ✅ Works with PostgreSQL, MySQL, SQLite, etc.

**Alternative tools:** golang-migrate, Flyway, Liquibase  
**Why Goose?** Simple, pure SQL, works great with Go projects.

---

## Chapter 2: Installing Goose

### 2.1 Installation

```bash
# Install Goose CLI globally
go install github.com/pressly/goose/v3/cmd/goose@latest

# Verify installation
goose -version
# Output: goose version: v3.x.x
```

### 2.2 Project Setup

```bash
# Navigate to your project
cd C:\Users\Admin\Desktop\projects\personal-finance-management\backend

# Create migrations directory
mkdir -p db\migrations

# Your project structure should look like:
# backend/
# ├── cmd/
# ├── internal/
# ├── db/
# │   └── migrations/    <- Goose migrations go here
# └── go.mod
```

---

## Chapter 3: Your First Migration

### 3.1 Creating a Migration File

Goose creates migration files with timestamps and names:

```bash
# Create a migration named "init_schema"
goose -dir db\migrations create init_schema sql

# Output:
# Created new file: db/migrations/20241211120000_init_schema.sql
```

**File naming convention:**
```
YYYYMMDDHHMMSS_migration_name.sql
└─ Timestamp ─┘ └─ Your name ─┘
```

The timestamp ensures migrations run **in order**.

### 3.2 Writing Your First Migration

Open `db/migrations/20241211120000_init_schema.sql`:

```sql
-- +goose Up
-- This runs when applying the migration
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

-- +goose Down
-- This runs when rolling back the migration
DROP TABLE IF EXISTS users;
```

**Key concepts:**
- `-- +goose Up`: Code to apply the migration
- `-- +goose Down`: Code to undo the migration
- Always write both Up and Down for safety!

---

## Chapter 4: Running Migrations

### 4.1 Database Connection String

Set your PostgreSQL connection:

```bash
# Windows PowerShell
$env:DATABASE_URL="postgres://postgres:postgres@localhost:5432/pfm-database?sslmode=disable"

# Or create a .env file:
# DATABASE_URL=postgres://postgres:postgres@localhost:5432/pfm-database?sslmode=disable
```

Format: `postgres://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=disable`

### 4.2 Applying Migrations

```bash
# Apply all pending migrations
goose -dir db\migrations postgres $env:DATABASE_URL up

# Output:
# OK    20241211120000_init_schema.sql
```

**What happened?**
1. Goose connected to `pfm-database`
2. Created a `goose_db_version` table to track migrations
3. Ran the `-- +goose Up` section
4. Recorded the migration as applied

### 4.3 Checking Migration Status

```bash
goose -dir db\migrations postgres $env:DATABASE_URL status

# Output:
# Applied At                  Migration
# ======================================
# Wed Dec 11 12:00:00 2024 -- 20241211120000_init_schema.sql
```

---

## Chapter 5: Multiple Migrations (The Cards Table)

### 5.1 Creating a Second Migration

```bash
goose -dir db\migrations create add_cards_table sql
```

**File:** `db/migrations/20241211120100_add_cards_table.sql`

```sql
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
```

### 5.2 Apply the New Migration

```bash
goose -dir db\migrations postgres $env:DATABASE_URL up

# Output:
# OK    20241211120100_add_cards_table.sql
```

---

## Chapter 6: Complete ChiBao Migrations

### Migration 1: Users Table
**File:** `20241211120000_init_schema.sql`

```sql
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

-- +goose Down
DROP TABLE IF EXISTS users;
```

### Migration 2: Cards Table
**File:** `20241211120100_add_cards_table.sql`

```sql
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
```

### Migration 3: Categories Table
**File:** `20241211120200_add_categories_table.sql`

```sql
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
```

### Migration 4: Transactions Table
**File:** `20241211120300_add_transactions_table.sql`

```sql
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
```

### Migration 5: Tags Tables (Optional)
**File:** `20241211120400_add_tags_tables.sql`

```sql
-- +goose Up
CREATE TABLE tags (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, name)
);

CREATE INDEX idx_tags_user_id ON tags(user_id);

CREATE TABLE transaction_tags (
    transaction_id BIGINT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (transaction_id, tag_id)
);

CREATE INDEX idx_transaction_tags_tag_id ON transaction_tags(tag_id);

-- +goose Down
DROP TABLE IF EXISTS transaction_tags;
DROP TABLE IF EXISTS tags;
```

### Migration 6: Refresh Tokens Table
**File:** `20241211120500_add_refresh_tokens_table.sql`

```sql
-- +goose Up
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

-- +goose Down
DROP TABLE IF EXISTS refresh_tokens;
```

### Migration 7: Database Triggers
**File:** `20241211120600_add_triggers.sql`

```sql
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
```

### Migration 8: Seed Categories
**File:** `20241211120700_seed_categories.sql`

```sql
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
```

---

## Chapter 7: Advanced Goose Operations

### 7.1 Rolling Back Migrations

```bash
# Rollback the last migration
goose -dir db\migrations postgres $env:DATABASE_URL down

# Rollback to a specific version
goose -dir db\migrations postgres $env:DATABASE_URL down-to 20241211120300

# Rollback ALL migrations (dangerous!)
goose -dir db\migrations postgres $env:DATABASE_URL reset
```

### 7.2 Fixing a Migration

If you make a mistake:

```bash
# 1. Rollback the bad migration
goose -dir db\migrations postgres $env:DATABASE_URL down

# 2. Edit the migration file
# Fix your SQL

# 3. Re-apply
goose -dir db\migrations postgres $env:DATABASE_URL up
```

### 7.3 Migration Best Practices

✅ **DO:**
- Always write both `Up` and `Down`
- Test migrations on dev database first
- Use descriptive migration names
- Keep migrations small and focused
- Never edit applied migrations in production

❌ **DON'T:**
- Delete old migration files
- Change migration timestamps
- Include destructive operations without backups
- Put business logic in migrations

---

## Chapter 8: Goose in Go Code

### 8.1 Embedding Migrations in Your App

```go
package main

import (
    "database/sql"
    "embed"
    "log"

    "github.com/pressly/goose/v3"
    _ "github.com/lib/pq"
)

//go:embed db/migrations/*.sql
var embedMigrations embed.FS

func main() {
    db, err := sql.Open("postgres", "postgres://postgres:postgres@localhost:5432/pfm-database?sslmode=disable")
    if err != nil {
        log.Fatal(err)
    }

    goose.SetBaseFS(embedMigrations)

    if err := goose.SetDialect("postgres"); err != nil {
        log.Fatal(err)
    }

    if err := goose.Up(db, "db/migrations"); err != nil {
        log.Fatal(err)
    }

    log.Println("Migrations applied successfully!")
}
```

### 8.2 Migration Status in Code

```go
version, err := goose.GetDBVersion(db)
if err != nil {
    log.Fatal(err)
}
log.Printf("Current database version: %d", version)
```

---

## Chapter 9: Production Deployment

### 9.1 Pre-Deployment Checklist

```bash
# 1. Backup your database
pg_dump -h localhost -U postgres pfm-database > backup_$(date +%Y%m%d).sql

# 2. Test migrations on staging
goose -dir db\migrations postgres $STAGING_DATABASE_URL up

# 3. Check status
goose -dir db\migrations postgres $STAGING_DATABASE_URL status

# 4. If successful, apply to production
goose -dir db\migrations postgres $PRODUCTION_DATABASE_URL up
```

### 9.2 CI/CD Integration

**GitHub Actions example:**

```yaml
name: Database Migration

on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Goose
        run: go install github.com/pressly/goose/v3/cmd/goose@latest
      
      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          goose -dir db/migrations postgres "$DATABASE_URL" up
```

---

## Chapter 10: Common Issues & Solutions

### Issue 1: "no such table: goose_db_version"

**Cause:** Goose hasn't initialized the tracking table.

**Solution:**
```bash
goose -dir db\migrations postgres $env:DATABASE_URL up
```
Goose will create the table automatically.

### Issue 2: "migration failed: syntax error"

**Cause:** SQL syntax error in your migration.

**Solution:**
1. Check your SQL syntax
2. Test the SQL directly in PostgreSQL
3. Fix and re-run

### Issue 3: "can't acquire lock"

**Cause:** Another Goose process is running.

**Solution:**
```bash
# Wait for other process to finish, or manually unlock:
DELETE FROM goose_db_version WHERE is_applied = false;
```

---

## Chapter 11: Goose vs Alternatives

| Feature | Goose | golang-migrate | Flyway |
|---------|-------|----------------|--------|
| Language | Go | Go | Java |
| SQL Support | ✅ | ✅ | ✅ |
| Go Code Migrations | ✅ | ✅ | ❌ |
| Rollback | ✅ | ✅ | ⚠️ Paid |
| Ease of Use | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

**Verdict:** Goose is perfect for Go projects!

---

## Chapter 12: Quick Reference Commands

```bash
# Create migration
goose -dir db\migrations create MIGRATION_NAME sql

# Apply all pending
goose -dir db\migrations postgres $env:DATABASE_URL up

# Apply one migration
goose -dir db\migrations postgres $env:DATABASE_URL up-by-one

# Rollback one migration
goose -dir db\migrations postgres $env:DATABASE_URL down

# Check status
goose -dir db\migrations postgres $env:DATABASE_URL status

# Reset database (rollback all)
goose -dir db\migrations postgres $env:DATABASE_URL reset

# Validate migrations
goose -dir db\migrations validate

# Get current version
goose -dir db\migrations postgres $env:DATABASE_URL version
```

---

## 🎯 Final Exercise: Set Up ChiBao Database

**Task:** Apply all ChiBao migrations to your database.

**Steps:**

```bash
# 1. Ensure PostgreSQL is running
# Check: psql -U postgres -c "SELECT version();"

# 2. Create database
createdb -U postgres pfm-database

# 3. Set connection string
$env:DATABASE_URL="postgres://postgres:postgres@localhost:5432/pfm-database?sslmode=disable"

# 4. Create migrations directory
mkdir -p db\migrations

# 5. Create all 8 migration files (copy from Chapter 6 above)
# - 20241211120000_init_schema.sql
# - 20241211120100_add_cards_table.sql
# - 20241211120200_add_categories_table.sql
# - 20241211120300_add_transactions_table.sql
# - 20241211120400_add_tags_tables.sql
# - 20241211120500_add_refresh_tokens_table.sql
# - 20241211120600_add_triggers.sql
# - 20241211120700_seed_categories.sql

# 6. Run migrations
goose -dir db\migrations postgres $env:DATABASE_URL up

# 7. Verify
goose -dir db\migrations postgres $env:DATABASE_URL status

# Expected output:
# Applied At                  Migration
# ======================================
# ... 8 migrations listed
```

**Congratulations!** 🎉 Your ChiBao database is ready!

---

*Database Design & Goose Tutorial for ChiBao — Created December 11, 2025*
