# Schedule Management System

## Tổng quan

Schedule Management System là module quản lý lịch chiếu phim trong hệ thống rạp chiếu phim. Module này cung cấp các tính năng để tạo, quản lý và theo dõi lịch chiếu phim trong các phòng chiếu khác nhau.

## Kiến trúc hệ thống

### Database Schema

```sql
-- Schedule Entity
CREATE TABLE schedules (
    schedule_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    movie_id BIGINT NOT NULL,
    cinema_room_id BIGINT NOT NULL,
    show_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'SCHEDULED',
    is_3d BOOLEAN DEFAULT FALSE,
    is_imax BOOLEAN DEFAULT FALSE,
    is_4dx BOOLEAN DEFAULT FALSE,
    subtitle_language VARCHAR(50) DEFAULT 'Vietnamese',
    audio_language VARCHAR(50) DEFAULT 'Vietnamese',
    available_seats INT DEFAULT 0,
    booked_seats INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id),
    FOREIGN KEY (cinema_room_id) REFERENCES cinema_rooms(cinema_room_id),
    
    INDEX idx_movie_date (movie_id, show_date),
    INDEX idx_room_date (cinema_room_id, show_date),
    INDEX idx_status (status),
    INDEX idx_show_date (show_date),
    INDEX idx_features (is_3d, is_imax, is_4dx)
);
```

### Các thành phần chính

1. **Entity Layer**: `Schedule.java`
2. **Repository Layer**: `ScheduleRepository.java`
3. **Service Layer**: `ScheduleService.java`, `ScheduleServiceImpl.java`
4. **Controller Layer**: `ScheduleController.java`
5. **DTO Layer**: `ScheduleCreateRequest`, `ScheduleUpdateRequest`, `ScheduleResponse`, `ScheduleSummaryResponse`, `BulkScheduleCreateRequest`
6. **Mapper Layer**: `ScheduleMapper.java`

## API Endpoints

### Admin Endpoints (Yêu cầu ADMIN role)

#### 1. Tạo lịch chiếu mới
```http
POST /schedules
Authorization: Bearer {admin_token}
Content-Type: application/json

{
    "movieId": 1,
    "cinemaRoomId": 1,
    "showDate": "2024-12-25",
    "startTime": "14:00",
    "endTime": "16:30",
    "price": 120000.0,
    "status": "SCHEDULED",
    "is3D": true,
    "isIMAX": false,
    "is4DX": false,
    "subtitleLanguage": "Vietnamese",
    "audioLanguage": "Vietnamese"
}
```

#### 2. Tạo nhiều lịch chiếu cùng lúc
```http
POST /schedules/bulk
Authorization: Bearer {admin_token}
Content-Type: application/json

{
    "movieId": 1,
    "timeSlots": [
        {
            "cinemaRoomId": 1,
            "showDate": "2024-12-25",
            "startTime": "09:00",
            "endTime": "11:30",
            "price": 100000.0,
            "is3D": false
        },
        {
            "cinemaRoomId": 1,
            "showDate": "2024-12-25",
            "startTime": "19:00",
            "endTime": "21:30",
            "price": 130000.0,
            "is3D": true
        }
    ]
}
```

#### 3. Cập nhật lịch chiếu
```http
PUT /schedules/{scheduleId}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
    "price": 150000.0,
    "is3D": false,
    "subtitleLanguage": "English"
}
```

#### 4. Quản lý trạng thái lịch chiếu
```http
POST /schedules/{scheduleId}/start      # Bắt đầu chiếu
POST /schedules/{scheduleId}/complete   # Hoàn thành
POST /schedules/{scheduleId}/cancel     # Hủy lịch chiếu
```

#### 5. Quản lý ghế ngồi
```http
POST /schedules/{scheduleId}/book-seats?seatCount=5        # Đặt ghế
POST /schedules/{scheduleId}/cancel-booking?seatCount=2    # Hủy đặt ghế
```

#### 6. Thống kê và báo cáo
```http
GET /schedules/statistics                                   # Thống kê tổng quan
GET /schedules/statistics/date-range?startDate=2024-01-01&endDate=2024-12-31
GET /schedules/revenue?startDate=2024-01-01&endDate=2024-12-31
GET /schedules/occupancy-rate                              # Tỷ lệ lấp đầy trung bình
```

#### 7. Xóa và khôi phục
```http
DELETE /schedules/{scheduleId}          # Xóa (soft delete)
POST /schedules/{scheduleId}/restore    # Khôi phục
```

### Public Endpoints

#### 1. Lấy thông tin lịch chiếu
```http
GET /schedules/{scheduleId}                    # Chi tiết lịch chiếu
GET /schedules?page=0&size=10&sortBy=showDate # Danh sách có phân trang
```

#### 2. Lọc theo phim và phòng chiếu
```http
GET /schedules/movie/{movieId}                 # Lịch chiếu theo phim
GET /schedules/cinema-room/{cinemaRoomId}      # Lịch chiếu theo phòng
GET /schedules/movie/{movieId}/date/{date}     # Phim trong ngày cụ thể
```

#### 3. Lọc theo thời gian
```http
GET /schedules/date/{date}                     # Lịch chiếu trong ngày
GET /schedules/date-range?startDate=2024-01-01&endDate=2024-01-31
GET /schedules/today                           # Lịch chiếu hôm nay
GET /schedules/upcoming                        # Lịch chiếu sắp tới
GET /schedules/past                            # Lịch chiếu đã qua
```

#### 4. Lọc theo tính năng đặc biệt
```http
GET /schedules/features/3d                     # Lịch chiếu 3D
GET /schedules/features/imax                   # Lịch chiếu IMAX
GET /schedules/features/4dx                    # Lịch chiếu 4DX
```

#### 5. Lọc theo trạng thái và điều kiện
```http
GET /schedules/status/{status}                 # Theo trạng thái
GET /schedules/available                       # Có thể đặt vé
GET /schedules/popular?minOccupancyRate=70.0   # Phổ biến
GET /schedules/price-range?minPrice=50000&maxPrice=200000
```

#### 6. Tìm kiếm và ngôn ngữ
```http
GET /schedules/search?keyword=avengers&page=0&size=10
GET /schedules/language/subtitle/{language}    # Theo ngôn ngữ phụ đề
GET /schedules/language/audio/{language}       # Theo ngôn ngữ âm thanh
```

#### 7. Kiểm tra xung đột
```http
GET /schedules/check-conflict?cinemaRoomId=1&showDate=2024-12-25&startTime=14:00&endTime=16:30
```

## Data Models

### ScheduleCreateRequest
```json
{
    "movieId": "Long (required)",
    "cinemaRoomId": "Long (required)",
    "showDate": "LocalDate (required, future date)",
    "startTime": "LocalTime (required)",
    "endTime": "LocalTime (required, after startTime)",
    "price": "Double (required, min 0)",
    "status": "String (optional, default: SCHEDULED)",
    "is3D": "Boolean (optional, default: false)",
    "isIMAX": "Boolean (optional, default: false)",
    "is4DX": "Boolean (optional, default: false)",
    "subtitleLanguage": "String (optional, default: Vietnamese)",
    "audioLanguage": "String (optional, default: Vietnamese)"
}
```

### ScheduleResponse
```json
{
    "scheduleId": "Long",
    "showDate": "LocalDate",
    "startTime": "LocalTime",
    "endTime": "LocalTime",
    "price": "Double",
    "isActive": "Boolean",
    "status": "String",
    "is3D": "Boolean",
    "isIMAX": "Boolean",
    "is4DX": "Boolean",
    "subtitleLanguage": "String",
    "audioLanguage": "String",
    "availableSeats": "Integer",
    "bookedSeats": "Integer",
    "createdAt": "LocalDateTime",
    "updatedAt": "LocalDateTime",
    
    // Movie information
    "movieId": "Long",
    "movieName": "String",
    "moviePoster": "String",
    "movieDuration": "Integer",
    "movieRating": "String",
    "movieGenre": "String",
    
    // Cinema room information
    "cinemaRoomId": "Long",
    "cinemaRoomName": "String",
    "roomType": "String",
    "totalSeats": "Integer",
    "roomPriceMultiplier": "Double",
    
    // Computed fields
    "showDateTime": "LocalDateTime",
    "endDateTime": "LocalDateTime",
    "displayTime": "String",
    "displayDate": "String",
    "isToday": "Boolean",
    "isPast": "Boolean",
    "isFuture": "Boolean",
    "isBookable": "Boolean",
    "occupancyRate": "Double",
    "specialFeatures": "String",
    "statusDisplay": "String",
    "canCancel": "Boolean",
    "canUpdate": "Boolean",
    "canDelete": "Boolean",
    "priceDisplay": "String",
    "durationDisplay": "String"
}
```

### ScheduleStatistics
```json
{
    "totalSchedules": "Long",
    "scheduledCount": "Long",
    "ongoingCount": "Long",
    "completedCount": "Long",
    "cancelledCount": "Long",
    "totalBookedSeats": "Long",
    "totalAvailableSeats": "Long",
    "averageOccupancyRate": "Double",
    "totalRevenue": "Double",
    "schedules3D": "Long",
    "schedulesIMAX": "Long",
    "schedules4DX": "Long",
    "averagePrice": "Double"
}
```

## Business Logic

### Trạng thái lịch chiếu
- **SCHEDULED**: Đã lên lịch, chưa bắt đầu
- **ONGOING**: Đang chiếu
- **COMPLETED**: Đã hoàn thành
- **CANCELLED**: Đã hủy

### Quy tắc nghiệp vụ

1. **Xung đột lịch chiếu**: Không được tạo lịch chiếu trùng thời gian trong cùng phòng
2. **Thời gian hợp lệ**: Giờ kết thúc phải sau giờ bắt đầu
3. **Ngày chiếu**: Chỉ được tạo lịch chiếu cho hôm nay hoặc tương lai
4. **Cập nhật**: Chỉ có thể cập nhật lịch chiếu ở trạng thái SCHEDULED
5. **Hủy lịch**: Chỉ có thể hủy lịch chiếu chưa có khách đặt vé
6. **Xóa lịch**: Chỉ có thể xóa lịch chiếu chưa có khách đặt vé

### Tính toán tự động

1. **Available Seats**: Tự động set bằng số ghế của phòng chiếu
2. **Occupancy Rate**: (Booked Seats / Total Seats) * 100
3. **Special Features**: Tổng hợp các tính năng đặc biệt (3D, IMAX, 4DX)
4. **Display Time**: Format thời gian hiển thị (HH:mm)
5. **Price Display**: Format giá tiền theo locale Việt Nam

## Security và Authorization

### Role-based Access Control
- **ADMIN**: Toàn quyền quản lý lịch chiếu
- **EMPLOYEE**: Có thể đặt/hủy ghế
- **PUBLIC**: Chỉ xem thông tin lịch chiếu

### Validation
- Input validation với Bean Validation
- Business rule validation trong service layer
- Authorization check với Spring Security

## Performance Optimizations

### Database Indexing
```sql
-- Indexes for common queries
INDEX idx_movie_date (movie_id, show_date)
INDEX idx_room_date (cinema_room_id, show_date)
INDEX idx_status (status)
INDEX idx_show_date (show_date)
INDEX idx_features (is_3d, is_imax, is_4dx)
```

### Caching Strategy
- Cache thông tin phim và phòng chiếu
- Cache kết quả tìm kiếm phổ biến
- Cache thống kê theo ngày

### Query Optimization
- Sử dụng pagination cho danh sách lớn
- Lazy loading cho relationships
- Projection queries cho summary data

## Testing

### Chạy test suite
```bash
chmod +x test-schedule-api.sh
./test-schedule-api.sh
```

### Test Coverage
- **40 test cases** bao phủ toàn bộ functionality
- Authentication và authorization testing
- CRUD operations testing
- Business logic validation
- Error handling testing
- Performance testing

### Test Categories
1. **Authentication Tests**: Login, token validation
2. **CRUD Tests**: Create, read, update, delete schedules
3. **Search & Filter Tests**: Various filtering options
4. **Business Logic Tests**: Conflict detection, validation
5. **Authorization Tests**: Role-based access control
6. **Error Handling Tests**: Invalid inputs, edge cases

## Troubleshooting

### Common Issues

#### 1. Schedule Conflict Error
```
Error: "Phòng chiếu đã có lịch chiếu trong khoảng thời gian này"
Solution: Kiểm tra lịch chiếu hiện tại của phòng, điều chỉnh thời gian
```

#### 2. Invalid Time Range
```
Error: "Giờ kết thúc phải sau giờ bắt đầu"
Solution: Đảm bảo endTime > startTime
```

#### 3. Past Date Schedule
```
Error: "Ngày chiếu phải là hôm nay hoặc trong tương lai"
Solution: Chỉ tạo lịch chiếu cho ngày hiện tại hoặc tương lai
```

#### 4. Cannot Update Schedule
```
Error: "Chỉ có thể cập nhật lịch chiếu ở trạng thái 'Đã lên lịch'"
Solution: Chỉ update schedules với status = SCHEDULED
```

### Monitoring

#### Health Checks
```bash
curl http://localhost:8080/cinema/actuator/health
```

#### Performance Metrics
- Response time cho các API endpoints
- Database query performance
- Memory usage
- Cache hit rates

## Usage Examples

### Tạo lịch chiếu cho một bộ phim
```bash
# 1. Tạo lịch chiếu đơn lẻ
curl -X POST http://localhost:8080/cinema/schedules \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "movieId": 1,
    "cinemaRoomId": 1,
    "showDate": "2024-12-25",
    "startTime": "14:00",
    "endTime": "16:30",
    "price": 120000.0,
    "is3D": true
  }'

# 2. Tạo nhiều lịch chiếu cùng lúc
curl -X POST http://localhost:8080/cinema/schedules/bulk \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "movieId": 1,
    "timeSlots": [
      {
        "cinemaRoomId": 1,
        "showDate": "2024-12-25",
        "startTime": "09:00",
        "endTime": "11:30",
        "price": 100000.0
      },
      {
        "cinemaRoomId": 2,
        "showDate": "2024-12-25",
        "startTime": "14:00",
        "endTime": "16:30",
        "price": 120000.0,
        "is3D": true
      }
    ]
  }'
```

### Tìm lịch chiếu phù hợp
```bash
# Tìm lịch chiếu 3D hôm nay
curl "http://localhost:8080/cinema/schedules/features/3d"

# Tìm lịch chiếu của phim cụ thể
curl "http://localhost:8080/cinema/schedules/movie/1"

# Tìm lịch chiếu trong khoảng giá
curl "http://localhost:8080/cinema/schedules/price-range?minPrice=50000&maxPrice=150000"
```

### Quản lý lịch chiếu
```bash
# Bắt đầu chiếu phim
curl -X POST "http://localhost:8080/cinema/schedules/1/start" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Đặt ghế
curl -X POST "http://localhost:8080/cinema/schedules/1/book-seats?seatCount=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Xem thống kê
curl "http://localhost:8080/cinema/schedules/statistics" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Integration với các modules khác

### Movie Management
- Lấy thông tin phim để hiển thị trong lịch chiếu
- Validate movie tồn tại khi tạo schedule

### Cinema Room Management  
- Lấy thông tin phòng chiếu và số ghế
- Validate room availability

### Booking Management (Future)
- Cung cấp lịch chiếu available cho booking
- Update seat counts khi có booking mới

## Future Enhancements

1. **Real-time Updates**: WebSocket cho cập nhật real-time
2. **Advanced Scheduling**: Recurring schedules, templates
3. **Dynamic Pricing**: Giá vé thay đổi theo demand
4. **Seat Selection**: Integration với seat layout
5. **Notification System**: Thông báo thay đổi lịch chiếu
6. **Analytics Dashboard**: Báo cáo chi tiết và visualization

---

**Tác giả**: Dũng_Solo  
**Phiên bản**: 1.0.0  
**Cập nhật lần cuối**: December 2024 