# 🎬 Movie Theater - Hướng dẫn Local Development

## 🎯 Mục tiêu

Setup môi trường phát triển **hybrid**: 
- **Database**: Chạy trong Docker (đảm bảo consistency)
- **Application**: Chạy trên local IDE (IntelliJ IDEA)
- **Frontend**: Chạy trên local với npm/yarn

## 🔧 Yêu cầu hệ thống

- **Docker Desktop** - Để chạy MySQL database
- **Java 17+** - Cho Spring Boot application
- **Maven 3.6+** - Build tool cho Java
- **Node.js 18+** - Cho frontend (nếu cần)
- **IntelliJ IDEA** hoặc IDE khác

## 🚀 Cách sử dụng

### 📋 Option 1: Tự động (Khuyến nghị)

```powershell
# Setup hoàn chỉnh (Database + Spring Boot)
.\start-local-development.ps1

# Chỉ khởi động database (để chạy Spring Boot từ IDE)
.\start-local-development.ps1 -DatabaseOnly

# Chỉ chạy Spring Boot (database đã chạy rồi)
.\start-local-development.ps1 -SkipDatabase
```

### 📋 Option 2: Thủ công

#### Bước 1: Khởi động Database
```powershell
.\start-database-only.ps1
```

#### Bước 2: Chạy Spring Boot từ IDE
1. Mở **IntelliJ IDEA**
2. Import project: `movie-theater-backend`
3. Chờ Maven sync xong
4. Tạo Run Configuration:
   - **Main class**: `com.swp.MovieTheaterService.MovieTheaterServiceApplication`
   - **Active profiles**: `local`
   - **VM options**: `-Dspring.profiles.active=local`
5. Click **Run** ▶️

#### Bước 3: Verify kết nối
- Application: http://localhost:8080/cinema
- Swagger UI: http://localhost:8080/cinema/swagger-ui.html
- Health Check: http://localhost:8080/cinema/actuator/health
- Database UI: http://localhost:8081 (Adminer)

## 🗄️ Thông tin Database

```
Host: localhost
Port: 3306
Database: cinema_db
Username: cinema_user
Password: cinema_password
Root Password: 12345Aa
```

### 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Spring Boot API | http://localhost:8080/cinema | Main application |
| Swagger UI | http://localhost:8080/cinema/swagger-ui.html | API documentation |
| Health Check | http://localhost:8080/cinema/actuator/health | Application health |
| Adminer | http://localhost:8081 | Database management |

## 🔧 Cấu hình IDE

### IntelliJ IDEA

#### 1. Import Project
- File → Open → Chọn thư mục `movie-theater-backend`
- Chọn "Import as Maven project"

#### 2. Set Active Profile
**Cách 1: Run Configuration**
- Run → Edit Configurations
- Thêm VM options: `-Dspring.profiles.active=local`

**Cách 2: Environment Variable**
- Run → Edit Configurations  
- Environment variables: `SPRING_PROFILES_ACTIVE=local`

#### 3. Database Connection (Optional)
- View → Tool Windows → Database
- Add Data Source → MySQL
- Host: localhost, Port: 3306
- Database: cinema_db
- User: cinema_user, Password: cinema_password

### VS Code

#### 1. Extensions cần thiết
- Extension Pack for Java
- Spring Boot Extension Pack

#### 2. Launch Configuration (`.vscode/launch.json`)
```json
{
    "type": "java",
    "name": "Spring Boot-Local",
    "request": "launch",
    "mainClass": "com.swp.MovieTheaterService.MovieTheaterServiceApplication",
    "projectName": "movie-theater-service",
    "env": {
        "SPRING_PROFILES_ACTIVE": "local"
    }
}
```

## 🐛 Troubleshooting

### ❌ Database connection failed

**Lỗi**: `Access denied for user 'cinema_user'@'localhost'`

**Giải pháp**:
```powershell
# Kiểm tra container đang chạy
docker ps

# Xem logs của database
docker logs movie-theater-mysql-local

# Restart database
.\stop-database.ps1
.\start-database-only.ps1
```

### ❌ Port 3306 already in use

**Lỗi**: `Port 3306 is already allocated`

**Giải pháp**:
```powershell
# Kiểm tra service nào đang dùng port 3306
netstat -an | findstr :3306

# Dừng MySQL service local (nếu có)
net stop mysql
# hoặc
services.msc # Tìm và stop MySQL service
```

### ❌ Docker Desktop not running

**Lỗi**: `Cannot connect to the Docker daemon`

**Giải pháp**:
1. Khởi động Docker Desktop
2. Đợi cho đến khi status là "Running"
3. Chạy lại script

### ❌ Application không kết nối được database

**Kiểm tra**:
```powershell
# Test connection thủ công
docker exec movie-theater-mysql-local mysql -u cinema_user -pcinema_password -e "SELECT 1;" cinema_db

# Kiểm tra network
docker network ls | findstr movie-theater
```

## 📝 Scripts có sẵn

| Script | Mô tả |
|--------|-------|
| `start-local-development.ps1` | Setup hoàn chỉnh |
| `start-database-only.ps1` | Chỉ khởi động database |
| `stop-database.ps1` | Dừng database containers |

## 🔄 Workflow thông thường

### Hàng ngày:
1. Khởi động Docker Desktop
2. `.\start-database-only.ps1`
3. Mở IDE và run Spring Boot project
4. Code và test

### Khi kết thúc:
1. Stop Spring Boot từ IDE
2. `.\stop-database.ps1` (optional, có thể để chạy)

### Khi có issue:
1. `.\stop-database.ps1`
2. `.\start-database-only.ps1`
3. Restart Spring Boot

## 💡 Tips

- **Database persistent**: Data sẽ được lưu trong Docker volume, không mất khi restart
- **Hot reload**: Code changes sẽ tự động reload (Spring DevTools)
- **Debug mode**: IDE có thể debug bình thường
- **Multiple profiles**: Có thể switch giữa `local`, `dev`, `test` profiles
- **Log files**: Logs được lưu trong `logs/app-local.log`

## 🆘 Cần trợ giúp?

1. Kiểm tra logs: `docker logs movie-theater-mysql-local`
2. Xem health check: http://localhost:8080/cinema/actuator/health
3. Test database: http://localhost:8081 (Adminer)
4. Check containers: `docker ps -a`

Happy coding! 🚀 