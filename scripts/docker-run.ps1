# 🎬 Movie Theater Management System - Docker Run Script (PowerShell)

param(
    [string]$Environment = "local",
    [switch]$Build,
    [switch]$Clean,
    [switch]$Logs,
    [switch]$Help
)

# Colors for PowerShell
function Write-ColorOutput($ForegroundColor) {
    if ($args[0]) {
        Write-Host $args[0] -ForegroundColor $ForegroundColor
    }
}

# Help function
function Show-Help {
    Write-ColorOutput Green "🎬 Movie Theater Management System - PowerShell Start Script"
    Write-Host ""
    Write-Host "Usage: .\docker-run.ps1 [-Environment <env>] [-Build] [-Clean] [-Logs] [-Help]"
    Write-Host ""
    Write-Host "ENVIRONMENT:"
    Write-Host "  local      Local environment (default)"
    Write-Host "  dev        Development environment với hot reload"
    Write-Host "  prod       Production environment với optimizations"
    Write-Host ""
    Write-Host "OPTIONS:"
    Write-Host "  -Build     Force rebuild images"
    Write-Host "  -Clean     Clean up before start"
    Write-Host "  -Logs      Show logs after start"
    Write-Host "  -Help      Show this help"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\docker-run.ps1 -Environment dev -Build    # Development với rebuild"
    Write-Host "  .\docker-run.ps1 -Environment prod -Clean   # Production với cleanup"
    Write-Host "  .\docker-run.ps1 -Logs                      # Local với logs"
}

if ($Help) {
    Show-Help
    exit 0
}

Write-ColorOutput Green "🎬 Starting Movie Theater Management System..."
Write-ColorOutput Blue "Environment: $Environment"

# Change to docker directory
Push-Location docker

try {
    # Clean up if requested
    if ($Clean) {
        Write-ColorOutput Yellow "🧹 Cleaning up containers and volumes..."
        docker-compose down -v
        docker system prune -f
    }

    # Create network if not exists
    Write-ColorOutput Yellow "📡 Creating Docker network..."
    try {
        docker network create movie-theater-network 2>$null
    } catch {
        Write-Host "Network already exists"
    }

    # Choose compose files based on environment
    $ComposeFiles = @("-f", "docker-compose.yml")

    switch ($Environment.ToLower()) {
        "dev" {
            $ComposeFiles += @("-f", "docker-compose.dev.yml")
            Write-ColorOutput Blue "🛠️ Development mode: Hot reload enabled"
        }
        "prod" {
            $ComposeFiles += @("-f", "docker-compose.prod.yml")
            Write-ColorOutput Green "🚀 Production mode: Optimizations enabled"
        }
        "local" {
            Write-ColorOutput Yellow "🏠 Local mode: Standard configuration"
        }
        default {
            Write-ColorOutput Red "❌ Unknown environment: $Environment"
            Write-ColorOutput Yellow "Available environments: local, dev, prod"
            exit 1
        }
    }

    # Start services
    Write-ColorOutput Yellow "🚀 Starting services..."
    $dockerArgs = $ComposeFiles + @("up", "-d")
    if ($Build) {
        $dockerArgs += "--build"
    }
    
    & docker-compose $dockerArgs

    if ($LASTEXITCODE -eq 0) {
        # Wait for services to be ready
        Write-ColorOutput Yellow "⏳ Waiting for services to be ready..."
        Start-Sleep -Seconds 5

        # Check health
        Write-ColorOutput Yellow "🩺 Checking service health..."
        & docker-compose $ComposeFiles ps

        # Show connection info
        Write-Host ""
        Write-ColorOutput Green "🎉 Movie Theater Management System is running!"
        Write-Host ""

        switch ($Environment.ToLower()) {
            "dev" {
                Write-ColorOutput Cyan "📱 Frontend (Dev): http://localhost:3000"
                Write-ColorOutput Cyan "🔧 Backend (Dev): http://localhost:8080"
                Write-ColorOutput Cyan "🐛 Backend Debug: localhost:5005"
                Write-ColorOutput Cyan "🗄️ Database: localhost:3306"
                Write-ColorOutput Cyan "📊 DB Admin: http://localhost:8081"
            }
            "prod" {
                Write-ColorOutput Green "🌐 Application: http://localhost"
                Write-ColorOutput Green "📊 DB Admin: http://localhost:8081"
                Write-ColorOutput Yellow "Note: In production, database is not exposed externally"
            }
            "local" {
                Write-ColorOutput Cyan "📱 Frontend: http://localhost:3000"
                Write-ColorOutput Cyan "🔧 Backend: http://localhost:8080"
                Write-ColorOutput Cyan "🗄️ Database: localhost:3306"
                Write-ColorOutput Cyan "📊 DB Admin: http://localhost:8081"
            }
        }

        Write-Host ""
        Write-ColorOutput Blue "📝 Useful commands:"
        Write-Host "  docker-compose $($ComposeFiles -join ' ') logs -f [service]    # View logs"
        Write-Host "  docker-compose $($ComposeFiles -join ' ') restart [service]   # Restart service"
        Write-Host "  docker-compose $($ComposeFiles -join ' ') down                # Stop all"
        Write-Host "  .\docker\scripts\stop.ps1                                     # Quick stop"

        # Show logs if requested
        if ($Logs) {
            Write-Host ""
            Write-ColorOutput Yellow "📋 Showing logs..."
            & docker-compose $ComposeFiles logs -f
        }
    } else {
        Write-ColorOutput Red "❌ Failed to start services. Check the logs for details."
        & docker-compose $ComposeFiles logs --tail=50
    }
} finally {
    Pop-Location
} 