#!/bin/bash

# Database Setup Script for Personal Finance Management
# This script initializes the database and runs migrations

set -e

echo "🗄️  Setting up Personal Finance Management Database..."

# Database configuration
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_USER="${DATABASE_USER:-postgres}"
DB_PASSWORD="${DATABASE_PASSWORD:-postgres}"
DB_NAME="${DATABASE_NAME:-personal_finance}"

# Connection string
DSN="host=$DB_HOST port=$DB_PORT user=$DB_USER password=$DB_PASSWORD dbname=$DB_NAME sslmode=disable"

echo "📡 Checking database connection..."
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d "postgres" -c '\q' 2>/dev/null; do
  echo "⏳ Waiting for PostgreSQL to be ready..."
  sleep 2
done

echo "✅ Database connection successful!"

echo "🔍 Checking if database exists..."
DB_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d "postgres" -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" != "1" ]; then
  echo "📝 Creating database: $DB_NAME"
  PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" -d "postgres" -c "CREATE DATABASE $DB_NAME;"
  echo "✅ Database created successfully!"
else
  echo "ℹ️  Database already exists: $DB_NAME"
fi

echo "🚀 Running migrations..."
cd "$(dirname "$0")/.."

# Check if goose is installed
if ! command -v goose &> /dev/null; then
  echo "⚠️  Goose not found. Installing..."
  go install github.com/pressly/goose/v3/cmd/goose@latest
fi

# Run migrations
cd db
goose postgres "$DSN" up

echo "✅ Migrations completed successfully!"
echo ""
echo "🎉 Database setup complete!"
echo "   Database: $DB_NAME"
echo "   Host: $DB_HOST:$DB_PORT"
echo "   User: $DB_USER"
