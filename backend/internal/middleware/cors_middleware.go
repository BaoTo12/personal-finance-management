package middleware

import (
	"pfn-backend/internal/config"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORSMiddleware(cfg *config.Config) gin.HandlerFunc {
	config := cors.DefaultConfig()
	config.AllowOrigins = cfg.CORS.AllowOrigins
	config.AllowMethods = cfg.CORS.AllowMethods
	config.AllowHeaders = cfg.CORS.AllowHeaders
	config.ExposeHeaders = cfg.CORS.ExposeHeaders
	config.MaxAge = time.Duration(cfg.CORS.MaxAge) * time.Second
	config.AllowCredentials = true

	return cors.New(config)
}
