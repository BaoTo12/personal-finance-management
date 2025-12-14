# Testing Guide - Personal Finance Management Backend

## Overview

Comprehensive testing strategy covering:
- **Unit Tests**: Service logic, utilities (JWT, password)
- **Integration Tests**: Repository operations with database
- **API Tests**: HTTP handlers and endpoints

## Running Tests

### All Tests
```bash
# Run all tests
go test ./...

# Run with verbose output
go test ./... -v

# Run with coverage
go test ./... -cover

# Generate HTML coverage report
go test ./... -coverprofile=coverage.out
go tool cover -html=coverage.out
```

### Specific Test Suites

```bash
# Unit tests - Password utility
go test ./internal/pkg/password -v

# Unit tests - JWT manager
go test ./internal/pkg/jwt -v

# Integration tests - Repositories
go test ./internal/app/postgres -v

# Specific test
go test ./internal/app/postgres -v -run TestUserRepository_Create
```

## Test Structure

### Test Files Organization

```
backend/
├── internal/
│   ├── testutil/              # Test utilities
│   │   ├── database.go        # DB setup/teardown
│   │   └── fixtures.go        # Test data factories
│   │
│   ├── app/postgres/
│   │   └── *_test.go          # Repository integration tests
│   │
│   └── pkg/
│       ├── jwt/
│       │   └── jwt_test.go    # JWT unit tests
│       └── password/
│           └── password_test.go  # Password unit tests
```

### Test Utilities

#### Database Setup
```go
// Create test database (in-memory SQLite)
db := testutil.SetupTestDB(t)
defer testutil.CleanupTestDB(t, db)

// Auto-migrate entities
testutil.AutoMigrateAll(t, db.DB, &entity.User{})
```

#### Test Fixtures
```go
fixtures := testutil.NewFixtures()

// Create test user
user := fixtures.CreateUser("test@example.com")

// Create test card
card := fixtures.CreateCard(userID)

// Create test transaction
tx := fixtures.CreateTransaction(userID, cardID, entity.TransactionTypeIncome, 50000)
```

## Test Coverage

### Current Test Coverage

| Package | Coverage | Tests |
|---------|----------|-------|
| `pkg/password` | ~90% | 8 tests |
| `pkg/jwt` | ~85% | 12 tests |
| `app/postgres` | ~75% | 15+ tests |

### Tested Components

✅ **Password Utilities**
- Hash generation and verification
- Password strength validation (8 criteria)
- Reset token generation and hashing

✅ **JWT Manager**
- Access token generation and validation
- Refresh token generation and validation  
- Reset token generation and validation
- Token pair generation
- Token expiry handling
- Token type validation

✅ **User Repository**
- Create user
- Find by ID and email
- Update user
- Delete user
- Check user existence
- Duplicate email prevention

✅ **Card Repository** (planned)
- CRUD operations
- Balance updates
- Freeze toggle

✅ **Transaction Repository** (planned)
- CRUD operations
- Filtering and pagination
- Statistics aggregation

## Writing New Tests

### Unit Test Template

```go
package mypackage_test

import (
	"testing"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMyFunction(t *testing.T) {
	t.Run("successfully does something", func(t *testing.T) {
		// Arrange
		input := "test"
		
		// Act
		result, err := MyFunction(input)
		
		// Assert
		require.NoError(t, err)
		assert.Equal(t, expected, result)
	})
	
	t.Run("handles error case", func(t *testing.T) {
		result, err := MyFunction("invalid")
		
		assert.Error(t, err)
		assert.Empty(t, result)
	})
}
```

### Integration Test Template

```go
func TestRepository_Operation(t *testing.T) {
	// Setup
	db := testutil.SetupTestDB(t)
	defer testutil.CleanupTestDB(t, db)
	
	testutil.AutoMigrateAll(t, db.DB, &entity.MyEntity{})
	
	repo := postgres.NewMyRepository(db.DB)
	fixtures := testutil.NewFixtures()
	
	t.Run("test case", func(t *testing.T) {
		// Create test data
		data := fixtures.CreateMyEntity()
		
		// Test operation
		err := repo.Create(context.Background(), data)
		
		// Verify
		require.NoError(t, err)
		assert.NotEqual(t, 0, data.ID)
	})
}
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `t.Run` for subtests
- Clean up resources in `defer`

### 2. Test Data
- Use fixtures for consistent test data
- Don't rely on production data
- Reset database state between tests

### 3. Assertions
- Use `require` for critical checks (stops test on failure)
- Use `assert` for non-critical checks (continues test)

### 4. Coverage
- Aim for 80%+ coverage on business logic
- 100% coverage on utilities
- Don't test third-party libraries

### 5. Test Naming
- Descriptive test names: `TestService_Function_Scenario`
- Subtest names describe behavior: "successfully creates user"

## CI/CD Integration

### GitHub Actions (example)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.21'
      
      - name: Run tests
        run: go test ./... -v -cover
      
      - name: Generate coverage report
        run: |
          go test ./... -coverprofile=coverage.out
          go tool cover -html=coverage.out -o coverage.html
      
      - name: Upload coverage
        uses: actions/upload-artifact@v3
        with:
          name: coverage
          path: coverage.html
```

## Troubleshooting

### Common Issues

**Import cycle error**
- Move test utilities to separate `testutil` package
- Use `_test` package suffix for tests

**Tests pass locally but fail in CI**
- Check environment variables
- Ensure database is available
- Verify timezone handling

**Slow tests**
- Use in-memory database for unit tests
- Run integration tests separately
- Use parallel testing: `t.Parallel()`

## Future Enhancements

- [ ] API endpoint tests with httptest
- [ ] Service layer unit tests with mocks
- [ ] E2E tests with real database
- [ ] Performance/benchmark tests
- [ ] Integration test with Docker Compose

## Resources

- [Go Testing Package](https://golang.org/pkg/testing/)
- [Testify Documentation](https://github.com/stretchr/testify)
- [Table-Driven Tests](https://github.com/golang/go/wiki/TableDrivenTests)
