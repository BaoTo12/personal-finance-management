package provider

import (
	"pfn-backend/internal/app/repository"
	"pfn-backend/internal/app/service/auth"
	"pfn-backend/internal/app/service/card"
	"pfn-backend/internal/app/service/category"
	"pfn-backend/internal/app/service/transaction"
	"pfn-backend/internal/app/service/user"
	"pfn-backend/internal/pkg/jwt"
	"pfn-backend/internal/pkg/logger"
)

func ProvideAuthService(
	userRepo repository.UserRepository,
	refreshTokenRepo repository.RefreshTokenRepository,
	jwtManager *jwt.JWTManager,
	logger *logger.Logger,
) auth.Service {
	return auth.NewService(userRepo, refreshTokenRepo, jwtManager, logger)
}

func ProvideUserService(
	userRepo repository.UserRepository,
) user.Service {
	return user.NewService(userRepo)
}

func ProvideCardService(
	cardRepo repository.CardRepository,
) card.Service {
	return card.NewService(cardRepo)
}

func ProvideTransactionService(
	txRepo repository.TransactionRepository,
	cardRepo repository.CardRepository,
) transaction.Service {
	return transaction.NewService(txRepo, cardRepo)
}

func ProvideCategoryService(
	categoryRepo repository.CategoryRepository,
) category.Service {
	return category.NewService(categoryRepo)
}
