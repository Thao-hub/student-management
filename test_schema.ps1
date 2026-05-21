# Test Script for schema.sql
# This script validates the database schema structure and content

Write-Host "`n===== DATABASE SCHEMA TEST REPORT =====" -ForegroundColor Cyan
Write-Host "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" -ForegroundColor Gray

$schemaFile = "d:\OSS\student_management\database\schema.sql"

# Check file exists
if (-not (Test-Path $schemaFile)) {
    Write-Host "ERROR: schema.sql not found!" -ForegroundColor Red
    exit 1
}

$fileInfo = Get-Item $schemaFile
$content = Get-Content $schemaFile -Raw

Write-Host "`n--- FILE INFORMATION ---" -ForegroundColor Yellow
Write-Host "Location: $schemaFile"
Write-Host "Size: $($fileInfo.Length) bytes"
Write-Host "Lines: $(($content | Measure-Object -Line).Lines)"

# Count SQL statements
$createDbCount = [regex]::Matches($content, '(?i)CREATE\s+DATABASE').Count
$createTableCount = [regex]::Matches($content, '(?i)CREATE\s+TABLE').Count
$dropTableCount = [regex]::Matches($content, '(?i)DROP\s+TABLE').Count
$insertCount = [regex]::Matches($content, '(?i)INSERT\s+INTO').Count
$alterCount = [regex]::Matches($content, '(?i)ALTER\s+TABLE').Count

Write-Host "`n--- SQL STATEMENTS COUNT ---" -ForegroundColor Yellow
Write-Host "CREATE DATABASE: $createDbCount"
Write-Host "CREATE TABLE: $createTableCount"
Write-Host "DROP TABLE: $dropTableCount"
Write-Host "INSERT INTO: $insertCount"
Write-Host "ALTER TABLE: $alterCount"

# Extract table names
Write-Host "`n--- TABLES CREATED ---" -ForegroundColor Yellow
$tableMatches = [regex]::Matches($content, '(?i)CREATE\s+TABLE\s+(\w+)')
$tables = @()
foreach ($match in $tableMatches) {
    $tableName = $match.Groups[1].Value
    $tables += $tableName
    Write-Host "  - $tableName"
}

# Count records per INSERT statement
Write-Host "`n--- DATA RECORDS ---" -ForegroundColor Yellow
$insertMatches = [regex]::Matches($content, '(?i)INSERT\s+INTO\s+(\w+)')
$tableInsertCount = @{}
foreach ($match in $insertMatches) {
    $tableName = $match.Groups[1].Value
    if ($tableInsertCount.ContainsKey($tableName)) {
        $tableInsertCount[$tableName] += 1
    } else {
        $tableInsertCount[$tableName] = 1
    }
}

foreach ($table in $tableInsertCount.Keys | Sort-Object) {
    Write-Host "  * $($table): $($tableInsertCount[$table]) INSERT statement(s)"
}

# Check for key constraints
Write-Host "`n--- DATA INTEGRITY ---" -ForegroundColor Yellow
$primaryKeyCount = [regex]::Matches($content, '(?i)PRIMARY\s+KEY').Count
$foreignKeyCount = [regex]::Matches($content, '(?i)FOREIGN\s+KEY').Count
$uniqueKeyCount = [regex]::Matches($content, '(?i)UNIQUE\s+KEY').Count
$indexCount = [regex]::Matches($content, '(?i)INDEX\s+').Count

Write-Host "  - PRIMARY KEY constraints: $primaryKeyCount"
Write-Host "  - FOREIGN KEY constraints: $foreignKeyCount"
Write-Host "  - UNIQUE KEY constraints: $uniqueKeyCount"
Write-Host "  - INDEX constraints: $indexCount"

# Validation summary
Write-Host "`n--- VALIDATION SUMMARY ---" -ForegroundColor Green
$issues = @()

if ($createTableCount -eq 0) {
    $issues += "No CREATE TABLE statements found"
}

if ($insertCount -eq 0) {
    $issues += "No INSERT statements found"
}

if ($foreignKeyCount -eq 0) {
    $issues += "Warning: No foreign key relationships defined"
}

if ($issues.Count -eq 0) {
    Write-Host "[PASS] Schema validation PASSED" -ForegroundColor Green
    Write-Host "Database structure is complete with $createTableCount tables and $insertCount insert statements"
} else {
    Write-Host "[WARNING] Schema validation found issues:" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "  - $issue"
    }
}

Write-Host "`n===== END OF REPORT =====" -ForegroundColor Cyan
Write-Host "`nTo import this schema to MySQL, run:"
Write-Host "  mysql -u root -p < schema.sql" -ForegroundColor Gray
Write-Host "`nOr with specific host/port:"
Write-Host "  mysql -h localhost -P 3306 -u root -p < schema.sql" -ForegroundColor Gray
Write-Host ""
