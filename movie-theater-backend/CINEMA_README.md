# Cinema Room Management System

## Tổng quan

Cinema Room Management System là module quản lý phòng chiếu và ghế ngồi trong hệ thống rạp chiếu phim. Module này cung cấp các tính năng quản lý phòng chiếu, sơ đồ ghế, và các loại phòng chiếu khác nhau.

## Kiến trúc hệ thống

### 1. Database Schema

#### CinemaRoom Entity
```sql
CREATE TABLE movietheater_cinema_room (
    cinema_room_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cinema_room_name VARCHAR(50) NOT NULL UNIQUE,
    seat_quantity INT NOT NULL,
    room_type VARCHAR(20) DEFAULT 'STANDARD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    row_count INT NOT NULL,
    column_count INT NOT NULL,
    has_3d BOOLEAN NOT NULL DEFAULT FALSE,
    has_dolby_atmos BOOLEAN NOT NULL DEFAULT FALSE,
    has_recliner_seats BOOLEAN NOT NULL DEFAULT FALSE,
    price_multiplier DOUBLE NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Seat Entity
```sql
CREATE TABLE movietheater_seat (
    seat_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    seat_number VARCHAR(10) NOT NULL,
    seat_row INT NOT NULL,
    seat_column INT NOT NULL,
    seat_status ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
    seat_type VARCHAR(20) DEFAULT 'STANDARD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    price_multiplier DOUBLE NOT NULL DEFAULT 1.0,
    is_recliner BOOLEAN NOT NULL DEFAULT FALSE,
    has_table BOOLEAN NOT NULL DEFAULT FALSE,
    cinema_room_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cinema_room_id) REFERENCES movietheater_cinema_room(cinema_room_id),
    UNIQUE KEY unique_seat_position (cinema_room_id, seat_row, seat_column)
);
```

### 2. Enums

#### Room Types
- `STANDARD`: Phòng chiếu tiêu chuẩn
- `VIP`: Phòng chiếu VIP cao cấp
- `IMAX`: Phòng chiếu IMAX
- `4DX`: Phòng chiếu 4DX với hiệu ứng đặc biệt

#### Seat Types
- `STANDARD`: Ghế tiêu chuẩn
- `VIP`: Ghế VIP cao cấp
- `COUPLE`: Ghế đôi
- `WHEELCHAIR`: Ghế dành cho người khuyết tật

#### Seat Status
- `AVAILABLE`: Ghế trống, có thể đặt
- `OCCUPIED`: Ghế đã được đặt
- `MAINTENANCE`: Ghế đang bảo trì

## API Endpoints

### Admin Endpoints (Yêu cầu ADMIN role)

#### 1. Tạo phòng chiếu mới
```http
POST /cinema-rooms
Authorization: Bearer {admin_token}
Content-Type: application/json

{
    "cinemaRoomName": "Room A1",
    "seatQuantity": 100,
    "roomType": "STANDARD",
    "description": "Standard cinema room with comfortable seating",
    "rows": 10,
    "columns": 10,
    "has3D": true,
    "hasDolbyAtmos": false,
    "hasReclinerSeats": false,
    "priceMultiplier": 1.0
}
```

#### 2. Cập nhật phòng chiếu
```http
PUT /cinema-rooms/{cinemaRoomId}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
    "description": "Updated description",
    "hasDolbyAtmos": true,
    "priceMultiplier": 1.2
}
```

#### 3. Xóa phòng chiếu (Soft delete)
```http
DELETE /cinema-rooms/{cinemaRoomId}
Authorization: Bearer {admin_token}
```

#### 4. Khôi phục phòng chiếu
```http
POST /cinema-rooms/{cinemaRoomId}/restore
Authorization: Bearer {admin_token}
```

#### 5. Tạo sơ đồ ghế mặc định
```http
POST /cinema-rooms/{cinemaRoomId}/seats/generate
Authorization: Bearer {admin_token}
```

#### 6. Tạo sơ đồ ghế tùy chỉnh
```http
POST /cinema-rooms/seats/layout
Authorization: Bearer {admin_token}
Content-Type: application/json

{
    "cinemaRoomId": 1,
    "seats": [
        {
            "seatRow": 1,
            "seatColumn": 1,
            "seatType": "WHEELCHAIR",
            "priceMultiplier": 1.0
        },
        {
            "seatRow": 10,
            "seatColumn": 5,
            "seatType": "VIP",
            "isRecliner": true,
            "priceMultiplier": 1.5
        }
    ]
}
```

#### 7. Reset sơ đồ ghế
```http
POST /cinema-rooms/{cinemaRoomId}/seats/reset
Authorization: Bearer {admin_token}
```

#### 8. Thống kê phòng chiếu
```http
GET /cinema-rooms/statistics
Authorization: Bearer {admin_token}
```

### Public Endpoints

#### 1. Lấy thông tin chi tiết phòng chiếu
```http
GET /cinema-rooms/{cinemaRoomId}
```

#### 2. Lấy danh sách phòng chiếu (có phân trang)
```http
GET /cinema-rooms?page=0&size=10&sortBy=cinemaRoomName&sortDir=asc
```

#### 3. Tìm kiếm phòng chiếu
```http
GET /cinema-rooms/search?keyword=Room&page=0&size=10
```

#### 4. Lấy phòng chiếu theo loại
```http
GET /cinema-rooms/type/STANDARD
GET /cinema-rooms/type/VIP
GET /cinema-rooms/type/IMAX
GET /cinema-rooms/type/4DX
```

#### 5. Lấy phòng chiếu theo tính năng
```http
GET /cinema-rooms/features/3d
GET /cinema-rooms/features/dolby-atmos
GET /cinema-rooms/features/recliner
```

#### 6. Lấy phòng chiếu cao cấp
```http
GET /cinema-rooms/premium
```

#### 7. Lấy phòng chiếu theo số ghế
```http
GET /cinema-rooms/seats-range?minSeats=50&maxSeats=150
```

#### 8. Lấy phòng chiếu trống
```http
GET /cinema-rooms/available?showDate=2024-01-15&startTime=14:00&endTime=16:30
```

#### 9. Lấy phòng chiếu theo sức chứa
```http
GET /cinema-rooms/capacity?ascending=false
```

#### 10. Kiểm tra tên phòng chiếu
```http
GET /cinema-rooms/check-name?cinemaRoomName=Room A1
```

#### 11. Lấy sơ đồ ghế
```http
GET /cinema-rooms/{cinemaRoomId}/seats
```

#### 12. Lấy danh sách ghế (có phân trang)
```http
GET /cinema-rooms/{cinemaRoomId}/seats/paginated?page=0&size=20
```

## Data Models

### CinemaRoomCreateRequest
```json
{
    "cinemaRoomName": "string (required, max 50 chars)",
    "seatQuantity": "integer (required, 1-500)",
    "roomType": "string (STANDARD|VIP|IMAX|4DX)",
    "description": "string (max 1000 chars)",
    "rows": "integer (required, 1-30)",
    "columns": "integer (required, 1-50)",
    "has3D": "boolean",
    "hasDolbyAtmos": "boolean",
    "hasReclinerSeats": "boolean",
    "priceMultiplier": "double (0.1-10.0)"
}
```

### CinemaRoomResponse
```json
{
    "cinemaRoomId": "long",
    "cinemaRoomName": "string",
    "seatQuantity": "integer",
    "roomType": "string",
    "isActive": "boolean",
    "description": "string",
    "rows": "integer",
    "columns": "integer",
    "has3D": "boolean",
    "hasDolbyAtmos": "boolean",
    "hasReclinerSeats": "boolean",
    "priceMultiplier": "double",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "displayName": "string",
    "isVIP": "boolean",
    "isIMAX": "boolean",
    "is4DX": "boolean",
    "isPremium": "boolean",
    "availableSeats": "integer",
    "occupiedSeats": "integer",
    "maintenanceSeats": "integer",
    "scheduleCount": "integer"
}
```

### SeatResponse
```json
{
    "seatId": "long",
    "seatNumber": "string",
    "seatRow": "integer",
    "seatColumn": "integer",
    "seatStatus": "enum",
    "seatType": "string",
    "isActive": "boolean",
    "priceMultiplier": "double",
    "isRecliner": "boolean",
    "hasTable": "boolean",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "cinemaRoomId": "long",
    "cinemaRoomName": "string",
    "rowLetter": "string",
    "displayName": "string",
    "isAvailable": "boolean",
    "isOccupied": "boolean",
    "isMaintenance": "boolean",
    "isVIP": "boolean",
    "isCouple": "boolean",
    "isWheelchair": "boolean",
    "isPremium": "boolean"
}
```

## Business Logic

### 1. Seat Layout Generation

#### Default Layout Rules:
- Ghế được đánh số theo format: A1, A2, B1, B2, ...
- Hàng đầu (row 1) dành cho ghế wheelchair
- 2 hàng cuối của phòng IMAX/4DX là ghế VIP
- Toàn bộ phòng VIP đều là ghế VIP
- Ghế VIP có price multiplier = 1.5
- Ghế couple có price multiplier = 1.3

#### Custom Layout:
- Admin có thể tạo sơ đồ ghế tùy chỉnh
- Vị trí ghế phải nằm trong kích thước phòng
- Mỗi vị trí chỉ có thể có 1 ghế

### 2. Price Calculation

```java
// Room price multiplier
double roomPrice = basePrice * room.getPriceMultiplier();

// Seat price multiplier
double finalPrice = roomPrice * seat.getPriceMultiplier();
```

### 3. Availability Check

Phòng chiếu được coi là trống khi:
- Không có lịch chiếu nào trong khoảng thời gian yêu cầu
- Phòng đang hoạt động (isActive = true)

## Security & Authorization

### Role-based Access Control:
- **ADMIN**: Toàn quyền quản lý phòng chiếu và ghế
- **EMPLOYEE**: Chỉ đọc thông tin phòng chiếu
- **CUSTOMER**: Chỉ đọc thông tin phòng chiếu và ghế
- **Public**: Truy cập các endpoint công khai

### Validation Rules:
- Tên phòng chiếu phải duy nhất
- Số lượng ghế phải khớp với kích thước phòng
- Price multiplier phải trong khoảng 0.1 - 10.0
- Vị trí ghế phải hợp lệ

## Testing

### Chạy test script:
```bash
chmod +x test-cinema-api.sh
./test-cinema-api.sh
```

### Test Cases (30 tests):
1. Health Check
2. Admin Authentication
3. Create Cinema Room
4. Get Cinema Room by ID
5. Get All Cinema Rooms
6. Create VIP Cinema Room
7. Search Cinema Rooms
8. Get Cinema Rooms by Type
9. Get Premium Cinema Rooms
10. Get Cinema Rooms with 3D
11. Get Cinema Rooms with Dolby Atmos
12. Get Cinema Rooms with Recliner Seats
13. Get Cinema Rooms by Seats Range
14. Get Available Cinema Rooms
15. Get Cinema Rooms by Capacity
16. Check Cinema Room Name Exists
17. Get Seat Layout
18. Get Seats with Pagination
19. Generate Default Seat Layout
20. Create Custom Seat Layout
21. Reset Seat Layout
22. Update Cinema Room
23. Get Cinema Room Statistics
24. Unauthorized Access Test
25. Invalid Cinema Room ID
26. Duplicate Cinema Room Name
27. Invalid Seat Layout
28. Delete Cinema Room
29. Restore Cinema Room
30. Validation Test

## Performance Optimizations

### 1. Database Indexing:
```sql
-- Indexes for better performance
CREATE INDEX idx_cinema_room_name ON movietheater_cinema_room(cinema_room_name);
CREATE INDEX idx_cinema_room_type ON movietheater_cinema_room(room_type);
CREATE INDEX idx_cinema_room_active ON movietheater_cinema_room(is_active);
CREATE INDEX idx_seat_room_position ON movietheater_seat(cinema_room_id, seat_row, seat_column);
CREATE INDEX idx_seat_status ON movietheater_seat(seat_status);
```

### 2. Caching Strategy:
- Cache seat layout cho mỗi phòng chiếu
- Cache thống kê phòng chiếu
- Cache danh sách phòng chiếu theo loại

### 3. Pagination:
- Tất cả list endpoints đều hỗ trợ pagination
- Default page size: 10-20 items
- Maximum page size: 100 items

## Error Handling

### Common Error Codes:
- `400 Bad Request`: Dữ liệu không hợp lệ
- `401 Unauthorized`: Chưa đăng nhập
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy phòng chiếu
- `409 Conflict`: Tên phòng chiếu đã tồn tại
- `500 Internal Server Error`: Lỗi server

### Error Response Format:
```json
{
    "success": false,
    "message": "Error message in Vietnamese",
    "data": null,
    "timestamp": "2024-01-15T10:30:00Z"
}
```

## Usage Examples

### 1. Tạo phòng chiếu IMAX:
```bash
curl -X POST http://localhost:8080/cinema/cinema-rooms \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cinemaRoomName": "IMAX Theater 1",
    "seatQuantity": 200,
    "roomType": "IMAX",
    "description": "Premium IMAX theater with state-of-the-art technology",
    "rows": 15,
    "columns": 15,
    "has3D": true,
    "hasDolbyAtmos": true,
    "hasReclinerSeats": false,
    "priceMultiplier": 2.5
  }'
```

### 2. Tìm phòng chiếu trống:
```bash
curl "http://localhost:8080/cinema/cinema-rooms/available?showDate=2024-01-20&startTime=19:00&endTime=21:30"
```

### 3. Lấy sơ đồ ghế:
```bash
curl "http://localhost:8080/cinema/cinema-rooms/1/seats"
```

## Troubleshooting

### Common Issues:

1. **Seat layout generation fails**
   - Check if cinema room exists and is active
   - Verify rows and columns are valid
   - Ensure seat quantity matches room dimensions

2. **Duplicate cinema room name**
   - Cinema room names must be unique
   - Check existing rooms before creating new ones

3. **Invalid seat position**
   - Seat row/column must be within room dimensions
   - Cannot place multiple seats at same position

4. **Authorization errors**
   - Ensure valid JWT token
   - Check user role permissions
   - Verify token expiration

## Next Steps

Sau khi hoàn thành Cinema Room Management, có thể tiếp tục phát triển:

1. **Schedule Management**: Quản lý lịch chiếu phim
2. **Booking Management**: Quản lý đặt vé
3. **Payment Integration**: Tích hợp thanh toán
4. **Notification System**: Hệ thống thông báo
5. **Analytics Dashboard**: Dashboard thống kê và báo cáo 