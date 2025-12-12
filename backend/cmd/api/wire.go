//go:build wireinject
// +build wireinject

package main

import (
	"pfn-backend/internal/app/postgres"
	"pfn-backend/internal/config"
	"pfn-backend/internal/pkg/logger"
	"pfn-backend/internal/provider"

	"github.com/google/wire"
)

type Application struct {
	Logger *logger.Logger
	DB     *postgres.Database
	Config *config.Config
}

func InitializeApplication(configPath string) (*Application, error) {

	wire.Build(
		// config
		provider.ProvideConfig,

		// database
		provider.ProviderDatabase,

		// infrastructure
		provider.ProviderLogger,

		// application
		wire.Struct(new(Application), "*"),
	)

	return &Application{}, nil
}
