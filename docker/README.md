# 🐳 Docker Configuration - Movie Theater Management System

Thư mục này chứa **tất cả cấu hình Docker** cho Movie Theater Management System được tổ chức gọn gàng.

## 🎯 Mục đích

Setup Docker cho nhiều môi trường:
- **Database-only**: Chỉ MySQL cho local development ⭐
- **Full-stack**: Toàn bộ application stack

## 📁 Cấu trúc

```
docker/
├── README.md                    # File này
├── env.example                  # Environment variables template
├── docker-compose.database.yml  # Database-only setup ⭐ (cho local dev)
├── docker-compose.yml          # Full stack setup
├── configs/                    # Tất cả configuration files
│   ├── init.sql                # Database initialization script
│   ├── sample-data.sql         # Sample data for testing
│   ├── mysql-local.cnf         # MySQL config cho local dev
│   ├── mysql.cnf               # MySQL config cho full stack
│   └── nginx.conf              # Nginx reverse proxy config
└── scripts/                    # Docker utility scripts
    ├── docker-commands.sh      # Main utility script
    ├── start.sh                # Start services
    └── stop.sh                 # Stop services
```

## 🚀 Quick Commands

### **Local Development (Database only) - Khuyến nghị**
```powershell
# Từ root directory
.\start-database-only.ps1

# Hoặc manual
cd docker
docker-compose -f docker-compose.database.yml up -d
```

### **Full Stack Development**
```bash
cd docker
docker-compose up -d

# Với helper script
./scripts/docker-commands.sh start
```

### **Management Commands**
```bash
# Stop database
docker-compose -f docker-compose.database.yml down

# Stop full stack
docker-compose down

# View logs
docker logs movie-theater-mysql-local

# Database shell
docker exec -it movie-theater-mysql-local mysql -u cinema_user -p
```

## 🌐 Access Points

### **Database-only setup:**
- **Database**: localhost:3306 (cinema_db)
- **Adminer**: http://localhost:8081

### **Full-stack setup:**
- **Spring Boot API**: http://localhost:8080/cinema
- **Frontend**: http://localhost:3000
- **Database**: localhost:3306
- **Adminer**: http://localhost:8081

## 🗄️ Database Info

```
Host: localhost
Port: 3306
Database: cinema_db
Username: cinema_user
Password: cinema_password
Root Password: 12345Aa
```

## 💡 Tips

- **Local dev**: Dùng `docker-compose.database.yml` + IDE cho Spring Boot
- **Testing**: Dùng `docker-compose.yml` cho full stack
- **Data persistence**: Docker volumes giữ data khi restart
- **Scripts**: Sử dụng helper scripts trong `scripts/` folder
- **Environment**: Copy `env.example` thành `.env` và chỉnh sửa

## 🔧 Utility Scripts

```bash
# Main utility script
./scripts/docker-commands.sh start
./scripts/docker-commands.sh stop
./scripts/docker-commands.sh logs
./scripts/docker-commands.sh health
./scripts/docker-commands.sh db_backup
./scripts/docker-commands.sh cleanup

# Dedicated scripts
./scripts/start.sh    # Start services
./scripts/stop.sh     # Stop services
```

## 📚 Tham khảo

- `LOCAL-DEVELOPMENT-GUIDE.md` - Hướng dẫn setup local development
- `scripts/docker-commands.sh` - Full list utility commands
- `configs/` - Các file cấu hình chi tiết 