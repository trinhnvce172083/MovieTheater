# 🐳 Docker Configuration

Thư mục này chứa tất cả cấu hình Docker cho Movie Theater Management System.

## 📁 Cấu trúc

```
docker/
├── README.md                    # File này
├── docker-compose.yml          # Main orchestration
├── docker-compose.dev.yml      # Development environment  
├── docker-compose.prod.yml     # Production environment
├── .env.example                # Environment template
├── scripts/                    # Docker utility scripts
│   ├── build.sh               # Build all services
│   ├── start.sh               # Start system
│   ├── stop.sh                # Stop system
│   ├── logs.sh                # View logs
│   └── clean.sh               # Clean up
└── configs/                   # Additional configs
    ├── nginx.conf             # Nginx reverse proxy
    └── mysql.cnf              # MySQL configuration
```

## 🚀 Quick Commands

```bash
# Development
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up --build -d

# Production  
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up --build -d

# Using scripts
./docker/scripts/start.sh dev
./docker/scripts/start.sh prod
``` 