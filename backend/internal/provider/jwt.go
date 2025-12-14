package provider

import (
	"pfn-backend/internal/config"
	"pfn-backend/internal/pkg/jwt"
)

func ProvideJWTManager(cfg *config.Config) *jwt.JWTManager {
	return jwt.NewJWTManager(
		cfg.JWT.AccessSecret,
		cfg.JWT.RefreshSecret,
		cfg.JWT.Issuer,
		cfg.JWT.AccessTokenExpiry,
		cfg.JWT.RefreshTokenExpiry,
		cfg.JWT.ResetTokenExpiry,
	)
}
