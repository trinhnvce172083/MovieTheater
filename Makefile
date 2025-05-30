# 🎬 Movie Theater Management System - Makefile

.PHONY: help start stop restart logs clean build dev prod status

# Default target
.DEFAULT_GOAL := help

# Colors
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

## Display this help message
help:
	@echo "$(GREEN)🎬 Movie Theater Management System$(NC)"
	@echo ""
	@echo "$(YELLOW)Available commands:$(NC)"
	@awk 'BEGIN {FS = ":.*##"; printf ""} /^[a-zA-Z_-]+:.*?##/ { printf "  $(BLUE)%-15s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)Environment-specific commands:$(NC)"
	@echo "  $(BLUE)dev$(NC)             Start development environment"
	@echo "  $(BLUE)prod$(NC)            Start production environment"
	@echo ""
	@echo "$(YELLOW)Examples:$(NC)"
	@echo "  make start          # Start local environment"
	@echo "  make dev            # Start development with hot reload"
	@echo "  make prod           # Start production with optimizations"
	@echo "  make logs service=frontend  # View frontend logs"
	@echo "  make restart service=backend # Restart backend only"

## Start the application (local environment)
start:
	@echo "$(GREEN)🚀 Starting Movie Theater System (Local)...$(NC)"
	@cd docker && docker-compose up -d

## Start development environment with hot reload
dev:
	@echo "$(GREEN)🛠️ Starting Development Environment...$(NC)"
	@cd docker && docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

## Start production environment with optimizations
prod:
	@echo "$(GREEN)🚀 Starting Production Environment...$(NC)"
	@cd docker && docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

## Stop all services
stop:
	@echo "$(YELLOW)🛑 Stopping all services...$(NC)"
	@cd docker && docker-compose down

## Restart services (use service=<name> to restart specific service)
restart:
	@if [ "$(service)" ]; then \
		echo "$(YELLOW)🔄 Restarting $(service)...$(NC)"; \
		cd docker && docker-compose restart $(service); \
	else \
		echo "$(YELLOW)🔄 Restarting all services...$(NC)"; \
		cd docker && docker-compose restart; \
	fi

## View logs (use service=<name> for specific service)
logs:
	@if [ "$(service)" ]; then \
		echo "$(BLUE)📋 Showing logs for $(service)...$(NC)"; \
		cd docker && docker-compose logs -f $(service); \
	else \
		echo "$(BLUE)📋 Showing all logs...$(NC)"; \
		cd docker && docker-compose logs -f; \
	fi

## Show status of all services
status:
	@echo "$(BLUE)📊 Service Status:$(NC)"
	@cd docker && docker-compose ps

## Build or rebuild all images
build:
	@echo "$(YELLOW)🔨 Building all images...$(NC)"
	@cd docker && docker-compose build

## Build and start (force rebuild)
start-build:
	@echo "$(GREEN)🚀 Building and starting services...$(NC)"
	@cd docker && docker-compose up -d --build

## Clean up containers, networks, and volumes
clean:
	@echo "$(RED)🧹 Cleaning up everything...$(NC)"
	@cd docker && docker-compose down -v
	@docker system prune -f

## Reset database (removes volumes)
reset-db:
	@echo "$(RED)🗑️ Resetting database (all data will be lost)...$(NC)"
	@cd docker && docker-compose down -v mysql
	@cd docker && docker-compose up -d mysql

## Enter shell of a service (use service=<name>)
shell:
	@if [ "$(service)" ]; then \
		echo "$(BLUE)🔧 Opening shell for $(service)...$(NC)"; \
		cd docker && docker-compose exec $(service) sh; \
	else \
		echo "$(RED)❌ Please specify a service: make shell service=<name>$(NC)"; \
		echo "Available services: frontend, backend, mysql, adminer"; \
	fi

## Download and install dependencies for local development
install:
	@echo "$(YELLOW)📦 Installing frontend dependencies...$(NC)"
	@cd movie-theater-frontend && npm install
	@echo "$(YELLOW)📦 Installing backend dependencies...$(NC)"
	@cd movie-theater-backend && mvn dependency:resolve

## Run tests
test:
	@echo "$(BLUE)🧪 Running frontend tests...$(NC)"
	@cd movie-theater-frontend && npm test
	@echo "$(BLUE)🧪 Running backend tests...$(NC)"
	@cd movie-theater-backend && mvn test

## Development shortcuts
dev-frontend: ## Start only frontend in development mode
	@cd docker && docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d frontend

dev-backend: ## Start only backend in development mode  
	@cd docker && docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d backend mysql

## Quick actions
quick-restart: stop start ## Quick stop and start
quick-logs: ## Show last 50 lines of logs for all services
	@cd docker && docker-compose logs --tail=50 