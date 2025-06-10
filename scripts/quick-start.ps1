# Quick Start Script cho Movie Theater System (Phiên bản cao nhất)
# Spring Boot 3.4.2 + Java 17 + Jakarta EE

Write-Host "🎬 Movie Theater Management System" -ForegroundColor Cyan
Write-Host "🚀 Quick Start - Phiên bản cao nhất" -ForegroundColor Green

# Kiểm tra Java 17
Write-Host ""
Write-Host "🔍 Kiểm tra Java version..." -ForegroundColor Yellow

try {
    $javaOutput = java -version 2>&1
    $javaVersion = $javaOutput | Select-String "version" | Out-String
    
    if ($javaVersion -match '"17\.') {
        Write-Host "✅ Java 17 detected!" -ForegroundColor Green
        Write-Host $javaVersion.Trim() -ForegroundColor Cyan
    } elseif ($javaVersion -match '"(\d+)\.') {
        $version = $matches[1]
        Write-Host "⚠️  Java $version detected, but need Java 17" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📖 Hướng dẫn cài Java 17:" -ForegroundColor Red
        Write-Host "1. Đọc docs/JAVA-SETUP.md" -ForegroundColor White
        Write-Host "2. Download từ: https://adoptium.net/temurin/releases/" -ForegroundColor White
        Write-Host "3. Chọn Version 17 - LTS" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "❌ Java not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📖 Cần cài Java 17:" -ForegroundColor Red
    Write-Host "1. Đọc docs/JAVA-SETUP.md" -ForegroundColor White
    Write-Host "2. Download từ: https://adoptium.net/temurin/releases/" -ForegroundColor White
    exit 1
}

# Kiểm tra Maven
Write-Host ""
Write-Host "🔍 Kiểm tra Maven..." -ForegroundColor Yellow

try {
    $mvnOutput = mvn -version 2>&1 | Select-Object -First 1
    if ($mvnOutput -match "Apache Maven") {
        Write-Host "✅ Maven found: $mvnOutput" -ForegroundColor Green
    } else {
        throw "Maven not detected"
    }
} catch {
    Write-Host "❌ Maven not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📖 Cần cài Maven:" -ForegroundColor Red
    Write-Host "1. Đọc docs/MAVEN-SETUP.md" -ForegroundColor White
    Write-Host "2. Quick install: winget install Apache.Maven" -ForegroundColor White
    Write-Host "3. Manual download: https://maven.apache.org/download.cgi" -ForegroundColor White
    exit 1
}

# Kiểm tra cấu trúc project
Write-Host ""
Write-Host "🔍 Kiểm tra project structure..." -ForegroundColor Yellow

if (Test-Path "movie-theater-backend/pom.xml") {
    Write-Host "✅ Backend project found" -ForegroundColor Green
} else {
    Write-Host "❌ Backend project not found!" -ForegroundColor Red
    exit 1
}

if (Test-Path "movie-theater-frontend/package.json") {
    Write-Host "✅ Frontend project found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend project not found (optional)" -ForegroundColor Yellow
}

# Start Backend
Write-Host ""
Write-Host "🚀 Starting Backend (Spring Boot 3.4.2)..." -ForegroundColor Cyan

Set-Location "movie-theater-backend"

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
mvn clean install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🔥 Starting server..." -ForegroundColor Yellow
    Write-Host "🌐 Backend will run on: http://localhost:8080" -ForegroundColor Cyan
    Write-Host "📚 API Docs: http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚡ Features enabled:" -ForegroundColor Green
    Write-Host "  • Spring Boot 3.4.2 (Latest)" -ForegroundColor White
    Write-Host "  • Java 17 LTS" -ForegroundColor White
    Write-Host "  • Jakarta EE" -ForegroundColor White
    Write-Host "  • JWT 0.12.6" -ForegroundColor White
    Write-Host "  • MapStruct 1.6.3" -ForegroundColor White
    Write-Host ""
    Write-Host "⏹️  Press Ctrl+C to stop" -ForegroundColor Yellow
    
    mvn spring-boot:run
} else {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check Java 17 installation" -ForegroundColor White
    Write-Host "2. Check internet connection" -ForegroundColor White
    Write-Host "3. Run: mvn clean compile" -ForegroundColor White
} 