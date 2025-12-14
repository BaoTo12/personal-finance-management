# Quick Start Guide

## Prerequisites

- Go 1.21+ installed
- PostgreSQL 16+ installed OR Docker installed
- Git

## 1-Minute Setup

### Option A: Using Docker (Recommended)

```bash
# 1. Start database
cd personal-finance-management
docker-compose -f docker-compose.dev.yml up -d

# 2. Setup database & run migrations
cd backend
scripts\setup-db.bat    # Windows
# OR
./scripts/setup-db.sh   # Linux/Mac

# 3. Run backend
go run ./cmd/api --config=config/config.dev.yaml
```

### Option B: Using Local PostgreSQL

```bash
# 1. Create database
psql -U postgres -c "CREATE DATABASE personal_finance;"

# 2. Run migrations
cd backend/db
goose postgres "host=localhost port=5432 user=postgres password=postgres dbname=personal_finance sslmode=disable" up

# 3. Run backend  
cd ..
go run ./cmd/api --config=config/config.dev.yaml
```

## Verify Setup

Backend should start on: `http://localhost:8080`

Test health endpoint:
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{"status":"ok","service":"personal-finance-management"}
```

## Test Authentication

### Register a user
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

You'll receive access and refresh tokens!

## Next Steps

1. ✅ Backend is ready
2. Configure frontend to use `http://localhost:8080/api/v1`
3. Update frontend auth to use JWT tokens
4. Test all CRUD operations

See [README.md](README.md) for complete API documentation.
