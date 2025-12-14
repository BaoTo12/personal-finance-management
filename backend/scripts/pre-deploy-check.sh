# Pre-deploy Bash Script
#!/bin/bash
set -e

echo "========================================="
echo "Pre-Deployment Verification"
echo "========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAILED=0

check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        FAILED=1
    fi
}

# 1. Wire generation
echo "1. Checking Wire code generation..."
wire check ./cmd/api 2>/dev/null
check "Wire code is up to date"

# 2. Go mod verification
echo "2. Verifying dependencies..."
go mod verify 2>/dev/null
check "Dependencies verified"

# 3. Tests
echo "3. Running tests..."
go test ./... -short > /dev/null 2>&1
check "All tests passed"

# 4. Build
echo "4. Building application..."
go build -o /tmp/test-build ./cmd/api > /dev/null 2>&1
check "Build successful"
rm -f /tmp/test-build

# 5. Linting
echo "5. Running linter..."
if command -v golangci-lint &> /dev/null; then
    golangci-lint run --timeout=3m > /dev/null 2>&1
    check "Linting passed"
else
    echo -e "${YELLOW}⚠${NC} golangci-lint not found (skipped)"
fi

# 6. Security scan
echo "6. Running security scan..."
if command -v gosec &> /dev/null; then
    gosec -quiet ./... > /dev/null 2>&1
    check "Security scan passed"
else
    echo -e "${YELLOW}⚠${NC} gosec not found (skipped)"
fi

# 7. Check migrations
echo "7. Validating migrations..."
if [ -d "db/migrations" ]; then
    COUNT=$(ls -1 db/migrations/*.sql 2>/dev/null | wc -l)
    if [ $COUNT -gt 0 ]; then
        echo -e "${GREEN}✓${NC} Found $COUNT migration files"
    else
        echo -e "${YELLOW}⚠${NC} No migration files found"
    fi
else
    echo -e "${YELLOW}⚠${NC} Migrations directory not found"
fi

echo ""
echo "========================================="
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL CHECKS PASSED - READY TO DEPLOY${NC}"
    echo "========================================="
    exit 0
else
    echo -e "${RED}✗ SOME CHECKS FAILED - DO NOT DEPLOY${NC}"
    echo "========================================="
    exit 1
fi
