# =============================================================================
# seed_db.ps1 — FreshAI Grocery Database Seeder
# =============================================================================
# SECURITY: Never hardcode passwords here.
# This script reads the DB password from the DB_PASSWORD environment variable.
# If not set, it will securely prompt you at runtime (input is NOT echoed).
# =============================================================================

$mysqlExe = 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe'
$dbName   = 'grocery_clean'
$dbUser   = 'root'
$sqlFile  = Join-Path $PSScriptRoot 'backend\src\main\resources\data.sql'

# ── Resolve password ──────────────────────────────────────────────────────────
if ($env:DB_PASSWORD) {
    $plainPassword = $env:DB_PASSWORD
    Write-Host "[seed_db] Using password from DB_PASSWORD environment variable."
} else {
    $securePassword = Read-Host -Prompt "[seed_db] Enter MySQL password for '$dbUser'" -AsSecureString
    $bstr           = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $plainPassword  = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

# ── Validate SQL file exists ─────────────────────────────────────────────────
if (-not (Test-Path $sqlFile)) {
    Write-Error "[seed_db] SQL file not found: $sqlFile"
    exit 1
}

# ── Run seeder ───────────────────────────────────────────────────────────────
Write-Host "[seed_db] Seeding database '$dbName' from: $sqlFile"

$sqlContent = Get-Content $sqlFile -Raw

& $mysqlExe -u $dbUser "--password=$plainPassword" $dbName '-e' $sqlContent

if ($LASTEXITCODE -eq 0) {
    Write-Host "[seed_db] ✅ Database seeded successfully."
} else {
    Write-Error "[seed_db] ❌ Seeding failed. Check your credentials and MySQL connection."
    exit $LASTEXITCODE
}

# ── Scrub password from memory ───────────────────────────────────────────────
$plainPassword = $null
