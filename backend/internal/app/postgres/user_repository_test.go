package postgres_test

import (
	"context"
	"pfn-backend/internal/app/entity"
	"pfn-backend/internal/app/postgres"
	"pfn-backend/internal/testutil"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUserRepository_Create(t *testing.T) {
	// Setup
	db := testutil.SetupTestDB(t)
	defer testutil.CleanupTestDB(t, db)

	testutil.AutoMigrateAll(t, db.DB, &entity.User{})

	repo := postgres.NewUserRepository(db.DB)
	fixtures := testutil.NewFixtures()

	t.Run("successfully creates user", func(t *testing.T) {
		user := fixtures.CreateUser("test@example.com")

		err := repo.Create(context.Background(), user)

		require.NoError(t, err)
		assert.NotEqual(t, 0, user.ID)
	})

	t.Run("fails with duplicate email", func(t *testing.T) {
		user1 := fixtures.CreateUser("duplicate@example.com")
		user2 := fixtures.CreateUser("duplicate@example.com")

		err1 := repo.Create(context.Background(), user1)
		err2 := repo.Create(context.Background(), user2)

		require.NoError(t, err1)
		assert.Error(t, err2)
	})
}

func TestUserRepository_FindByEmail(t *testing.T) {
	// Setup
	db := testutil.SetupTestDB(t)
	defer testutil.CleanupTestDB(t, db)

	testutil.AutoMigrateAll(t, db.DB, &entity.User{})

	repo := postgres.NewUserRepository(db.DB)
	fixtures := testutil.NewFixtures()

	t.Run("finds existing user", func(t *testing.T) {
		user := fixtures.CreateUser("find@example.com")
		_ = repo.Create(context.Background(), user)

		found, err := repo.FindByEmail(context.Background(), "find@example.com")

		require.NoError(t, err)
		assert.Equal(t, user.Email, found.Email)
		assert.Equal(t, user.ID, found.ID)
	})

	t.Run("returns error for non-existent user", func(t *testing.T) {
		_, err := repo.FindByEmail(context.Background(), "nonexistent@example.com")

		assert.Error(t, err)
	})
}

func TestUserRepository_Update(t *testing.T) {
	// Setup
	db := testutil.SetupTestDB(t)
	defer testutil.CleanupTestDB(t, db)

	testutil.AutoMigrateAll(t, db.DB, &entity.User{})

	repo := postgres.NewUserRepository(db.DB)
	fixtures := testutil.NewFixtures()

	t.Run("successfully updates user", func(t *testing.T) {
		user := fixtures.CreateUser("update@example.com")
		_ = repo.Create(context.Background(), user)

		user.FirstName = "Updated"
		user.LastName = "Name"

		err := repo.Update(context.Background(), user)

		require.NoError(t, err)

		// Verify update
		updated, _ := repo.FindByEmail(context.Background(), "update@example.com")
		assert.Equal(t, "Updated", updated.FirstName)
		assert.Equal(t, "Name", updated.LastName)
	})
}

func TestUserRepository_Exists(t *testing.T) {
	// Setup
	db := testutil.SetupTestDB(t)
	defer testutil.CleanupTestDB(t, db)

	testutil.AutoMigrateAll(t, db.DB, &entity.User{})

	repo := postgres.NewUserRepository(db.DB)
	fixtures := testutil.NewFixtures()

	t.Run("returns true for existing user", func(t *testing.T) {
		user := fixtures.CreateUser("exists@example.com")
		_ = repo.Create(context.Background(), user)

		exists, err := repo.Exists(context.Background(), "exists@example.com")

		require.NoError(t, err)
		assert.True(t, exists)
	})

	t.Run("returns false for non-existent user", func(t *testing.T) {
		exists, err := repo.Exists(context.Background(), "notexists@example.com")

		require.NoError(t, err)
		assert.False(t, exists)
	})
}
