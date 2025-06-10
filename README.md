# 🎭 Movie Theater Management System

A modern movie theater management system built with **latest versions** of NextJS 15 + React 19 (Frontend) and Spring Boot 3.4.2 + Java 17 (Backend).

## ⚡ Phiên bản cao nhất - Không lạc hậu!

**Backend (Spring Boot 3.4.2):**
- ☕ **Java 17** - LTS version với performance tối ưu
- 🌱 **Spring Boot 3.4.2** - Phiên bản mới nhất (2024)
- 📦 **Jakarta EE** - Thay thế javax, enterprise standard mới
- 🔐 **JWT 0.12.6** - Security cải thiện, API cleaner
- 🔄 **MapStruct 1.6.3** - Mapping nhanh hơn, ít bug hơn
- 🐬 **MySQL 8.0.35** - Database hiệu suất cao
- 📝 **OpenAPI 2.7.0** - Documentation tự động

**Frontend (NextJS 15):**
- ⚛️ **NextJS 15** - App Router, Server Components, Turbopack
- ⚛️ **React 19** - Features mới nhất
- 🎨 **TailwindCSS v4** - CSS-in-JS mới
- 🧩 **shadcn/ui** - Components chất lượng cao

## 🏗️ Cấu trúc Project đã được tổ chức chuẩn

## 🔧 Backend Architecture (Latest & Organized)

**📁 Cấu trúc được tổ chức theo user rule - từng file vào đúng thư mục:**

```
movie-theater-backend/
├── 📁 src/main/java/com/swp/MovieTheaterService/
│   ├── 📁 config/                    # 🔧 All configurations organized
│   │   ├── 📁 documentation/         # 📚 API docs configs
│   │   │   └── OpenApiConfiguration.java
│   │   ├── 📁 properties/           # ⚙️ Configuration properties  
│   │   │   ├── ApplicationProperties.java
│   │   │   └── EmailProperties.java
│   │   ├── 📁 security/             # 🔐 Security configurations
│   │   │   ├── SecurityConfiguration.java
│   │   │   └── JwtAuthenticationFilter.java
│   │   ├── WebConfig.java           # 🌐 Spring MVC config
│   │   └── README.md                # 📖 Config documentation
│   ├── 📁 controller/               # 🎮 REST API endpoints
│   ├── 📁 service/                  # 💼 Business logic
│   ├── 📁 entity/                   # 🗃️ JPA entities
│   ├── 📁 repository/               # 🗄️ Data access layer
│   └── 📁 dto/                      # 📦 Data transfer objects
├── 📁 scripts/                      # 🚀 Build & utility scripts
│   └── check-build.ps1              # ✅ Build verification
├── 📁 tests/                        # 🧪 Test scripts & demos
├── 📁 docs/                         # 📚 Backend documentation
└── pom.xml                          # 📦 Maven with latest versions
```

**✅ Key improvements theo user rules:**
- **Tổ chức file hợp lý**: config/ với sub-folders cho từng loại
- **Phiên bản cao nhất**: Spring Boot 3.4.2, Java 17, JWT 0.12.6  
- **No duplicate configs**: Consolidated OpenAPI + Swagger
- **Type-safe properties**: @ConfigurationProperties
- **Jakarta EE compliant**: All imports updated

## 🏗️ Cấu trúc Project đã được tổ chức chuẩn

```
SU-2025/                          # 📁 Root Project
├── 📄 package.json              # Root package với scripts tổng hợp  
├── 📄 quick-start.ps1           # Script khởi động nhanh từ root
├── 📄 .gitignore                # Git ignore cho toàn project
├── 🎬 movie-theater-frontend/   # NextJS 15 + React 19 + shadcn/ui
│   ├── src/
│   │   ├── app/                 # NextJS App Router  
│   │   ├── components/ui/       # shadcn/ui components (customized)
│   │   └── lib/utils.ts         # Utility functions
│   ├── components.json          # shadcn/ui config
│   ├── tailwind.config.ts       # TailwindCSS v4 + custom colors
│   └── package.json             # Frontend dependencies
├── ☕ movie-theater-backend/    # Spring Boot 3.4.2 + Java 17 + MySQL
│   ├── src/                     # Source code (Jakarta EE)
│   ├── tests/                   # 📝 Test scripts & demo files
│   │   ├── test-auth.sh
│   │   ├── test-apis.ps1
│   │   ├── test-*-api.sh
│   │   └── demo-cicd.sh
│   ├── docs/                    # 📚 Backend documentation
│   │   ├── AUTH_README.md
│   │   ├── BOOKING_README.md
│   │   ├── CINEMA_README.md
│   │   └── *_README.md
│   └── pom.xml                  # Maven với phiên bản cao nhất
├── 🐳 docker/                   # Docker configurations
│   ├── docker-compose.yml       # Base configuration
│   ├── docker-compose.dev.yml   # Development overrides  
│   └── docker-compose.prod.yml  # Production overrides
├── 📚 docs/                     # 📖 Project documentation
│   ├── FRONTEND_SETUP.md        # Hướng dẫn frontend chi tiết
│   ├── DOCKER_README.md         # Docker setup guide
│   └── JAVA-SETUP.md            # 🔥 Hướng dẫn cài Java 17
├── 🔧 scripts/                  # 🚀 Automation scripts
│   ├── start.ps1                # PowerShell script tiện lợi
│   ├── quick-start.ps1          # Script kiểm tra Java 17
│   ├── docker-run.ps1           # Docker automation
│   └── docker-run.sh            # Docker script for Linux/Mac
└── 🛠️ tools/                    # 🔨 Build tools & utilities
    └── Makefile                 # Make commands
```

## 🚀 Quick Start (3 cách)

### 🌟 Cách 1: Script khởi động nhanh (Dễ nhất)
```powershell
# Chạy backend với auto-check Java 17
.\scripts\quick-start.ps1

# Chạy frontend development
.\scripts\start.ps1

# Chạy full stack với Docker  
.\scripts\docker-run.ps1 dev

# Xem tất cả options
.\scripts\quick-start.ps1 -Help
```

### 📋 Requirements

**Backend cần Java 17:**
```powershell
# Kiểm tra Java version
java -version

# Nếu không có Java 17:
# 1. Đọc docs/JAVA-SETUP.md  
# 2. Download: https://adoptium.net/temurin/releases/
# 3. Chọn Version 17 - LTS
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

## 🎯 URLs sau khi khởi động

| Service | URL | Mô tả |
|---------|-----|-------|
| 🎬 Frontend | http://localhost:3000 | NextJS app với shadcn/ui |
| ☕ Backend | http://localhost:8080 | Spring Boot REST API |
| 📚 API Docs | http://localhost:8080/swagger-ui.html | OpenAPI 2.7.0 |
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

## 🎨 Frontend Tech Stack (Latest)

- **⚛️ NextJS 15** - App Router, Server Components, Turbopack
- **⚛️ React 19** - Latest React với concurrent features
- **🎨 TailwindCSS v4** - Latest Tailwind với CSS variables
- **🧩 shadcn/ui** - High-quality components, customized cho Movie Theater
- **📘 TypeScript** - Type safety
- **🎭 Custom Components**:
  - Button variants: `cinema`, `gold`, `outline`...
  - Card types: `MovieCard`, `CinemaCard`  
  - Badge variants: `rating`, `genre`, `imax`, `vip`, `3d`

## ☕ Backend Tech Stack (Latest)

- **☕ Java 17** - LTS với performance improvements
- **🌱 Spring Boot 3.4.2** - Latest với Jakarta EE support
- **📦 Jakarta EE** - Enterprise standard mới (thay javax)
- **🔐 JWT 0.12.6** - Latest với security enhancements
- **🔄 MapStruct 1.6.3** - Fastest mapping performance
- **🐬 MySQL 8.0.35** - Latest với JSON improvements
- **📝 OpenAPI 2.7.0** - Latest documentation tools
- **🐳 Docker** - Containerization

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

### ❌ "Java 17 not found"
```bash
# Đọc hướng dẫn cài đặt Java 17
cat docs/JAVA-SETUP.md

# Hoặc download trực tiếp:
# https://adoptium.net/temurin/releases/
```

### ❌ "Could not read package.json"
```bash
# Đảm bảo bạn ở đúng thư mục root
pwd  # Phải là /path/to/SU-2025
.\scripts\quick-start.ps1
```

### ❌ Port conflicts
```bash
# Windows
netstat -an | findstr :8080
Get-Process | Where-Object {$_.ProcessName -eq "java"}

# Kill process nếu cần
Stop-Process -Id <PID>
taskkill /PID <PID> /F
```

### ❌ Maven compilation errors
```bash
# Clean và compile lại
cd movie-theater-backend
mvn clean compile
mvn spring-boot:run
```

## 📚 Documentation

- 📖 [Frontend Setup Guide](./docs/FRONTEND_SETUP.md) - Chi tiết về NextJS + shadcn/ui
- 📖 [Java 17 Setup Guide](./docs/JAVA-SETUP.md) - 🔥 Hướng dẫn cài Java 17  
- 📖 [Maven Setup Guide](./docs/MAVEN-SETUP.md) - 🔧 Hướng dẫn cài Maven mới nhất
- 📖 [shadcn/ui Custom Guide](./movie-theater-frontend/SHADCN_README.md) - UI components  
- 📖 [Docker Setup Guide](./docs/DOCKER_README.md) - Docker configurations
- 📖 [Backend API Docs](./movie-theater-backend/docs/) - API documentation
- 📖 [Test Scripts](./movie-theater-backend/tests/) - Testing utilities

## ⚡ Tại sao dùng phiên bản cao nhất?

✅ **Performance tốt hơn** - Java 17, Spring Boot 3.x có tối ưu hiệu suất  
✅ **Security patches** - Các lỗ hổng bảo mật được fix trong versions mới  
✅ **Modern features** - Jakarta EE, React 19, TailwindCSS v4 có features mới  
✅ **Long-term support** - Java 17 là LTS, Spring Boot 3.x được hỗ trợ lâu dài  
✅ **Community support** - Phiên bản mới có community active hơn  
✅ **Future-proof** - Tránh technical debt, dễ maintain về lâu dài

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

## 🧪 Testing & Development

### Backend Testing
```bash
# Chạy test scripts từ backend
cd movie-theater-backend/tests/
./test-auth.sh               # Test authentication
./test-booking-api.sh        # Test booking APIs
./test-cinema-api.sh         # Test cinema management
```

### Development Tools
```bash
# Sử dụng Makefile commands
cd tools/
make help                    # Xem available commands
make build                   # Build project
make clean                   # Clean build files
```

## 🛡️ Safe Development Practices

**🔧 Tuân thủ tất cả User Rules:**

### ✅ **Rule 1: Tiếng Việt Communication**
- **Always respond in Tiếng Việt** - Đảm bảo team Việt Nam dễ hiểu
- **Documentation & Comments** - Tất cả đều bằng tiếng Việt  
- **Technical terms** - Có thể tiếng Anh nhưng có giải thích

### ✅ **Rule 2: Version Compliance & Type Safety**
- **Luôn kiểm tra phiên bản** - Dùng versions cao nhất & stable
- **Type safety** - Strict TypeScript, Jakarta EE annotations
- **Compatibility matrix** - Test kỹ sau upgrade

### ✅ **Rule 3: Practical Implementation**  
- **Code thực tiễn** - Giải quyết real business problems
- **Avoid over-engineering** - Không academic patterns phức tạp  
- **Simple & maintainable** - Dễ đọc, dễ maintain
- **User-friendly** - UX/DX tốt cho end users

### ✅ **Rule 4: Safe File Management** ⭐
- **Impact analysis** trước khi xóa file
- **Replacement strategy** nếu có dependencies 
- **Verification** đảm bảo không break project
- **Auto backup** và recovery plan

**🛠️ Safe Deletion Tools:**
```powershell
# Analyze impact before deletion
.\scripts\safe-delete.ps1 path/to/file.java -DryRun

# Force deletion with backup (if safe)
.\scripts\safe-delete.ps1 path/to/file.java -Force
```

**📖 Chi tiết đầy đủ:** [User Rules Documentation](./docs/USER-RULES.md)  
**📖 Safe Deletion:** [Safe Deletion Process](./docs/SAFE-DELETION-PROCESS.md) 

# 🎬 Lumiere Cinema - Movie Theater Management System

Professional movie theater management system với comprehensive backend Spring Boot và modern frontend NextJS.

## ✨ **Key Features**

### 🎭 **Movie Management**
- Complete movie CRUD operations
- Movie scheduling và showtime management
- Support multiple cinema rooms (Standard, VIP, IMAX, 4DX)
- Advanced seat selection với real-time availability

### 👥 **User Management & Authentication**
- Multi-role system: Admin, Employee, Member, Customer
- JWT-based secure authentication
- Membership levels với loyalty points
- Role-based access control

### 🎫 **Booking System**
- Real-time seat selection
- Multiple payment methods support
- Booking confirmation với QR codes
- Guest và member booking options

### 🎁 **Promotions & Discounts**
- Flexible promotion system
- Time-based và condition-based discounts
- Member exclusive offers
- Bulk discount options

## 🚀 **Quick Start**

### **Prerequisites**
- Docker Desktop
- Java 17+
- Node.js 20+
- Git

### **1. Clone Repository**
```bash
git clone <repository-url>
cd SU-2025
```

### **2. Start Database (Docker)**
```bash
# Quick start database với sample data
.\dev.ps1 db

# Adminer UI: http://localhost:8081
# Host: movie-theater-mysql-local
# Database: cinema_db
# Username: cinema_user
# Password: cinema_password
```

### **3. Start Backend (Spring Boot)**
```bash
cd movie-theater-backend
./mvnw spring-boot:run

# Backend API: http://localhost:8080/cinema
# Swagger UI: http://localhost:8080/cinema/swagger-ui.html
```

### **4. Start Frontend (NextJS)**
```bash
cd movie-theater-frontend
npm install
npm run dev

# Frontend: http://localhost:3000
```

## 🧪 **Sample Data & Test Accounts**

System comes với comprehensive sample data để immediate testing:

### **🔐 Test Accounts**
| Role | Email | Password | Features |
|------|--------|----------|----------|
| **Admin** | `admin@lumiere.com` | `admin123` | Full system access, user management |
| **Employee** | `employee@lumiere.com` | `employee123` | Booking management, check-in |
| **Member** | `member@lumiere.com` | `member123` | SILVER member (1,250 points) |
| **Customer** | `customer@lumiere.com` | `customer123` | Basic customer features |

### **🎬 Sample Movies**
- Avengers: Endgame (181 min, Action/Sci-Fi)
- Spider-Man: No Way Home (148 min, Action/Sci-Fi)
- Top Gun: Maverick (131 min, Action/Drama)
- Everything Everywhere All at Once (139 min, Comedy/Drama)
- Avatar: The Way of Water (192 min, Action/Sci-Fi)

### **🏛️ Cinema Rooms**
- **Standard Rooms**: Cinema Room A (120 seats), Cinema Room B (100 seats)
- **Premium Rooms**: VIP Room (60 seats), IMAX Theater (200 seats), 4DX Experience (80 seats)
- **Total Capacity**: 560 seats across 5 rooms

### **📅 Daily Schedules**
- 15+ daily showtimes across all rooms
- Multiple pricing tiers (Standard, VIP, IMAX, 4DX)
- Morning, afternoon, và evening shows

### **🎁 Active Promotions**
- Weekend Special (20% off weekends)
- Student Discount (15% off với student ID)
- Happy Hour Matinee (Fixed 80,000 VND before 12PM)
- VIP Member Exclusive (25% off premium rooms)
- Couple Night Special (Buy 2 get 1 free combo)

📖 **[Complete Sample Data Guide →](./SAMPLE-DATA-GUIDE.md)**

## 🛠️ **Development Workflow**

### **Database Operations**
```bash
# Start database only
.\dev.ps1 db

# Stop all services
.\dev.ps1 stop

# Reset database (removes all data, recreates với sample data)
.\dev.ps1 stop
docker volume rm movie-theater-local-network_mysql-local-data
.\dev.ps1 db

# View database logs
docker logs movie-theater-mysql-local
```

### **Backend Development**
```bash
# Development mode với auto-reload
cd movie-theater-backend
./mvnw spring-boot:run

# API Documentation
open http://localhost:8080/cinema/swagger-ui.html

# Health check
curl http://localhost:8080/cinema/actuator/health
```

### **Frontend Development**
```bash
# Development server với hot reload
cd movie-theater-frontend
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check
```

## 🏗️ **Architecture Overview**

### **Backend (Spring Boot)**
```
movie-theater-backend/
├── src/main/java/com/swp/MovieTheaterService/
│   ├── config/          # Security, CORS, Database config
│   ├── controller/      # REST API endpoints
│   ├── dto/            # Data Transfer Objects
│   ├── entity/         # JPA Entities (User, Movie, Booking, etc.)
│   ├── enums/          # Enumerations (Role, Status, etc.)
│   ├── exception/      # Custom exceptions
│   ├── mapper/         # Entity ↔ DTO mapping
│   ├── repository/     # Data access layer
│   ├── service/        # Business logic
│   └── utils/          # Utility classes
└── src/main/resources/
    ├── application.yml # Single configuration file
    └── static/        # Static resources
```

### **Frontend (NextJS 15)**
```
movie-theater-frontend/
├── src/
│   ├── app/           # NextJS App Router
│   ├── components/    # Reusable UI components
│   ├── contexts/      # React Context (Auth, etc.)
│   ├── services/      # API calls & business logic
│   ├── types/         # TypeScript type definitions
│   ├── config/        # Environment configuration
│   └── hooks/         # Custom React hooks
├── public/           # Static assets
└── package.json      # Dependencies
```

### **Database (Docker)**
```
docker/
├── docker-compose.database.yml  # Database-only setup
├── configs/
│   ├── init.sql                # Sample data initialization
│   └── mysql-local.cnf         # MySQL optimization
└── README.md                   # Docker documentation
```

## 📡 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/verify` - Token verification

### **Movies**
- `GET /api/movies/public` - Public movie listings
- `GET /api/movies/public/{id}` - Movie details
- `POST /api/movies` - Create movie (Admin)
- `PUT /api/movies/{id}` - Update movie (Admin)

### **Schedules**
- `GET /api/schedules/public` - Public schedules
- `GET /api/schedules/public/movie/{movieId}` - Schedules by movie
- `POST /api/schedules` - Create schedule (Admin)

### **Bookings**
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my` - User's bookings
- `GET /api/bookings/{id}` - Booking details

**[Complete API Documentation →](http://localhost:8080/cinema/swagger-ui.html)**

## 🔧 **Configuration**

### **Environment Variables**

**Backend (`application.yml`)**
```yaml
# Database
spring.datasource.url: jdbc:mysql://localhost:3306/cinema_db
spring.datasource.username: cinema_user
spring.datasource.password: cinema_password

# JWT
app.jwt.secret: your-secret-key
app.jwt.expiration: 86400000
```

**Frontend (`.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=Lumiere Cinema
```

## 🧪 **Testing**

### **Backend Testing**
```bash
cd movie-theater-backend
./mvnw test                    # Run all tests
./mvnw test -Dtest=UserService # Run specific test
```

### **Frontend Testing**
```bash
cd movie-theater-frontend
npm test                       # Run unit tests
npm run test:e2e              # Run E2E tests
```

### **API Testing**
- Use Swagger UI: http://localhost:8080/cinema/swagger-ui.html
- Postman collection available
- Sample cURL commands in documentation

## 📦 **Deployment**

### **Production Database**
```bash
# Production docker-compose
docker-compose -f docker/docker-compose.yml up -d
```

### **Backend Deployment**
```bash
cd movie-theater-backend
./mvnw clean package
java -jar target/MovieTheaterService-0.0.1-SNAPSHOT.jar
```

### **Frontend Deployment**
```bash
cd movie-theater-frontend
npm run build
npm start
```

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 **License**

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Issues**: [GitHub Issues](issues-url)
- **Documentation**: [Wiki](wiki-url)
- **Email**: support@lumiere-cinema.com

---

**Made với ❤️ by Lumiere Cinema Team** 🎬✨ 