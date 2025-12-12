### 9.2 CI/CD Integration

**GitHub Actions example:**

```yaml
name: Database Migration

on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Goose
        run: go install github.com/pressly/goose/v3/cmd/goose@latest
      
      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          goose -dir db/migrations postgres "$DATABASE_URL" up
```