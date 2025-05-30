#!/bin/bash

# 🎬 Movie Theater Management System - Stop Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Help function
show_help() {
    echo "🎬 Movie Theater Management System - Stop Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "OPTIONS:"
    echo "  --clean     Remove volumes (reset database)"
    echo "  --force     Force stop and remove containers"
    echo "  --help      Show this help"
    echo ""
    echo "Examples:"
    echo "  $0              # Stop services normally"
    echo "  $0 --clean      # Stop and reset database"
    echo "  $0 --force      # Force stop everything"
}

# Default values
CLEAN_FLAG=""
FORCE_FLAG=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --clean)
            CLEAN_FLAG="-v"
            shift
            ;;
        --force)
            FORCE_FLAG="true"
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

echo -e "${YELLOW}🛑 Stopping Movie Theater Management System...${NC}"

if [[ "$FORCE_FLAG" == "true" ]]; then
    echo -e "${RED}⚡ Force stopping all containers...${NC}"
    docker-compose down --remove-orphans --timeout 10
    docker stop $(docker ps -q --filter "name=movie-theater") 2>/dev/null || true
    docker rm $(docker ps -aq --filter "name=movie-theater") 2>/dev/null || true
else
    echo -e "${YELLOW}📦 Stopping containers gracefully...${NC}"
    docker-compose down $CLEAN_FLAG
fi

if [[ "$CLEAN_FLAG" == "-v" ]]; then
    echo -e "${YELLOW}🗑️ Removing volumes (database data will be lost)...${NC}"
    echo -e "${RED}⚠️ This will delete all database data!${NC}"
fi

# Clean up orphaned images if force flag is used
if [[ "$FORCE_FLAG" == "true" ]]; then
    echo -e "${YELLOW}🧹 Cleaning up unused images and networks...${NC}"
    docker image prune -f --filter "label=com.docker.compose.project=movie-theater" 2>/dev/null || true
    docker network prune -f 2>/dev/null || true
fi

echo -e "${GREEN}✅ Movie Theater Management System stopped successfully!${NC}"

# Show next steps
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "  ./scripts/start.sh              # Start again"
echo "  ./scripts/start.sh dev          # Start in development mode"
echo "  ./scripts/start.sh prod         # Start in production mode"
if [[ "$CLEAN_FLAG" != "-v" ]]; then
    echo "  ./scripts/stop.sh --clean       # Stop and reset database"
fi 