# Personal Finance Management Platform - Comprehensive Guide



## Project Structure

```
personal-finance-management/
├── backend/
│   ├── cmd/
│   │   └── api/
│   │       ├── main.go              # Application entry point
│   │       ├── wire.go              # Wire injector definitions
│   │       └── wire_gen.go          # Generated Wire code
│   │
│   ├── internal/
│   │   ├── app/
│   │   │   ├── entity/             # Domain entities
│   │   │   │   ├── user.go
│   │   │   │   ├── card.go
│   │   │   │   ├── transaction.go
│   │   │   │   ├── category.go
│   │   │   │   └── refresh_token.go
│   │   │   │
│   │   │   ├── repository/         # Repository interfaces (output ports)
│   │   │   │   ├── user.go
│   │   │   │   ├── card.go
│   │   │   │   ├── transaction.go
│   │   │   │   └── category.go
│   │   │   │
│   │   │   ├── service/            # Business logic (use cases)
│   │   │   │   ├── auth/
│   │   │   │   │   ├── service.go
│   │   │   │   │   └── dto.go
│   │   │   │   ├── user/
│   │   │   │   ├── card/
│   │   │   │   └── transaction/
│   │   │   │
│   │   │   └── postgres/           # Repository implementations
│   │   │       ├── connection.go
│   │   │       ├── user_repository.go
│   │   │       ├── card_repository.go
│   │   │       ├── transaction_repository.go
│   │   │       └── category_repository.go
│   │   │
│   │   ├── handlers/               # HTTP handlers (controllers)
│   │   │   ├── auth_handler.go
│   │   │   ├── user_handler.go
│   │   │   ├── card_handler.go
│   │   │   └── transaction_handler.go
│   │   │
│   │   ├── middleware/             # HTTP middleware
│   │   │   ├── auth.go
│   │   │   ├── cors.go
│   │   │   └── logger.go
│   │   │
│   │   ├── router/                 # Route definitions
│   │   │   └── router.go
│   │   │
│   │   ├── server/                 # HTTP server setup
│   │   │   └── server.go
│   │   │
│   │   ├── config/                 # Configuration management
│   │   │   └── config.go
│   │   │
│   │   ├── pkg/                    # Shared utilities
│   │   │   └── logger/
│   │   │       └── logger.go
│   │   │
│   │   └── provider/               # Wire DI providers
│   │       ├── config.go
│   │       ├── database.go
│   │       ├── infrastructure.go
│   │       ├── middleware.go
│   │       ├── repository.go
│   │       └── server.go
│   │
│   ├── db/
│   │   └── migrations/             # Database migrations (Goose)
│   │       └── 20251211081558_init_schema.sql
│   │
│   ├── config/                     # Config files
│   │   └── config.yaml
│   │
│   ├── Makefile                    # Build and migration commands
│   ├── go.mod                      # Go dependencies
│   └── go.sum
│
├── frontend/
│   ├── app/                        # Application routes
│   ├── components/                 # Reusable UI components
│   ├── pages/                      # Page components
│   ├── types.ts                    # TypeScript type definitions
│   ├── store.ts                    # Zustand state management
│   ├── constants.ts                # Application constants
│   ├── App.tsx                     # Root component
│   ├── index.tsx                   # Entry point
│   ├── index.html                  # HTML template
│   ├── vite.config.ts              # Vite configuration
│   ├── tsconfig.json               # TypeScript configuration
│   └── package.json
│
├── docker-compose.dev.yml          # Development infrastructure
├── DATABASE_AND_GOOSE_GUIDE.md     # Database migration guide
└── README.md
