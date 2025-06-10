#!/bin/bash

# 🎬 Movie Theater Management System - Database Only Startup Script
# Shell script để khởi động chỉ MySQL database bằng Docker cho Git Bash/Linux

echo "🎬 Movie Theater - Starting Database Only"
echo "========================================="

# Kiểm tra Docker
echo "🐳 Checking Docker..."
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi
echo "✅ Docker is running"

# Đảm bảo đang ở docker directory
if [ ! -f "docker-compose.database.yml" ]; then
    echo "❌ docker-compose.database.yml not found!"
    echo "Please run this script from the docker directory"
    exit 1
fi

echo "📁 Working directory: $(pwd)"

# Dừng container cũ nếu có
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.database.yml down --remove-orphans 2>/dev/null

# Kiểm tra và tạo network nếu cần
echo "🌐 Setting up network..."
if ! docker network ls --filter name=movie-theater-local-network --format "{{.Name}}" | grep -q "movie-theater-local-network"; then
    docker network create movie-theater-local-network
    echo "✅ Network created: movie-theater-local-network"
fi

# Khởi động database
echo "🗄️ Starting MySQL database..."
docker-compose -f docker-compose.database.yml up --build -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start database!"
    exit 1
fi

echo "✅ Database containers started successfully!"

# Chờ database sẵn sàng
echo "⏳ Waiting for database to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    attempt=$((attempt + 1))
    echo "   Attempt $attempt/$max_attempts..."
    
    if docker exec movie-theater-mysql-local mysqladmin ping -h localhost -u root -p12345Aa >/dev/null 2>&1; then
        echo "✅ Database is ready!"
        break
    fi
    
    sleep 2
done

if [ $attempt -ge $max_attempts ]; then
    echo "❌ Database failed to start within timeout!"
    echo "Checking logs..."
    docker logs movie-theater-mysql-local
    exit 1
fi

# Hiển thị thông tin kết nối
echo ""
echo "🎉 Database setup completed successfully!"
echo "========================================="
echo "📋 Connection Information:"
echo "   Host: localhost"
echo "   Port: 3306"
echo "   Database: cinema_db"
echo "   Username: cinema_user"
echo "   Password: cinema_password"
echo "   Root Password: 12345Aa"
echo ""
echo "🌐 Access Points:"
echo "   Adminer (DB Management): http://localhost:8081"
echo ""
echo "🚀 Next Steps:"
echo "   1. Open IntelliJ IDEA or VS Code"
echo "   2. Run Spring Boot application from IDE"
echo "   3. Application will connect to Docker database automatically"
echo ""
echo "📊 Container Status:"
docker ps --filter "name=movie-theater" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✨ Database is ready for development!" 