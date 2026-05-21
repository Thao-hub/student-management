[CmdletBinding()]
param(
    [switch]$Desktop
)

$ErrorActionPreference = 'Stop'

# Run backend in a new PowerShell window, then run frontend in the current one.
# Optionally start Electron in a separate window with -Desktop.

$projectRoot = $PSScriptRoot
Write-Host "Using project root: $projectRoot"
$backendPython = Join-Path $projectRoot 'backend\venv\Scripts\python.exe'
$frontendPath = Join-Path $projectRoot 'frontend'
$desktopPath = Join-Path $projectRoot 'desktop'

if (-not (Test-Path $backendPython)) {
    Write-Host 'Khong tim thay Python cua backend tai:'
    Write-Host "  $backendPython"
    Write-Host 'Hay kiem tra moi truong ao backend truoc khi chay script nay.'
    exit 1
}

$npmCommand = Get-Command 'npm.cmd' -ErrorAction SilentlyContinue
if (-not $npmCommand) {
    Write-Host 'Khong tim thay npm tren may nay.'
    Write-Host 'Can cai Node.js LTS va mo lai PowerShell de npm duoc them vao PATH.'
    Write-Host ''
    Write-Host 'Huong dan nhanh:'
    Write-Host '1. Tai Node.js LTS: https://nodejs.org/en/download/'
    Write-Host '2. Cai dat xong, dong PowerShell hien tai.'
    Write-Host '3. Mo lai PowerShell va chay lai: .\run-all.ps1'
    exit 1
}

$backendCommand = "Set-Location '$projectRoot\backend'; & '$backendPython' -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
Start-Process powershell -ArgumentList '-NoExit', '-Command', $backendCommand

if ($Desktop) {
    if (-not (Test-Path $desktopPath)) {
        Write-Host 'Khong tim thay thu muc desktop.'
        exit 1
    }

    $desktopPackage = Join-Path $desktopPath 'package.json'
    $electronEntry = Join-Path $desktopPath 'node_modules\.bin\electron.cmd'

    if (-not (Test-Path $desktopPackage)) {
        Write-Host 'Khong tim thay cau hinh Electron trong thu muc desktop.'
        exit 1
    }

    if (-not (Test-Path $electronEntry)) {
        Write-Host 'Chua cai Electron cho desktop app.'
        Write-Host 'Hay chay cac lenh sau mot lan:'
        Write-Host "  Set-Location '$desktopPath'"
        Write-Host '  npm.cmd install'
        Write-Host ''
        Write-Host 'Sau do chay lai: .\run-desktop.ps1'
        exit 1
    }
}

Write-Host 'Dang chay frontend trong terminal hien tai...'
Set-Location $frontendPath

if ($Desktop) {
    $desktopCommand = "Set-Location '$desktopPath'; Start-Sleep -Seconds 4; & '$($npmCommand.Source)' run dev"
    Start-Process powershell -ArgumentList '-NoExit', '-Command', $desktopCommand
    Write-Host 'Da bat them cua so Electron cho desktop app.'
}

& $npmCommand.Source run dev
