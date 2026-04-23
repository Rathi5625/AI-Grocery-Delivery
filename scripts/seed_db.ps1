# =============================================================================
# seed_db.ps1 — FreshAI Grocery Database Seeder
# Reads DB credentials from backend/.env or prompts securely at runtime.
# =============================================================================

$mysqlExe = 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe'
$dbName   = 'grocery_clean'
$sqlFile  = Join-Path (Split-Path $PSScriptRoot -Parent) 'backend\src\main\resources\data.sql'

# ── Load backend/.env ─────────────────────────────────────────────────────────
$envFile = Join-Path (Split-Path $PSScriptRoot -Parent) 'backend\.env'
if (Test-Path $envFile) {
    Write-Host "[seed_db] Loading credentials from backend/.env..." -ForegroundColor Cyan
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and $line -notmatch '^\s*#') {
            $parts = $line -split '=', 2
            if ($parts.Count -eq 2) {
                $key   = $parts[0].Trim()
                $value = $parts[1].Trim()
                if (-not [System.Environment]::GetEnvironmentVariable($key)) {
                    [System.Environment]::SetEnvironmentVariable($key, $value, 'Process')
                }
            }
        }
    }
}

# ── Resolve DB user ──────────────────────────────────────────────────────────
$dbUser = $env:DB_USERNAME
if (-not $dbUser) {
    $dbUser = Read-Host "Enter MySQL username (default: root)"
    if (-not $dbUser) { $dbUser = 'root' }
}

# ── Resolve DB password (env var → secure prompt) ────────────────────────────
$plainPassword = $env:DB_PASSWORD
if (-not $plainPassword) {
    Write-Host "[seed_db] DB_PASSWORD not set in backend/.env or environment." -ForegroundColor Yellow
    $securePassword = Read-Host "Enter MySQL password for user '$dbUser'" -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

# ── Validate SQL file exists ──────────────────────────────────────────────────
if (-not (Test-Path $sqlFile)) {
    Write-Error "[seed_db] SQL file not found: $sqlFile"
    exit 1
}

# ── Run seeder ────────────────────────────────────────────────────────────────
Write-Host "[seed_db] Seeding database '$dbName' from: $sqlFile" -ForegroundColor Green

$sqlContent = Get-Content $sqlFile -Raw
& $mysqlExe -u $dbUser "--password=$plainPassword" $dbName '-e' $sqlContent

if ($LASTEXITCODE -eq 0) {
    Write-Host "[seed_db] ✅ Database seeded successfully." -ForegroundColor Green
} else {
    Write-Error "[seed_db] ❌ Seeding failed. Check your credentials and MySQL connection."
    exit $LASTEXITCODE
}

# ── Scrub credentials from memory ────────────────────────────────────────────
$plainPassword  = $null
$securePassword = $null
