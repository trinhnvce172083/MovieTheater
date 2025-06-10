#!/bin/bash

# 🎬 Movie Theater Management System - Stop Database Script
# Shell script để dừng MySQL database containers

echo "🎬 Movie Theater - Stopping Database"
echo "===================================="

# Đảm bảo đang ở docker directory
if [ ! -f "docker-compose.database.yml" ]; then
    echo "❌ docker-compose.database.yml not found!"
    echo "Please run this script from the docker directory"
    exit 1
fi

# Dừng containers
echo "🛑 Stopping database containers..."
docker-compose -f docker-compose.database.yml down

if [ $? -eq 0 ]; then
    echo "✅ Database containers stopped successfully!"
else
    echo "❌ Failed to stop containers!"
    exit 1
fi

# Hiển thị trạng thái
echo ""
echo "📊 Current containers status:"
docker ps --filter "name=movie-theater" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "💡 Tips:"
echo "  - Data is persisted in Docker volumes"
echo "  - To remove all data: docker volume rm movie-theater-mysql-local-data"
echo "  - To restart database: ./start-database.sh" 