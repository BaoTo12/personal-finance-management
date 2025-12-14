package provider

import (
	"pfn-backend/internal/app/postgres"
	"pfn-backend/internal/app/repository"
)

func ProvideUserRepository(db *postgres.Database) repository.UserRepository {
	return repository.NewUserRepository(db.DB)
}

func ProvideCardRepository(db *postgres.Database) repository.CardRepository {
	return repository.NewCardRepository(db.DB)
}

func ProvideTransactionRepository(db *postgres.Database) repository.TransactionRepository {
	return repository.NewTransactionRepository(db.DB)
}

func ProvideCategoryRepository(db *postgres.Database) repository.CategoryRepository {
	return repository.NewCategoryRepository(db.DB)
}

func ProvideRefreshTokenRepository(db *postgres.Database) repository.RefreshTokenRepository {
	return repository.NewRefreshTokenRepository(db.DB)
}
