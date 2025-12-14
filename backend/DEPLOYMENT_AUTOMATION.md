# Go Deployment Best Practices & Automation Guide

> **Expert Guide**: Automating Wire, Goose, Testing, and Deployment for Production-Ready Go Applications

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Automating Manual Tasks](#automating-manual-tasks)
3. [Makefile Automation](#makefile-automation)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Docker Multi-Stage Builds](#docker-multi-stage-builds)
6. [Deployment Verification](#deployment-verification)
7. [Production Best Practices](#production-best-practices)

---

## Pre-Deployment Checklist

### ✅ Must-Have Before Deployment

```bash
# 1. Code Generation (Wire)
wire gen ./cmd/api

# 2. Database Migrations
goose -dir db/migrations postgres "$DSN" up

# 3. Tests Pass
go test ./... -cover

# 4. Build Succeeds
go build -o bin/api ./cmd/api

# 5. Linting Passes
golangci-lint run

# 6. Security Scan
gosec ./...

# 7. Dependencies Updated
go mod tidy && go mod verify
```

---

## Automating Manual Tasks

### Problem: Too Many Manual Steps

**Manual workflow** (error-prone 😰):
```bash
# Developer has to remember:
wire gen ./cmd/api
go mod tidy
goose up
go test ./...
go build
# ... forgot wire? builds with old code!
```

**Automated workflow** (reliable 🎯):
```bash
make deploy-ready
# Automatically runs ALL steps in correct order!
```

---

## Makefile Automation

### Complete Production-Ready Makefile

Create `backend/Makefile`:

```makefile
# ==========================================
# Configuration
# ==========================================
APP_NAME := personal-finance-api
VERSION := $(shell git describe --tags --always --dirty)
BUILD_TIME := $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")
BINARY := bin/$(APP_NAME)

# Database
DB_DSN := "postgres://postgres:postgres@localhost:5432/personal_finance?sslmode=disable"

# Directories
MIGRATIONS_DIR := ./db/migrations
CMD_DIR := ./cmd/api

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
RED := \033[0;31m
NC := \033[0m # No Color

# ==========================================
# Help
# ==========================================
.PHONY: help
help: ## Show this help message
	@echo "$(BLUE)Personal Finance Management - Make Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# ==========================================
# Development
# ==========================================
.PHONY: dev
dev: ## Start development environment (Docker + migrations + run)
	@echo "$(BLUE)Starting development environment...$(NC)"
	@docker-compose -f ../docker-compose.dev.yml up -d
	@sleep 3
	@$(MAKE) migrate-up
	@$(MAKE) run

.PHONY: run
run: ## Run the application
	@echo "$(BLUE)Running application...$(NC)"
	@go run $(CMD_DIR) --config=config/config.dev.yaml

# ==========================================
# Code Generation
# ==========================================
.PHONY: wire
wire: ## Generate Wire dependency injection code
	@echo "$(BLUE)Generating Wire code...$(NC)"
	@wire gen $(CMD_DIR)
	@echo "$(GREEN)✓ Wire generation complete$(NC)"

.PHONY: wire-check
wire-check: ## Check if Wire code is up to date
	@echo "$(BLUE)Checking Wire code...$(NC)"
	@wire check $(CMD_DIR)

# ==========================================
# Database Migrations
# ==========================================
.PHONY: migrate-up
migrate-up: ## Run database migrations
	@echo "$(BLUE)Running migrations...$(NC)"
	@goose -dir $(MIGRATIONS_DIR) postgres $(DB_DSN) up
	@echo "$(GREEN)✓ Migrations complete$(NC)"

.PHONY: migrate-down
migrate-down: ## Rollback last migration
	@echo "$(BLUE)Rolling back migration...$(NC)"
	@goose -dir $(MIGRATIONS_DIR) postgres $(DB_DSN) down

.PHONY: migrate-status
migrate-status: ## Show migration status
	@goose -dir $(MIGRATIONS_DIR) postgres $(DB_DSN) status

.PHONY: migrate-create
migrate-create: ## Create new migration (name=<migration_name>)
	@if [ -z "$(name)" ]; then \
		echo "$(RED)Error: migration name required$(NC)"; \
		echo "Usage: make migrate-create name=add_users_table"; \
		exit 1; \
	fi
	@goose -dir $(MIGRATIONS_DIR) create $(name) sql

# ==========================================
# Testing
# ==========================================
.PHONY: test
test: ## Run all tests
	@echo "$(BLUE)Running tests...$(NC)"
	@go test ./... -v -race

.PHONY: test-cover
test-cover: ## Run tests with coverage
	@echo "$(BLUE)Running tests with coverage...$(NC)"
	@go test ./... -coverprofile=coverage.out -covermode=atomic
	@go tool cover -html=coverage.out -o coverage.html
	@echo "$(GREEN)✓ Coverage report: coverage.html$(NC)"

.PHONY: test-short
test-short: ## Run quick tests (skip integration)
	@go test ./... -short

# ==========================================
# Code Quality
# ==========================================
.PHONY: lint
lint: ## Run linter
	@echo "$(BLUE)Running linter...$(NC)"
	@golangci-lint run --timeout=5m

.PHONY: lint-fix
lint-fix: ## Run linter and auto-fix
	@golangci-lint run --fix

.PHONY: fmt
fmt: ## Format code
	@echo "$(BLUE)Formatting code...$(NC)"
	@go fmt ./...
	@echo "$(GREEN)✓ Code formatted$(NC)"

.PHONY: vet
vet: ## Run go vet
	@go vet ./...

.PHONY: security
security: ## Run security scan
	@echo "$(BLUE)Running security scan...$(NC)"
	@gosec -quiet ./...

# ==========================================
# Build
# ==========================================
.PHONY: build
build: wire ## Build the application
	@echo "$(BLUE)Building $(APP_NAME)...$(NC)"
	@go build -ldflags="-X main.Version=$(VERSION) -X main.BuildTime=$(BUILD_TIME)" \
		-o $(BINARY) $(CMD_DIR)
	@echo "$(GREEN)✓ Build complete: $(BINARY)$(NC)"

.PHONY: build-Linux
build-linux: wire ## Build for Linux
	@echo "$(BLUE)Building for Linux...$(NC)"
	@GOOS=linux GOARCH=amd64 go build -ldflags="-X main.Version=$(VERSION)" \
		-o $(BINARY)-linux-amd64 $(CMD_DIR)

.PHONY: build-all
build-all: build-linux ## Build for all platforms
	@echo "$(GREEN)✓ All builds complete$(NC)"

# ==========================================
# Dependencies
# ==========================================
.PHONY: deps
deps: ## Download dependencies
	@echo "$(BLUE)Downloading dependencies...$(NC)"
	@go mod download

.PHONY: tidy
tidy: ## Tidy dependencies
	@echo "$(BLUE)Tidying dependencies...$(NC)"
	@go mod tidy
	@echo "$(GREEN)✓ Dependencies tidied$(NC)"

.PHONY: verify
verify: ## Verify dependencies
	@go mod verify

.PHONY: deps-upgrade
deps-upgrade: ## Upgrade all dependencies
	@go get -u ./...
	@go mod tidy

# ==========================================
# Docker
# ==========================================
.PHONY: docker-build
docker-build: ## Build Docker image
	@echo "$(BLUE)Building Docker image...$(NC)"
	@docker build -t $(APP_NAME):$(VERSION) .
	@docker tag $(APP_NAME):$(VERSION) $(APP_NAME):latest

.PHONY: docker-run
docker-run: ## Run Docker container
	@docker run -p 8080:8080 --env-file .env $(APP_NAME):latest

# ==========================================
# Database
# ==========================================
.PHONY: db-up
db-up: ## Start database with Docker
	@docker-compose -f ../docker-compose.dev.yml up -d postgres

.PHONY: db-down
db-down: ## Stop database
	@docker-compose -f ../docker-compose.dev.yml down

.PHONY: db-reset
db-reset: ## Reset database (drop + migrate)
	@echo "$(RED)⚠️  This will DELETE all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		goose -dir $(MIGRATIONS_DIR) postgres $(DB_DSN) reset; \
		$(MAKE) migrate-up; \
		echo "$(GREEN)✓ Database reset complete$(NC)"; \
	fi

# ==========================================
# Cleanup
# ==========================================
.PHONY: clean
clean: ## Clean build artifacts
	@echo "$(BLUE)Cleaning...$(NC)"
	@rm -rf bin/
	@rm -f coverage.out coverage.html
	@echo "$(GREEN)✓ Clean complete$(NC)"

# ==========================================
# Pre-Commit / CI Checks
# ==========================================
.PHONY: pre-commit
pre-commit: fmt lint test ## Run all pre-commit checks
	@echo "$(GREEN)✓ All pre-commit checks passed$(NC)"

.PHONY: ci
ci: deps wire lint test build ## Run all CI checks
	@echo "$(GREEN)✓ All CI checks passed$(NC)"

# ==========================================
# Deployment Ready
# ==========================================
.PHONY: deploy-ready
deploy-ready: clean deps wire tidy lint test build ## Prepare for deployment
	@echo "$(BLUE)Running deployment checks...$(NC)"
	@$(MAKE) verify
	@$(MAKE) security
	@echo ""
	@echo "$(GREEN)=====================================$(NC)"
	@echo "$(GREEN)✓ DEPLOYMENT READY$(NC)"
	@echo "$(GREEN)=====================================$(NC)"
	@echo "Binary: $(BINARY)"
	@echo "Version: $(VERSION)"
	@echo "Build Time: $(BUILD_TIME)"

# ==========================================
# Install Tools
# ==========================================
.PHONY: install-tools
install-tools: ## Install required development tools
	@echo "$(BLUE)Installing tools...$(NC)"
	@go install github.com/google/wire/cmd/wire@latest
	@go install github.com/pressly/goose/v3/cmd/goose@latest
	@go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	@go install github.com/securego/gosec/v2/cmd/gosec@latest
	@echo "$(GREEN)✓ All tools installed$(NC)"

.DEFAULT_GOAL := help
```

---

## 3. CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/backend-ci.yml`:

```yaml
name: Backend CI/CD

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'backend/**'
  pull_request:
    branches: [ main ]
    paths:
      - 'backend/**'

env:
  GO_VERSION: '1.21'

jobs:
  # ==========================================
  # Job 1: Code Quality
  # ==========================================
  lint:
    name: Lint & Format Check
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: ${{ env.GO_VERSION }}
          cache-dependency-path: backend/go.sum
      
      - name: golangci-lint
        uses: golangci/golangci-lint-action@v3
        with:
          version: latest
          working-directory: backend
          args: --timeout=5m
  
  # ==========================================
  # Job 2: Security Scan
  # ==========================================
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Gosec Security Scanner
        uses: securego/gosec@master
        with:
          args: '-no-fail -fmt json -out gosec-results.json ./backend/...'
      
      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: gosec-results
          path: gosec-results.json
  
  # ==========================================
  # Job 3: Tests
  # ==========================================
  test:
    name: Tests
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: ${{ env.GO_VERSION }}
          cache-dependency-path: backend/go.sum
      
      - name: Install Wire
        run: go install github.com/google/wire/cmd/wire@latest
      
      - name: Generate Wire Code
        working-directory: backend
        run: wire gen ./cmd/api
      
      - name: Run Tests
        working-directory: backend
        run: go test ./... -v -race -coverprofile=coverage.out -covermode=atomic
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage.out
          flags: backend
  
  # ==========================================
  # Job 4: Build
  # ==========================================
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: ${{ env.GO_VERSION }}
          cache-dependency-path: backend/go.sum
      
      - name: Install Wire
        run: go install github.com/google/wire/cmd/wire@latest
      
      - name: Generate Wire Code
        working-directory: backend
        run: wire gen ./cmd/api
      
      - name: Build Binary
        working-directory: backend
        run: |
          VERSION=$(git describe --tags --always --dirty)
          BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
          go build -ldflags="-X main.Version=$VERSION -X main.BuildTime=$BUILD_TIME" \
            -o bin/api ./cmd/api
      
      - name: Upload Artifact
        uses: actions/upload-artifact@v3
        with:
          name: api-binary
          path: backend/bin/api
  
  # ==========================================
  # Job 5: Database Migrations Check
  # ==========================================
  migrations:
    name: Migration Check
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Goose
        run: go install github.com/pressly/goose/v3/cmd/goose@latest
      
      - name: Test Migrations Up
        working-directory: backend/db
        run: |
          goose postgres "postgres://postgres:postgres@localhost:5432/test_db?sslmode=disable" up
      
      - name: Test Migrations Down
        working-directory: backend/db
        run: |
          goose postgres "postgres://postgres:postgres@localhost:5432/test_db?sslmode=disable" down
  
  # ==========================================
  # Job 6: Docker Build (on main branch)
  # ==========================================
  docker:
    name: Docker Build & Push
    runs-on: ubuntu-latest
    needs: [build, migrations]
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            yourusername/personal-finance-api:latest
            yourusername/personal-finance-api:${{ github.sha }}
          cache-from: type=registry,ref=yourusername/personal-finance-api:latest
          cache-to: type=inline
```

---

## 4. Docker Multi-Stage Build

### Production Dockerfile

Create `backend/Dockerfile`:

```dockerfile
# ==========================================
# Stage 1: Build Stage
# ==========================================
FROM golang:1.21-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git make

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Install Wire
RUN go install github.com/google/wire/cmd/wire@latest

# Copy source code
COPY . .

# Generate Wire code
RUN wire gen ./cmd/api

# Build the application
ARG VERSION=dev
ARG BUILD_TIME
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-w -s -X main.Version=${VERSION} -X main.BuildTime=${BUILD_TIME}" \
    -o /app/bin/api \
    ./cmd/api

# ==========================================
# Stage 2: Runtime Stage
# ==========================================
FROM alpine:3.19

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/bin/api /app/api

# Copy config files
COPY --from=builder /app/config /app/config

# Set ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Run the application
ENTRYPOINT ["/app/api"]
CMD ["--config=/app/config/config.yaml"]
```

---

## 5. Deployment Verification

### Pre-Deploy Script

Create `backend/scripts/pre-deploy-check.sh`:

```bash
#!/bin/bash
set -e

echo "========================================="
echo "Pre-Deployment Verification"
echo "========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAILED=0

check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        FAILED=1
    fi
}

# 1. Wire generation
echo "1. Checking Wire code generation..."
wire check ./cmd/api 2>/dev/null
check "Wire code is up to date"

# 2. Go mod verification
echo "2. Verifying dependencies..."
go mod verify 2>/dev/null
check "Dependencies verified"

# 3. Tests
echo "3. Running tests..."
go test ./... -short > /dev/null 2>&1
check "All tests passed"

# 4. Build
echo "4. Building application..."
go build -o /tmp/test-build ./cmd/api > /dev/null 2>&1
check "Build successful"
rm -f /tmp/test-build

# 5. Linting
echo "5. Running linter..."
if command -v golangci-lint &> /dev/null; then
    golangci-lint run --timeout=3m > /dev/null 2>&1
    check "Linting passed"
else
    echo -e "${YELLOW}⚠${NC} golangci-lint not found (skipped)"
fi

# 6. Security scan
echo "6. Running security scan..."
if command -v gosec &> /dev/null; then
    gosec -quiet ./... > /dev/null 2>&1
    check "Security scan passed"
else
    echo -e "${YELLOW}⚠${NC} gosec not found (skipped)"
fi

# 7. Check migrations
echo "7. Validating migrations..."
if [ -d "db/migrations" ]; then
    COUNT=$(ls -1 db/migrations/*.sql 2>/dev/null | wc -l)
    if [ $COUNT -gt 0 ]; then
        echo -e "${GREEN}✓${NC} Found $COUNT migration files"
    else
        echo -e "${YELLOW}⚠${NC} No migration files found"
    fi
else
    echo -e "${YELLOW}⚠${NC} Migrations directory not found"
fi

echo ""
echo "========================================="
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL CHECKS PASSED - READY TO DEPLOY${NC}"
    echo "========================================="
    exit 0
else
    echo -e "${RED}✗ SOME CHECKS FAILED - DO NOT DEPLOY${NC}"
    echo "========================================="
    exit 1
fi
```

Make it executable:
```bash
chmod +x scripts/pre-deploy-check.sh
```

---

## 6. Production Best Practices

### Automated Deployment Workflow

```bash
# Local Development:
make dev              # Auto: Docker up + migrations + run

# Pre-Commit:
make pre-commit       # Auto: fmt + lint + test

# Before Push:
make ci               # Auto: deps + wire + lint + test + build

# Deployment:
make deploy-ready     # Auto: ALL checks + build

# In CI/CD:
./scripts/pre-deploy-check.sh && make build
```

### Environment-Specific Configs

```yaml
# config/config.prod.yaml
app:
  environment: "production"
  
database:
  max_open_conns: 100
  max_idle_conns: 25
  
jwt:
  access_token_expiry: 15m
  refresh_token_expiry: 168h

logger:
  level: "info"
  format: "json"
```

### Version Management

Update `cmd/api/main.go`:

```go
package main

import (
	"flag"
	"fmt"
	"log"
)

var (
	Version   = "dev"
	BuildTime = "unknown"
)

func main() {
	showVersion := flag.Bool("version", false, "Show version")
	flag.Parse()

	if *showVersion {
		fmt.Printf("Version: %s\nBuild Time: %s\n", Version, BuildTime)
		return
	}

	// ... rest of main
}
```

Build with version:
```bash
go build -ldflags="-X main.Version=v1.2.3 -X main.BuildTime=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

---

## 7. Summary: Automated Deployment Checklist

### ✅ What's Automated

| Task | Manual | Automated | Command |
|------|--------|-----------|---------|
| Wire generation | `wire gen` | ✅ | `make build` |
| Dependencies | `go mod tidy` | ✅ | `make tidy` |
| Migrations | `goose up` | ✅ | `make migrate-up` |
| Tests | `go test` | ✅ | `make test` |
| Linting | `golangci-lint run` | ✅ | `make lint` |
| Build | `go build` | ✅ | `make build` |
| All checks | (multiple commands) | ✅ | `make deploy-ready` |

### 🚀 One-Command Deployment

```bash
# Instead of 10+ manual steps:
make deploy-ready

# This automatically:
# 1. Cleans old builds
# 2. Downloads dependencies
# 3. Generates Wire code
# 4. Tidies go.mod
# 5. Runs linter
# 6. Runs all tests
# 7. Builds binary
# 8. Verifies dependencies
# 9. Runs security scan
# 10. Shows deployment status
```

### 📋 Pre-Push Hook (Optional)

Create `.git/hooks/pre-push`:

```bash
#!/bin/bash
echo "Running pre-push checks..."
cd backend && make pre-commit
```

---

## Key Takeaways

1. **Makefile is your friend**: Automate everything
2. **CI/CD catches mistakes**: Before they reach production
3. **Pre-deploy scripts**: Final verification barrier
4. **Docker multi-stage**: Consistent builds everywhere
5. **Version everything**: Know what's deployed

**Never deploy manually again!** 🎯
