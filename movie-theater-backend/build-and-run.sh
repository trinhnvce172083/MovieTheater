#!/bin/bash

echo "=== Movie Theater Backend Build & Run ==="

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "Maven is not installed. Please install Maven first."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "Docker is not running. Please start Docker first."
    exit 1
fi

echo "1. Starting MySQL database with Docker..."
cd docker
docker-compose up -d mysql
echo "Waiting for MySQL to be ready..."
sleep 10

echo "2. Building Spring Boot application..."
cd ..
mvn clean compile

echo "3. Running Spring Boot application..."
mvn spring-boot:run

echo "=== Application started ==="
echo "API Documentation: http://localhost:8080/cinema/swagger-ui.html"
echo "Health Check: http://localhost:8080/cinema/actuator/health"
echo "Test Authentication: ./test-auth.sh" 