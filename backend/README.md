# Personal Finance Management API

Complete backend implementation with modern Go patterns.

## Features

- ✅ JWT Authentication (access, refresh, reset tokens)
- ✅ User Management with profile operations
- ✅ Card Management with CRUD operations
- ✅ Transaction Management with filtering & statistics
- ✅ Category Management
- ✅ Password Reset Flow
- ✅ CORS Support
- ✅ Request Logging
- ✅ Graceful Shutdown

## Tech Stack

- **Framework**: Gin
- **Database**: PostgreSQL with GORM
- **DI**: Google Wire
- **Logging**: Zap
- **Migration**: Goose
- **Authentication**: JWT

## Setup

### 1. Database Setup

```bash
# Start PostgreSQL with Docker
cd ../
docker-compose up -d postgres

# Or use existing PostgreSQL instance
# Make sure it's running on localhost:5432
```

### 2. Run Migrations

```bash
# Install goose if not already installed
go install github.com/pressly/goose/v3/cmd/goose@latest

# Run migrations
cd db
goose postgres "host=localhost port=5432 user=postgres password=postgres dbname=personal_finance sslmode=disable" up
```

### 3. Configuration

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your settings
# Key settings:
# - DATABASE_* : PostgreSQL connection details
# - JWT_*_SECRET : Change these for production!
```

### 4. Build & Run

```bash
# Generate Wire dependencies (if modified)
wire gen ./cmd/api

# Build
go build -o bin/api.exe ./cmd/api

# Run with config file
./bin/api.exe --config=config/config.dev.yaml

# Or run with go run
go run ./cmd/api --config=config/config.dev.yaml
```

## API Endpoints

### Authentication

```
POST   /api/v1/auth/register           - Register new user
POST   /api/v1/auth/login               - Login user
POST   /api/v1/auth/refresh             - Refresh access token
POST   /api/v1/auth/logout              - Logout (revoke tokens)
POST   /api/v1/auth/forgot-password     - Request password reset
POST   /api/v1/auth/reset-password      - Reset password with token
POST   /api/v1/auth/change-password     - Change password (authenticated)
```

### User

```
GET    /api/v1/users/me           - Get current user profile
PUT    /api/v1/users/me           - Update user profile
```

### Cards

```
POST   /api/v1/cards              - Create new card
GET    /api/v1/cards              - List all user cards
GET    /api/v1/cards/:id          - Get card details
PUT    /api/v1/cards/:id          - Update card
POST   /api/v1/cards/:id/freeze   - Toggle card freeze status
DELETE /api/v1/cards/:id          - Delete card
```

### Transactions

```
POST   /api/v1/transactions       - Create transaction
GET    /api/v1/transactions       - List transactions (with filters)
GET    /api/v1/transactions/stats - Get transaction statistics

Query params for listing:
  - transaction_type: Income|Expense|Transfer
  - category_id: Filter by category
  - start_date: Start date (RFC3339)
  - end_date: End date (RFC3339)
  - limit: Max results (default 20)
  - offset: Pagination offset
```

### Categories

```
GET    /api/v1/categories?type=Income   - List categories (optional type filter)
```

### Health Check

```
GET    /health                    - Health check endpoint
```

## Development

### Project Structure

```
backend/
├── cmd/api/              # Application entrypoint
├── config/               # Configuration files
├── db/migrations/        # Database migrations
├── internal/
│   ├── app/
│   │   ├── entity/      # Domain models
│   │   ├── repository/  # Data access layer
│   │   └── service/     # Business logic
│   ├── handlers/        # HTTP handlers
│   ├── middleware/      # HTTP middleware
│   ├── router/          # Route definitions
│   ├── provider/        # Wire providers
│   └── pkg/             # Utilities (JWT, password, logger)
└── bin/                 # Compiled binaries
```

### Running Tests

```bash
go test ./...
```

### Code Generation

```bash
# Regenerate Wire dependencies
wire gen ./cmd/api
```

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `DATABASE_*`: PostgreSQL connection settings
- `JWT_ACCESS_SECRET`: Secret for access tokens (min 32 chars)
- `JWT_REFRESH_SECRET`: Secret for refresh tokens (min 32 chars)
- `APP_PORT`: Server port (default: 8080)
- `CORS_ALLOW_ORIGINS`: Allowed CORS origins

## Production Deployment

1. **Change JWT Secrets**: Use strong, random secrets
2. **Enable SSL**: Set `DATABASE_SSL_MODE=require`
3. **Set Environment**: `APP_ENV=production`
4. **Use Config File**: Store secrets in secure config management
5. **Enable HTTPS**: Use reverse proxy (nginx/Apache) with SSL

## License

MIT
