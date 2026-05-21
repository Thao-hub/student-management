# Student Management System - Automated Setup Script
# For Windows PowerShell users
# Usage: .\setup.ps1

$host.ui.RawUI.WindowTitle = "Student Management System Setup"

# Colors
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Blue = "Cyan"

Write-Host "================================" -ForegroundColor $Blue
Write-Host "Student Management System Setup" -ForegroundColor $Blue
Write-Host "================================" -ForegroundColor $Blue

# Check prerequisites
Write-Host ""
Write-Host "Checking Prerequisites..." -ForegroundColor $Blue
Write-Host ""

# Check Node.js
$NodeVersion = node --version 2>$null
if ($NodeVersion) {
    Write-Host "✓ Node.js $NodeVersion" -ForegroundColor $Green
} else {
    Write-Host "✗ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor $Red
    exit 1
}

# Check npm
$NpmVersion = npm --version 2>$null
if ($NpmVersion) {
    Write-Host "✓ npm $NpmVersion" -ForegroundColor $Green
} else {
    Write-Host "✗ npm not found" -ForegroundColor $Red
    exit 1
}

# Check Python
$PythonVersion = python --version 2>$null
if ($PythonVersion) {
    Write-Host "✓ $PythonVersion" -ForegroundColor $Green
} else {
    Write-Host "✗ Python not found. Please install from https://www.python.org/" -ForegroundColor $Red
    exit 1
}

# Check MySQL (optional)
$MysqlExists = (Get-Command mysql -ErrorAction SilentlyContinue) -ne $null
if ($MysqlExists) {
    Write-Host "✓ MySQL found" -ForegroundColor $Green
} else {
    Write-Host "⚠ MySQL not in PATH. Make sure it's installed." -ForegroundColor $Yellow
}

# Setup Backend
Write-Host ""
Write-Host "================================" -ForegroundColor $Blue
Write-Host "Setting up Backend..." -ForegroundColor $Blue
Write-Host "================================" -ForegroundColor $Blue
Write-Host ""

Set-Location backend

# Create venv if not exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor $Yellow
    python -m venv venv
    Write-Host "✓ Virtual environment created" -ForegroundColor $Green
} else {
    Write-Host "✓ Virtual environment already exists" -ForegroundColor $Green
}

# Activate venv
Write-Host "Activating virtual environment..." -ForegroundColor $Yellow
& "venv\Scripts\Activate.ps1"
Write-Host "✓ Virtual environment activated" -ForegroundColor $Green

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor $Yellow
python -m pip install --upgrade pip | Out-Null

# Install requirements
Write-Host "Installing Python dependencies (this may take a while)..." -ForegroundColor $Yellow
pip install -r requirements.txt | Out-Null
Write-Host "✓ Python dependencies installed" -ForegroundColor $Green

# Check .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠ .env file not found. Please create it manually." -ForegroundColor $Yellow
    Write-Host ""
    Write-Host "Template:" -ForegroundColor $Blue
    Write-Host "DATABASE_URL=mysql+pymysql://root:password@localhost:3306/student_management"
    Write-Host "SECRET_KEY=your-secret-key"
} else {
    Write-Host "✓ .env file exists" -ForegroundColor $Green
}

Set-Location ..

# Setup Frontend
Write-Host ""
Write-Host "================================" -ForegroundColor $Blue
Write-Host "Setting up Frontend..." -ForegroundColor $Blue
Write-Host "================================" -ForegroundColor $Blue
Write-Host ""

Set-Location frontend

# Install node modules if not exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing Node.js dependencies (this may take a while)..." -ForegroundColor $Yellow
    npm install
    Write-Host "✓ Node.js dependencies installed" -ForegroundColor $Green
} else {
    Write-Host "✓ Node.js dependencies already exist" -ForegroundColor $Green
}

Set-Location ..

# Setup complete
Write-Host ""
Write-Host "================================" -ForegroundColor $Blue
Write-Host "Setup Complete!" -ForegroundColor $Blue
Write-Host "================================" -ForegroundColor $Blue
Write-Host ""

Write-Host "To start the application:" -ForegroundColor $Blue
Write-Host ""

Write-Host "Terminal 1 (Backend):" -ForegroundColor $Yellow
Write-Host "  cd backend"
Write-Host "  venv\Scripts\Activate.ps1"
Write-Host "  python -m uvicorn app.main:app --reload"
Write-Host ""

Write-Host "Terminal 2 (Frontend):" -ForegroundColor $Yellow
Write-Host "  cd frontend"
Write-Host "  npm run dev"
Write-Host ""

Write-Host "Then open: " -ForegroundColor $Blue -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor $Green
Write-Host ""

Write-Host "Default credentials:" -ForegroundColor $Yellow
Write-Host "  Username: admin"
Write-Host "  Password: admin123"
Write-Host ""

Write-Host "Press any key to exit..."
Read-Host "Press Enter to exit"
