# =============================================================================
# start_backend.ps1 — Helper script to load .env and start the backend
# =============================================================================

$envPath = Join-Path $PSScriptRoot ".env"

if (Test-Path $envPath) {
    Write-Host "[INFO] Loading environment variables from .env..." -ForegroundColor Cyan
    Get-Content $envPath | Where-Object { $_ -match '^\s*[^#]' } | ForEach-Object {
        $kv = $_ -split '=', 2
        if ($kv.Length -eq 2) {
            [System.Environment]::SetEnvironmentVariable($kv[0].Trim(), $kv[1].Trim())
        }
    }
} else {
    Write-Host "[WARN] No .env file found. Make sure environment variables are set." -ForegroundColor Yellow
}

cd backend
Write-Host "[INFO] Starting Spring Boot backend..." -ForegroundColor Green
mvn spring-boot:run "-Dspring-boot.run.profiles=local"
