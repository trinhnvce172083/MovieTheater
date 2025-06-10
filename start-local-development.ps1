# 🎬 Movie Theater Management System - Local Development Setup
# Script để setup môi trường phát triển local: Database Docker + Spring Boot Local

param(
    [switch]$SkipDatabase,
    [switch]$DatabaseOnly,
    [switch]$Help
)

if ($Help) {
    Write-Host "🎬 Movie Theater - Local Development Setup" -ForegroundColor Cyan
    Write-Host "Usage: .\start-local-development.ps1 [options]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -SkipDatabase    Skip starting database (if already running)" -ForegroundColor White
    Write-Host "  -DatabaseOnly    Start only database, don't run Spring Boot" -ForegroundColor White
    Write-Host "  -Help           Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\start-local-development.ps1                # Full setup" -ForegroundColor White
    Write-Host "  .\start-local-development.ps1 -DatabaseOnly  # Only database" -ForegroundColor White
    Write-Host "  .\start-local-development.ps1 -SkipDatabase  # Only Spring Boot" -ForegroundColor White
    exit 0
}

Write-Host "🎬 Movie Theater - Local Development Setup" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Kiểm tra requirements
Write-Host "🔍 Checking requirements..." -ForegroundColor Yellow

# Kiểm tra Docker Desktop
if (-not $SkipDatabase) {
    $dockerRunning = docker info 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker Desktop is not running!" -ForegroundColor Red
        Write-Host "Please start Docker Desktop and try again." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Docker Desktop is running" -ForegroundColor Green
}

# Kiểm tra Java và Maven
if (-not $DatabaseOnly) {
    $javaVersion = java -version 2>&1 | Select-String "version" | Select-Object -First 1
    if (-not $javaVersion) {
        Write-Host "❌ Java not found! Please install Java 17 or higher." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Java found: $($javaVersion.ToString().Trim())" -ForegroundColor Green

    $mavenVersion = mvn --version 2>$null | Select-String "Apache Maven" | Select-Object -First 1
    if (-not $mavenVersion) {
        Write-Host "❌ Maven not found! Please install Maven." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Maven found: $($mavenVersion.ToString().Trim())" -ForegroundColor Green
}

# Step 1: Khởi động Database
if (-not $SkipDatabase) {
    Write-Host ""
    Write-Host "🗄️ Step 1: Starting Database..." -ForegroundColor Yellow
    Write-Host "================================" -ForegroundColor Yellow
    
    & "$PSScriptRoot\start-database-only.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to start database!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⏭️ Skipping database startup..." -ForegroundColor Gray
}

# Nếu chỉ cần database thì dừng ở đây
if ($DatabaseOnly) {
    Write-Host ""
    Write-Host "✅ Database-only setup completed!" -ForegroundColor Green
    Write-Host "You can now start Spring Boot from your IDE with profile: local" -ForegroundColor Yellow
    exit 0
}

# Step 2: Chạy Spring Boot Application
Write-Host ""
Write-Host "🚀 Step 2: Starting Spring Boot Application..." -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Yellow

$backendPath = Join-Path $PSScriptRoot "movie-theater-backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend directory not found: $backendPath" -ForegroundColor Red
    exit 1
}

Set-Location $backendPath
Write-Host "📁 Working directory: $backendPath" -ForegroundColor Blue

# Kiểm tra kết nối database trước khi chạy
Write-Host "🔌 Testing database connection..." -ForegroundColor Yellow
$dbTest = docker exec movie-theater-mysql-local mysql -u cinema_user -pcinema_password -e "SELECT 1;" cinema_db 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cannot connect to database! Please check database status." -ForegroundColor Red
    Write-Host "Run: docker logs movie-theater-mysql-local" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Database connection successful" -ForegroundColor Green

# Chạy Spring Boot với profile local
Write-Host "🌟 Starting Spring Boot with local profile..." -ForegroundColor Yellow
Write-Host "Application will be available at: http://localhost:8080/cinema" -ForegroundColor Cyan
Write-Host "Swagger UI: http://localhost:8080/cinema/swagger-ui.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 To stop the application, press Ctrl+C" -ForegroundColor Gray
Write-Host ""

# Set environment variables
$env:SPRING_PROFILES_ACTIVE = "local"

# Chạy Maven Spring Boot
mvn spring-boot:run -Dspring-boot.run.profiles=local

Write-Host ""
Write-Host "👋 Application stopped." -ForegroundColor Yellow
Write-Host "Database containers are still running. To stop them:" -ForegroundColor Gray
Write-Host "  docker-compose -f docker/docker-compose.database.yml down" -ForegroundColor Gray 