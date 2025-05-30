#!/bin/bash

# 🎬 Movie Theater Management System - Start Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Help function
show_help() {
    echo "🎬 Movie Theater Management System - Start Script"
    echo ""
    echo "Usage: $0 [ENVIRONMENT] [OPTIONS]"
    echo ""
    echo "ENVIRONMENT:"
    echo "  dev        Development environment với hot reload"
    echo "  prod       Production environment với optimizations"
    echo "  local      Local environment (default)"
    echo ""
    echo "OPTIONS:"
    echo "  --build    Force rebuild images"
    echo "  --clean    Clean up before start"
    echo "  --logs     Show logs after start"
    echo "  --help     Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 dev --build         # Development với rebuild"
    echo "  $0 prod --clean        # Production với cleanup"
    echo "  $0 local --logs        # Local với logs"
}

# Default values
ENVIRONMENT="local"
BUILD_FLAG=""
CLEAN_FLAG=""
SHOW_LOGS=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        dev|development)
            ENVIRONMENT="dev"
            shift
            ;;
        prod|production)
            ENVIRONMENT="prod"
            shift
            ;;
        local)
            ENVIRONMENT="local"
            shift
            ;;
        --build)
            BUILD_FLAG="--build"
            shift
            ;;
        --clean)
            CLEAN_FLAG="true"
            shift
            ;;
        --logs)
            SHOW_LOGS="true"
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Change to docker directory
cd "$(dirname "$0")/.."

echo -e "${GREEN}🎬 Starting Movie Theater Management System...${NC}"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"

# Clean up if requested
if [[ "$CLEAN_FLAG" == "true" ]]; then
    echo -e "${YELLOW}🧹 Cleaning up containers and volumes...${NC}"
    docker-compose down -v
    docker system prune -f
fi

# Create network if not exists
echo -e "${YELLOW}📡 Creating Docker network...${NC}"
docker network create movie-theater-network 2>/dev/null || echo "Network already exists"

# Choose compose files based on environment
COMPOSE_FILES="-f docker-compose.yml"

case $ENVIRONMENT in
    dev)
        COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.dev.yml"
        echo -e "${BLUE}🛠️ Development mode: Hot reload enabled${NC}"
        ;;
    prod)
        COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.prod.yml"
        echo -e "${GREEN}🚀 Production mode: Optimizations enabled${NC}"
        ;;
    local)
        echo -e "${YELLOW}🏠 Local mode: Standard configuration${NC}"
        ;;
esac

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose $COMPOSE_FILES up -d $BUILD_FLAG

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 5

# Check health
echo -e "${YELLOW}🩺 Checking service health...${NC}"
docker-compose $COMPOSE_FILES ps

# Show connection info
echo ""
echo -e "${GREEN}🎉 Movie Theater Management System is running!${NC}"
echo ""

case $ENVIRONMENT in
    dev)
        echo -e "${BLUE}📱 Frontend (Dev): http://localhost:3000${NC}"
        echo -e "${BLUE}🔧 Backend (Dev): http://localhost:8080${NC}"
        echo -e "${BLUE}🐛 Backend Debug: localhost:5005${NC}"
        echo -e "${BLUE}🗄️ Database: localhost:3306${NC}"
        echo -e "${BLUE}📊 DB Admin: http://localhost:8081${NC}"
        ;;
    prod)
        echo -e "${GREEN}🌐 Application: http://localhost${NC}"
        echo -e "${GREEN}📊 DB Admin: http://localhost:8081${NC}"
        echo -e "${YELLOW}Note: In production, database is not exposed externally${NC}"
        ;;
    local)
        echo -e "${YELLOW}📱 Frontend: http://localhost:3000${NC}"
        echo -e "${YELLOW}🔧 Backend: http://localhost:8080${NC}"
        echo -e "${YELLOW}🗄️ Database: localhost:3306${NC}"
        echo -e "${YELLOW}📊 DB Admin: http://localhost:8081${NC}"
        ;;
esac

echo ""
echo -e "${BLUE}📝 Useful commands:${NC}"
echo "  docker-compose $COMPOSE_FILES logs -f [service]    # View logs"
echo "  docker-compose $COMPOSE_FILES restart [service]   # Restart service"
echo "  docker-compose $COMPOSE_FILES down                # Stop all"
echo "  ./scripts/logs.sh $ENVIRONMENT                    # Quick logs"
echo "  ./scripts/stop.sh                                 # Quick stop"

# Show logs if requested
if [[ "$SHOW_LOGS" == "true" ]]; then
    echo ""
    echo -e "${YELLOW}📋 Showing logs...${NC}"
    docker-compose $COMPOSE_FILES logs -f
fi 