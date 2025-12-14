package main

import (
	"flag"
	"log"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Parse command line flags
	configPath := flag.String("config", "", "Path to configuration file")
	flag.Parse()

	// Initialize application with Wire
	server, err := InitializeApplication(*configPath)
	if err != nil {
		log.Fatalf("Failed to initialize application: %v", err)
	}

	// Start server with graceful shutdown
	if err := server.Start(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
