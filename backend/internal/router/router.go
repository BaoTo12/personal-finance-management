package router

import (
	"pfn-backend/internal/config"
	"pfn-backend/internal/handlers"
	"pfn-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

type Router struct {
	engine             *gin.Engine
	authHandler        *handlers.AuthHandler
	userHandler        *handlers.UserHandler
	cardHandler        *handlers.CardHandler
	transactionHandler *handlers.TransactionHandler
	categoryHandler    *handlers.CategoryHandler
	authMiddleware     *middleware.AuthMiddleware
}

func New(
	cfg *config.Config,
	authHandler *handlers.AuthHandler,
	userHandler *handlers.UserHandler,
	cardHandler *handlers.CardHandler,
	transactionHandler *handlers.TransactionHandler,
	categoryHandler *handlers.CategoryHandler,
	authMiddleware *middleware.AuthMiddleware,
	loggerMw gin.HandlerFunc,
	corsMw gin.HandlerFunc,
	recoveryMw gin.HandlerFunc,
) *Router {
	// Set Gin mode based on environment
	if cfg.App.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	engine := gin.New()

	// Global middleware
	engine.Use(recoveryMw)
	engine.Use(loggerMw)
	engine.Use(corsMw)

	router := &Router{
		engine:             engine,
		authHandler:        authHandler,
		userHandler:        userHandler,
		cardHandler:        cardHandler,
		transactionHandler: transactionHandler,
		categoryHandler:    categoryHandler,
		authMiddleware:     authMiddleware,
	}

	router.setupRoutes()

	return router
}

func (r *Router) setupRoutes() {
	// Health check
	r.engine.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "personal-finance-management",
		})
	})

	// API v1 routes
	v1 := r.engine.Group("/api/v1")
	{
		// Auth routes (public)
		auth := v1.Group("/auth")
		{
			auth.POST("/register", r.authHandler.Register)
			auth.POST("/login", r.authHandler.Login)
			auth.POST("/refresh", r.authHandler.RefreshToken)
			auth.POST("/forgot-password", r.authHandler.ForgotPassword)
			auth.POST("/reset-password", r.authHandler.ResetPassword)

			// Protected auth routes
			auth.POST("/logout", r.authMiddleware.RequireAuth(), r.authHandler.Logout)
			auth.POST("/change-password", r.authMiddleware.RequireAuth(), r.authHandler.ChangePassword)
		}

		// User routes (protected)
		users := v1.Group("/users")
		users.Use(r.authMiddleware.RequireAuth())
		{
			users.GET("/me", r.userHandler.GetProfile)
			users.PUT("/me", r.userHandler.UpdateProfile)
		}

		// Card routes (protected)
		cards := v1.Group("/cards")
		cards.Use(r.authMiddleware.RequireAuth())
		{
			cards.POST("", r.cardHandler.CreateCard)
			cards.GET("", r.cardHandler.GetUserCards)
			cards.GET("/:id", r.cardHandler.GetCard)
			cards.PUT("/:id", r.cardHandler.UpdateCard)
			cards.POST("/:id/freeze", r.cardHandler.ToggleFreeze)
			cards.DELETE("/:id", r.cardHandler.DeleteCard)
		}

		// Transaction routes (protected)
		transactions := v1.Group("/transactions")
		transactions.Use(r.authMiddleware.RequireAuth())
		{
			transactions.POST("", r.transactionHandler.CreateTransaction)
			transactions.GET("", r.transactionHandler.GetUserTransactions)
			transactions.GET("/stats", r.transactionHandler.GetStats)
		}

		// Category routes (protected)
		categories := v1.Group("/categories")
		categories.Use(r.authMiddleware.RequireAuth())
		{
			categories.GET("", r.categoryHandler.ListCategories)
		}
	}
}

func (r *Router) GetEngine() *gin.Engine {
	return r.engine
}
