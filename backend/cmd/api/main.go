package main

import (
	"flag"
	"fmt"
	"os"
	"pfn-backend/internal/app/postgres"
	"pfn-backend/internal/config"
	"pfn-backend/internal/pkg/logger"
	"pfn-backend/internal/pkg/tracer"

	"github.com/subosito/gotenv"
)

func main() {
	var configPath string
	flag.StringVar(&configPath, "config", "backend\\internal\\config", "path to config file")
	flag.Parse()

	if err := gotenv.Load(); err != nil {
		fmt.Println("No .env file found, using environment variables")
	}

	cfg, err := config.Load(configPath)
	if err != nil {
		fmt.Printf("Failed to load configuration: %v\n", err)
		os.Exit(1)
	}

	// logger
	log, err := logger.New(logger.Config{
		Level:      cfg.Logger.Level,
		Format:     cfg.Logger.Format,
		Output:     cfg.Logger.Output,
		TimeFormat: cfg.Logger.TimeFormat,
	})
	// tracer
	trace, err := tracer.New(tracer.Config{
		Enabled:     cfg.Tracer.Enabled,
		ServiceName: cfg.Tracer.ServiceName,
		Endpoint:    cfg.Tracer.Endpoint,
		Insecure:    cfg.Tracer.Insecure,
		SampleRate:  cfg.Tracer.SampleRate,
		Environment: cfg.App.Environment,
	})

	// Initialize Database
	db, err := postgres.New(postgres.Config{
		Host:            cfg.Database.Host,
		Port:            cfg.Database.Port,
		User:            cfg.Database.User,
		Password:        cfg.Database.Password,
		Name:            cfg.Database.Name,
		MaxOpenConns:    cfg.Database.MaxOpenConns,
		MaxIdleConns:    cfg.Database.MaxIdleConns,
		ConnMaxLifetime: cfg.Database.ConnMaxLifetime,
		DebugLevel:      cfg.Database.DebugLevel,
	}, log)
}
