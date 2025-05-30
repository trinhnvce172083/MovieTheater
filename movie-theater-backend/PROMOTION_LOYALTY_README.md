# Hệ thống Khuyến mãi và Tích điểm (Promotion & Loyalty System)

## Tổng quan

Hệ thống quản lý khuyến mãi và tích điểm cho rạp chiếu phim với các tính năng:

### 🎯 Promotion System (Hệ thống Khuyến mãi)
- **Quản lý khuyến mãi đa dạng**: Giảm giá theo phần trăm, số tiền cố định
- **Điều kiện áp dụng linh hoạt**: Theo phim, phòng chiếu, ngày, giờ, thành viên
- **Hệ thống điểm thưởng**: Đổi điểm lấy khuyến mãi
- **Quản lý sử dụng**: Giới hạn số lần sử dụng tổng và theo user
- **Khuyến mãi nổi bật**: Hiển thị ưu tiên trên giao diện

### 💎 Loyalty System (Hệ thống Tích điểm)
- **Tích điểm tự động**: Từ booking (1 điểm/100 VND)
- **Hệ thống thành viên**: BRONZE → SILVER → GOLD → PLATINUM
- **Quản lý hết hạn**: Điểm có thời hạn sử dụng
- **Lịch sử giao dịch**: Theo dõi chi tiết mọi giao dịch điểm
- **Thống kê**: Báo cáo theo tháng, năm

## Cấu trúc Database

### Bảng `promotions`
```sql
CREATE TABLE promotions (
    promotion_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    promotion_code VARCHAR(50) UNIQUE NOT NULL,
    promotion_name VARCHAR(200) NOT NULL,
    description TEXT,
    discount_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    max_discount_amount DECIMAL(10,2),
    min_purchase_amount DECIMAL(10,2),
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    max_usage_count INT,
    current_usage_count INT DEFAULT 0,
    max_usage_per_user INT,
    applicable_days VARCHAR(20), -- JSON: ["MONDAY", "TUESDAY"]
    applicable_times VARCHAR(50), -- JSON: ["MORNING", "AFTERNOON"]
    applicable_movies TEXT, -- JSON: [1, 2, 3]
    applicable_rooms TEXT, -- JSON: [1, 2, 3]
    member_only BOOLEAN DEFAULT FALSE,
    membership_levels VARCHAR(100), -- JSON: ["SILVER", "GOLD"]
    banner_image_url VARCHAR(500),
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    is_points_promotion BOOLEAN DEFAULT FALSE,
    points_required INT,
    points_value DECIMAL(10,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Bảng `loyalty_transactions`
```sql
CREATE TABLE loyalty_transactions (
    transaction_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_id BIGINT NOT NULL,
    transaction_type ENUM('EARN', 'REDEEM', 'EXPIRE', 'ADJUST') NOT NULL,
    points INT NOT NULL,
    description VARCHAR(500),
    reference_type VARCHAR(50), -- 'BOOKING', 'PROMOTION', 'MANUAL'
    reference_id BIGINT,
    transaction_date DATETIME NOT NULL,
    expiry_date DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);
```

## API Endpoints

### 🎯 Promotion APIs

#### Quản lý Khuyến mãi (Admin)
```bash
# Tạo khuyến mãi mới
POST /api/promotions
Authorization: Bearer {admin_token}
Content-Type: application/json

{
    "promotionCode": "SUMMER2024",
    "promotionName": "Khuyến mãi mùa hè",
    "description": "Giảm 20% cho tất cả vé",
    "discountType": "PERCENTAGE",
    "discountValue": 20.0,
    "maxDiscountAmount": 50000.0,
    "minPurchaseAmount": 100000.0,
    "startDate": "2024-06-01T00:00:00",
    "endDate": "2024-08-31T23:59:59",
    "maxUsageCount": 1000,
    "maxUsagePerUser": 5,
    "memberOnly": false,
    "isFeatured": true,
    "displayOrder": 1
}

# Vô hiệu hóa khuyến mãi
PUT /api/promotions/{promotionId}/deactivate
Authorization: Bearer {admin_token}
```

#### Truy vấn Khuyến mãi (Public)
```bash
# Lấy tất cả khuyến mãi đang hoạt động
GET /api/promotions

# Lấy khuyến mãi nổi bật
GET /api/promotions/featured

# Lấy khuyến mãi điểm
GET /api/promotions/points

# Lấy khuyến mãi có thể đổi với số điểm hiện có
GET /api/promotions/redeemable?availablePoints=500

# Lấy khuyến mãi cho thành viên
GET /api/promotions/member/GOLD

# Tìm kiếm khuyến mãi
GET /api/promotions/search?keyword=summer&page=0&size=10

# Lấy khuyến mãi theo mã
GET /api/promotions/code/SUMMER2024
```

#### Sử dụng Khuyến mãi
```bash
# Kiểm tra tính hợp lệ
POST /api/promotions/validate
Content-Type: application/x-www-form-urlencoded

promotionCode=SUMMER2024&totalAmount=150000&movieId=1&roomId=1

# Tính toán giảm giá
POST /api/promotions/calculate-discount
Content-Type: application/x-www-form-urlencoded

promotionCode=SUMMER2024&totalAmount=150000

# Áp dụng khuyến mãi (tăng usage count)
POST /api/promotions/apply/SUMMER2024
Authorization: Bearer {user_token}
```

### 💎 Loyalty APIs

#### Quản lý Điểm
```bash
# Lấy thông tin điểm của tài khoản
GET /api/loyalty/points/{accountId}
Authorization: Bearer {user_token}

Response:
{
    "availablePoints": 1250,
    "totalEarned": 2500,
    "totalRedeemed": 1250,
    "accountId": 1
}

# Lấy tổng quan điểm
GET /api/loyalty/overview/{accountId}
Authorization: Bearer {user_token}

Response:
{
    "accountId": 1,
    "availablePoints": 1250,
    "totalEarned": 2500,
    "totalRedeemed": 1250,
    "expiringPointsIn30Days": 200,
    "recentTransactionsCount": 5,
    "recentTransactions": [...]
}
```

#### Lịch sử Giao dịch
```bash
# Lấy lịch sử giao dịch (phân trang)
GET /api/loyalty/transactions/{accountId}?page=0&size=10
Authorization: Bearer {user_token}

# Lấy giao dịch gần đây
GET /api/loyalty/transactions/{accountId}/recent?limit=5
Authorization: Bearer {user_token}

# Lấy điểm sắp hết hạn
GET /api/loyalty/expiring/{accountId}?daysAhead=30
Authorization: Bearer {user_token}
```

#### Thống kê
```bash
# Thống kê theo tháng
GET /api/loyalty/statistics/{accountId}/monthly?year=2024&month=6
Authorization: Bearer {user_token}

Response:
{
    "year": 2024,
    "month": 6,
    "earnedPoints": 500,
    "redeemedPoints": 200,
    "netPoints": 300
}
```

#### Quản lý Admin
```bash
# Điều chỉnh điểm thủ công
POST /api/loyalty/adjust
Authorization: Bearer {admin_token}
Content-Type: application/x-www-form-urlencoded

accountId=1&points=100&reason=Bonus for feedback

# Xử lý điểm hết hạn (chạy định kỳ)
POST /api/loyalty/process-expired
Authorization: Bearer {admin_token}
```

## Business Logic

### Tích điểm từ Booking
```java
// Tự động tích điểm khi booking thành công
// 1 điểm = 100 VND
int points = (int) Math.floor(totalAmount * 0.01);

// Tối thiểu 1 điểm, tối đa 1000 điểm/giao dịch
points = Math.max(1, Math.min(points, 1000));

// Điểm có hạn sử dụng 1 năm
LocalDateTime expiryDate = LocalDateTime.now().plusYears(1);
```

### Cấp độ Thành viên
```java
// Dựa trên tổng điểm đã tích lũy (không phải điểm hiện có)
private String calculateMembershipLevel(int totalEarnedPoints) {
    if (totalEarnedPoints >= 10000) return "PLATINUM";
    if (totalEarnedPoints >= 5000) return "GOLD";
    if (totalEarnedPoints >= 2000) return "SILVER";
    return "BRONZE";
}
```

### Validation Khuyến mãi
```java
// Kiểm tra điều kiện áp dụng khuyến mãi
boolean isValid = promotion.isValid() && // Còn hiệu lực
    totalAmount >= promotion.getMinPurchaseAmount() && // Đủ số tiền tối thiểu
    promotion.canBeUsedBy(account) && // Phù hợp với thành viên
    promotion.canBeUsedForMovie(movieId) && // Áp dụng cho phim
    promotion.canBeUsedForRoom(roomId) && // Áp dụng cho phòng
    promotion.canBeUsedOnDay(bookingDate); // Áp dụng cho ngày
```

## Tích hợp với Booking System

### Workflow Đặt vé có Khuyến mãi
1. **Chọn ghế và tính tổng tiền**
2. **Nhập mã khuyến mãi** → Validate → Tính discount
3. **Thanh toán** → Apply promotion (tăng usage count)
4. **Booking thành công** → Tích điểm tự động
5. **Cập nhật membership level** nếu cần

### Integration Points
```java
// Trong BookingService
@Autowired
private PromotionService promotionService;

@Autowired
private LoyaltyService loyaltyService;

public BookingResponse createBooking(BookingRequest request) {
    // 1. Validate promotion
    if (request.getPromotionCode() != null) {
        boolean isValid = promotionService.validatePromotionForBooking(
            request.getPromotionCode(), account, movieId, roomId, 
            bookingDate, totalAmount);
        if (!isValid) throw new InvalidPromotionException();
        
        // 2. Calculate discount
        double discount = promotionService.calculateDiscount(
            request.getPromotionCode(), totalAmount);
        finalAmount = totalAmount - discount;
    }
    
    // 3. Create booking
    Booking booking = createBookingEntity(request, finalAmount);
    
    // 4. Apply promotion
    if (request.getPromotionCode() != null) {
        promotionService.applyPromotion(request.getPromotionCode());
    }
    
    // 5. Earn loyalty points
    loyaltyService.earnPointsFromBooking(account, booking);
    
    return mapToResponse(booking);
}
```

## Testing

### Test Promotion System
```bash
# Test tạo và sử dụng khuyến mãi
./test-promotion-api.sh

# Test cases:
# - Tạo khuyến mãi percentage và fixed amount
# - Validate điều kiện áp dụng
# - Test giới hạn sử dụng
# - Test khuyến mãi cho thành viên
# - Test khuyến mãi điểm
```

### Test Loyalty System
```bash
# Test hệ thống tích điểm
./test-loyalty-api.sh

# Test cases:
# - Tích điểm từ booking
# - Đổi điểm lấy khuyến mãi
# - Xử lý điểm hết hạn
# - Nâng cấp membership level
# - Thống kê điểm
```

## Deployment

### Docker Setup
```bash
# Build và chạy services
cd movie-theater-backend/docker
docker-compose up -d --build

# Services:
# - MySQL: localhost:3306
# - Spring Boot: localhost:8080
# - Adminer: localhost:8081
```

### Database Migration
```sql
-- Chạy script tạo bảng
source init.sql

-- Insert dữ liệu mẫu
INSERT INTO promotions (promotion_code, promotion_name, ...) VALUES (...);
INSERT INTO loyalty_transactions (...) VALUES (...);
```

## Monitoring & Maintenance

### Scheduled Tasks
```java
// Xử lý điểm hết hạn (chạy hàng ngày)
@Scheduled(cron = "0 0 2 * * *") // 2:00 AM daily
public void processExpiredPoints() {
    loyaltyService.processExpiredPoints();
}

// Deactivate expired promotions
@Scheduled(cron = "0 0 1 * * *") // 1:00 AM daily  
public void deactivateExpiredPromotions() {
    promotionService.deactivateExpiredPromotions();
}
```

### Performance Optimization
- **Index** trên `promotion_code`, `account_id`, `transaction_date`
- **Caching** cho active promotions
- **Pagination** cho transaction history
- **Batch processing** cho expired points

### Security
- **Authorization**: Admin-only cho create/deactivate promotions
- **Rate limiting**: Prevent promotion code abuse
- **Validation**: Strict input validation
- **Audit log**: Track all promotion usage

## Roadmap

### Phase 2 Features
- [ ] **Promotion Templates**: Tạo nhanh từ template
- [ ] **A/B Testing**: Test hiệu quả khuyến mãi
- [ ] **Referral Program**: Giới thiệu bạn bè
- [ ] **Gamification**: Badges, achievements
- [ ] **Push Notifications**: Thông báo khuyến mãi mới
- [ ] **Analytics Dashboard**: Báo cáo chi tiết

### Integration Plans
- [ ] **Email Marketing**: Gửi khuyến mãi qua email
- [ ] **SMS Gateway**: Thông báo qua SMS
- [ ] **Mobile App**: Push notifications
- [ ] **Social Media**: Share promotions
- [ ] **Payment Gateway**: Loyalty points payment

---

**Tác giả**: Dũng_Solo  
**Phiên bản**: 1.0.0  
**Cập nhật**: 2024-12-27 