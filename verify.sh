#!/bin/bash

# Verification script to check all requirements and setup
# Usage: bash verify.sh

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_ok() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_fail() {
    echo -e "${RED}✗ $1${NC}"
}

# Start verification
print_header "Student Management System - Verification"

# Check Node.js
echo "Node.js:"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_ok "$NODE_VERSION"
else
    print_fail "Not installed"
fi

# Check npm
echo "npm:"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_ok "$NPM_VERSION"
else
    print_fail "Not installed"
fi

# Check Python
echo "Python:"
if command -v python3 &> /dev/null; then
    PY_VERSION=$(python3 --version)
    print_ok "$PY_VERSION"
else
    print_fail "Not installed"
fi

# Check MySQL
echo "MySQL:"
if command -v mysql &> /dev/null; then
    MYSQL_VERSION=$(mysql --version)
    print_ok "$MYSQL_VERSION"
else
    print_warn "Not in PATH (but may still be installed)"
fi

# Check Backend
echo ""
print_header "Backend Status"

cd backend 2>/dev/null || { print_fail "backend directory not found"; cd ..; }

if [ -d "venv" ]; then
    print_ok "Virtual environment exists"
else
    print_warn "Virtual environment not found"
fi

if [ -f "requirements.txt" ]; then
    print_ok "requirements.txt found"
    # Try to check if all are installed
    source venv/bin/activate 2>/dev/null && {
        print_ok "Virtual environment activated"
        python -c "import fastapi; print('FastAPI: ' + fastapi.__version__)" 2>/dev/null && print_ok "FastAPI installed" || print_warn "FastAPI not installed, run: pip install -r requirements.txt"
    } || print_warn "Virtual environment not activated"
else
    print_fail "requirements.txt not found"
fi

cd ..

# Check Frontend
echo ""
print_header "Frontend Status"

cd frontend 2>/dev/null || { print_fail "frontend directory not found"; cd ..; }

if [ -d "node_modules" ]; then
    print_ok "node_modules exists"
else
    print_warn "node_modules not found, run: npm install"
fi

if [ -f "package.json" ]; then
    print_ok "package.json found"
else
    print_fail "package.json not found"
fi

cd ..

# Check Database
echo ""
print_header "Database Status"

if [ -f "database/schema.sql" ]; then
    print_ok "schema.sql found"
else
    print_fail "schema.sql not found"
fi

# Try to connect to database
if command -v mysql &> /dev/null; then
    if mysql -u root -p -e "SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'student_management' LIMIT 1;" 2>/dev/null; then
        print_ok "student_management database exists"
    else
        print_warn "student_management database not found, run: mysql -u root -p < database/schema.sql"
    fi
fi

# Summary
echo ""
print_header "Summary"
echo ""
echo "Next steps:"
echo "1. Run: bash setup.sh (or setup.ps1 on Windows)"
echo "2. Terminal 1: cd backend && source venv/bin/activate && python -m uvicorn app.main:app --reload"
echo "3. Terminal 2: cd frontend && npm run dev"
echo "4. Open: http://localhost:3000"
echo ""
