# 🎬 Movie Theater Development Helper
# One simple script for all development tasks

param(
    [string]$Action = "help"
)

Write-Host "🎬 Movie Theater Development Helper" -ForegroundColor Cyan

switch ($Action.ToLower()) {
    "db" {
        Write-Host "🎬 Movie Theater Development Helper" -ForegroundColor Blue
        Set-Location "docker"
        Write-Host "📁 Working directory: $(Get-Location)" -ForegroundColor Yellow
        
        # Dừng containers hiện tại nếu có
        Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
        docker-compose -f docker-compose.database.yml down --remove-orphans 2>$null
        
        # Khởi động database
        Write-Host "🗄️ Starting MySQL database..." -ForegroundColor Green
        docker-compose -f docker-compose.database.yml up -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Database started successfully!" -ForegroundColor Green
            Write-Host "📋 Services running:" -ForegroundColor Cyan
            Write-Host "   🗄️  MySQL Database: localhost:3306" -ForegroundColor White
            Write-Host "   📊 Adminer (DB UI): http://localhost:8081" -ForegroundColor White
            Write-Host ""
            Write-Host "🔗 Database Connection Info:" -ForegroundColor Cyan
            Write-Host "   Host: localhost" -ForegroundColor White
            Write-Host "   Port: 3306" -ForegroundColor White
            Write-Host "   Database: cinema_db" -ForegroundColor White
            Write-Host "   Username: cinema_user" -ForegroundColor White
            Write-Host "   Password: cinema_password" -ForegroundColor White
            Write-Host ""
            Write-Host "💡 Để stop database: .\dev.ps1 stop" -ForegroundColor Yellow
        } else {
            Write-Host "❌ Failed to start database!" -ForegroundColor Red
        }
    }
    "full" {
        Write-Host "🚀 Starting full local development..." -ForegroundColor Yellow
        & ".\start-local-development.ps1"
    }
    "stop" {
        Write-Host "🛑 Stopping database..." -ForegroundColor Yellow
        & ".\stop-database.ps1"
    }
    "rebuild" {
        Write-Host "🔨 Rebuilding Docker containers..." -ForegroundColor Yellow
        Set-Location docker
        
        Write-Host "🛑 Stopping containers..." -ForegroundColor Gray
        docker-compose -f docker-compose.database.yml down -v 2>$null
        
        Write-Host "🗑️ Cleaning up..." -ForegroundColor Gray  
        docker system prune -f 2>$null
        
        Write-Host "🔨 Building fresh containers..." -ForegroundColor Gray
        docker-compose -f docker-compose.database.yml up --build -d
        
        Set-Location ..
        Write-Host "✅ Rebuild completed!" -ForegroundColor Green
    }
    "clean" {
        Write-Host "🧹 Deep cleaning Docker..." -ForegroundColor Yellow
        Set-Location docker
        
        Write-Host "🛑 Stopping all containers..." -ForegroundColor Gray
        docker-compose -f docker-compose.database.yml down -v 2>$null
        docker-compose down -v 2>$null
        
        Write-Host "🗑️ Removing unused Docker resources..." -ForegroundColor Gray
        docker system prune -af --volumes 2>$null
        
        Write-Host "🔨 Building fresh database..." -ForegroundColor Gray
        docker-compose -f docker-compose.database.yml up --build -d
        
        Set-Location ..
        Write-Host "✅ Deep clean completed!" -ForegroundColor Green
    }
    "help" {
        Write-Host ""
        Write-Host "Usage: .\dev.ps1 <action>" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Actions:" -ForegroundColor Yellow
        Write-Host "  db       - Start database only (recommended for IDE development)" -ForegroundColor White
        Write-Host "  full     - Start database + Spring Boot application" -ForegroundColor White
        Write-Host "  stop     - Stop database containers" -ForegroundColor White
        Write-Host "  rebuild  - Rebuild database containers (fresh start)" -ForegroundColor White
        Write-Host "  clean    - Deep clean + rebuild (remove all Docker data)" -ForegroundColor White
        Write-Host "  help     - Show this help" -ForegroundColor White
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Yellow
        Write-Host "  .\dev.ps1 db       # Start database, then use IDE for Spring Boot" -ForegroundColor Gray
        Write-Host "  .\dev.ps1 rebuild  # Fresh database rebuild" -ForegroundColor Gray
        Write-Host "  .\dev.ps1 clean    # Nuclear option - clean everything" -ForegroundColor Gray
        Write-Host "  .\dev.ps1 stop     # Stop when done" -ForegroundColor Gray
    }
    default {
        Write-Host "❌ Unknown action: $Action" -ForegroundColor Red
        Write-Host "Run: .\dev.ps1 help" -ForegroundColor Yellow
    }
} 