# 🎬 Movie Theater Frontend - Skeleton Structure

## 📁 Cấu trúc thư mục sẵn sàng để phát triển

Thư mục này chứa cấu trúc skeleton hoàn chỉnh cho Next.js frontend, sẵn sàng để bắt đầu phát triển từ đầu.

### 📋 Cấu trúc thư mục:

#### Root Configuration Files:
- `package.json` - Dependencies và scripts
- `package-lock.json` - Lock file cho dependencies  
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration
- `eslint.config.mjs` - ESLint configuration
- `components.json` - ShadCN/UI components configuration
- `next-env.d.ts` - Next.js TypeScript declarations
- `.gitignore` - Git ignore rules
- `.dockerignore` - Docker ignore rules
- `Dockerfile` - Docker container configuration

#### Source Code Structure:
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/             # React components
│   └── index.ts           # Components export
├── hooks/                  # Custom React hooks
│   └── index.ts           # Hooks export
├── contexts/              # React Context providers
│   └── index.ts           # Contexts export
├── services/              # API calls & business logic
│   └── index.ts           # Services export
├── store/                 # Global state management
│   └── index.ts           # Store export
├── types/                 # TypeScript type definitions
│   └── index.ts           # Types export
├── utils/                 # Utility functions
│   └── index.ts           # Utils export
├── config/                # Configuration files
│   └── environment.ts     # Environment variables
└── lib/                   # Third-party libraries setup
    └── utils.ts           # Utility helpers (cn, etc.)
```

#### Public Directory:
```
public/
└── .gitkeep              # Placeholder for static assets
```

### 🚀 Bắt đầu phát triển:

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Mở http://localhost:3000
```

### 📝 Cách sử dụng:

1. **Components**: Tạo React components trong `src/components/`
2. **Pages**: Sử dụng App Router trong `src/app/`
3. **API Integration**: Thêm API calls vào `src/services/`
4. **State Management**: Setup Redux/Zustand trong `src/store/`
5. **Custom Hooks**: Tạo reusable hooks trong `src/hooks/`
6. **Type Definitions**: Định nghĩa types trong `src/types/`
7. **Utilities**: Thêm helper functions vào `src/utils/`

### 📦 Dependencies đã cài sẵn:

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **ShadCN/UI** - Component library
- **ESLint** - Code linting

### 🎯 Tính năng sẵn sàng:

- ✅ Next.js App Router setup
- ✅ TypeScript configuration
- ✅ Tailwind CSS styling
- ✅ ShadCN/UI components
- ✅ Environment configuration
- ✅ Folder structure organized
- ✅ Import/export patterns
- ✅ Basic page template

### 🔧 Customization:

- Thay đổi theme trong `tailwind.config.ts`
- Cập nhật environment trong `src/config/environment.ts`
- Thêm metadata trong `src/app/layout.tsx`
- Customize components trong `components.json`

**Ready to code! 🚀**
