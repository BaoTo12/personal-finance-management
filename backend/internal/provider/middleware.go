package provider

import (
	"pfn-backend/internal/config"
	"pfn-backend/internal/middleware"
	"pfn-backend/internal/pkg/jwt"
	"pfn-backend/internal/pkg/logger"

	"github.com/gin-gonic/gin"
)

type LoggerMiddleware gin.HandlerFunc
type CORSMiddleware gin.HandlerFunc
type RecoveryMiddleware gin.HandlerFunc

func ProvideAuthMiddleware(
	jwtManager *jwt.JWTManager,
	logger *logger.Logger,
) *middleware.AuthMiddleware {
	return middleware.NewAuthMiddleware(jwtManager, logger)
}

func ProvideLoggerMiddleware(logger *logger.Logger) LoggerMiddleware {
	return LoggerMiddleware(middleware.LoggerMiddleware(logger))
}

func ProvideCORSMiddleware(cfg *config.Config) CORSMiddleware {
	return CORSMiddleware(middleware.CORSMiddleware(cfg))
}

func ProvideRecoveryMiddleware(logger *logger.Logger) RecoveryMiddleware {
	return RecoveryMiddleware(middleware.RecoveryMiddleware(logger))
}
