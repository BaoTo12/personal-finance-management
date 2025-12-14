@echo off
REM Database Setup Script for Personal Finance Management (Windows)
REM This script initializes the database and runs migrations

echo 🗄️  Setting up Personal Finance Management Database...

REM Database configuration
set DB_HOST=localhost
set DB_PORT=5432
set DB_USER=postgres
set DB_PASSWORD=postgres
set DB_NAME=personal_finance

REM Connection string
set DSN=host=%DB_HOST% port=%DB_PORT% user=%DB_USER% password=%DB_PASSWORD% dbname=%DB_NAME% sslmode=disable

echo.
echo 📡 Checking database connection...
echo ⏳ Make sure PostgreSQL is running on %DB_HOST%:%DB_PORT%
echo.

echo 🚀 Running migrations...
cd "%~dp0.."
cd db

REM Check if goose is installed
where goose >nul 2>nul
if errorlevel 1 (
  echo ⚠️  Goose not found. Installing...
  go install github.com/pressly/goose/v3/cmd/goose@latest
)

REM Run migrations
goose postgres "%DSN%" up

if errorlevel 1 (
  echo.
  echo ❌ Migration failed! Please check:
  echo    1. PostgreSQL is running
  echo    2. Database credentials are correct
  echo    3. Database 'personal_finance' exists
  echo.
  echo You can create the database manually with:
  echo    psql -U postgres -c "CREATE DATABASE personal_finance;"
  exit /b 1
)

echo.
echo ✅ Migrations completed successfully!
echo.
echo 🎉 Database setup complete!
echo    Database: %DB_NAME%
echo    Host: %DB_HOST%:%DB_PORT%
echo    User: %DB_USER%
echo.
