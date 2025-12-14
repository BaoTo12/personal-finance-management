package provider

import (
	"pfn-backend/internal/app/service/auth"
	"pfn-backend/internal/app/service/card"
	"pfn-backend/internal/app/service/category"
	"pfn-backend/internal/app/service/transaction"
	"pfn-backend/internal/app/service/user"
	"pfn-backend/internal/handlers"
	"pfn-backend/internal/pkg/logger"
)

func ProvideAuthHandler(
	authService auth.Service,
	logger *logger.Logger,
) *handlers.AuthHandler {
	return handlers.NewAuthHandler(authService, logger)
}

func ProvideUserHandler(
	userService user.Service,
) *handlers.UserHandler {
	return handlers.NewUserHandler(userService)
}

func ProvideCardHandler(
	cardService card.Service,
) *handlers.CardHandler {
	return handlers.NewCardHandler(cardService)
}

func ProvideTransactionHandler(
	txService transaction.Service,
) *handlers.TransactionHandler {
	return handlers.NewTransactionHandler(txService)
}

func ProvideCategoryHandler(
	categoryService category.Service,
) *handlers.CategoryHandler {
	return handlers.NewCategoryHandler(categoryService)
}
