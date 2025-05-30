# 🐳 Docker Setup Guide - Movie Theater Management System

## 📋 Tổng quan

Hướng dẫn này sẽ giúp bạn setup và chạy Movie Theater Management System bằng Docker, chuẩn bị cho GitLab CI/CD.

## 🛠️ Prerequisites

### **Cài đặt cần thiết:**
- **Docker Desktop** 4.0+ 
- **Docker Compose** 2.0+
- **Git** 2.30+

### **Kiểm tra cài đặt:**
```bash
docker --version
docker-compose --version
git --version
```

## 🚀 Quick Start

### **1. Clone repository:**
```bash
git clone <your-repo-url>
cd movie-theater-backend
```

### **2. Setup environment:**
```bash
cd docker
cp env.example .env
# Edit .env file với thông tin của bạn
```

### **3. Start services:**
```bash
# Sử dụng script helper
chmod +x docker-commands.sh
./docker-commands.sh start

# Hoặc dùng docker-compose trực tiếp
docker-compose up -d --build
```

### **4. Verify deployment:**
```bash
./docker-commands.sh health
```

## 📊 Services Overview

| Service | Port | Description | URL |
|---------|------|-------------|-----|
| **app** | 8080 | Spring Boot Application | http://localhost:8080/cinema |
| **mysql** | 3306 | MySQL Database | localhost:3306 |
| **adminer** | 8081 | Database Management | http://localhost:8081 |

## 🔧 Docker Commands

### **Sử dụng helper script:**
```bash
# Start all services
./docker-commands.sh start

# Stop all services  
./docker-commands.sh stop

# Restart services
./docker-commands.sh restart

# View logs
./docker-commands.sh logs
./docker-commands.sh logs app
./docker-commands.sh logs mysql

# Health check
./docker-commands.sh health

# Database operations
./docker-commands.sh db_backup
./docker-commands.sh db_restore backup.sql

# Development
./docker-commands.sh dev_shell
./docker-commands.sh db_shell

# Cleanup
./docker-commands.sh cleanup
```

### **Docker Compose commands:**
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and start
docker-compose up -d --build

# Scale services
docker-compose up -d --scale app=2
```

## 🗄️ Database Management

### **Access database:**
```bash
# Via Adminer (Web UI)
http://localhost:8081
Server: mysql
Username: cinema_user
Password: cinema_password
Database: cinema_db

# Via MySQL CLI
./docker-commands.sh db_shell
```

### **Backup & Restore:**
```bash
# Create backup
./docker-commands.sh db_backup

# Restore from backup
./docker-commands.sh db_restore backup_20240101_120000.sql
```

## 🔍 Monitoring & Debugging

### **Health Checks:**
```bash
# Application health
curl http://localhost:8080/cinema/actuator/health

# Database health
docker exec movie-theater-mysql mysqladmin ping -h localhost -u root -p12345Aa
```

### **View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mysql

# Follow logs with timestamps
docker-compose logs -f -t app
```

### **Container inspection:**
```bash
# List running containers
docker ps

# Inspect container
docker inspect movie-theater-app

# Container stats
docker stats

# Execute commands in container
docker exec -it movie-theater-app /bin/sh
```

## 🔧 Development Workflow

### **1. Code changes:**
```bash
# Rebuild only app service
docker-compose build app
docker-compose up -d app

# Or use helper script
./docker-commands.sh dev_build
```

### **2. Database changes:**
```bash
# Reset database
docker-compose down -v
docker-compose up -d

# Or restore from backup
./docker-commands.sh db_restore init.sql
```

### **3. Configuration changes:**
```bash
# Edit docker-compose.yml or .env
# Then restart services
docker-compose down
docker-compose up -d
```

## 🚀 GitLab CI/CD Integration

### **Environment Variables trong GitLab:**
```bash
# Settings > CI/CD > Variables
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret
DOCKER_REGISTRY_USER=your-registry-user
DOCKER_REGISTRY_PASSWORD=your-registry-password
```

### **Pipeline stages:**
1. **Validate** - Kiểm tra dependencies
2. **Build** - Compile source code
3. **Test** - Unit tests + Integration tests với MySQL
4. **Package** - Build Docker image
5. **Deploy** - Deploy to staging/production

### **Test với MySQL trong CI:**
```yaml
# .gitlab-ci.yml snippet
integration-tests:
  services:
    - mysql:8.0
  variables:
    MYSQL_ROOT_PASSWORD: test123
    MYSQL_DATABASE: cinema_test_db
```

## 🔒 Security Best Practices

### **1. Environment Variables:**
- Không commit `.env` files
- Sử dụng GitLab CI/CD variables cho secrets
- Rotate passwords định kỳ

### **2. Docker Security:**
- Chạy containers với non-root user
- Sử dụng specific image tags thay vì `latest`
- Regular security scans

### **3. Database Security:**
- Strong passwords
- Limited user privileges
- Regular backups

## 🐛 Troubleshooting

### **Common Issues:**

#### **Port conflicts:**
```bash
# Check port usage
netstat -tulpn | grep :8080
lsof -i :8080

# Change ports in docker-compose.yml
ports:
  - "8081:8080"  # Host:Container
```

#### **Database connection issues:**
```bash
# Check MySQL logs
docker-compose logs mysql

# Verify database is ready
docker exec movie-theater-mysql mysqladmin ping -h localhost -u root -p12345Aa

# Reset database
docker-compose down -v
docker-compose up -d
```

#### **Application startup issues:**
```bash
# Check application logs
docker-compose logs app

# Check health endpoint
curl http://localhost:8080/cinema/actuator/health

# Restart application
docker-compose restart app
```

#### **Memory issues:**
```bash
# Check container resources
docker stats

# Increase memory limits in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
```

### **Clean slate restart:**
```bash
# Complete cleanup and restart
./docker-commands.sh cleanup
./docker-commands.sh start
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)

## 🆘 Support

Nếu gặp vấn đề:
1. Kiểm tra logs: `./docker-commands.sh logs`
2. Verify health: `./docker-commands.sh health`
3. Clean restart: `./docker-commands.sh cleanup && ./docker-commands.sh start`
4. Tạo issue trong repository với logs chi tiết

---

**🎬 Happy Dockerizing! 🐳** 