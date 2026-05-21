#!/bin/bash

# Student Management System - Automated Setup Script
# For macOS and Linux users
# Usage: bash setup.sh

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check prerequisites
print_header "Checking Prerequisites"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install from https://nodejs.org/"
    exit 1
fi
print_success "Node.js $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm $(npm --version)"

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install from https://www.python.org/"
    exit 1
fi
print_success "Python $(python3 --version)"

# Check MySQL (optional, just warn)
if ! command -v mysql &> /dev/null; then
    print_warning "MySQL is not in PATH. Make sure it's installed and configured."
else
    print_success "MySQL found"
fi

# Check Git (optional)
if command -v git &> /dev/null; then
    print_success "Git $(git --version)"
fi

# Setup Backend
print_header "Setting up Backend"

cd backend || exit 1

# Check if venv exists
if [ ! -d "venv" ]; then
    print_warning "Creating virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
else
    print_success "Virtual environment already exists"
fi

# Activate venv
source venv/bin/activate
print_success "Virtual environment activated"

# Install dependencies
print_warning "Installing Python dependencies (this may take a while)..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt > /dev/null 2>&1
print_success "Python dependencies installed"

# Check .env
if [ ! -f ".env" ]; then
    print_error ".env file not found. Please create it manually."
    echo "Template:"
    echo "DATABASE_URL=mysql+pymysql://root:password@localhost:3306/student_management"
    echo "SECRET_KEY=your-secret-key"
else
    print_success ".env file exists"
fi

cd ..

# Setup Frontend
print_header "Setting up Frontend"

cd frontend || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "Installing Node.js dependencies (this may take a while)..."
    npm install > /dev/null 2>&1
    print_success "Node.js dependencies installed"
else
    print_success "Node.js dependencies already exist"
fi

cd ..

# Setup Summary
print_header "Setup Complete!"

print_success "Backend setup completed"
print_success "Frontend setup completed"

echo ""
echo -e "${BLUE}To start the application:${NC}"
echo ""
echo -e "${YELLOW}Terminal 1 (Backend):${NC}"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python -m uvicorn app.main:app --reload"
echo ""
echo -e "${YELLOW}Terminal 2 (Frontend):${NC}"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo -e "${BLUE}Then open: ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Default credentials:${NC}"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
