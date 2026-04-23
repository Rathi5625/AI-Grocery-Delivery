# =============================================================================
# start_backend.ps1 — Load backend/.env variables and start the Spring Boot backend
# Run from the project root: .\scripts\start_backend.ps1
# =============================================================================

$projectRoot = Split-Path $PSScriptRoot -Parent
$envFile     = Join-Path $projectRoot 'backend\.env'

# ── Load backend/.env into the current PowerShell process ────────────────────
if (Test-Path $envFile) {
    Write-Host "[INFO] Loading environment variables from backend/.env..." -ForegroundColor Cyan
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and $line -notmatch '^\s*#') {
            $parts = $line -split '=', 2
            if ($parts.Count -eq 2) {
                $key   = $parts[0].Trim()
                $value = $parts[1].Trim()
                [System.Environment]::SetEnvironmentVariable($key, $value, 'Process')
                Write-Host "  SET $key" -ForegroundColor DarkGray
            }
        }
    }
    Write-Host "[INFO] Environment variables loaded." -ForegroundColor Cyan
} else {
    Write-Warning "[WARN] No .env file found at $envFile — relying on system environment variables."
}

# ── Verify required variables are present ────────────────────────────────────
$required = @('DB_USERNAME', 'DB_PASSWORD', 'JWT_SECRET', 'MAIL_USERNAME', 'MAIL_PASSWORD')
$missing  = @()
foreach ($var in $required) {
    if (-not [System.Environment]::GetEnvironmentVariable($var)) {
        $missing += $var
    }
}
if ($missing.Count -gt 0) {
    Write-Error "[ERROR] Missing required environment variables: $($missing -join ', ')"
    Write-Host  "        Add them to backend/.env and try again." -ForegroundColor Yellow
    exit 1
}

# ── Start the backend ─────────────────────────────────────────────────────────
Write-Host "[INFO] Starting Spring Boot backend..." -ForegroundColor Green
Set-Location (Join-Path $projectRoot 'backend')
mvn spring-boot:run
