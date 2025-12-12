package provider

import (
	"pfn-backend/internal/app/postgres"
	"pfn-backend/internal/config"
	"pfn-backend/internal/pkg/logger"
)

func ProviderDatabase(cfg *config.Config, logger *logger.Logger) (*postgres.Database, error) {
	return postgres.New(postgres.Config{
		Host:            cfg.Database.Host,
		Port:            cfg.Database.Port,
		User:            cfg.Database.User,
		Password:        cfg.Database.Password,
		Name:            cfg.Database.Name,
		MaxOpenConns:    cfg.Database.MaxOpenConns,
		MaxIdleConns:    cfg.Database.MaxIdleConns,
		ConnMaxLifetime: cfg.Database.ConnMaxLifetime,
		DebugLevel:      cfg.Database.DebugLevel,
	}, logger)
}
