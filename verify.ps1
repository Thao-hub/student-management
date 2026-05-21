# Student Management System - Verification Script
# For Windows PowerShell users
# Usage: .\verify.ps1

$ErrorActionPreference = "SilentlyContinue"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Student Management System - Verification" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Node.js:" -ForegroundColor White
$NodeVersion = node --version 2>$null
if ($NodeVersion) {
    Write-Host "✓ $NodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Not installed" -ForegroundColor Red
}

# Check npm
Write-Host "npm:" -ForegroundColor White
$NpmVersion = npm --version 2>$null
if ($NpmVersion) {
    Write-Host "✓ $NpmVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Not installed" -ForegroundColor Red
}

# Check Python
Write-Host "Python:" -ForegroundColor White
$PythonVersion = python --version 2>$null
if ($PythonVersion) {
    Write-Host "✓ $PythonVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Not installed" -ForegroundColor Red
}

# Check MySQL
Write-Host "MySQL:" -ForegroundColor White
$MysqlVersion = mysql --version 2>$null
if ($MysqlVersion) {
    Write-Host "✓ $MysqlVersion" -ForegroundColor Green
} else {
    Write-Host "⚠ Not in PATH (may still be installed)" -ForegroundColor Yellow
}

# Check Backend
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Backend Status" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Push-Location backend

if (Test-Path "venv") {
    Write-Host "✓ Virtual environment exists" -ForegroundColor Green
} else {
    Write-Host "⚠ Virtual environment not found" -ForegroundColor Yellow
}

if (Test-Path "requirements.txt") {
    Write-Host "✓ requirements.txt found" -ForegroundColor Green
} else {
    Write-Host "✗ requirements.txt not found" -ForegroundColor Red
}

Pop-Location

# Check Frontend
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Frontend Status" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Push-Location frontend

if (Test-Path "node_modules") {
    Write-Host "✓ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "⚠ node_modules not found, run: npm install" -ForegroundColor Yellow
}

if (Test-Path "package.json") {
    Write-Host "✓ package.json found" -ForegroundColor Green
} else {
    Write-Host "✗ package.json not found" -ForegroundColor Red
}

Pop-Location

# Check Database
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Database Status" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path "database\schema.sql") {
    Write-Host "✓ schema.sql found" -ForegroundColor Green
} else {
    Write-Host "✗ schema.sql not found" -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Next Steps" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Run: .\setup.ps1"
Write-Host "2. Terminal 1: cd backend; venv\Scripts\Activate.ps1; python -m uvicorn app.main:app --reload"
Write-Host "3. Terminal 2: cd frontend; npm run dev"
Write-Host "4. Open: http://localhost:3000"
Write-Host ""

Write-Host "Press any key to exit..."
Read-Host "Press Enter to exit"
