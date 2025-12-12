package provider

import "pfn-backend/internal/config"

func ProvideConfig(configPath string) (*config.Config, error) {
	return config.Load(configPath)
}
