# 🎬 Movie Theater Management System - Stop Database Script
# Script để dừng MySQL database containers

Write-Host "🎬 Movie Theater - Stopping Database" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Chuyển đến thư mục docker
$dockerPath = Join-Path $PSScriptRoot "docker"
if (-not (Test-Path $dockerPath)) {
    Write-Host "❌ Docker directory not found: $dockerPath" -ForegroundColor Red
    exit 1
}

Set-Location $dockerPath

# Dừng containers
Write-Host "🛑 Stopping database containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.database.yml down

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database containers stopped successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to stop containers!" -ForegroundColor Red
    exit 1
}

# Hiển thị trạng thái
Write-Host ""
Write-Host "📊 Current containers status:" -ForegroundColor Yellow
docker ps --filter "name=movie-theater" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "  - Data is persisted in Docker volumes" -ForegroundColor White
Write-Host "  - To remove all data: docker volume rm movie-theater-mysql-local-data" -ForegroundColor White
Write-Host "  - To restart database: .\start-database-only.ps1" -ForegroundColor White 