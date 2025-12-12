# Database configuration
DB_HOST ?= localhost
DB_PORT ?= 5432
DB_USER ?= postgres
DB_PASSWORD ?= postgres
DB_NAME ?= pfm-database
# DB_DSN := "host=$(DB_HOST) port=$(DB_PORT) user=$(DB_USER) password=$(DB_PASS) dbname=$(DB_NAME)"
DB_DSN := "postgres://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)"
# Migration directory
MIGRATIONS_DIR := ./db/migrations

.PHONY: migrate-up migrate-down migrate-status migrate-reset migrate-create

migrate-up:
	@echo "Running migrations..."
	goose -dir $(MIGRATIONS_DIR) postgres $(DB_DSN) up
migrate-down:
	@echo "Rolling back last migration..."
	goose -dir $(MIGRATIONS_DIR) postgres $(DB_DSN) down
migrate-status:
	@echo "Migration status:"
	goose -dir $(MIGRATIONS_DIR) postgres $(DB_DSN) status
migrate-reset:
	@echo "Resetting database..."
	goose -dir $(MIGRATIONS_DIR) postgres $(DB_DSN) reset
migrate-create:
	@read -p "Enter migration name: " name; \
	goose -dir $(MIGRATIONS_DIR) create $$name sql