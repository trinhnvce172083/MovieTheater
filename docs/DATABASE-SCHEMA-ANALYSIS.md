# 📊 Database Schema Analysis - SRS vs Current Implementation

## 🎯 **SRS Requirements vs Current Implementation**

### ✅ **Phù hợp với SRS:**

| SRS Table | Current Entity | Status | Notes |
|-----------|----------------|--------|-------|
| MOVIETHEATER_ACCOUNT | Account | ✅ Match | Đầy đủ fields theo SRS |
| MOVIETHEATER_MOVIE | Movie | ✅ Match | Compatible structure |
| MOVIETHEATER_CINEMA_ROOM | CinemaRoom | ✅ Match | Có thêm features mở rộng |
| MOVIETHEATER_SEAT | Seat | ✅ Match | Enhanced với status enum |
| MOVIETHEATER_SCHEDULE | Schedule | ✅ Match | Có thêm features (3D, IMAX) |
| MOVIETHEATER_PROMOTION | Promotion | ✅ Match | Advanced promotion system |

### 🔄 **Cần cải tiến theo SRS:**

| SRS Requirement | Current Status | Recommendation |
|-----------------|----------------|----------------|
| **INVOICE System** | Booking only | 🔄 Add Invoice entity |
| **MEMBER Table** | Account.role | 🔄 Consider separate Member table |
| **EMPLOYEE Table** | Account.role | 🔄 Consider separate Employee table |
| **SHOW_DATES Table** | Schedule.showDate | ✅ Current approach better |
| **MOVIE_SCHEDULE Junction** | Direct relationship | ✅ Current approach better |
| **TICKET Table** | BookingSeat | 🔄 Add physical Ticket entity |

## 📋 **Đề xuất cải tiến Data Types:**

### 1. **Invoice Enhancement** (Theo SRS Page 64)
```sql
-- SRS: INVOICE_ID, ACCOUNT_ID, ADD_SCORE, BOOKED_DATE, MOVIE_NAME, 
--      SCHEDULE_SHOW, SCHEDULE_SHOW_TIME, STATUS, TOTAL_MONEY, USE_SCORE, SEAT

CREATE TABLE movietheater_invoice (
    invoice_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    issue_date DATETIME NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    FOREIGN KEY (booking_id) REFERENCES movietheater_booking(booking_id)
);
```

### 2. **Member-specific Enhancements**
```sql
-- Enhance Account table với SRS member fields
ALTER TABLE movietheater_account ADD COLUMN membership_card_number VARCHAR(20) UNIQUE;
ALTER TABLE movietheater_account ADD COLUMN issue_date DATE;
ALTER TABLE movietheater_account ADD COLUMN expiry_date DATE;
```

### 3. **Ticket Physical Entity** (Theo SRS)
```sql
-- Physical ticket cho check-in tại rạp
CREATE TABLE movietheater_ticket (
    ticket_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_seat_id BIGINT NOT NULL,
    ticket_number VARCHAR(30) UNIQUE NOT NULL,
    qr_code TEXT NOT NULL,
    print_date DATETIME,
    is_used BOOLEAN DEFAULT FALSE,
    used_date DATETIME,
    FOREIGN KEY (booking_seat_id) REFERENCES movietheater_booking_seat(booking_seat_id)
);
```

## 🎯 **Data Type Improvements:**

### 1. **Precision & Performance**
```java
// Current: Double → Recommended: BigDecimal for money
@Column(name = "total_amount", precision = 10, scale = 2)
private BigDecimal totalAmount;

// Current: String → Recommended: Enum for better type safety
@Enumerated(EnumType.STRING)
private PaymentMethod paymentMethod; // CASH, CARD, ONLINE, WALLET
```

### 2. **Database Index Optimization**
```sql
-- Performance indexes theo SRS use cases
CREATE INDEX idx_booking_date ON movietheater_booking(booking_date);
CREATE INDEX idx_schedule_showdate ON movietheater_schedule(show_date, start_time);
CREATE INDEX idx_account_membership ON movietheater_account(membership_level, membership_points);
```

### 3. **SRS Business Rules Implementation**
```java
// Member score system theo SRS
public void addMembershipPoints(int points) {
    this.membershipPoints += points;
    updateMembershipLevel();
    // Log transaction for audit trail
    loyaltyTransactionService.recordPointsEarned(this, points);
}
```

## 📈 **Performance & Practical Recommendations:**

### ✅ **Keep Current Better Practices:**
1. **Direct Movie-Schedule relationship** → Tốt hơn SRS junction table
2. **Enum types** → Type-safe hơn SRS VARCHAR
3. **Audit fields** (created_at, updated_at) → Essential for production
4. **Soft delete** (is_active) → Better than hard delete

### 🔄 **Adopt from SRS:**
1. **Invoice separation** → Tách biệt booking và billing
2. **Member card system** → Physical membership cards
3. **Ticket printing** → Physical ticket management
4. **Score transaction history** → Detailed points tracking

## 🎯 **Migration Strategy:**

### Phase 1: Core Enhancements
- [ ] Add Invoice entity
- [ ] Add Ticket entity  
- [ ] Enhance Member scoring system

### Phase 2: Business Logic
- [ ] Implement SRS use cases
- [ ] Member card management
- [ ] Advanced promotion rules

### Phase 3: Performance
- [ ] Add recommended indexes
- [ ] Optimize queries for SRS scenarios
- [ ] Add caching for frequently accessed data

## 💡 **Kết luận:**
Current implementation đã **vượt xa SRS requirements** về technical aspects, nhưng cần **bổ sung một số business entities** để hoàn thiện theo document requirements. 