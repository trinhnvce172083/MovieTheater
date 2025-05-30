#!/bin/bash

# 🎬 Movie Theater Management System - Docker Run Script

echo "🎬 Starting Movie Theater Management System..."

# Tạo network nếu chưa có
echo "📡 Creating Docker network..."
docker network create movie-theater-network 2>/dev/null || echo "Network already exists"

# Build và start tất cả services
echo "🚀 Building and starting all services..."
docker-compose up --build -d

# Chờ services khởi động
echo "⏳ Waiting for services to start..."
sleep 10

# Kiểm tra trạng thái services
echo "📋 Checking services status..."
docker-compose ps

echo ""
echo "🎉 Movie Theater Management System is running!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8080"
echo "🗄️ Database Admin: http://localhost:8081"
echo ""
echo "📝 To view logs: docker-compose logs -f [service-name]"
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart [service-name]" 