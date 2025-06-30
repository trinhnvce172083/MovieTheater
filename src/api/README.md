# Booking API Documentation

## Tổng quan
Booking API cung cấp các endpoint để quản lý việc đặt vé xem phim, bao gồm chọn ghế, giữ ghế tạm thời, tạo booking và quản lý booking.

## Base URL
```
http://localhost:8080/cinema/api
```

## Authentication
Tất cả các API booking yêu cầu authentication. Token được tự động gắn vào header `Authorization: Bearer <token>` thông qua axiosClient.

## Các API Endpoints

### 1. Lấy trạng thái ghế
```typescript
GET /bookings/schedules/{scheduleId}/seats
// Hoặc
GET /schedules/{scheduleId}/seats
// Hoặc  
GET /schedule/{scheduleId}/seats
```

**Response:**
```typescript
{
  data: Seat[],
  success: boolean,
  message?: string
}
```

### 2. Giữ ghế tạm thời
```typescript
POST /bookings/schedules/{scheduleId}/seats/reserve
```

**Request Body:**
```typescript
{
  seatIds: string[]
}
```

### 3. Gia hạn giữ ghế
```typescript
POST /bookings/sessions/{sessionId}/seats/extend
```

### 4. Giải phóng ghế
```typescript
DELETE /bookings/sessions/{sessionId}/seats/release
```

### 5. Tạo booking
```typescript
POST /bookings
```

**Request Body:**
```typescript
{
  scheduleId: string | number,
  seatIds: string[],
  userId?: string,
  guestInfo?: {
    name: string,
    email: string,
    phone: string
  }
}
```

### 6. Lấy tóm tắt booking
```typescript
GET /bookings/{bookingId}/summary
```

### 7. Lấy chi tiết booking
```typescript
GET /bookings/{bookingId}
```

### 8. Hủy booking
```typescript
POST /bookings/{bookingId}/cancel
```

### 9. Lấy booking của user
```typescript
GET /bookings/my-bookings
```

## Data Types

### Seat
```typescript
interface Seat {
  id: string;
  row: string;
  number: number;
  type: "standard" | "vip" | "couple";
  status: "available" | "occupied" | "reserved" | "selected";
  price: number;
  coupleId?: string;
}
```

### BookingSummary
```typescript
interface BookingSummary {
  bookingId: string;
  movieTitle: string;
  scheduleInfo: {
    date: string;
    time: string;
    cinemaRoom: string;
  };
  seats: Seat[];
  totalAmount: number;
  status: string;
}
```

## Sử dụng trong Component

### Trong Seat Selection Page
```typescript
import { BookingApiService } from "@/api/booking-api";

// Lấy trạng thái ghế
const response = await BookingApiService.getSeatStatus(scheduleId);
if (response.success) {
  setSeats(response.data);
} else {
  messageApi.error(response.message);
}

// Giữ ghế tạm thời
const reserveResponse = await BookingApiService.reserveSeats({
  seatIds: selectedSeatIds,
  scheduleId: scheduleId
});
```

### Trong CornChip Page
```typescript
// Lấy tóm tắt booking
const response = await BookingApiService.getBookingSummary(bookingId);
if (response.success) {
  setBookingSummary(response.data);
}
```

## Debug API

### Sử dụng TestApiService
```typescript
import { TestApiService } from "@/api/test-api";

// Test tất cả endpoints
await TestApiService.testEndpoints();

// Test authentication
await TestApiService.testAuth();

// Test base URL
await TestApiService.testBaseUrl();
```

### Debug Panel trong Seat Selection
Trang seat-selection có debug panel để test API:
- Hiển thị thông tin debug
- Nút "Test API" để kiểm tra các endpoint
- Log chi tiết trong console

## Error Handling

### Các loại lỗi thường gặp:
- **401 Unauthorized**: Cần đăng nhập
- **403 Forbidden**: Không có quyền truy cập
- **404 Not Found**: Endpoint không tồn tại
- **500 Internal Server Error**: Lỗi server

### Cách xử lý:
```typescript
try {
  const response = await BookingApiService.getSeatStatus(scheduleId);
  if (response.success) {
    // Xử lý thành công
  } else {
    // Hiển thị lỗi từ API
    messageApi.error(response.message);
  }
} catch (error) {
  // Xử lý lỗi network
  console.error("Network error:", error);
  messageApi.error("Lỗi kết nối server");
}
```

## Lưu ý khi Deploy Production

1. **Cập nhật Base URL**: Thay đổi `baseURL` trong `axiosClient.ts`
2. **CORS Configuration**: Đảm bảo backend cho phép CORS từ domain frontend
3. **Authentication**: Kiểm tra token authentication hoạt động đúng
4. **Error Logging**: Implement proper error logging cho production
5. **Rate Limiting**: Cân nhắc implement rate limiting cho các API booking

## Troubleshooting

### Lỗi 403 Forbidden
- Kiểm tra user đã đăng nhập chưa
- Kiểm tra token có hợp lệ không
- Kiểm tra user có quyền truy cập booking không

### Lỗi 404 Not Found
- Kiểm tra endpoint URL có đúng không
- Kiểm tra backend có implement endpoint này không
- Sử dụng TestApiService để test các endpoint

### Lỗi Network
- Kiểm tra backend server có chạy không
- Kiểm tra CORS configuration
- Kiểm tra network connection 