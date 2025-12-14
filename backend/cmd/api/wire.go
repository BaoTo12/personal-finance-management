//go:build wireinject
// +build wireinject

package main

import (
	"pfn-backend/internal/provider"

	"github.com/google/wire"
)

func InitializeApplication(configPath string) (*provider.Server, error) {
	wire.Build(
		// Config & Infrastructure
		provider.ProvideConfig,
		provider.ProviderLogger,
		provider.ProviderDatabase,
		provider.ProvideJWTManager,

		// Repositories
		provider.ProvideUserRepository,
		provider.ProvideCardRepository,
		provider.ProvideTransactionRepository,
		provider.ProvideCategoryRepository,
		provider.ProvideRefreshTokenRepository,

		// Services
		provider.ProvideAuthService,
		provider.ProvideUserService,
		provider.ProvideCardService,
		provider.ProvideTransactionService,
		provider.ProvideCategoryService,

		// Handlers
		provider.ProvideAuthHandler,
		provider.ProvideUserHandler,
		provider.ProvideCardHandler,
		provider.ProvideTransactionHandler,
		provider.ProvideCategoryHandler,

		// Middleware
		provider.ProvideAuthMiddleware,
		provider.ProvideLoggerMiddleware,
		provider.ProvideCORSMiddleware,
		provider.ProvideRecoveryMiddleware,

		// Router & Server
		provider.ProvideRouter,
		provider.ProvideServer,
	)

	return &provider.Server{}, nil
}
