# 📋 **HƯỚNG DẪN TEST FLOW BOOKING TRÊN SWAGGER**

## 🎯 **Tổng quan**

Tài liệu này hướng dẫn test toàn bộ luồng booking rạp chiếu phim thông qua Swagger UI tại:
`http://localhost:8080/swagger-ui/index.html`

---

## 🔐 **Bước 1: Authentication**

### **1.1. Login để lấy JWT Token**

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "accountId": 1,
      "email": "admin@example.com",
      "role": "ADMIN"
    }
  }
}
```

### **1.2. Cấu hình Authorization trong Swagger**

1. Click vào nút **"Authorize"** (🔒) ở góc trên bên phải
2. Nhập: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Click **"Authorize"**

---

## 🏗️ **Bước 2: Chuẩn bị dữ liệu test**

### **2.1. Tạo Movie**

**Endpoint:** `POST /api/movies`

**Request Body:**

```json
{
  "title": "Avengers: Endgame",
  "description": "Siêu anh hùng Marvel",
  "duration": 181,
  "releaseDate": "2024-06-01",
  "genre": "Action",
  "director": "Russo Brothers",
  "cast": "Robert Downey Jr., Chris Evans",
  "language": "English",
  "subtitle": "Vietnamese",
  "rating": "PG-13",
  "ticketPrice": 120000
}
```

### **2.2. Tạo Cinema Room**

**Endpoint:** `POST /api/cinema-rooms`

**Request Body:**

```json
{
  "roomName": "Phòng 1",
  "capacity": 100,
  "roomType": "STANDARD",
  "seatLayout": "10x10"
}
```

### **2.3. Tạo Schedule**

**Endpoint:** `POST /api/schedules`

**Request Body:**

```json
{
  "movieId": 1,
  "cinemaRoomId": 1,
  "showDateTime": "2024-06-15T19:30:00",
  "ticketPrice": 120000
}
```

### **2.4. Tạo Concession (tùy chọn)**

**Endpoint:** `POST /api/concessions`

**Request Body:**

```json
{
  "name": "Bắp rang bơ",
  "description": "Bắp rang bơ thơm ngon",
  "price": 30000,
  "category": "FOOD",
  "isAvailable": true
}
```

### **2.5. Tạo Promotion (tùy chọn)**

**Endpoint:** `POST /api/promotions`

**Request Body:**

```json
{
  "promotionCode": "SUMMER2024",
  "promotionName": "Khuyến mãi mùa hè",
  "discountType": "PERCENTAGE",
  "discountValue": 10.0,
  "minPurchaseAmount": 100000.0,
  "startDate": "2024-06-01T00:00:00",
  "endDate": "2024-08-31T23:59:59",
  "maxUsageCount": 1000,
  "maxUsagePerUser": 1,
  "isFeatured": true,
  "pointsRequired": 500
}
```

---

## 🎬 **Bước 3: Test luồng booking**

### **3.1. Lấy thông tin Schedule**

**Endpoint:** `GET /api/schedules/{scheduleId}`

**Parameters:**

- `scheduleId`: 1

**Response:**

```json
{
  "scheduleId": 1,
  "movie": {
    "movieId": 1,
    "title": "Avengers: Endgame"
  },
  "cinemaRoom": {
    "roomId": 1,
    "roomName": "Phòng 1"
  },
  "showDateTime": "2024-06-15T19:30:00",
  "ticketPrice": 120000
}
```

### **3.2. Lấy trạng thái ghế**

**Endpoint:** `GET /api/bookings/schedules/{scheduleId}/seats`

**Parameters:**

- `scheduleId`: 1

**Response:**

```json
{
  "scheduleId": 1,
  "seats": [
    {
      "seatId": 1,
      "seatNumber": "A1",
      "status": "AVAILABLE"
    },
    {
      "seatId": 2,
      "seatNumber": "A2",
      "status": "AVAILABLE"
    }
  ]
}
```

### **3.3. Giữ chỗ tạm thời**

**Endpoint:** `POST /api/bookings/schedules/{scheduleId}/seats/reserve`

**Parameters:**

- `scheduleId`: 1

**Request Body:**

```json
{
  "seatIds": [1, 2, 3]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Ghế đã được giữ chỗ tạm thời trong 15 phút",
  "sessionId": "sess_123456",
  "expiryMinutes": 15
}
```

### **3.4. Tạo Booking**

#### **Option A: Quick Booking (chỉ ghế)**

**Endpoint:** `POST /api/bookings/quick`

**Request Body:**

```json
{
  "scheduleId": 1,
  "seatIds": [1, 2, 3],
  "customerEmail": "test@example.com",
  "customerPhone": "0123456789"
}
```

#### **Option B: Full Booking (có concession + promotion)**

**Endpoint:** `POST /api/bookings`

**Request Body:**

```json
{
  "scheduleId": 1,
  "seatIds": [1, 2, 3],
  "customerEmail": "test@example.com",
  "customerPhone": "0123456789",
  "concessionOrders": [
    {
      "concessionId": 1,
      "quantity": 2
    }
  ],
  "promotionCode": "SUMMER2024"
}
```

**Response:**

```json
{
  "bookingId": 1,
  "bookingCode": "BK123456",
  "status": "PENDING",
  "totalAmount": 360000,
  "finalAmount": 324000,
  "discountAmount": 36000,
  "seats": [
    {
      "seatId": 1,
      "seatNumber": "A1",
      "price": 120000
    }
  ],
  "concessions": [
    {
      "concessionId": 1,
      "name": "Bắp rang bơ",
      "quantity": 2,
      "price": 60000
    }
  ],
  "promotion": {
    "code": "SUMMER2024",
    "name": "Khuyến mãi mùa hè",
    "discountType": "PERCENTAGE",
    "discountValue": 10
  }
}
```

### **3.5. Thêm Concession (tùy chọn)**

**Endpoint:** `POST /api/bookings/{bookingId}/concessions`

**Parameters:**

- `bookingId`: 1

**Request Body:**

```json
{
  "concessionId": 1,
  "quantity": 1
}
```

### **3.6. Áp dụng Promotion (tùy chọn)**

**Endpoint:** `POST /api/bookings/{bookingId}/promotion`

**Parameters:**

- `bookingId`: 1
- `promotionCode`: SUMMER2024

### **3.7. Thanh toán**

**Endpoint:** `POST /api/bookings/payment`

**Request Body:**

```json
{
  "bookingCode": "BK123456",
  "paymentMethod": "VNPAY",
  "paidAmount": 324000,
  "paymentReference": "VNPAY123456"
}
```

**Response:**

```json
{
  "bookingId": 1,
  "status": "CONFIRMED",
  "paymentStatus": "PAID",
  "qrCode": "qr_123456",
  "earnedPoints": 3240
}
```

---

## 🎁 **Bước 4: Test hệ thống Loyalty**

### **4.1. Xem điểm hiện tại**

**Endpoint:** `GET /api/loyalty/points`

**Response:**

```json
{
  "success": true,
  "data": {
    "availablePoints": 3240,
    "totalEarnedPoints": 3240,
    "totalRedeemedPoints": 0,
    "membershipLevel": "BRONZE"
  }
}
```

### **4.2. Xem promotion có thể đổi bằng điểm**

**Endpoint:** `GET /api/promotions/points`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "promotionId": 1,
      "promotionCode": "SUMMER2024",
      "promotionName": "Khuyến mãi mùa hè",
      "pointsRequired": 500,
      "discountType": "PERCENTAGE",
      "discountValue": 10.0
    }
  ]
}
```

### **4.3. Đổi điểm lấy promotion**

**Endpoint:** `POST /api/promotions/purchase`

**Parameters:**

- `promotionCode`: SUMMER2024

**Response:**

```json
{
  "success": true,
  "message": "Đổi promotion thành công với 500 điểm",
  "data": "USER_SUMMER2024_1234567890"
}
```

---

## 🔧 **Bước 5: Test các tính năng bổ sung**

### **5.1. Xem chi tiết booking**

**Endpoint:** `GET /api/bookings/{bookingId}`

**Parameters:**

- `bookingId`: 1

### **5.2. Xem tóm tắt booking**

**Endpoint:** `GET /api/bookings/{bookingId}/summary`

**Parameters:**

- `bookingId`: 1

### **5.3. Check-in booking**

**Endpoint:** `POST /api/bookings/{bookingId}/checkin`

**Parameters:**

- `bookingId`: 1

### **5.4. Hủy booking**

**Endpoint:** `POST /api/bookings/{bookingId}/cancel`

**Parameters:**

- `bookingId`: 1
- `reason`: "User cancelled"

---

## 🧪 **Bước 6: Test Error Cases**

### **6.1. Test ghế đã được đặt**

1. Tạo booking với ghế [1, 2, 3]
2. Thử tạo booking khác với cùng ghế
3. **Expected:** Lỗi "Ghế đã được đặt"

### **6.2. Test promotion không hợp lệ**

1. Tạo booking
2. Áp dụng promotion code không tồn tại
3. **Expected:** Lỗi "Mã khuyến mãi không hợp lệ"

### **6.3. Test payment sai số tiền**

1. Tạo booking với finalAmount = 324000
2. Thanh toán với paidAmount = 300000
3. **Expected:** Lỗi "Số tiền thanh toán không đúng"

### **6.4. Test booking hết hạn**

1. Tạo booking
2. Đợi 15 phút
3. Thử thanh toán
4. **Expected:** Lỗi "Booking đã hết hạn"

---

## 📊 **Bước 7: Test Analytics**

### **7.1. Xem thống kê booking**

**Endpoint:** `GET /api/bookings/statistics`

**Parameters:**

- `period`: all (hoặc today, week, month)

### **7.2. Xem thống kê promotion**

**Endpoint:** `GET /api/promotions/usage/{promotionId}`

**Parameters:**

- `promotionId`: 1

---

## 🎯 **Checklist Test**

### **✅ Luồng cơ bản:**

- [ ] Login thành công
- [ ] Tạo movie, room, schedule
- [ ] Lấy trạng thái ghế
- [ ] Giữ chỗ tạm thời
- [ ] Tạo booking
- [ ] Thanh toán
- [ ] Nhận điểm thưởng

### **✅ Luồng nâng cao:**

- [ ] Thêm concession
- [ ] Áp dụng promotion
- [ ] Đổi điểm lấy promotion
- [ ] Check-in booking
- [ ] Hủy booking

### **✅ Error handling:**

- [ ] Ghế đã đặt
- [ ] Promotion không hợp lệ
- [ ] Payment sai số tiền
- [ ] Booking hết hạn

### **✅ Analytics:**

- [ ] Thống kê booking
- [ ] Thống kê promotion
- [ ] Lịch sử giao dịch

---

## 🚀 **Tips khi test**

1. **Sử dụng Postman** để test nhanh hơn
2. **Lưu bookingCode** sau khi tạo booking
3. **Test từng bước** một cách tuần tự
4. **Kiểm tra response** kỹ lưỡng
5. **Test cả success và error cases**
6. **Sử dụng different accounts** để test role-based access

---

## 🔍 **Troubleshooting**

### **Lỗi thường gặp:**

1. **401 Unauthorized**
    - Kiểm tra JWT token còn hiệu lực không
    - Login lại để lấy token mới

2. **404 Not Found**
    - Kiểm tra ID của entity có tồn tại không
    - Tạo dữ liệu test trước

3. **400 Bad Request**
    - Kiểm tra format JSON
    - Kiểm tra required fields

4. **500 Internal Server Error**
    - Xem logs trong console
    - Kiểm tra database connection

### **Debug steps:**

1. Kiểm tra server đã start chưa
2. Kiểm tra database có dữ liệu test không
3. Xem logs trong console để debug
4. Test từng endpoint riêng lẻ

---

## 📝 **Ghi chú**

- Tài liệu này dành cho version 1.0.0 của hệ thống
- Cập nhật ngày: 2024-06-01
- Tác giả: Development Team
- Liên hệ: dev@movietheater.com

---

**Happy Testing! 🎉** 