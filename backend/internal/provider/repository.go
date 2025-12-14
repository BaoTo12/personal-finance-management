package provider

import (
	"pfn-backend/internal/app/postgres"
	"pfn-backend/internal/app/repository"
)

func ProvideUserRepository(db *postgres.Database) repository.UserRepository {
	return postgres.NewUserRepository(db.DB)
}

func ProvideCardRepository(db *postgres.Database) repository.CardRepository {
	return postgres.NewCardRepository(db.DB)
}

func ProvideTransactionRepository(db *postgres.Database) repository.TransactionRepository {
	return postgres.NewTransactionRepository(db.DB)
}

func ProvideCategoryRepository(db *postgres.Database) repository.CategoryRepository {
	return postgres.NewCategoryRepository(db.DB)
}

func ProvideRefreshTokenRepository(db *postgres.Database) repository.RefreshTokenRepository {
	return postgres.NewRefreshTokenRepository(db.DB)
}
