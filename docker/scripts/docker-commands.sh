#!/bin/bash
# 🎬 Movie Theater Management System - Docker Commands
# Useful Docker commands for development and deployment

echo "🎬 Movie Theater Docker Commands"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_status "Docker is running ✅"
}

# Build and start all services
start_all() {
    print_status "🚀 Starting Movie Theater application..."
    check_docker
    docker-compose up -d --build
    print_status "✅ All services started!"
    print_status "📍 Application: http://localhost:8080/cinema"
    print_status "📊 Adminer: http://localhost:8081"
    print_status "📚 Swagger: http://localhost:8080/cinema/swagger-ui.html"
}

# Stop all services
stop_all() {
    print_status "🛑 Stopping all services..."
    docker-compose down
    print_status "✅ All services stopped!"
}

# Restart all services
restart_all() {
    print_status "🔄 Restarting all services..."
    docker-compose down
    docker-compose up -d --build
    print_status "✅ All services restarted!"
}

# View logs
view_logs() {
    if [ -z "$1" ]; then
        print_status "📋 Viewing all logs..."
        docker-compose logs -f
    else
        print_status "📋 Viewing logs for $1..."
        docker-compose logs -f "$1"
    fi
}

# Clean up everything
cleanup() {
    print_warning "🧹 This will remove all containers, images, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "🧹 Cleaning up..."
        docker-compose down -v --rmi all
        docker system prune -a -f
        print_status "✅ Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Database operations
db_backup() {
    print_status "💾 Creating database backup..."
    docker exec movie-theater-mysql mysqldump -u root -p12345Aa cinema_db > backup_$(date +%Y%m%d_%H%M%S).sql
    print_status "✅ Database backup created!"
}

db_restore() {
    if [ -z "$1" ]; then
        print_error "Please provide backup file: ./docker-commands.sh db_restore backup.sql"
        exit 1
    fi
    print_status "📥 Restoring database from $1..."
    docker exec -i movie-theater-mysql mysql -u root -p12345Aa cinema_db < "$1"
    print_status "✅ Database restored!"
}

# Development helpers
dev_build() {
    print_status "🔨 Building application only..."
    docker-compose build app
    print_status "✅ Application built!"
}

dev_shell() {
    print_status "🐚 Opening shell in application container..."
    docker exec -it movie-theater-app /bin/sh
}

db_shell() {
    print_status "🗄️ Opening MySQL shell..."
    docker exec -it movie-theater-mysql mysql -u root -p12345Aa cinema_db
}

# Health check
health_check() {
    print_status "🏥 Checking service health..."
    echo "MySQL Health:"
    docker exec movie-theater-mysql mysqladmin ping -h localhost -u root -p12345Aa
    echo
    echo "Application Health:"
    curl -f http://localhost:8080/cinema/actuator/health || print_error "Application health check failed"
    echo
    print_status "✅ Health check completed!"
}

# Show help
show_help() {
    echo "Usage: ./docker-commands.sh [COMMAND]"
    echo
    echo "Commands:"
    echo "  start       Start all services"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  logs [service]  View logs (optional: specify service)"
    echo "  cleanup     Remove all containers, images, and volumes"
    echo "  db_backup   Create database backup"
    echo "  db_restore  Restore database from backup file"
    echo "  dev_build   Build application only"
    echo "  dev_shell   Open shell in application container"
    echo "  db_shell    Open MySQL shell"
    echo "  health      Check service health"
    echo "  help        Show this help message"
    echo
    echo "Examples:"
    echo "  ./docker-commands.sh start"
    echo "  ./docker-commands.sh logs app"
    echo "  ./docker-commands.sh db_restore backup_20240101_120000.sql"
}

# Main script logic
case "$1" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_all
        ;;
    logs)
        view_logs "$2"
        ;;
    cleanup)
        cleanup
        ;;
    db_backup)
        db_backup
        ;;
    db_restore)
        db_restore "$2"
        ;;
    dev_build)
        dev_build
        ;;
    dev_shell)
        dev_shell
        ;;
    db_shell)
        db_shell
        ;;
    health)
        health_check
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac 