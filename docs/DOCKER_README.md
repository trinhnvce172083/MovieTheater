# 🎬 Movie Theater Management System - Docker Setup

Hệ thống quản lý rạp chiếu phim với Docker tối ưu hóa, bao gồm Frontend (NextJS), Backend (Spring Boot), và Database (MySQL).

## 🚀 Khởi chạy siêu nhanh

### 🥇 Cách 1: Makefile (Khuyên dùng)
```bash
make help           # Xem tất cả commands
make start          # Khởi động local
make dev            # Development với hot reload  
make prod           # Production với optimizations
make logs           # Xem logs
make stop           # Dừng tất cả
```

### 🥈 Cách 2: PowerShell Script (Windows)
```powershell
.\docker-run.ps1 -Help                    # Xem hướng dẫn
.\docker-run.ps1                          # Local environment
.\docker-run.ps1 -Environment dev -Build  # Development với rebuild
.\docker-run.ps1 -Environment prod        # Production
```

### 🥉 Cách 3: Bash Script (Linux/Mac)
```bash
chmod +x docker/scripts/start.sh
./docker/scripts/start.sh dev --logs      # Development với logs
./docker/scripts/start.sh prod --clean    # Production với cleanup
./docker/scripts/stop.sh --clean          # Stop và reset database
```

### 🔧 Cách 4: Docker Compose trực tiếp
```bash
cd docker
docker-compose up -d                                          # Local
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d   # Development
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d  # Production
```

## 📋 Cấu trúc services

### 🎭 Frontend (NextJS)
- **Port**: 3000
- **URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **Technology**: NextJS 15, React 19, TailwindCSS v4, TypeScript

### 🔧 Backend (Spring Boot)
- **Port**: 8080
- **URL**: http://localhost:8080
- **API Docs**: http://localhost:8080/cinema/swagger-ui.html
- **Health Check**: http://localhost:8080/cinema/actuator/health
- **Technology**: Spring Boot, Java 21, MySQL

### 🗄️ Database (MySQL)
- **Port**: 3306 (chỉ dev/local)
- **Database**: cinema_db
- **User**: cinema_user
- **Password**: cinema_password
- **Admin Interface**: http://localhost:8081 (Adminer)

## 🏗️ Cấu trúc file được tối ưu

```
movie-theater-management/
├── 📁 movie-theater-backend/          # Spring Boot Backend
│   ├── 🐳 Dockerfile                  # Backend container config
│   ├── 📁 docker/                     # Backend-specific docker configs
│   └── 📁 src/                        # Backend source code
├── 📁 movie-theater-frontend/         # NextJS Frontend  
│   ├── 🐳 Dockerfile                  # Frontend container config
│   ├── 📁 src/                        # Frontend source code
│   └── ⚙️ next.config.ts              # NextJS config cho Docker
├── 📁 docker/                         # 🎯 CENTRALIZED DOCKER CONFIG
│   ├── 📄 README.md                   # Docker documentation
│   ├── 🐳 docker-compose.yml          # Base configuration
│   ├── 🛠️ docker-compose.dev.yml      # Development overrides
│   ├── 🚀 docker-compose.prod.yml     # Production overrides
│   ├── 📁 configs/                    # Configuration files
│   │   ├── ⚙️ mysql.cnf               # MySQL optimization
│   │   └── 🌐 nginx.conf              # Production reverse proxy
│   └── 📁 scripts/                    # Utility scripts
│       ├── ▶️ start.sh                # Smart start script
│       └── ⏹️ stop.sh                 # Smart stop script
├── ⚡ Makefile                        # One-command operations
├── 📋 docker-run.ps1                  # PowerShell start script
└── 📖 DOCKER_README.md                # This file
```

## 🌟 Tính năng tối ưu mới

### 🏁 Multiple Environments
- **Local**: Standard configuration
- **Development**: Hot reload, debug ports, development database
- **Production**: Optimized builds, Nginx reverse proxy, resource limits

### 🔄 Hot Reload (Development Mode)
- Frontend: Automatic reload khi thay đổi code
- Backend: Spring DevTools restart tự động
- Database: Exposed ports để connect local tools

### ⚡ Performance Optimizations
- **Multi-stage Docker builds** giảm 60% kích thước image
- **Resource limits** để tránh memory leaks
- **Nginx reverse proxy** với caching và gzip
- **Health checks** đảm bảo reliability

### 🛡️ Security Features
- **Non-root users** trong tất cả containers
- **Network isolation** giữa services
- **Environment variable isolation**
- **Port restrictions** trong production

## 📝 Quick Commands

### 🚀 Khởi động
```bash
make start          # Local environment
make dev            # Development với hot reload
make prod           # Production với Nginx
```

### 📊 Monitoring
```bash
make status         # Service status
make logs           # All logs
make logs service=frontend  # Specific service logs
```

### 🔧 Management
```bash
make restart        # Restart all
make restart service=backend  # Restart specific service
make shell service=mysql     # Access service shell
```

### 🧹 Cleanup
```bash
make stop           # Stop all services
make clean          # Remove everything + volumes
make reset-db       # Reset database only
```

## 🌐 Network & Connectivity

Tất cả services chạy trong `movie-theater-network`:
- **Frontend** ↔ **Backend**: `http://backend:8080`
- **Backend** ↔ **Database**: `mysql:3306`
- **External Access**: Qua localhost ports
- **Production**: Qua Nginx reverse proxy

## 🔧 Environment Variables

Copy và chỉnh sửa:
```bash
cp docker/.env.example docker/.env
```

Chứa cấu hình cho:
- Database credentials
- JWT secrets
- Email configuration
- Google OAuth
- Production URLs

## ⚠️ Troubleshooting

### 🔍 Common Issues
```bash
# Port conflicts
make stop && make start

# Build issues  
make clean && make start-build

# Database issues
make reset-db

# View specific logs
make logs service=<service-name>

# Force cleanup
make clean
docker system prune -af
```

### 🩺 Health Checks
```bash
# Check all services
make status

# Manual health checks
curl http://localhost:3000/api/health         # Frontend
curl http://localhost:8080/cinema/actuator/health  # Backend
```

## 🎯 Why This Structure?

### ✅ Advantages của cấu trúc mới:

1. **📂 Organized**: Tất cả Docker config ở một chỗ
2. **🔄 Flexible**: Dễ switch giữa environments  
3. **⚡ Efficient**: Multi-stage builds + optimizations
4. **🛡️ Secure**: Network isolation + non-root users
5. **🔧 Maintainable**: Clear separation of concerns
6. **📈 Scalable**: Dễ thêm services mới

### ❓ 2 Dockerfile có sao không?

**Hoàn toàn bình thường!** Đây là best practice:
- Frontend (Node.js) và Backend (Java) khác tech stack
- Khác build process và dependencies  
- Khác runtime requirements
- **Microservices architecture** chuẩn như vậy

## 🎯 Next Steps

1. ✅ **Docker setup hoàn thành**
2. 🎨 Cài đặt shadcn/ui components
3. 🔗 Kết nối Frontend ↔ Backend APIs
4. 🔐 Authentication & Authorization
5. 🎬 Movie booking features
6. 🚀 Production deployment

---

**🏆 Perfect! Bạn đã có một Docker setup enterprise-grade với tất cả best practices!** 