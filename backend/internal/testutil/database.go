package testutil

import (
	"fmt"
	"pfn-backend/internal/app/postgres"
	"pfn-backend/internal/pkg/logger"
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// SetupTestDB creates an in-memory SQLite database for testing
func SetupTestDB(t *testing.T) *postgres.Database {
	t.Helper()

	// Use SQLite in-memory for tests
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to create test database: %v", err)
	}

	// Create test logger
	testLogger, err := logger.New(logger.Config{
		Level:  "error",
		Format: "console",
		Output: "stdout",
	})
	if err != nil {
		t.Fatalf("Failed to create test logger: %v", err)
	}

	return &postgres.Database{
		DB:     db,
		Logger: testLogger,
	}
}

// CleanupTestDB closes the test database
func CleanupTestDB(t *testing.T, db *postgres.Database) {
	t.Helper()

	sqlDB, err := db.DB.DB()
	if err != nil {
		t.Errorf("Failed to get underlying DB: %v", err)
		return
	}

	if err := sqlDB.Close(); err != nil {
		t.Errorf("Failed to close test DB: %v", err)
	}
}

// AutoMigrateAll runs auto-migration for all entities
func AutoMigrateAll(t *testing.T, db *gorm.DB, models ...interface{}) {
	t.Helper()

	if err := db.AutoMigrate(models...); err != nil {
		t.Fatalf("Failed to auto-migrate: %v", err)
	}
}

// TruncateTables truncates all specified tables
func TruncateTables(t *testing.T, db *gorm.DB, tables ...string) {
	t.Helper()

	for _, table := range tables {
		if err := db.Exec(fmt.Sprintf("DELETE FROM %s", table)).Error; err != nil {
			t.Errorf("Failed to truncate table %s: %v", table, err)
		}
	}
}
