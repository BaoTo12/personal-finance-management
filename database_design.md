# Personal Finance Management App — Database Design

> Comprehensive database schema design for the personal finance management app using PostgreSQL.

---

## 1. Database Overview

### 1.1 Database Technology
- **RDBMS:** PostgreSQL 14+
- **ORM:** GORM (Go)
- **Migration Tool:** Goose
- **Character Set:** UTF-8
- **Timezone:** UTC (all timestamps stored in UTC)

### 1.2 Design Principles
- Normalization to 3NF for core transactional tables
- Denormalization for performance-critical aggregates (cached totals)
- Soft deletes for audit trail preservation
- Foreign key constraints for referential integrity
- Indexing strategy for query performance
- JSON columns for flexible metadata and rule configurations

---

## 2. Core Entity Relationship Diagram (ERD)

```
┌──────────┐         ┌────────────┐         ┌──────────────┐
│  users   │────────<│  accounts  │────────<│ transactions │
└──────────┘         └────────────┘         └──────────────┘
     │                                              │
     │                                              │
     ├──────────────┐                              │
     │              │                              │
     ▼              ▼                              ▼
┌──────────┐  ┌──────────┐                  ┌──────────┐
│categories│  │  budgets │                  │   tags   │
└──────────┘  └──────────┘                  └──────────┘
     │              │                              │
     └──────────────┴──────────────────────────────┘
                    │
                    ▼
            ┌───────────────┐
            │transaction_tags│
            └───────────────┘
```

---

## 3. Table Schemas

### 3.1 users

Stores user authentication and profile information.

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    locale VARCHAR(10) DEFAULT 'en_US',
    currency_code VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
```

**Fields:**
- `id`: Primary key, auto-increment
- `email`: Unique email address for login
- `password_hash`: Bcrypt/Argon2 hashed password
- `first_name`, `last_name`: User's name
- `locale`: Preferred language (e.g., en_US, ja_JP)
- `currency_code`: Default currency (ISO 4217)
- `timezone`: User's timezone for display purposes
- `is_active`: Account status (for suspension)
- `email_verified`: Email verification status
- `last_login_at`: Timestamp of last successful login
- `created_at`, `updated_at`: Standard audit timestamps
- `deleted_at`: Soft delete timestamp

---

### 3.2 accounts

Financial accounts (bank, credit card, cash, etc.).

```sql
CREATE TABLE accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    account_type VARCHAR(20) NOT NULL,
    currency_code VARCHAR(3) NOT NULL DEFAULT 'USD',
    initial_balance BIGINT NOT NULL DEFAULT 0,
    current_balance BIGINT NOT NULL DEFAULT 0,
    institution_name VARCHAR(255),
    account_number_last4 VARCHAR(4),
    color VARCHAR(7),
    icon VARCHAR(50),
    is_archived BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT account_type_valid CHECK (
        account_type IN ('checking', 'savings', 'credit_card', 'cash', 'investment', 'loan', 'other')
    ),
    CONSTRAINT currency_code_valid CHECK (LENGTH(currency_code) = 3)
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_type ON accounts(account_type);
CREATE INDEX idx_accounts_deleted_at ON accounts(deleted_at);
```

**Fields:**
- `id`: Primary key
- `user_id`: Foreign key to users
- `name`: User-defined account name (e.g., "Chase Checking")
- `account_type`: Type of account (checking, savings, credit_card, cash, investment, loan, other)
- `currency_code`: ISO 4217 currency code
- `initial_balance`: Opening balance in cents (BIGINT to avoid float issues)
- `current_balance`: Current balance in cents (updated via triggers or application logic)
- `institution_name`: Bank/institution name
- `account_number_last4`: Last 4 digits for identification
- `color`: Hex color for UI display
- `icon`: Icon identifier for UI
- `is_archived`: Hide from active views
- `metadata`: JSON field for extensible data (e.g., bank connection info)

**Note:** All monetary values stored as BIGINT in smallest currency unit (cents, yen, etc.)

---

### 3.3 categories

Expense and income categories with hierarchical support.

```sql
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category_type VARCHAR(10) NOT NULL,
    parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    color VARCHAR(7),
    icon VARCHAR(50),
    is_system BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT category_type_valid CHECK (category_type IN ('expense', 'income')),
    CONSTRAINT no_self_parent CHECK (id != parent_id),
    UNIQUE(user_id, name, category_type)
);

CREATE INDEX idx_categories_user_id ON categories(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_type ON categories(category_type);
CREATE INDEX idx_categories_deleted_at ON categories(deleted_at);
```

**Fields:**
- `id`: Primary key
- `user_id`: NULL for system categories, user-specific otherwise
- `name`: Category name (e.g., "Groceries", "Salary")
- `category_type`: expense or income
- `parent_id`: For subcategories (1-level deep recommended)
- `color`, `icon`: UI display properties
- `is_system`: True for default system categories (cannot be deleted)
- `display_order`: Sort order for UI display

**System Categories (seeded):**
- Expense: Groceries, Dining, Transportation, Utilities, Entertainment, Healthcare, Shopping, Travel, Other
- Income: Salary, Freelance, Investment, Gift, Other

---

### 3.4 transactions

All financial transactions.

```sql
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    transaction_type VARCHAR(10) NOT NULL,
    amount BIGINT NOT NULL,
    transaction_date DATE NOT NULL,
    payee VARCHAR(255),
    description TEXT,
    reference_number VARCHAR(100),
    is_recurring BOOLEAN DEFAULT FALSE,
    imported_from VARCHAR(50),
    import_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT transaction_type_valid CHECK (transaction_type IN ('debit', 'credit')),
    CONSTRAINT amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_payee ON transactions(payee) WHERE payee IS NOT NULL;
CREATE INDEX idx_transactions_import_id ON transactions(import_id) WHERE import_id IS NOT NULL;
CREATE INDEX idx_transactions_deleted_at ON transactions(deleted_at);
```

**Fields:**
- `id`: Primary key
- `user_id`: Foreign key to users
- `account_id`: Foreign key to accounts
- `category_id`: Foreign key to categories (nullable for uncategorized)
- `transaction_type`: debit (expense) or credit (income)
- `amount`: Transaction amount in cents (always positive)
- `transaction_date`: Date of transaction (DATE type for day-level precision)
- `payee`: Merchant/person name
- `description`: User notes or memo
- `reference_number`: Check number, transaction ID, etc.
- `is_recurring`: Flag for recurring transactions
- `imported_from`: Source of import (csv, bank_sync, manual)
- `import_id`: Unique identifier from import source (prevent duplicates)
- `metadata`: JSON for extensible fields

---

### 3.5 tags

User-defined tags for flexible categorization.

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

**Fields:**
- `id`: Primary key
- `user_id`: Foreign key to users
- `name`: Tag name (e.g., "business", "tax-deductible", "project-alpha")
- `color`: Display color

---

### 3.6 transaction_tags

Many-to-many relationship between transactions and tags.

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

### 3.7 budgets

Budget tracking per category.

```sql
CREATE TABLE budgets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100),
    amount BIGINT NOT NULL,
    period_type VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    rollover_unused BOOLEAN DEFAULT FALSE,
    alert_threshold_percentage INT DEFAULT 80,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT period_type_valid CHECK (
        period_type IN ('weekly', 'monthly', 'quarterly', 'yearly', 'custom')
    ),
    CONSTRAINT amount_positive CHECK (amount > 0),
    CONSTRAINT threshold_valid CHECK (
        alert_threshold_percentage >= 0 AND alert_threshold_percentage <= 100
    )
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id) WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_budgets_category_id ON budgets(category_id);
CREATE INDEX idx_budgets_period ON budgets(start_date, end_date);
CREATE INDEX idx_budgets_deleted_at ON budgets(deleted_at);
```

**Fields:**
- `id`: Primary key
- `user_id`: Foreign key to users
- `category_id`: Foreign key to categories
- `name`: Budget name (optional, e.g., "January Groceries")
- `amount`: Budget limit in cents
- `period_type`: weekly, monthly, quarterly, yearly, custom
- `start_date`, `end_date`: Budget period
- `rollover_unused`: Allow unused budget to carry over
- `alert_threshold_percentage`: Notify when reaching this % (default 80%)
- `is_active`: Enable/disable budget

---

### 3.8 rules

Auto-categorization and automation rules.

```sql
CREATE TABLE rules (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    priority INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    match_criteria JSONB NOT NULL,
    actions JSONB NOT NULL,
    apply_to_existing BOOLEAN DEFAULT FALSE,
    last_applied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_rules_user_id ON rules(user_id) WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_rules_priority ON rules(priority DESC);
CREATE INDEX idx_rules_deleted_at ON rules(deleted_at);
```

**Fields:**
- `id`: Primary key
- `user_id`: Foreign key to users
- `name`: Rule description
- `priority`: Higher priority rules execute first (DESC order)
- `is_active`: Enable/disable rule
- `match_criteria`: JSON criteria for matching transactions
  ```json
  {
    "payee_contains": ["amazon", "amzn"],
    "amount_min": 1000,
    "amount_max": 50000,
    "transaction_type": "debit"
  }
  ```
- `actions`: JSON actions to perform
  ```json
  {
    "set_category_id": 123,
    "add_tags": [456, 789],
    "set_description": "Online Shopping"
  }
  ```
- `apply_to_existing`: Whether to retroactively apply to existing transactions
- `last_applied_at`: Timestamp of last batch application

---

### 3.9 budget_alerts

Track budget alert notifications.

```sql
CREATE TABLE budget_alerts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    budget_id BIGINT NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    alert_type VARCHAR(20) NOT NULL,
    threshold_percentage INT NOT NULL,
    amount_spent BIGINT NOT NULL,
    budget_amount BIGINT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT alert_type_valid CHECK (
        alert_type IN ('warning', 'exceeded', 'approaching')
    )
);

CREATE INDEX idx_budget_alerts_user_id ON budget_alerts(user_id);
CREATE INDEX idx_budget_alerts_budget_id ON budget_alerts(budget_id);
CREATE INDEX idx_budget_alerts_sent_at ON budget_alerts(sent_at DESC);
```

**Fields:**
- `id`: Primary key
- `user_id`: Foreign key to users
- `budget_id`: Foreign key to budgets
- `alert_type`: warning (70%), approaching (80%), exceeded (100%)
- `threshold_percentage`: Percentage that triggered alert
- `amount_spent`: Current spending in cents
- `budget_amount`: Budget limit in cents
- `sent_at`: When alert was sent

---

### 3.10 refresh_tokens

Secure refresh token storage for JWT authentication.

```sql
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash) WHERE NOT revoked;
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at) WHERE NOT revoked;
```

**Fields:**
- `id`: Primary key
- `user_id`: Foreign key to users
- `token_hash`: SHA-256 hash of refresh token
- `expires_at`: Token expiration timestamp
- `revoked`: Revocation status
- `revoked_at`: When token was revoked
- `ip_address`, `user_agent`: Security audit fields

---

### 3.11 audit_logs

Security and compliance audit trail.

```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

**Fields:**
- `id`: Primary key
- `user_id`: User who performed the action (NULL for system actions)
- `action`: create, update, delete, login, logout, export, etc.
- `entity_type`: Table/entity name (e.g., "transaction", "account")
- `entity_id`: ID of affected entity
- `old_values`, `new_values`: JSON snapshots of changes
- `ip_address`, `user_agent`: Request metadata

---

### 3.12 recurring_transactions

Templates for recurring transactions.

```sql
CREATE TABLE recurring_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    transaction_type VARCHAR(10) NOT NULL,
    amount BIGINT NOT NULL,
    payee VARCHAR(255),
    description TEXT,
    frequency VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    next_occurrence DATE NOT NULL,
    last_created_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT frequency_valid CHECK (
        frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')
    ),
    CONSTRAINT transaction_type_valid CHECK (transaction_type IN ('debit', 'credit'))
);

CREATE INDEX idx_recurring_trans_user_id ON recurring_transactions(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_recurring_trans_next ON recurring_transactions(next_occurrence) WHERE is_active = TRUE;
```

---

### 3.13 savings_goals

Track savings goals and progress.

```sql
CREATE TABLE savings_goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    target_amount BIGINT NOT NULL,
    current_amount BIGINT DEFAULT 0,
    target_date DATE,
    account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    color VARCHAR(7),
    icon VARCHAR(50),
    is_achieved BOOLEAN DEFAULT FALSE,
    achieved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT target_amount_positive CHECK (target_amount > 0),
    CONSTRAINT current_amount_nonnegative CHECK (current_amount >= 0)
);

CREATE INDEX idx_savings_goals_user_id ON savings_goals(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_savings_goals_target_date ON savings_goals(target_date);
```

---

## 4. Database Triggers and Functions

### 4.1 Update Account Balance Trigger

Automatically update account balance when transactions are inserted/updated/deleted.

```sql
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE accounts
        SET current_balance = current_balance + 
            CASE 
                WHEN NEW.transaction_type = 'credit' THEN NEW.amount
                ELSE -NEW.amount
            END,
            updated_at = NOW()
        WHERE id = NEW.account_id;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Revert old transaction
        UPDATE accounts
        SET current_balance = current_balance - 
            CASE 
                WHEN OLD.transaction_type = 'credit' THEN OLD.amount
                ELSE -OLD.amount
            END
        WHERE id = OLD.account_id;
        
        -- Apply new transaction
        UPDATE accounts
        SET current_balance = current_balance + 
            CASE 
                WHEN NEW.transaction_type = 'credit' THEN NEW.amount
                ELSE -NEW.amount
            END,
            updated_at = NOW()
        WHERE id = NEW.account_id;
        
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE accounts
        SET current_balance = current_balance - 
            CASE 
                WHEN OLD.transaction_type = 'credit' THEN OLD.amount
                ELSE -OLD.amount
            END,
            updated_at = NOW()
        WHERE id = OLD.account_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_account_balance
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_account_balance();
```

### 4.2 Updated At Trigger

Automatically update `updated_at` timestamp.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_accounts_updated_at
BEFORE UPDATE ON accounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Repeat for other tables...
```

---

## 5. Materialized Views for Performance

### 5.1 Monthly Spending Summary

```sql
CREATE MATERIALIZED VIEW mv_monthly_spending AS
SELECT 
    user_id,
    DATE_TRUNC('month', transaction_date) AS month,
    category_id,
    COUNT(*) AS transaction_count,
    SUM(amount) AS total_amount
FROM transactions
WHERE transaction_type = 'debit'
    AND deleted_at IS NULL
GROUP BY user_id, DATE_TRUNC('month', transaction_date), category_id;

CREATE INDEX idx_mv_monthly_spending_user ON mv_monthly_spending(user_id, month);
CREATE INDEX idx_mv_monthly_spending_category ON mv_monthly_spending(category_id);

-- Refresh strategy: daily or on-demand
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_spending;
```

### 5.2 Account Summary View

```sql
CREATE MATERIALIZED VIEW mv_account_summary AS
SELECT 
    a.id AS account_id,
    a.user_id,
    a.name AS account_name,
    a.account_type,
    a.current_balance,
    COUNT(t.id) AS transaction_count,
    MAX(t.transaction_date) AS last_transaction_date
FROM accounts a
LEFT JOIN transactions t ON a.id = t.account_id AND t.deleted_at IS NULL
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.user_id, a.name, a.account_type, a.current_balance;

CREATE INDEX idx_mv_account_summary_user ON mv_account_summary(user_id);

REFRESH MATERIALIZED VIEW CONCURRENTLY mv_account_summary;
```

---

## 6. Data Partitioning Strategy

For high-volume applications, consider partitioning the `transactions` table by date.

```sql
-- Example: Partition by year
CREATE TABLE transactions_2024 PARTITION OF transactions
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE transactions_2025 PARTITION OF transactions
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Create partitions dynamically or via scheduled job
```

---

## 7. Sample Queries

### 7.1 Get User's Net Worth

```sql
SELECT 
    SUM(
        CASE 
            WHEN account_type IN ('checking', 'savings', 'cash', 'investment') 
            THEN current_balance
            WHEN account_type IN ('credit_card', 'loan') 
            THEN -current_balance
            ELSE 0
        END
    ) AS net_worth
FROM accounts
WHERE user_id = $1
    AND deleted_at IS NULL
    AND NOT is_archived;
```

### 7.2 Get Budget Progress

```sql
SELECT 
    b.id,
    b.name,
    b.amount AS budget_amount,
    b.period_type,
    b.start_date,
    b.end_date,
    COALESCE(SUM(t.amount), 0) AS spent_amount,
    b.amount - COALESCE(SUM(t.amount), 0) AS remaining,
    ROUND((COALESCE(SUM(t.amount), 0)::NUMERIC / b.amount::NUMERIC) * 100, 2) AS percentage_used
FROM budgets b
LEFT JOIN transactions t 
    ON b.category_id = t.category_id
    AND t.transaction_date >= b.start_date
    AND (b.end_date IS NULL OR t.transaction_date <= b.end_date)
    AND t.transaction_type = 'debit'
    AND t.deleted_at IS NULL
WHERE b.user_id = $1
    AND b.is_active = TRUE
    AND b.deleted_at IS NULL
GROUP BY b.id, b.name, b.amount, b.period_type, b.start_date, b.end_date;
```

### 7.3 Top Spending Categories

```sql
SELECT 
    c.name AS category_name,
    COUNT(t.id) AS transaction_count,
    SUM(t.amount) AS total_spent
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.user_id = $1
    AND t.transaction_type = 'debit'
    AND t.transaction_date >= $2
    AND t.transaction_date <= $3
    AND t.deleted_at IS NULL
GROUP BY c.id, c.name
ORDER BY total_spent DESC
LIMIT 10;
```

### 7.4 Monthly Trend

```sql
SELECT 
    DATE_TRUNC('month', transaction_date) AS month,
    transaction_type,
    SUM(amount) AS total_amount
FROM transactions
WHERE user_id = $1
    AND deleted_at IS NULL
    AND transaction_date >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', transaction_date), transaction_type
ORDER BY month DESC, transaction_type;
```

---

## 8. Migration Strategy with Goose

### 8.1 Initial Setup

```bash
# Install Goose
go install github.com/pressly/goose/v3/cmd/goose@latest

# Create migrations directory
mkdir -p db/migrations

# Set database URL
export DATABASE_URL="postgres://user:password@localhost:5432/finance_db?sslmode=disable"
```

### 8.2 Create Migrations

```bash
# Create initial schema migration
goose -dir db/migrations create init_schema sql

# Create indexes migration
goose -dir db/migrations create add_indexes sql

# Create triggers migration
goose -dir db/migrations create add_triggers sql
```

### 8.3 Migration Files

**db/migrations/20241210000001_init_schema.sql:**

```sql
-- +goose Up
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    -- ... rest of schema
);

-- +goose Down
DROP TABLE users;
```

### 8.4 Run Migrations

```bash
# Apply all pending migrations
goose -dir db/migrations postgres "$DATABASE_URL" up

# Rollback last migration
goose -dir db/migrations postgres "$DATABASE_URL" down

# Check status
goose -dir db/migrations postgres "$DATABASE_URL" status
```

---

## 9. GORM Model Examples

### 9.1 User Model

```go
package models

import (
    "time"
    "gorm.io/gorm"
)

type User struct {
    ID            uint           `gorm:"primaryKey"`
    Email         string         `gorm:"uniqueIndex;not null" json:"email"`
    PasswordHash  string         `gorm:"column:password_hash;not null" json:"-"`
    FirstName     string         `gorm:"size:100" json:"first_name,omitempty"`
    LastName      string         `gorm:"size:100" json:"last_name,omitempty"`
    Locale        string         `gorm:"size:10;default:en_US" json:"locale"`
    CurrencyCode  string         `gorm:"size:3;default:USD" json:"currency_code"`
    Timezone      string         `gorm:"size:50;default:UTC" json:"timezone"`
    IsActive      bool           `gorm:"default:true" json:"is_active"`
    EmailVerified bool           `gorm:"default:false" json:"email_verified"`
    LastLoginAt   *time.Time     `json:"last_login_at,omitempty"`
    CreatedAt     time.Time      `json:"created_at"`
    UpdatedAt     time.Time      `json:"updated_at"`
    DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
    
    // Associations
    Accounts      []Account      `gorm:"foreignKey:UserID" json:"accounts,omitempty"`
    Transactions  []Transaction  `gorm:"foreignKey:UserID" json:"-"`
}

func (User) TableName() string {
    return "users"
}
```

### 9.2 Account Model

```go
package models

import (
    "time"
    "gorm.io/gorm"
)

type Account struct {
    ID                 uint           `gorm:"primaryKey"`
    UserID             uint           `gorm:"not null;index" json:"user_id"`
    Name               string         `gorm:"size:100;not null" json:"name"`
    AccountType        string         `gorm:"size:20;not null" json:"account_type"`
    CurrencyCode       string         `gorm:"size:3;not null;default:USD" json:"currency_code"`
    InitialBalance     int64          `gorm:"not null;default:0" json:"initial_balance"`
    CurrentBalance     int64          `gorm:"not null;default:0" json:"current_balance"`
    InstitutionName    string         `gorm:"size:255" json:"institution_name,omitempty"`
    AccountNumberLast4 string         `gorm:"column:account_number_last4;size:4" json:"account_number_last4,omitempty"`
    Color              string         `gorm:"size:7" json:"color,omitempty"`
    Icon               string         `gorm:"size:50" json:"icon,omitempty"`
    IsArchived         bool           `gorm:"default:false" json:"is_archived"`
    Metadata           JSON           `gorm:"type:jsonb" json:"metadata,omitempty"`
    CreatedAt          time.Time      `json:"created_at"`
    UpdatedAt          time.Time      `json:"updated_at"`
    DeletedAt          gorm.DeletedAt `gorm:"index" json:"-"`
    
    // Associations
    User         User          `gorm:"foreignKey:UserID" json:"-"`
    Transactions []Transaction `gorm:"foreignKey:AccountID" json:"-"`
}

func (Account) TableName() string {
    return "accounts"
}
```

### 9.3 Transaction Model

```go
package models

import (
    "time"
    "gorm.io/gorm"
)

type Transaction struct {
    ID              uint           `gorm:"primaryKey"`
    UserID          uint           `gorm:"not null;index" json:"user_id"`
    AccountID       uint           `gorm:"not null;index" json:"account_id"`
    CategoryID      *uint          `gorm:"index" json:"category_id,omitempty"`
    TransactionType string         `gorm:"size:10;not null" json:"transaction_type"`
    Amount          int64          `gorm:"not null" json:"amount"`
    TransactionDate time.Time      `gorm:"type:date;not null;index:,sort:desc" json:"transaction_date"`
    Payee           string         `gorm:"size:255" json:"payee,omitempty"`
    Description     string         `gorm:"type:text" json:"description,omitempty"`
    ReferenceNumber string         `gorm:"size:100" json:"reference_number,omitempty"`
    IsRecurring     bool           `gorm:"default:false" json:"is_recurring"`
    ImportedFrom    string         `gorm:"size:50" json:"imported_from,omitempty"`
    ImportID        string         `gorm:"size:255;index" json:"import_id,omitempty"`
    Metadata        JSON           `gorm:"type:jsonb" json:"metadata,omitempty"`
    CreatedAt       time.Time      `json:"created_at"`
    UpdatedAt       time.Time      `json:"updated_at"`
    DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
    
    // Associations
    User     User      `gorm:"foreignKey:UserID" json:"-"`
    Account  Account   `gorm:"foreignKey:AccountID" json:"account,omitempty"`
    Category *Category `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
    Tags     []Tag     `gorm:"many2many:transaction_tags" json:"tags,omitempty"`
}

func (Transaction) TableName() string {
    return "transactions"
}
```

---

## 10. Indexing Strategy Summary

| Table | Index | Purpose |
|-------|-------|---------|
| users | email (unique) | Fast login lookup |
| accounts | user_id | List user's accounts |
| transactions | user_id, account_id, category_id | Filtering |
| transactions | transaction_date (DESC) | Date range queries |
| transactions | payee | Search by merchant |
| categories | user_id, category_type | Filter categories |
| budgets | user_id, category_id | Budget lookups |
| rules | user_id, priority (DESC) | Rule execution order |

---

## 11. Data Retention & Archival

### 11.1 Soft Delete Policy
- All user-facing tables use soft deletes (`deleted_at`)
- Audit logs are append-only (no deletes)
- Transactions older than 7 years can be archived to cold storage

### 11.2 GDPR Compliance
- User deletion triggers cascade delete of all associated data
- Export endpoint generates complete JSON export
- PII minimization: avoid storing unnecessary personal data

---

## 12. Backup & Disaster Recovery

### 12.1 Backup Strategy
- **Frequency:** Daily automated backups
- **Retention:** 30 days rolling + monthly snapshots for 1 year
- **Method:** pg_dump with compression or continuous archiving (WAL)
- **Storage:** S3-compatible object storage with encryption

### 12.2 Recovery Objectives
- **RTO (Recovery Time Objective):** < 4 hours
- **RPO (Recovery Point Objective):** < 24 hours

---

## 13. Security Considerations

1. **Encryption at Rest:** Enable PostgreSQL transparent data encryption (TDE) or disk encryption
2. **Encryption in Transit:** TLS/SSL for all database connections
3. **Access Control:** Principle of least privilege for database users
4. **Password Storage:** Never store plain text; use Argon2id or bcrypt
5. **SQL Injection Prevention:** Use parameterized queries (GORM handles this)
6. **Audit Trail:** Log all sensitive operations in `audit_logs`

---

## 14. Performance Optimization Checklist

- [ ] Implement connection pooling (default in GORM)
- [ ] Use prepared statements for repeated queries
- [ ] Enable query result caching for read-heavy endpoints
- [ ] Partition large tables (transactions) by date
- [ ] Create covering indexes for common query patterns
- [ ] Monitor slow query log and optimize with EXPLAIN ANALYZE
- [ ] Use materialized views for complex aggregations
- [ ] Implement read replicas for reporting queries
- [ ] Set up database monitoring (pg_stat_statements)

---

## 15. Next Steps

1. **Set up local database:**
   ```bash
   docker run -d --name finance-postgres \
     -e POSTGRES_DB=finance_db \
     -e POSTGRES_USER=finance_user \
     -e POSTGRES_PASSWORD=secure_password \
     -p 5432:5432 \
     postgres:14-alpine
   ```

2. **Initialize migrations:**
   ```bash
   goose -dir db/migrations create init_schema sql
   ```

3. **Create seed data script** for system categories

4. **Set up database monitoring** (Prometheus exporter)

5. **Document backup/restore procedures**

---

*Database Design Document v1.0 — Last Updated: December 10, 2025*

Frontend Stack
Core Framework
Next.js 16.0.8 (with App Router & Turbopack)
React 19.2.1 - Latest React version
TypeScript 5 - Type-safe development
Styling
Tailwind CSS v4 - Utility-first CSS framework
Custom CSS Variables - Maglo design tokens (RGBA colors)
Vanilla CSS - For custom components and animations
State Management
Zustand 5.0.9 - Lightweight state management
Data Fetching
TanStack Query (React Query) 5.90.12 - Server state management
TanStack Query DevTools - Development tools
Forms & Validation
React Hook Form 7.68.0 - Form handling
Zod 4.1.13 - Schema validation
@hookform/resolvers 5.2.2 - Form resolver integration
UI Components
Lucide React 0.556.0 - Icon library
Recharts 3.5.1 - Chart library for data visualization
Sonner 2.0.7 - Toast notifications
Authentication
NextAuth.js 5.0.0-beta.30 - Authentication for Next.js
Utilities
clsx 2.1.1 - Conditional className utility
tailwind-merge 3.4.0 - Merge Tailwind classes
Design System
Maglo Financial Management UI Kit - Design specifications

**Color Palette (RGBA):**
- **Primary & Secondary**
  - `--primary--color`: rgba(200, 238, 68, 1) - Bright yellow-green
  - `--secondary--color`: rgba(41, 160, 115, 1) - Teal green

- **Text Colors**
  - `--text--color---text-1`: rgba(27, 33, 45, 1) - Primary dark text
  - `--text--color---text-2`: rgba(146, 158, 174, 1) - Secondary text
  - `--text--color---text-3`: rgba(120, 119, 139, 1) - Tertiary text
  - `--text--color---pure--white`: rgba(255, 255, 255, 1) - Pure white

- **Dark Mode Colors**
  - `--darkish--color---dark--b-g`: rgba(28, 26, 46, 1) - Main background
  - `--darkish--color---dark--shade`: rgba(30, 28, 48, 1) - Shade variant
  - `--darkish--color---dark-1`: rgba(32, 30, 52, 1) - Card background
  - `--darkish--color---dark-2`: rgba(40, 37, 65, 1) - Hover background
  - `--darkish--color---key--black`: rgba(54, 58, 63, 1) - Key black

- **Status Colors**
  - `--status--color---success`: rgba(25, 208, 118, 1) - Success green
  - `--status--color---error`: rgba(229, 54, 61, 1) - Error red

- **Light Mode (Gray Scale)**
  - `--gray---gray-1`: rgba(250, 250, 250, 1)
  - `--gray---gray-2`: rgba(248, 248, 248, 1)
  - `--gray---gray-3`: rgba(245, 245, 245, 1)
  - `--gray---gray-4`: rgba(253, 253, 253, 1)
  - `--gray---gray-5`: rgba(242, 242, 242, 1)

**Typography System:**
- **Size 12**: regular (400), medium (500), semi-bold (600)
- **Size 13**: regular (400)
- **Size 14**: regular (400), medium (500), semi-bold (600)
- **Size 16**: regular (400), medium (500), semi-bold (600)
- **Size 18**: semi-bold (600)
- **Size 20**: semi-bold (600)

**Design Features:**
- Dark Mode by default with light mode support
- Border radius: 0.75rem (12px) to 1.5rem (24px)
- Shadows: sm, md, lg, xl variants
- Gradients: Primary, Purple, Pink, Teal, Orange, Blue
Development Tools
ESLint 9 - Code linting
PostCSS - CSS processing
Turbopack - Fast bundler (Next.js built-in)


### colors
