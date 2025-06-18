# 🎬 Movies API Integration Guide

## Tổng quan

Tôi đã tạo thành công một trang **Movies API** hoàn chỉnh dựa trên phần NowShowing hiện có của bạn, với các tính năng nâng cao và tích hợp API thực tế.

## 📁 Cấu trúc Files đã tạo

```
src/
├── app/movies-api/page.tsx                    # Main page component
├── hooks/MoviesApi/use-movies-api.ts          # Custom hooks với API integration
├── components/MoviesApi/
│   ├── search-filters-api.tsx                 # Enhanced search & filters
│   ├── movie-grid-api.tsx                     # Grid layout với categorization
│   ├── movie-card-api.tsx                     # Enhanced movie cards
│   ├── error-state-api.tsx                    # Advanced error handling
│   └── loading-state-api.tsx                  # Beautiful loading states
├── api/movie-api.ts                           # Enhanced API service với fallback
└── constants/routes.ts                        # Updated với MOVIES_API route
```

## 🚀 Tính năng chính

### 1. **API Integration với Fallback**
- Kết nối với backend API endpoint `/movies/now-showing`
- Tự động fallback về mock data khi API không khả dụng
- Real-time error handling và retry logic

### 2. **Enhanced UI Components**
- **Search & Filters**: Tìm kiếm theo title/genre, filter theo rating, sort multiple options
- **Movie Cards**: Hover effects, status badges, rating colors, featured highlighting
- **Loading States**: Skeleton animations với progress indicators
- **Error States**: Smart error detection với troubleshooting tips

### 3. **Advanced Features**
- Featured movies section riêng biệt
- Adult content warnings
- API status indicators
- Filter statistics
- Responsive design hoàn chỉnh

## 🛠️ Cách sử dụng

### 1. Truy cập trang
```typescript
// Navigate to: /movies-api
// Hoặc sử dụng route constant
import ROUTES from "@/constants/routes";
router.push(ROUTES.MOVIES_API);
```

### 2. Cấu hình API Backend
Cập nhật base URL trong `src/api/axiosClient.ts`:
```typescript
const axiosClient = axios.create({
  baseURL: "YOUR_BACKEND_URL_HERE", // Thay thế bằng URL thực tế
  headers: {
    "Content-Type": "application/json",
  },
});
```

### 3. API Endpoints cần thiết

Backend cần implement các endpoints sau:

```bash
GET /movies/now-showing          # Lấy danh sách phim đang chiếu
GET /movies/{id}                 # Lấy chi tiết phim
GET /movies/search?q={query}     # Tìm kiếm phim
GET /movies/genre/{genre}        # Lấy phim theo thể loại
```

### 4. Response Format mong đợi

```typescript
// GET /movies/now-showing
{
  "success": true,
  "data": [
    {
      "movieId": "string",
      "title": "string",
      "genre": ["string"],
      "duration": number,
      "formattedDuration": "string",
      "releaseDate": "string",
      "rating": "string",
      "posterUrl": "string",
      "price": number,
      "status": "string",
      "imdbRating": number,
      "isFeatured": boolean,
      "isAdultContent": boolean
    }
  ]
}
```

## 🎨 UI/UX Features

### Design System
- **Color Scheme**: Dark theme với orange accents
- **Typography**: Modern font hierarchy
- **Animations**: Smooth transitions và hover effects
- **Responsive**: Mobile-first design

### Interactive Elements
- **Search**: Real-time filtering
- **Filters**: Multi-criteria filtering với active filter display
- **Cards**: Hover reveals action buttons
- **Loading**: Progressive loading với status updates

### Status Indicators
- 🟢 API Connected
- 🟡 Loading from API
- 🔴 API Error (fallback to demo data)

## 🔧 Customization

### 1. Thay đổi Mock Data
Edit `MOCK_MOVIES` trong `src/api/movie-api.ts`

### 2. Customize Filters
Edit `SearchFiltersApi` component để thêm/bớt filter options

### 3. Modify Card Layout
Edit `MovieCardApi` component để thay đổi design

### 4. Add New API Endpoints
Extend `MovieApiService` class với methods mới

## 📱 Responsive Breakpoints

```css
- Mobile: 1 column
- Tablet: 2 columns  
- Desktop: 3 columns
- Large: 4 columns
```

## 🚨 Error Handling

### Automatic Fallback
- Nếu API fails → sử dụng mock data
- Nếu network error → hiển thị troubleshooting tips
- Nếu server error → retry options

### User-Friendly Messages
- Network issues: "Check internet connection"
- Server issues: "Try again later"
- Not found: "Resource not available"

## 🔗 Integration với Backend

### Bước 1: Cung cấp Backend URL
```bash
# Ví dụ URLs
http://localhost:8080/cinema/api
https://api.yourcinema.com
https://your-backend-domain.com/api
```

### Bước 2: Test API Endpoints
```bash
curl http://your-backend/movies/now-showing
```

### Bước 3: Update axiosClient
```typescript
baseURL: "http://your-backend-url"
```

## 🎯 Next Steps

1. **Cung cấp Backend URL** để tôi cập nhật axiosClient
2. **Test API endpoints** để đảm bảo response format đúng
3. **Customize UI** theo branding requirements
4. **Add authentication** nếu cần thiết
5. **Deploy và test** trên production

## 📞 Support

Nếu cần hỗ trợ thêm:
- Cập nhật API endpoints
- Customize UI components  
- Fix integration issues
- Add new features

Chỉ cần cung cấp **Backend API URL** và tôi sẽ hoàn thiện integration ngay lập tức! 🚀 