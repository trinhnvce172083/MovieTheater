# Hệ Thống Tự Động Tạo Lịch Chiếu Phim

## 📖 Tổng Quan

Hệ thống tự động tạo lịch chiếu phim là một tính năng thông minh giúp tự động tạo lịch chiếu cho tất cả phim đang chiếu (NOW_SHOWING) trong 3 ngày tiếp theo. Hệ thống sẽ tự động chạy hàng ngày và đảm bảo luôn có đủ lịch chiếu cho khách hàng đặt vé trước.

## ✨ Tính Năng Chính

### 🤖 Tự Động Tạo Lịch
- **Tự động hàng ngày**: Chạy vào 1:00 AM mỗi ngày
- **Đảm bảo 3 ngày trước**: Luôn có lịch chiếu cho 3 ngày tiếp theo
- **Thông minh**: Tự động chọn khung giờ và phòng chiếu phù hợp
- **Tránh xung đột**: Kiểm tra và tránh trùng lập lịch chiếu

### 🏢 Tự Động Tạo Phòng Chiếu
- **Phát hiện thiếu hụt**: Tự động phát hiện khi cần thêm phòng
- **Đa dạng loại phòng**: STANDARD, VIP, IMAX, 4DX
- **Cấu hình thông minh**: Tự động cấu hình số ghế và tính năng

### ⏰ Giờ Chiếu Chuẩn
- **Theo rạp lớn**: Giờ chiếu tham khảo CGV, Lotte, Galaxy
- **Khung giờ vàng**: Ưu tiên 14:30, 16:30, 19:00, 21:00
- **Linh hoạt**: Từ 8:00 sáng đến 23:00 tối

### 💰 Tính Giá Thông Minh
- **Theo khung giờ**: Sáng (x0.8), Chiều (x1.0), Tối (x1.2), Đêm (x1.1)
- **Theo loại phòng**: VIP (x1.5), IMAX (x1.8), 4DX (x2.0)
- **Theo độ phổ biến**: Phim hot có nhiều suất chiếu hơn

## 🛠️ Cấu Hình

### application.yml
```yaml
app:
  scheduler:
    auto-schedule:
      enabled: true                    # Bật/tắt tự động tạo lịch
      daily-time: "01:00"             # Giờ chạy hàng ngày
      room-check-time: "02:00"        # Giờ kiểm tra phòng
      weekly-backup-time: "03:00"     # Giờ backup hàng tuần
      min-schedules-per-movie: 2      # Tối thiểu suất chiếu/phim
      max-schedules-per-movie: 4      # Tối đa suất chiếu/phim
      advance-days: 3                 # Số ngày tạo trước
      timezone: "Asia/Ho_Chi_Minh"
  
  cinema:
    default-room-capacity: 120        # Sức chứa mặc định
    max-rooms: 20                     # Tối đa số phòng
    standard-showtime-duration: 150   # Thời lượng mặc định (phút)
    cleanup-time: 30                  # Thời gian dọn dẹp giữa suất
```

### Database Schema Enhancements
```sql
-- Bảng log tự động tạo lịch
CREATE TABLE movietheater_auto_schedule_log (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(50) NOT NULL,
    execution_date DATE NOT NULL,
    target_date DATE NOT NULL,
    status ENUM('SUCCESS', 'PARTIAL_SUCCESS', 'FAILED'),
    movies_processed INT DEFAULT 0,
    schedules_created INT DEFAULT 0,
    rooms_created INT DEFAULT 0,
    -- ... more columns
);

-- Cột mới trong bảng movie
ALTER TABLE movietheater_movie ADD COLUMN auto_schedule_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE movietheater_movie ADD COLUMN min_daily_shows INT DEFAULT 2;
ALTER TABLE movietheater_movie ADD COLUMN max_daily_shows INT DEFAULT 4;
ALTER TABLE movietheater_movie ADD COLUMN priority_score INT DEFAULT 5;

-- Cột mới trong bảng schedule
ALTER TABLE movietheater_schedule ADD COLUMN auto_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE movietheater_schedule ADD COLUMN generation_batch_id VARCHAR(50);
```

## 🚀 API Endpoints

### 1. Tạo Lịch Cho 3 Ngày Tiếp Theo
```http
POST /api/v1/auto-schedule/generate-next-3-days
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã tạo thành công 45 lịch chiếu cho 5 phim trong 3 ngày tiếp theo",
  "totalSchedulesCreated": 45,
  "moviesProcessed": 5,
  "roomsUsed": 5,
  "errors": [],
  "createdSchedules": [...]
}
```

### 2. Tạo Lịch Cho Ngày Cụ Thể
```http
POST /api/v1/auto-schedule/generate-for-date?date=2024-12-25
Authorization: Bearer {admin_token}
```

### 3. Tạo Lịch Cho Phim Cụ Thể
```http
POST /api/v1/auto-schedule/generate-for-movie?movieId=1&startDate=2024-12-25&endDate=2024-12-30
Authorization: Bearer {admin_token}
```

### 4. Tạo Thêm Phòng Chiếu
```http
POST /api/v1/auto-schedule/create-additional-rooms
Authorization: Bearer {admin_token}
```

### 5. Chạy Tác Vụ Hàng Ngày
```http
POST /api/v1/auto-schedule/daily-generation
Authorization: Bearer {admin_token}
```

### 6. Thống Kê Hệ Thống
```http
GET /api/v1/auto-schedule/statistics
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "totalSchedulesGenerated": 1250,
  "schedulesLast7Days": 105,
  "averageSchedulesPerDay": 15,
  "totalRoomsCreated": 8,
  "nowShowingMovies": 5,
  "averageOccupancyRate": 78.5,
  "lastGenerationDate": "2024-12-20",
  "nextGenerationDate": "2024-12-21"
}
```

### 7. Giờ Chiếu Chuẩn
```http
GET /api/v1/auto-schedule/standard-showtimes
```

### 8. Ngày Cần Tạo Lịch
```http
GET /api/v1/auto-schedule/dates-need-schedules
Authorization: Bearer {admin_token}
```

### 9. Trạng Thái Hệ Thống
```http
GET /api/v1/auto-schedule/status
```

## ⏰ Lịch Trình Tự Động

### Scheduled Tasks
1. **01:00 AM** - Tạo lịch chiếu hàng ngày
2. **02:00 AM** - Kiểm tra và tạo thêm phòng
3. **03:00 AM** - Backup tạo lịch hàng tuần (Chủ nhật)
4. **Mỗi 6 giờ** - Log thống kê hệ thống

### Cron Expressions
```java
@Scheduled(cron = "0 0 1 * * *", zone = "Asia/Ho_Chi_Minh")  // Daily at 1:00 AM
@Scheduled(cron = "0 0 2 * * *", zone = "Asia/Ho_Chi_Minh")  // Daily at 2:00 AM  
@Scheduled(cron = "0 0 3 * * SUN", zone = "Asia/Ho_Chi_Minh") // Weekly at 3:00 AM Sunday
```

## 🎯 Thuật Toán Tạo Lịch

### 1. Phân Tích Phim
```java
private int determineSchedulesPerDay(Movie movie) {
    if (movie.getIsFeatured()) {
        return 4; // Phim nổi bật: 4 suất/ngày
    }
    if (movie.getImdbRating() >= 8.0) {
        return 3; // Phim rating cao: 3 suất/ngày
    }
    return 2; // Phim thường: 2 suất/ngày
}
```

### 2. Chọn Khung Giờ
```java
private List<String> selectOptimalShowtimes(int count) {
    // Ưu tiên khung giờ vàng
    List<String> priorityTimes = Arrays.asList(
        "14:30", "16:30", "19:00", "21:00", 
        "18:30", "20:30", "15:00", "17:00"
    );
    return priorityTimes.subList(0, Math.min(count, priorityTimes.size()));
}
```

### 3. Chọn Phòng Chiếu
```java
private List<CinemaRoom> selectSuitableRooms(Movie movie, List<CinemaRoom> availableRooms) {
    // Logic chọn phòng dựa trên thể loại phim
    String genre = movie.getGenres().toLowerCase();
    
    if (genre.contains("action") || genre.contains("sci-fi")) {
        return rooms.stream()
            .filter(r -> r.isIMAX() || r.is4DX() || r.getHasDolbyAtmos())
            .collect(Collectors.toList());
    }
    
    if (genre.contains("romance") || genre.contains("drama")) {
        return rooms.stream()
            .filter(r -> r.isVIP() || r.getHasReclinerSeats())
            .collect(Collectors.toList());
    }
    
    return availableRooms; // Phòng thường cho mọi thể loại
}
```

### 4. Tính Giá Vé
```java
private double calculatePrice(Movie movie, CinemaRoom room, LocalTime startTime) {
    double basePrice = movie.getPrice();
    double roomMultiplier = room.getPriceMultiplier();
    double timeMultiplier = getTimeMultiplier(startTime);
    
    return Math.round(basePrice * roomMultiplier * timeMultiplier / 1000.0) * 1000.0;
}

private double getTimeMultiplier(LocalTime startTime) {
    int hour = startTime.getHour();
    if (hour >= 8 && hour < 12) return 0.8;   // Sáng
    if (hour >= 12 && hour < 18) return 1.0;  // Chiều  
    if (hour >= 18 && hour < 22) return 1.2;  // Tối
    return 1.1;                               // Đêm
}
```

## 📊 Monitoring & Analytics

### Log Files
```
logs/movie-theater.log
```

### Metrics
- Số lịch chiếu tự động tạo/ngày
- Tỷ lệ thành công/thất bại
- Thời gian thực thi trung bình
- Số phòng chiếu được tạo tự động
- Tỷ lệ lấp đầy trung bình

### Database Views
```sql
-- Tóm tắt lịch chiếu hàng ngày
CREATE VIEW v_daily_schedule_summary AS
SELECT 
    show_date,
    COUNT(*) as total_schedules,
    COUNT(DISTINCT movie_id) as unique_movies,
    AVG(occupancy_rate) as avg_occupancy,
    SUM(CASE WHEN auto_generated = TRUE THEN 1 ELSE 0 END) as auto_generated_count
FROM movietheater_schedule 
GROUP BY show_date;

-- Sử dụng phòng chiếu
CREATE VIEW v_room_utilization AS
SELECT 
    cr.cinema_room_name,
    cr.room_type,
    COUNT(s.schedule_id) as total_schedules,
    AVG(s.occupancy_rate) as avg_occupancy
FROM movietheater_cinema_room cr
LEFT JOIN movietheater_schedule s ON cr.cinema_room_id = s.cinema_room_id
GROUP BY cr.cinema_room_id;
```

## 🧪 Testing

### PowerShell Test Script
```powershell
# Chạy script test
.\test-auto-schedule-system.ps1
```

### Test Cases
1. ✅ Đăng nhập Admin
2. ✅ Kiểm tra trạng thái hệ thống
3. ✅ Lấy thống kê tự động
4. ✅ Lấy giờ chiếu chuẩn
5. ✅ Phát hiện ngày cần tạo lịch
6. ✅ Tự động tạo phòng chiếu
7. ✅ Tạo lịch cho ngày cụ thể
8. ✅ Tạo lịch cho 3 ngày tiếp theo
9. ✅ Tác vụ tạo lịch hàng ngày
10. ✅ Kiểm tra kết quả

### Manual Testing
```http
# Test với Postman hoặc curl
curl -X POST "http://localhost:8080/api/v1/auto-schedule/generate-next-3-days" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -H "Content-Type: application/json"
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Scheduled Tasks Không Chạy
```yaml
# Kiểm tra cấu hình
app:
  scheduler:
    auto-schedule:
      enabled: true  # Đảm bảo enabled = true
```

#### 2. Không Có Phim NOW_SHOWING
```sql
-- Kiểm tra phim đang chiếu
SELECT * FROM movietheater_movie WHERE status = 'NOW_SHOWING' AND is_active = TRUE;

-- Cập nhật status phim
UPDATE movietheater_movie SET status = 'NOW_SHOWING' WHERE movie_id = 1;
```

#### 3. Thiếu Phòng Chiếu
```http
# Tạo thêm phòng tự động
POST /api/v1/auto-schedule/create-additional-rooms
```

#### 4. Xung Đột Lịch Chiếu
```java
// Hệ thống tự động kiểm tra xung đột
if (scheduleService.hasScheduleConflict(roomId, date, startTime, endTime)) {
    // Bỏ qua slot này và thử slot khác
}
```

### Debug Logs
```yaml
logging:
  level:
    com.swp.MovieTheaterService.scheduler: DEBUG
    com.swp.MovieTheaterService.service.impl.AutoScheduleServiceImpl: DEBUG
```

### Health Check
```http
GET /api/v1/auto-schedule/status
```

## 🚀 Deployment

### Docker
```yaml
# docker-compose.yml
services:
  movie-theater-backend:
    environment:
      - APP_SCHEDULER_AUTO_SCHEDULE_ENABLED=true
      - APP_SCHEDULER_AUTO_SCHEDULE_DAILY_TIME=01:00
```

### Production Settings
```yaml
app:
  scheduler:
    auto-schedule:
      enabled: true
      timezone: "Asia/Ho_Chi_Minh"
  cinema:
    max-rooms: 50                    # Tăng giới hạn phòng cho production
    default-room-capacity: 150       # Tăng sức chứa mặc định
```

## 📈 Performance Optimization

### Database Indexes
```sql
-- Indexes cho auto-scheduling
CREATE INDEX idx_movie_schedule_date ON movietheater_schedule (movie_id, show_date);
CREATE INDEX idx_room_schedule_date ON movietheater_schedule (cinema_room_id, show_date);
CREATE INDEX idx_auto_generated_batch ON movietheater_schedule (auto_generated, generation_batch_id);
```

### Caching
```java
@Cacheable("movies-now-showing")
public List<Movie> getNowShowingMovies() {
    return movieRepository.findByStatusAndIsActiveTrue("NOW_SHOWING");
}

@Cacheable("available-rooms")
public List<CinemaRoom> getAvailableRooms() {
    return cinemaRoomRepository.findByIsActiveTrue();
}
```

### Async Processing
```java
@Async
public CompletableFuture<AutoScheduleResult> generateSchedulesAsync(LocalDate date) {
    // Xử lý bất đồng bộ để không block UI
}
```

## 🔐 Security

### Authorization
```java
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<AutoScheduleResult> generateSchedules() {
    // Chỉ Admin mới có thể trigger manual
}
```

### Rate Limiting
```java
@RateLimiter(name = "auto-schedule", fallbackMethod = "fallbackGeneration")
public AutoScheduleResult generateSchedules() {
    // Giới hạn số lần gọi API
}
```

## 📚 Best Practices

### 1. Monitoring
- Theo dõi logs hàng ngày
- Thiết lập alerts cho failures
- Kiểm tra metrics định kỳ

### 2. Backup
- Backup database trước khi chạy auto-generation
- Lưu trữ logs lâu dài
- Có kế hoạch rollback

### 3. Maintenance
- Dọn dẹp logs cũ định kỳ
- Optimize database indexes
- Review và cập nhật giờ chiếu chuẩn

### 4. Testing
- Test trên staging trước khi deploy
- Verify tất cả scheduled tasks
- Kiểm tra performance với data lớn

---

## 📞 Support

Nếu có vấn đề với hệ thống tự động tạo lịch chiếu, vui lòng:

1. Kiểm tra logs: `logs/movie-theater.log`
2. Kiểm tra database: `movietheater_auto_schedule_log`
3. Test API endpoints
4. Liên hệ team dev với thông tin lỗi chi tiết

**Author**: Dũng_Solo  
**Version**: 1.0.0  
**Last Updated**: December 2024 