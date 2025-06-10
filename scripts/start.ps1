# 🎬 Movie Theater Management System - Start Script
# PowerShell script để khởi động project

param(
    [string]$Mode = "dev",
    [switch]$Help
)

function Show-Help {
    Write-Host "🎭 Movie Theater Management System - Start Script" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\start.ps1 [mode]" -ForegroundColor White
    Write-Host ""
    Write-Host "Modes:" -ForegroundColor Yellow
    Write-Host "  dev          Chạy frontend development server (default)" -ForegroundColor White
    Write-Host "  frontend     Chạy frontend only" -ForegroundColor White
    Write-Host "  backend      Chạy backend only" -ForegroundColor White
    Write-Host "  docker       Chạy toàn bộ hệ thống với Docker (dev mode)" -ForegroundColor White
    Write-Host "  docker-prod  Chạy toàn bộ hệ thống với Docker (production)" -ForegroundColor White
    Write-Host "  setup        Cài đặt dependencies" -ForegroundColor White
    Write-Host "  clean        Dọn dẹp build files" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\start.ps1              # Chạy frontend dev" -ForegroundColor Green
    Write-Host "  .\start.ps1 docker       # Chạy full stack với Docker" -ForegroundColor Green
    Write-Host "  .\start.ps1 setup        # Cài đặt dependencies" -ForegroundColor Green
}

function Start-Frontend {
    Write-Host "🎬 Starting Frontend Development Server..." -ForegroundColor Green
    Write-Host "URL: http://localhost:3000" -ForegroundColor Cyan
    npm run dev
}

function Start-Backend {
    Write-Host "☕ Starting Backend Server..." -ForegroundColor Green
    Write-Host "URL: http://localhost:8080" -ForegroundColor Cyan
    npm run backend:dev
}

function Start-Docker {
    Write-Host "🐳 Starting Full Stack with Docker (Development)..." -ForegroundColor Green
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Backend: http://localhost:8080" -ForegroundColor Cyan
    npm run docker:dev
}

function Start-DockerProd {
    Write-Host "🐳 Starting Full Stack with Docker (Production)..." -ForegroundColor Green
    Write-Host "URL: http://localhost (Nginx)" -ForegroundColor Cyan
    npm run docker:prod
}

function Setup-Project {
    Write-Host "📦 Setting up project dependencies..." -ForegroundColor Green
    npm run setup
    Write-Host "✅ Setup completed!" -ForegroundColor Green
}

function Clean-Project {
    Write-Host "🧹 Cleaning build files..." -ForegroundColor Green
    npm run clean
    Write-Host "✅ Cleanup completed!" -ForegroundColor Green
}

# Main logic
if ($Help) {
    Show-Help
    exit 0
}

Write-Host "🎭 Movie Theater Management System" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta
Write-Host ""

switch ($Mode.ToLower()) {
    "dev" { Start-Frontend }
    "frontend" { Start-Frontend }
    "backend" { Start-Backend }
    "docker" { Start-Docker }
    "docker-prod" { Start-DockerProd }
    "setup" { Setup-Project }
    "clean" { Clean-Project }
    default {
        Write-Host "❌ Unknown mode: $Mode" -ForegroundColor Red
        Write-Host ""
        Show-Help
        exit 1
    }
} 