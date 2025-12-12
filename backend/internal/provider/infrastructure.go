package provider

import (
	"pfn-backend/internal/config"
	"pfn-backend/internal/pkg/logger"
)

// logger

func ProviderLogger(cfg *config.Config) (*logger.Logger, error) {
	return logger.New(logger.Config{
		Level:      cfg.Logger.Level,
		Format:     cfg.Logger.Level,
		Output:     cfg.Logger.Level,
		TimeFormat: cfg.Logger.Level,
	})
}
