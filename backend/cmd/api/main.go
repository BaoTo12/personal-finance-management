package main

import (
	"flag"
	"fmt"
	"os"
	"pfn-backend/internal/config"
	"pfn-backend/internal/pkg/logger"

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
}
