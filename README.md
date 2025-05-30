# 🎭 Movie Theater Management System

A modern movie theater management system built with NextJS 15 + React 19 (Frontend) and Spring Boot + Java 21 (Backend).

## 🏗️ Cấu trúc Project đã được tổ chức chuẩn

```
SU-2025/                          # 📁 Root Project
├── 📄 package.json              # Root package với scripts tổng hợp  
├── 📄 start.ps1                 # PowerShell script tiện lợi
├── 📄 FRONTEND_SETUP.md         # Hướng dẫn frontend chi tiết
├── 📄 .gitignore                # Git ignore cho toàn project
├── 🎬 movie-theater-frontend/   # NextJS 15 + React 19 + shadcn/ui
│   ├── src/
│   │   ├── app/                 # NextJS App Router  
│   │   ├── components/ui/       # shadcn/ui components (customized)
│   │   └── lib/utils.ts         # Utility functions
│   ├── components.json          # shadcn/ui config
│   ├── tailwind.config.ts       # TailwindCSS v4 + custom colors
│   └── package.json             # Frontend dependencies
├── ☕ movie-theater-backend/    # Spring Boot + Java 21 + MySQL
├── 🐳 docker/                   # Docker configurations
│   ├── docker-compose.yml       # Base configuration
│   ├── docker-compose.dev.yml   # Development overrides  
│   └── docker-compose.prod.yml  # Production overrides
└── 📚 Documentation files...
```

## 🚀 Quick Start (3 cách)

### 🌟 Cách 1: PowerShell Script (Dễ nhất)
```powershell
# Chạy frontend development
.\start.ps1

# Chạy full stack với Docker  
.\start.ps1 docker

# Xem tất cả options
.\start.ps1 -Help
```

### 🌟 Cách 2: NPM Scripts từ Root
```bash
# Cài đặt dependencies
npm run setup

# Chạy frontend development
npm run dev

# Chạy full stack
npm run docker:dev
```

### 🌟 Cách 3: Từ thư mục con
```bash
# Frontend
cd movie-theater-frontend
npm run dev

# Backend  
cd movie-theater-backend
./mvnw spring-boot:run
```

## 🎯 URLs sau khi khởi động

| Service | URL | Mô tả |
|---------|-----|-------|
| 🎬 Frontend | http://localhost:3000 | NextJS app với shadcn/ui |
| ☕ Backend | http://localhost:8080 | Spring Boot REST API |
| 🐳 Docker (Full) | http://localhost:3000 & :8080 | Cả frontend + backend |
| 🐳 Production | http://localhost | Nginx reverse proxy |

## 📦 NPM Scripts có sẵn

### 🌟 Root Level (Từ SU-2025/)
```bash
npm run dev              # ✅ Chạy frontend dev server
npm run build            # 🏗️ Build frontend
npm run start            # 🚀 Start frontend production
npm run lint             # 🔍 Lint frontend code

npm run frontend:dev     # 🎬 Frontend development  
npm run frontend:build   # 🎬 Frontend build
npm run backend:dev      # ☕ Backend development

npm run docker:dev       # 🐳 Full stack development
npm run docker:prod      # 🐳 Full stack production  
npm run docker:stop      # 🛑 Stop Docker containers

npm run setup            # 📦 Cài đặt all dependencies
npm run clean            # 🧹 Clean build files
```

### 🎨 Frontend Level (Từ movie-theater-frontend/)
```bash
npm run dev              # NextJS dev với Turbopack
npm run build            # Build production
npm run lint:fix         # Auto-fix ESLint issues
npm run type-check       # TypeScript checking
npm run ui:add           # Thêm shadcn/ui component
npm run ui:list          # List available components
```

## 🎨 Frontend Tech Stack

- **⚛️ NextJS 15** - App Router, Server Components, Turbopack
- **⚛️ React 19** - Latest React with new features  
- **🎨 TailwindCSS v4** - Latest Tailwind với CSS variables
- **🧩 shadcn/ui** - High-quality components, customized cho Movie Theater
- **📘 TypeScript** - Type safety
- **🎭 Custom Components**:
  - Button variants: `cinema`, `gold`, `outline`...
  - Card types: `MovieCard`, `CinemaCard`  
  - Badge variants: `rating`, `genre`, `imax`, `vip`, `3d`

## ☕ Backend Tech Stack

- **☕ Spring Boot 3.x** - Java 21, REST APIs
- **🗄️ MySQL 8** - Database
- **🐳 Docker** - Containerization
- **🔧 Maven** - Build tool

## 🐳 Docker Architecture

```yaml
# Development
docker-compose.yml + docker-compose.dev.yml
- Frontend: Port 3000 (hot reload)
- Backend: Port 8080 + 5005 (debug)  
- MySQL: Port 3306

# Production  
docker-compose.yml + docker-compose.prod.yml
- Nginx: Port 80/443 (reverse proxy)
- Internal network communication
- Resource limits & security
```

## 🔧 Troubleshooting

### ❌ "Could not read package.json"
```bash
# Đảm bảo bạn ở đúng thư mục root
pwd  # Phải là /path/to/SU-2025
npm run dev
```

### ❌ Port conflicts
```bash
# Windows
netstat -an | findstr :3000
Get-Process | Where-Object {$_.ProcessName -eq "node"}

# Kill process nếu cần
Stop-Process -Id <PID>
taskkill /PID <PID> /F
```

### ❌ Node version
```bash
node --version  # Cần >= 20.0.0
npm --version   # Cần >= 10.0.0
```

## 📚 Documentation

- 📖 [Frontend Setup Guide](./FRONTEND_SETUP.md) - Chi tiết về NextJS + shadcn/ui
- 📖 [shadcn/ui Custom Guide](./movie-theater-frontend/SHADCN_README.md) - UI components  
- 📖 [Docker Setup Guide](./DOCKER_README.md) - Docker configurations
- 📖 [PowerShell Scripts](./start.ps1) - Automation scripts

## 🏆 Features

### 🎬 Frontend Features
- ✅ Modern UI với shadcn/ui (customized)
- ✅ Movie cards với ratings, genres, formats  
- ✅ Responsive design (mobile-first)
- ✅ Dark/Light mode support
- ✅ TypeScript strict mode
- ✅ Hot reload với Turbopack

### ☕ Backend Features  
- ✅ REST APIs cho movie management
- ✅ MySQL database integration
- ✅ Docker containerization
- ✅ Development/Production environments

### 🐳 DevOps Features
- ✅ Multi-environment Docker setup
- ✅ Nginx reverse proxy (production)
- ✅ Health checks & auto-restart
- ✅ Resource limits & security
- ✅ One-command deployment

## 🤝 Contributing

1. Clone repository
2. Chạy `npm run setup` để cài dependencies
3. Chạy `npm run dev` hoặc `.\start.ps1` để development
4. Make changes và test
5. Submit pull request

---

**🎬 Enjoy coding! Project đã được tổ chức hoàn chỉnh!**

**Developed with ❤️ using NextJS 15, React 19, Spring Boot & Docker** 