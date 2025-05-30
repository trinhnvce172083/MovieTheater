# 🎭 Movie Theater Frontend - Setup Guide

## 🏗️ Cấu trúc thư mục

```
SU-2025/                          # Root project
├── package.json                  # Root package.json với scripts tổng hợp
├── movie-theater-frontend/       # NextJS Frontend
│   ├── src/
│   │   ├── app/                  # NextJS App Router
│   │   │   ├── globals.css       # Global styles + shadcn variables
│   │   │   ├── layout.tsx        # Root layout
│   │   │   └── page.tsx          # Homepage
│   │   ├── components/
│   │   │   └── ui/               # shadcn/ui components
│   │   │       ├── button.tsx    # Button với cinema/gold variants
│   │   │       ├── card.tsx      # Card + MovieCard + CinemaCard
│   │   │       ├── badge.tsx     # Badge với movie-specific variants
│   │   │       ├── input.tsx     # Input components
│   │   │       └── index.ts      # Central exports
│   │   └── lib/
│   │       └── utils.ts          # cn() utility function
│   ├── public/                   # Static assets
│   ├── components.json           # shadcn/ui configuration
│   ├── tailwind.config.ts        # TailwindCSS với movie theater colors
│   ├── package.json              # Frontend dependencies
│   └── Dockerfile                # Frontend Docker configuration
├── movie-theater-backend/        # Spring Boot Backend
├── docker/                       # Docker configurations
└── README.md                     # Project documentation
```

## 🚀 Quick Start

### 1. Từ thư mục root (Khuyến nghị)
```bash
# Cài đặt dependencies
npm run setup

# Chạy frontend (development)
npm run dev

# Chạy cả frontend + backend với Docker
npm run docker:dev
```

### 2. Từ thư mục frontend
```bash
cd movie-theater-frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build
```

## 📦 Scripts có sẵn

### 🌟 Root Scripts (Từ thư mục SU-2025/)
```bash
npm run dev              # Chạy frontend dev server
npm run build            # Build frontend
npm run start            # Start frontend production
npm run lint             # Lint frontend code

npm run frontend:dev     # Chạy frontend (alternative)
npm run frontend:build   # Build frontend (alternative)
npm run frontend:install # Cài đặt frontend dependencies

npm run backend:dev      # Chạy Spring Boot backend
npm run backend:build    # Build backend

npm run docker:dev       # Chạy toàn bộ hệ thống (dev mode)
npm run docker:prod      # Chạy toàn bộ hệ thống (production)
npm run docker:stop      # Stop Docker containers

npm run setup            # Cài đặt tất cả dependencies
npm run clean            # Clean build files
```

### 🎨 Frontend Scripts (Từ movie-theater-frontend/)
```bash
npm run dev              # Dev server với Turbopack
npm run build            # Build cho production
npm run start            # Start production server
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix ESLint issues
npm run type-check       # TypeScript type checking
npm run clean            # Xóa .next build files

npm run ui:add           # Thêm shadcn/ui component
npm run ui:list          # List available shadcn/ui components
```

## 🎯 Development Workflow

### 1. Chạy Frontend standalone
```bash
# Từ root
npm run dev

# Hoặc từ frontend folder
cd movie-theater-frontend
npm run dev
```
➡️ Frontend sẽ chạy tại: http://localhost:3000

### 2. Chạy Full Stack với Docker
```bash
# Development mode
npm run docker:dev
```
➡️ 
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- MySQL: localhost:3306

### 3. Thêm shadcn/ui components mới
```bash
cd movie-theater-frontend

# Xem danh sách components
npm run ui:list

# Thêm component (ví dụ: dialog)
npm run ui:add dialog

# Customize cho movie theater
# Edit component file trong src/components/ui/
# Export trong src/components/ui/index.ts
```

## 🎨 UI Components

### 🔘 Button Variants
- `default` - Standard shadcn button
- `cinema` - Theater branding (purple)
- `gold` - Premium/VIP features
- `outline`, `secondary`, `ghost`, `link` - Standard variants

### 🃏 Card Types
- `Card` - Standard shadcn card
- `MovieCard` - Movie displays với hover effects
- `CinemaCard` - Theater information với gradients

### 🏷️ Badge Variants
- `rating` - Movie ratings (9.5, 8.8)
- `genre` - Movie genres (Action, Drama)
- `age` - Age restrictions (T13, T16)
- `imax`, `vip`, `3d` - Format badges

## 🎯 URLs và Ports

| Service | Development | Production |
|---------|-------------|------------|
| Frontend | http://localhost:3000 | http://localhost (Nginx) |
| Backend | http://localhost:8080 | http://localhost/api (Nginx) |
| MySQL | localhost:3306 | Internal Docker network |

## 🔧 Troubleshooting

### ❌ Lỗi: "Could not read package.json"
```bash
# Đảm bảo bạn đang ở đúng thư mục
pwd  # Phải là /path/to/SU-2025

# Hoặc chạy từ frontend folder
cd movie-theater-frontend
npm run dev
```

### ❌ Port đã được sử dụng
```bash
# Tìm process đang dùng port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Hoặc dùng port khác
npm run dev -- --port 3001
```

### ❌ Node version không tương thích
```bash
# Kiểm tra Node version
node --version  # Cần >= 20.0.0

# Cài đặt Node 20+ hoặc dùng nvm
nvm install 20
nvm use 20
```

## 🏆 Best Practices

1. **📁 Luôn chạy từ thư mục root** (`SU-2025/`) để dùng root scripts
2. **🎨 Dùng custom UI components** thay vì HTML raw
3. **📱 Mobile-first design** với TailwindCSS responsive classes
4. **🔍 TypeScript strict mode** cho type safety
5. **🧹 Regular linting** với `npm run lint:fix`

## 📚 Tài liệu tham khảo

- [NextJS Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Movie Theater SHADCN README](./movie-theater-frontend/SHADCN_README.md)
- [Docker Setup Guide](./DOCKER_README.md)

---

**🎬 Happy Coding! Frontend đã được tổ chức chuẩn!** 