package provider

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"pfn-backend/internal/app/postgres"
	"pfn-backend/internal/config"
	"pfn-backend/internal/pkg/logger"
	"pfn-backend/internal/router"
	"syscall"
	"time"
)

type Server struct {
	cfg    *config.Config
	router *router.Router
	db     *postgres.Database
	logger *logger.Logger
}

func ProvideServer(
	cfg *config.Config,
	router *router.Router,
	db *postgres.Database,
	logger *logger.Logger,
) *Server {
	return &Server{
		cfg:    cfg,
		router: router,
		db:     db,
		logger: logger,
	}
}

func (s *Server) Start() error {
	addr := fmt.Sprintf("%s:%s", s.cfg.App.Host, s.cfg.App.Port)

	srv := &http.Server{
		Addr:           addr,
		Handler:        s.router.GetEngine(),
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	// Start server in goroutine
	go func() {
		s.logger.Info("Starting HTTP server", logger.String("address", addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			s.logger.Fatal("Failed to start server", logger.Error(err))
		}
	}()

	// Wait for interrupt signal to gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	s.logger.Info("Shutting down server...")

	// Graceful shutdown with 5 second timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		s.logger.Error("Server forced to shutdown", logger.Error(err))
		return err
	}

	// Close database connection
	if err := s.db.Close(); err != nil {
		s.logger.Error("Failed to close database", logger.Error(err))
	}

	s.logger.Info("Server exited successfully")
	return nil
}
