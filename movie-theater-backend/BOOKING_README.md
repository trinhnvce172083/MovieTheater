# BOOKING MANAGEMENT SYSTEM

## Tổng quan

Booking Management System là module quản lý đặt vé xem phim trong hệ thống Movie Theater Management. Module này cung cấp đầy đủ chức năng để quản lý việc đặt vé từ khách hàng, xử lý thanh toán, check-in và các thống kê liên quan.

## Kiến trúc hệ thống

### 1. Database Schema

```sql
-- Booking Table
CREATE TABLE bookings (
    booking_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_code VARCHAR(50) UNIQUE NOT NULL,
    booking_date DATETIME NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.0,
    final_amount DECIMAL(10,2) NOT NULL,
    booking_status ENUM('PENDING', 'CONFIRMED', 'PAID', 'COMPLETED', 'CANCELLED') NOT NULL,
    payment_method VARCHAR(20),
    payment_date DATETIME,
    payment_reference VARCHAR(100),
    seat_count INT NOT NULL,
    notes TEXT,
    cancellation_date DATETIME,
    cancellation_reason TEXT,
    refund_amount DECIMAL(10,2) DEFAULT 0.0,
    qr_code VARCHAR(100) UNIQUE,
    is_checked_in BOOLEAN DEFAULT FALSE,
    check_in_time DATETIME,
    
    -- Customer information (for guest bookings)
    customer_name VARCHAR(100),
    customer_email VARCHAR(100),
    customer_phone VARCHAR(15),
    
    -- Foreign keys
    schedule_id BIGINT NOT NULL,
    account_id BIGINT,
    promotion_id BIGINT,
    
    -- Audit fields
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id),
    FOREIGN KEY (account_id) REFERENCES accounts(account_id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(promotion_id)
);

-- BookingSeat Table
CREATE TABLE booking_seats (
    booking_seat_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    seat_id BIGINT NOT NULL,
    seat_price DECIMAL(10,2) NOT NULL,
    seat_type VARCHAR(20),
    seat_number VARCHAR(10),
    
    -- Audit fields
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    FOREIGN KEY (seat_id) REFERENCES seats(seat_id)
);

-- Indexes for performance
CREATE INDEX idx_bookings_code ON bookings(booking_code);
CREATE INDEX idx_bookings_schedule ON bookings(schedule_id);
CREATE INDEX idx_bookings_account ON bookings(account_id);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX idx_bookings_customer_phone ON bookings(customer_phone);
CREATE INDEX idx_bookings_qr_code ON bookings(qr_code);
CREATE INDEX idx_booking_seats_booking ON booking_seats(booking_id);
CREATE INDEX idx_booking_seats_seat ON booking_seats(seat_id);
```

### 2. Entity Relationships

```
Booking (1) ←→ (N) BookingSeat
Booking (N) ←→ (1) Schedule
Booking (N) ←→ (1) Account (optional)
Booking (N) ←→ (1) Promotion (optional)
BookingSeat (N) ←→ (1) Seat
```

## API Endpoints

### Admin Endpoints (Yêu cầu ADMIN/EMPLOYEE role)

#### 1. Quản lý Booking
- `POST /api/bookings/admin` - Tạo booking (admin)
- `PUT /api/bookings/admin/{bookingId}` - Cập nhật booking
- `DELETE /api/bookings/admin/{bookingId}` - Xóa booking (soft delete)
- `POST /api/bookings/admin/{bookingId}/restore` - Khôi phục booking đã xóa

#### 2. Xử lý Booking
- `POST /api/bookings/admin/{bookingId}/confirm` - Xác nhận booking
- `POST /api/bookings/admin/payment` - Xử lý thanh toán
- `POST /api/bookings/admin/{bookingId}/cancel` - Hủy booking
- `POST /api/bookings/admin/check-in` - Check-in booking

#### 3. Khuyến mãi
- `POST /api/bookings/admin/{bookingId}/promotion` - Áp dụng khuyến mãi
- `DELETE /api/bookings/admin/{bookingId}/promotion` - Xóa khuyến mãi

#### 4. Hoàn tiền
- `POST /api/bookings/admin/{bookingId}/refund` - Xử lý hoàn tiền
- `GET /api/bookings/admin/refunds` - Danh sách booking cần hoàn tiền

#### 5. Thống kê và báo cáo
- `GET /api/bookings/admin/statistics` - Thống kê tổng quan
- `GET /api/bookings/admin/statistics/date-range` - Thống kê theo khoảng thời gian
- `GET /api/bookings/admin/revenue` - Doanh thu theo khoảng thời gian
- `GET /api/bookings/admin/revenue/payment-method` - Doanh thu theo phương thức thanh toán
- `GET /api/bookings/admin/average-amount` - Giá trị booking trung bình

#### 6. Quản lý hệ thống
- `POST /api/bookings/admin/cleanup-expired` - Dọn dẹp booking hết hạn
- `GET /api/bookings/check-in` - Danh sách booking có thể check-in

### Public Endpoints

#### 1. Tạo booking
- `POST /api/bookings/guest` - Tạo booking khách vãng lai
- `POST /api/bookings/member` - Tạo booking thành viên (yêu cầu CUSTOMER role)

#### 2. Truy vấn booking
- `GET /api/bookings/{bookingId}` - Chi tiết booking theo ID
- `GET /api/bookings/code/{bookingCode}` - Chi tiết booking theo mã
- `GET /api/bookings` - Danh sách tất cả booking (có phân trang)

#### 3. Truy vấn theo điều kiện
- `GET /api/bookings/account/{accountId}` - Booking theo tài khoản
- `GET /api/bookings/schedule/{scheduleId}` - Booking theo lịch chiếu
- `GET /api/bookings/status/{status}` - Booking theo trạng thái
- `GET /api/bookings/date-range` - Booking theo khoảng thời gian
- `GET /api/bookings/customer/email/{email}` - Booking theo email khách hàng
- `GET /api/bookings/customer/phone/{phone}` - Booking theo số điện thoại
- `GET /api/bookings/payment-method/{method}` - Booking theo phương thức thanh toán

#### 4. Tìm kiếm và lọc
- `GET /api/bookings/search` - Tìm kiếm booking theo từ khóa
- `GET /api/bookings/today` - Booking hôm nay
- `GET /api/bookings/upcoming` - Booking sắp tới
- `GET /api/bookings/movie/{movieId}` - Booking theo phim
- `GET /api/bookings/cinema-room/{roomId}` - Booking theo phòng chiếu

#### 5. Quản lý ghế
- `GET /api/bookings/schedule/{scheduleId}/available-seats` - Ghế trống
- `GET /api/bookings/schedule/{scheduleId}/booked-seats` - Ghế đã đặt
- `POST /api/bookings/schedule/{scheduleId}/check-seats` - Kiểm tra ghế có sẵn

#### 6. QR Code
- `POST /api/bookings/{bookingId}/generate-qr` - Tạo QR code
- `POST /api/bookings/validate-qr` - Xác thực QR code

#### 7. Thanh toán và hủy (Guest)
- `POST /api/bookings/payment/guest` - Thanh toán booking khách vãng lai
- `POST /api/bookings/{bookingId}/cancel/guest` - Hủy booking khách vãng lai

## Data Models

### 1. Request DTOs

#### BookingCreateRequest
```json
{
  "scheduleId": 1,
  "selectedSeats": [
    {
      "seatId": 1,
      "seatPrice": 100000.0,
      "seatType": "STANDARD"
    }
  ],
  "customerName": "Nguyễn Văn A",
  "customerEmail": "customer@example.com",
  "customerPhone": "0123456789",
  "promotionCode": "DISCOUNT10",
  "notes": "Ghi chú đặt vé",
  "preferredPaymentMethod": "CASH"
}
```

#### PaymentRequest
```json
{
  "bookingCode": "BK1234567890",
  "paymentMethod": "CARD",
  "paidAmount": 200000.0,
  "paymentReference": "TXN123456",
  "cardNumber": "1234567890123456",
  "cardHolderName": "NGUYEN VAN A",
  "expiryDate": "12/25",
  "cvv": "123"
}
```

### 2. Response DTOs

#### BookingResponse
```json
{
  "bookingId": 1,
  "bookingCode": "BK1234567890",
  "bookingDate": "2024-01-15T10:30:00",
  "totalAmount": 200000.0,
  "discountAmount": 20000.0,
  "finalAmount": 180000.0,
  "bookingStatus": "PAID",
  "paymentMethod": "CARD",
  "seatCount": 2,
  "qrCode": "QR1234567890ABCD",
  "isCheckedIn": false,
  
  "customerName": "Nguyễn Văn A",
  "customerEmail": "customer@example.com",
  "customerPhone": "0123456789",
  "isGuestBooking": true,
  
  "scheduleId": 1,
  "showDate": "2024-01-20",
  "startTime": "19:00:00",
  "endTime": "21:30:00",
  
  "movieId": 1,
  "movieName": "Avengers: Endgame",
  "moviePoster": "poster.jpg",
  "movieDuration": 150,
  
  "cinemaRoomId": 1,
  "cinemaRoomName": "Phòng 1",
  "roomType": "STANDARD",
  
  "bookedSeats": [
    {
      "seatId": 1,
      "seatNumber": "A1",
      "seatType": "STANDARD",
      "seatPrice": 100000.0,
      "rowName": "A",
      "columnNumber": 1
    }
  ],
  
  "displayBookingDate": "15/01/2024 10:30",
  "displayShowDate": "20/01/2024",
  "displayShowTime": "19:00",
  "statusDisplay": "Đã thanh toán",
  "canBeCancelled": false,
  "canBeCheckedIn": true,
  "finalAmountDisplay": "180.000 ₫"
}
```

## Business Logic

### 1. Booking Status Workflow

```
PENDING → CONFIRMED → PAID → COMPLETED
    ↓
CANCELLED (có thể từ PENDING hoặc CONFIRMED)
```

### 2. Validation Rules

#### Tạo Booking
- Schedule phải tồn tại và có thể đặt vé
- Ghế phải còn trống
- Thông tin khách hàng đầy đủ (cho guest booking)
- Số lượng ghế > 0

#### Thanh toán
- Booking phải ở trạng thái PENDING hoặc CONFIRMED
- Số tiền thanh toán phải khớp với finalAmount
- Thông tin thanh toán hợp lệ theo phương thức

#### Hủy Booking
- Chỉ hủy được booking ở trạng thái PENDING hoặc CONFIRMED
- Không hủy được booking đã check-in
- Phải có lý do hủy

#### Check-in
- Booking phải ở trạng thái PAID
- Chưa check-in trước đó
- Trong ngày chiếu và trước giờ chiếu

### 3. Business Methods

#### Booking Entity
```java
// Status checks
public boolean isPending()
public boolean isConfirmed()
public boolean isPaid()
public boolean isCompleted()
public boolean isCancelled()

// Business logic
public boolean canBeCancelled()
public boolean canBeCheckedIn()
public boolean isGuestBooking()
public boolean isMemberBooking()

// Actions
public void confirmPayment(String method, String reference)
public void cancel(String reason)
public void checkIn()
public void applyDiscount(Double amount)

// Display methods
public String getCustomerDisplayName()
public String getCustomerDisplayEmail()
public String getCustomerDisplayPhone()
public Double getDiscountPercentage()
```

## Security

### 1. Role-based Access Control

- **ADMIN**: Toàn quyền truy cập tất cả endpoints
- **EMPLOYEE**: Truy cập các chức năng quản lý booking, không thể xóa
- **CUSTOMER**: Chỉ truy cập booking của chính mình
- **PUBLIC**: Tạo guest booking, xem thông tin công khai

### 2. Data Protection

- Thông tin thanh toán được mã hóa
- QR code unique và secure
- Soft delete cho audit trail
- Validation đầu vào nghiêm ngặt

## Performance Optimizations

### 1. Database Indexing

- Composite indexes cho các truy vấn phổ biến
- Index trên booking_code, schedule_id, account_id
- Partial indexes cho active records

### 2. Caching Strategy

- Cache available seats cho mỗi schedule
- Cache booking statistics
- Redis cho session management

### 3. Query Optimization

- Pagination cho tất cả list endpoints
- Lazy loading cho relationships
- Projection queries cho summary responses

## Testing

### 1. Test Coverage

Script `test-booking-api.sh` bao gồm 50 test cases:

#### Functional Tests (1-30)
- Health check và authentication
- CRUD operations
- Business workflows (confirm, payment, check-in)
- Search và filtering
- QR code generation/validation

#### Integration Tests (31-40)
- Cross-module integration
- Statistics và reporting
- Seat management
- Date range queries

#### Error Handling Tests (41-50)
- Invalid data validation
- Business rule violations
- Security access control
- Edge cases

### 2. Test Execution

```bash
# Make script executable
chmod +x test-booking-api.sh

# Run all tests
./test-booking-api.sh

# Run with verbose output
./test-booking-api.sh -v
```

## Monitoring và Logging

### 1. Application Logs

```java
// Service layer logging
log.info("Creating booking for schedule: {}", scheduleId);
log.warn("Seat conflict detected for seats: {}", seatIds);
log.error("Payment processing failed: {}", error);
```

### 2. Metrics

- Booking creation rate
- Payment success rate
- Check-in completion rate
- Average booking value
- Seat occupancy rate

### 3. Alerts

- Failed payment processing
- High booking cancellation rate
- System errors
- Performance degradation

## Deployment

### 1. Environment Configuration

```yaml
# application.yml
booking:
  expiration-minutes: 15
  max-seats-per-booking: 10
  payment-timeout-minutes: 30
  
payment:
  enabled-methods: [CASH, CARD, ONLINE, WALLET]
  card-validation: true
  
qr-code:
  expiry-hours: 24
  encryption-key: ${QR_ENCRYPTION_KEY}
```

### 2. Database Migration

```sql
-- V5__Create_Booking_Tables.sql
-- Migration scripts cho booking tables
-- Indexes và constraints
-- Initial data setup
```

## Troubleshooting

### 1. Common Issues

#### Seat Conflict Errors
```
Lỗi: "Một hoặc nhiều ghế đã được đặt"
Giải pháp: Kiểm tra real-time seat availability
```

#### Payment Processing Failures
```
Lỗi: "Số tiền thanh toán không khớp"
Giải pháp: Refresh booking data trước khi thanh toán
```

#### QR Code Validation Errors
```
Lỗi: "QR code không hợp lệ"
Giải pháp: Kiểm tra expiry time và format
```

### 2. Performance Issues

#### Slow Booking Creation
- Kiểm tra database connections
- Optimize seat availability queries
- Review transaction boundaries

#### High Memory Usage
- Check for memory leaks in seat caching
- Optimize large result sets
- Review pagination settings

## Future Enhancements

### 1. Planned Features

- **Real-time Seat Selection**: WebSocket cho seat selection
- **Mobile App Integration**: Push notifications
- **Advanced Analytics**: ML-based demand prediction
- **Multi-language Support**: i18n cho messages

### 2. Technical Improvements

- **Microservices Architecture**: Split booking service
- **Event Sourcing**: Audit trail improvements
- **CQRS Pattern**: Separate read/write models
- **GraphQL API**: Flexible data fetching

## API Documentation

Swagger UI có sẵn tại: `http://localhost:8080/swagger-ui.html`

### Sample API Calls

#### Tạo Guest Booking
```bash
curl -X POST "http://localhost:8080/api/bookings/guest" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduleId": 1,
    "selectedSeats": [
      {"seatId": 1, "seatPrice": 100000.0}
    ],
    "customerName": "Nguyễn Văn A",
    "customerEmail": "customer@example.com",
    "customerPhone": "0123456789"
  }'
```

#### Xử lý Thanh toán
```bash
curl -X POST "http://localhost:8080/api/bookings/payment/guest" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingCode": "BK1234567890",
    "paymentMethod": "CASH",
    "paidAmount": 100000.0,
    "paymentReference": "CASH-001"
  }'
```

---

**Tác giả**: Dũng_Solo  
**Phiên bản**: 1.0.0  
 