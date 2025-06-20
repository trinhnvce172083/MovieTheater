# Ví dụ sử dụng Supabase Image Management APIs

## 1. Tạo movie kèm ảnh

```bash
curl -X POST \
  'http://localhost:8080/movies/with-images' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: multipart/form-data' \
  -F 'movieData={"title":"Avengers: Endgame","description":"Epic superhero movie","duration":181,"genre":"Action","releaseDate":"2019-04-26","price":120000.0}' \
  -F 'poster=@/path/to/poster.jpg' \
  -F 'backdrop=@/path/to/backdrop.jpg'
```

## 2. Update movie kèm ảnh

```bash
curl -X PUT \
  'http://localhost:8080/movies/1/with-images' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: multipart/form-data' \
  -F 'movieData={"title":"Updated Title","description":"Updated description","releaseDate":"2024-12-25"}' \
  -F 'poster=@/path/to/new_poster.jpg' \
  -F 'backdrop=@/path/to/new_backdrop.jpg'
```

## 3. Upload poster cho phim (riêng biệt)

```bash
curl -X POST \
  'http://localhost:8080/api/images/movies/1/poster' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/poster.jpg'
```

Response:
```json
{
  "success": true,
  "message": "Cập nhật poster phim thành công",
  "url": "https://your-project.supabase.co/storage/v1/object/public/movie-theater-images/movies/posters/123abc.jpg"
}
```

## 4. Upload backdrop cho phim

```bash
curl -X POST \
  'http://localhost:8080/api/images/movies/1/backdrop' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/backdrop.jpg'
```

## 5. Upload avatar cho user (qua ImageController)

```bash
curl -X POST \
  'http://localhost:8080/api/images/accounts/123/avatar' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/avatar.jpg'
```

## 6. Upload avatar cho user (qua UserManagementController - Admin)

```bash
curl -X POST \
  'http://localhost:8080/api/admin/users/123/avatar' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/avatar.jpg'
```

Response:
```json
{
  "success": true,
  "message": "Upload avatar thành công",
  "avatarUrl": "https://your-project.supabase.co/storage/v1/object/public/movie-theater-images/accounts/avatars/123abc.jpg"
}
```

## 7. Xóa poster phim

```bash
curl -X DELETE \
  'http://localhost:8080/api/images/movies/1/poster' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## 8. Upload file generic

```bash
curl -X POST \
  'http://localhost:8080/api/files/upload/general' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/image.jpg'
```

## 9. USER PROFILE AVATAR MANAGEMENT 🔥

### 9.1. Lấy thông tin profile của user hiện tại

```bash
curl -X GET \
  'http://localhost:8080/api/auth/profile' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

Response:
```json
{
  "code": 1000,
  "message": "Lấy thông tin profile thành công",
  "result": {
    "accountId": 123,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phoneNumber": "0901234567",
    "dateOfBirth": "1990-01-01",
    "address": "123 Main St, District 1, Ho Chi Minh City",
    "avatarUrl": "https://supabase.co/storage/v1/object/public/avatars/user123.jpg",
    "role": "MEMBER",
    "membershipLevel": "GOLD",
    "membershipPoints": 1500,
    "isActive": true,
    "emailVerified": true,
    "acceptMarketing": false,
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
}
```

### 9.2. Cập nhật profile (không bao gồm avatar)

```bash
curl -X PUT \
  'http://localhost:8080/api/auth/profile' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "fullName": "John Updated Doe",
    "phoneNumber": "0987654321",
    "address": "456 New Street, District 2, Ho Chi Minh City",
    "acceptMarketing": true
  }'
```

### 9.3. Upload avatar cho user hiện tại

```bash
curl -X POST \
  'http://localhost:8080/api/auth/profile/avatar' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/new_avatar.jpg'
```

Response:
```json
{
  "code": 1000,
  "message": "Upload avatar thành công",
  "result": {
    "success": true,
    "message": "Upload avatar thành công",
    "avatarUrl": "https://cuzwjjseeohnyrbfcngs.supabase.co/storage/v1/object/public/image/accounts/avatars/abc123.jpg"
  }
}
```

### 9.4. Xóa avatar của user hiện tại

```bash
curl -X DELETE \
  'http://localhost:8080/api/auth/profile/avatar' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

Response:
```json
{
  "code": 1000,
  "message": "Xóa avatar thành công",
  "result": {
    "success": true,
    "message": "Xóa avatar thành công"
  }
}
```

### 9.5. Cập nhật profile + avatar cùng lúc

```bash
curl -X PUT \
  'http://localhost:8080/api/auth/profile/with-avatar' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: multipart/form-data' \
  -F 'profileData={"fullName":"John Ultimate Doe","phoneNumber":"0123456789","address":"789 Ultimate Street","acceptMarketing":true}' \
  -F 'avatar=@/path/to/ultimate_avatar.jpg'
```

Response:
```json
{
  "code": 1000,
  "message": "Cập nhật profile và avatar thành công",
  "result": {
    "accountId": 123,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Ultimate Doe",
    "phoneNumber": "0123456789",
    "address": "789 Ultimate Street",
    "avatarUrl": "https://cuzwjjseeohnyrbfcngs.supabase.co/storage/v1/object/public/image/accounts/avatars/def456.jpg",
    "role": "MEMBER",
    "membershipLevel": "GOLD",
    "membershipPoints": 1500,
    "isActive": true,
    "emailVerified": true,
    "acceptMarketing": true,
    "updatedAt": "2024-06-20T23:45:00"
  }
}
```

## 10. 🔧 Improved APIs (Clean-up & Enhancements)

### API Clean-up
- ❌ **Removed**: `POST /api/auth/test-registration` (not needed, regular registration works)
- ✅ **Improved**: Statistics APIs với period filtering và real data calculation
- ✅ **Fixed**: Seat status API với proper database integration

### 10.1 Enhanced Booking Statistics API

```bash
# Get booking statistics for different periods
curl -X GET "${API_BASE_URL}/api/bookings/statistics?period=today" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json"

# Available periods: today, week, month, quarter, year, all
curl -X GET "${API_BASE_URL}/api/bookings/statistics?period=month" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json"
```

**Response example:**
```json
{
  "totalBookings": 150,
  "pendingCount": 5,
  "confirmedCount": 45,
  "paidCount": 80,
  "completedCount": 15,
  "cancelledCount": 5,
  "totalSeatsBooked": 320,
  "totalRevenue": 2500000.0,
  "averageBookingAmount": 166666.67,
  "guestBookings": 60,
  "memberBookings": 90,
  "cashPayments": 20,
  "cardPayments": 50,
  "onlinePayments": 70,
  "walletPayments": 10,
  "refundAmount": 150000.0,
  "checkedInBookings": 95
}
```

### 10.2 Enhanced User Statistics API

```bash
# Get comprehensive user statistics with real data
curl -X GET "${API_BASE_URL}/api/admin/users/statistics" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json"
```

**Response example:**
```json
{
  "totalUsers": 1250,
  "activeUsers": 1180,
  "verifiedUsers": 980,
  "lockedAccounts": 3,
  "usersByRole": {
    "MEMBER": 1100,
    "ADMIN": 5,
    "EMPLOYEE": 10
  },
  "usersByMembershipLevel": {
    "BRONZE": 800,
    "SILVER": 300,
    "GOLD": 120,
    "PLATINUM": 30
  },
  "newUsersThisMonth": 85,
  "newUsersThisWeek": 23,
  "usersLoggedInToday": 245,
  "usersLoggedInThisWeek": 650,
  "averageMembershipPoints": 520.5,
  "totalMembershipPointsDistributed": 650625,
  "oauthUsers": 320,
  "marketingAcceptanceRate": 0.68,
  "averageUserAge": 28.5,
  "topCities": {
    "Hồ Chí Minh": 450,
    "Hà Nội": 380,
    "Đà Nẵng": 150,
    "Cần Thơ": 85,
    "Hải Phòng": 70
  }
}
```

### 10.3 Enhanced Seat Status API

```bash
# Get real-time seat status with proper database integration
curl -X GET "${API_BASE_URL}/api/bookings/schedules/123/seats" \
  -H "Content-Type: application/json"
```

**Response example:**
```json
{
  "seatStatuses": [
    {
      "seatId": 1,
      "seatNumber": "A1",
      "rowLetter": "A",
      "status": "AVAILABLE",
      "reservedBySession": null,
      "reservationExpiry": null
    },
    {
      "seatId": 2,
      "seatNumber": "A2", 
      "rowLetter": "A",
      "status": "BOOKED",
      "reservedBySession": null,
      "reservationExpiry": null
    },
    {
      "seatId": 3,
      "seatNumber": "A3",
      "rowLetter": "A", 
      "status": "TEMPORARILY_RESERVED",
      "reservedBySession": "session123",
      "reservationExpiry": "2024-01-15T10:45:00"
    }
  ],
  "timestamp": "2024-01-15T10:30:00"
}
```

### 10.4 React Integration Examples

```tsx
// Enhanced Booking Statistics Component
const BookingStatisticsWidget = () => {
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState(null);

  const fetchStatistics = async (selectedPeriod) => {
    try {
      const response = await fetch(`/api/bookings/statistics?period=${selectedPeriod}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching booking stats:', error);
    }
  };

  useEffect(() => {
    fetchStatistics(period);
  }, [period]);

  return (
    <div className="stats-widget">
      <div className="period-selector">
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="today">Hôm nay</option>
          <option value="week">7 ngày qua</option>
          <option value="month">30 ngày qua</option>
          <option value="quarter">3 tháng qua</option>
          <option value="year">1 năm qua</option>
          <option value="all">Tất cả</option>
        </select>
      </div>
      
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Tổng booking</h3>
            <span className="stat-value">{stats.totalBookings}</span>
          </div>
          <div className="stat-card">
            <h3>Doanh thu</h3>
            <span className="stat-value">
              {new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND' 
              }).format(stats.totalRevenue)}
            </span>
          </div>
          <div className="stat-card">
            <h3>Ghế đã đặt</h3>
            <span className="stat-value">{stats.totalSeatsBooked}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Seat Selection Component
const SeatSelectionGrid = ({ scheduleId }) => {
  const [seatStatus, setSeatStatus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const fetchSeatStatus = async () => {
    try {
      const response = await fetch(`/api/bookings/schedules/${scheduleId}/seats`);
      const data = await response.json();
      setSeatStatus(data);
    } catch (error) {
      console.error('Error fetching seat status:', error);
    }
  };

  useEffect(() => {
    fetchSeatStatus();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchSeatStatus, 30000);
    return () => clearInterval(interval);
  }, [scheduleId]);

  const handleSeatClick = (seat) => {
    if (seat.status === 'AVAILABLE') {
      setSelectedSeats(prev => 
        prev.includes(seat.seatId) 
          ? prev.filter(id => id !== seat.seatId)
          : [...prev, seat.seatId]
      );
    }
  };

  return (
    <div className="seat-grid">
      {seatStatus?.seatStatuses?.map(seat => (
        <div
          key={seat.seatId}
          className={`seat seat-${seat.status.toLowerCase()} ${
            selectedSeats.includes(seat.seatId) ? 'selected' : ''
          }`}
          onClick={() => handleSeatClick(seat)}
          title={`${seat.seatNumber} - ${seat.status}`}
        >
          {seat.seatNumber}
        </div>
      ))}
    </div>
  );
};
```

### 10.5 API Performance Notes

- 🚀 **Seat Status API**: Now fetches real data from database instead of empty lists
- 📊 **Statistics APIs**: Calculate real metrics with proper date filtering
- 🧹 **Clean Architecture**: Removed debug endpoints and improved code quality
- ⚡ **Caching**: In-memory seat reservations for better performance
- 🔄 **Real-time**: Automatic cleanup of expired reservations every minute

### 10.6 Error Handling Improvements

```json
// Enhanced error responses with detailed information
{
  "success": false,
  "message": "Schedule not found",
  "errorCode": "SCHEDULE_NOT_FOUND",
  "timestamp": "2024-01-15T10:30:00",
  "details": {
    "scheduleId": 999,
    "suggestion": "Please verify the schedule ID exists and is active"
  }
}
```

---

## 📋 Summary of Improvements

### ✅ Completed Enhancements
1. **Removed** unnecessary test-registration endpoint
2. **Enhanced** booking statistics with period filtering (today, week, month, quarter, year, all)  
3. **Improved** user statistics with real age calculation and top cities data
4. **Fixed** seat status API to use actual database data instead of empty lists
5. **Added** proper error handling and logging
6. **Enhanced** documentation with React integration examples

### 🎯 Benefits
- **Better Performance**: Real database queries instead of mock data
- **Better UX**: Period-based filtering for analytics
- **Better Code Quality**: Removed debug code and improved architecture
- **Better Monitoring**: Enhanced logging and error tracking
- **Better Integration**: Comprehensive React examples for frontend teams

### 🔧 Technical Improvements
- Added `ScheduleRepository` dependency injection
- Implemented proper exception handling with try-catch blocks
- Enhanced query performance with targeted database lookups
- Added real-time seat status updates with temporary reservation support
- Improved statistics calculation with date range filtering

## 11. Security & Validation

- **File validation**: Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)
- **Size limit**: Tối đa 5MB
- **Authentication**: Tất cả API đều yêu cầu JWT token
- **Authorization**: 
  - User chỉ có thể upload/xóa avatar của chính mình
  - Admin có thể upload/xóa avatar cho bất kỳ user nào
- **Rate limiting**: Áp dụng cho các operations upload
- **Auto cleanup**: Tự động xóa file cũ khi upload file mới

## 12. API Endpoints Summary

### Movie Images
- `POST /movies/with-images` - Tạo movie + upload ảnh
- `PUT /movies/{id}/with-images` - Update movie + upload ảnh
- `POST /api/images/movies/{id}/poster` - Upload poster riêng
- `POST /api/images/movies/{id}/backdrop` - Upload backdrop riêng
- `DELETE /api/images/movies/{id}/poster` - Xóa poster
- `DELETE /api/images/movies/{id}/backdrop` - Xóa backdrop

### User Avatar (Self-Management)
- `GET /api/auth/profile` - Lấy thông tin profile
- `PUT /api/auth/profile` - Cập nhật profile 
- `POST /api/auth/profile/avatar` - Upload avatar (user tự làm)
- `DELETE /api/auth/profile/avatar` - Xóa avatar (user tự làm)
- `PUT /api/auth/profile/with-avatar` - Update profile + avatar

### User Avatar (Admin Management)
- `POST /api/admin/users/{userId}/avatar` - Admin upload avatar cho user
- `DELETE /api/admin/users/{userId}/avatar` - Admin xóa avatar của user

### Generic Upload
- `POST /api/files/upload/{folder}` - Upload file tổng quát
- `POST /api/images/accounts/{accountId}/avatar` - Upload avatar qua account ID

**🎉 Tích hợp Supabase hoàn chỉnh với full user avatar management!** 