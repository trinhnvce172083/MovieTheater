# 🎬 Movie Theater Management System - Database Only Startup Script
# Script để khởi động chỉ MySQL database bằng Docker cho local development

Write-Host "🎬 Movie Theater - Starting Database Only" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Kiểm tra Docker Desktop
Write-Host "🐳 Checking Docker Desktop..." -ForegroundColor Yellow
$dockerRunning = docker info 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker Desktop is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker Desktop is running" -ForegroundColor Green

# Chuyển đến thư mục docker
$dockerPath = Join-Path $PSScriptRoot "docker"
if (-not (Test-Path $dockerPath)) {
    Write-Host "❌ Docker directory not found: $dockerPath" -ForegroundColor Red
    exit 1
}

Set-Location $dockerPath
Write-Host "📁 Working directory: $dockerPath" -ForegroundColor Blue

# Dừng container cũ nếu có
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.database.yml down --remove-orphans 2>$null

# Kiểm tra và tạo network nếu cần
Write-Host "🌐 Setting up network..." -ForegroundColor Yellow
$networkExists = docker network ls --filter name=movie-theater-local-network --format "{{.Name}}" | Select-String "movie-theater-local-network"
if (-not $networkExists) {
    docker network create movie-theater-local-network
    Write-Host "✅ Network created: movie-theater-local-network" -ForegroundColor Green
}

# Khởi động database
Write-Host "🗄️ Starting MySQL database..." -ForegroundColor Yellow
docker-compose -f docker-compose.database.yml up --build -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start database!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database containers started successfully!" -ForegroundColor Green

# Chờ database sẵn sàng
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0

do {
    $attempt++
    Write-Host "   Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
    
    $healthCheck = docker exec movie-theater-mysql-local mysqladmin ping -h localhost -u root -p12345Aa 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database is ready!" -ForegroundColor Green
        break
    }
    
    Start-Sleep -Seconds 2
} while ($attempt -lt $maxAttempts)

if ($attempt -ge $maxAttempts) {
    Write-Host "❌ Database failed to start within timeout!" -ForegroundColor Red
    Write-Host "Checking logs..." -ForegroundColor Yellow
    docker logs movie-theater-mysql-local
    exit 1
}

# Hiển thị thông tin kết nối
Write-Host "" 
Write-Host "🎉 Database setup completed successfully!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "📋 Connection Information:" -ForegroundColor Yellow
Write-Host "   Host: localhost" -ForegroundColor White
Write-Host "   Port: 3306" -ForegroundColor White
Write-Host "   Database: cinema_db" -ForegroundColor White
Write-Host "   Username: cinema_user" -ForegroundColor White
Write-Host "   Password: cinema_password" -ForegroundColor White
Write-Host "   Root Password: 12345Aa" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Access Points:" -ForegroundColor Yellow
Write-Host "   Adminer (DB Management): http://localhost:8081" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Open IntelliJ IDEA" -ForegroundColor White
Write-Host "   2. Run Spring Boot application from IDE" -ForegroundColor White
Write-Host "   3. Application will connect to Docker database automatically" -ForegroundColor White
Write-Host ""
Write-Host "📊 Container Status:" -ForegroundColor Yellow
docker ps --filter "name=movie-theater" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host ""
Write-Host "✨ Database is ready for development!" -ForegroundColor Green 