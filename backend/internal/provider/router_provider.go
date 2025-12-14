package provider

import (
	"pfn-backend/internal/config"
	"pfn-backend/internal/handlers"
	"pfn-backend/internal/middleware"
	"pfn-backend/internal/router"

	"github.com/gin-gonic/gin"
)

func ProvideRouter(
	cfg *config.Config,
	authHandler *handlers.AuthHandler,
	userHandler *handlers.UserHandler,
	cardHandler *handlers.CardHandler,
	transactionHandler *handlers.TransactionHandler,
	categoryHandler *handlers.CategoryHandler,
	authMiddleware *middleware.AuthMiddleware,
	loggerMw LoggerMiddleware,
	corsMw CORSMiddleware,
	recoveryMw RecoveryMiddleware,
) *router.Router {
	return router.New(
		cfg,
		authHandler,
		userHandler,
		cardHandler,
		transactionHandler,
		categoryHandler,
		authMiddleware,
		gin.HandlerFunc(loggerMw),
		gin.HandlerFunc(corsMw),
		gin.HandlerFunc(recoveryMw),
	)
}
