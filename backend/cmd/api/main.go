package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/subosito/gotenv"
)

func main() {
	var configPath string
	flag.StringVar(&configPath, "config", "backend\\internal\\config", "path to config file")
	flag.Parse()

	if err := gotenv.Load(); err != nil {
		fmt.Println("No .env file found, using environment variables")
	}

	app, err := InitializeApplication(configPath)
	if err != nil {
		fmt.Printf("Failed to initialize application: %v\n", err)
		os.Exit(1)
	}
	app.Logger.Info("Starting CinemaOS Backend")

	defer func() {
		if app.DB != nil {
			app.DB.Close()
		}
	}()
}
