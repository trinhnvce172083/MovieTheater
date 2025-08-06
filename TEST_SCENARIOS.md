# 🎬 LUMIERE CINEMA MANAGEMENT SYSTEM - TEST SCENARIOS

## 📋 Kịch Bản Demo Cho Mentor

### 🎯 **OVERVIEW**
Hệ thống quản lý rạp chiếu phim hoàn chỉnh với 3 vai trò chính:
- **Admin**: Quản lý toàn bộ hệ thống
- **Employee**: Nhân viên bán vé, check-in
- **Member**: Khách hàng đặt vé, xem phim

---

## 🔐 **PHẦN 1: AUTHENTICATION & AUTHORIZATION**

### **Test Case 1.1: Admin Login**
1. **Truy cập**: `http://localhost:3001/auth/Login`
2. **Thông tin đăng nhập Admin**:
   - Email: `admin@cinema.com`
   - Password: `admin123`
3. **Kết quả mong đợi**:
   - Redirect đến `/admin` dashboard
   - Hiển thị sidebar với đầy đủ quyền
   - Dashboard hiển thị thống kê tổng quan

### **Test Case 1.2: Employee Login**
1. **Thông tin đăng nhập Employee**:
   - Email: `employee@cinema.com`
   - Password: `employee123`
2. **Kết quả mong đợi**:
   - Redirect đến `/employee` dashboard
   - Chỉ hiển thị menu: Dashboard, Ticket Selling, Booking Management, Check-in

### **Test Case 1.3: Member Registration & Login**
1. **Đăng ký mới**: `/auth/Register`
   - Full Name: `Nguyen Van Test`
   - Email: `test@email.com`
   - Password: `test123456`
   - Phone: `0123456789`
2. **Đăng nhập Member**:
   - Redirect đến `/member` dashboard
   - Hiển thị: Profile, Bookings, History, Tickets

---

## 👨‍💼 **PHẦN 2: ADMIN WORKFLOWS**

### **Test Case 2.1: Dashboard Analytics**
1. **Truy cập**: `/admin` (sau khi đăng nhập admin)
2. **Kiểm tra các metrics**:
   - Total Customers: ~11
   - Total Movies: ~12
   - Cinema Halls: ~4
   - Promotions: ~7
3. **Kiểm tra charts**:
   - Revenue Analytics (Line Chart)
   - Top Movies performance
   - Recent Activities
4. **Test Refresh Button**: Click "Làm mới" để reload data

### **Test Case 2.2: Cinema Room Management**
1. **Truy cập**: `/admin/rooms`
2. **View Room List**:
   - Kiểm tra 4 rooms: Standard Room 1, 2, 3, VIP Cinema Room
   - Statistics: 4 Total Rooms, 4 Active, 420 Total Seats, 105 Average
3. **Filter Testing**:
   - Search: "VIP" → Chỉ hiển thị VIP room
   - Filter by Type: "STANDARD" → Chỉ hiển thị standard rooms
   - **Click "Clear Filters"** → Reset về tất cả rooms
4. **Create New Room**:
   ```
   Room Name: "IMAX Theater 1"
   Type: IMAX
   Seats: 100
   Rows: 10, Columns: 10
   Description: "Premium IMAX experience"
   Features: ✓ 3D, ✓ Dolby Atmos
   Price Multiplier: 2.0
   ```
5. **Edit Room**: Click Edit trên room bất kỳ, modify thông tin
6. **View Room Detail**: Click View để xem chi tiết

### **Test Case 2.3: Movie Management**
1. **Truy cập**: `/admin/movies`
2. **View Movie List**: Kiểm tra danh sách phim hiện có
3. **Create New Movie**:
   ```
   Title: "Spider-Man: No Way Home"
   Genre: Action, Adventure
   Duration: 148 minutes
   Price: 75000 VND
   Rating: PG-13
   Release Date: [Future date]
   Description: "Marvel's Spider-Man adventure..."
   Director: "Jon Watts"
   Cast: "Tom Holland, Zendaya"
   ```
4. **Edit Movie**: 
   - Click Edit trên movie
   - **Kiểm tra Description field được populate đúng**
   - Modify và Save
5. **View Movie Detail**:
   - Click View để xem chi tiết
   - **Kiểm tra Description hiển thị với icon**

### **Test Case 2.4: Analytics Deep Dive**
1. **Truy cập**: `/admin/analytics`
2. **Overview Tab**:
   - Revenue Chart hiển thị trend
   - Top Movies performance
   - Booking Statistics
3. **Revenue Tab**: Chi tiết doanh thu theo thời gian
4. **Movies Tab**: Performance comparison các phim
5. **Activities Tab**: Recent activities và Quick Actions
6. **Test Controls**:
   - Click "Thu gọn/Mở rộng" → Layout thay đổi
   - Click "Làm mới" → Charts reload
   - Click "Xuất dữ liệu" → Console log (TODO)

---

## 👨‍💼 **PHẦN 3: EMPLOYEE WORKFLOWS**

### **Test Case 3.1: Employee Dashboard**
1. **Login**: employee credentials
2. **Truy cập**: `/employee`
3. **Kiểm tra Menu**:
   - ✅ Dashboard
   - ✅ Ticket Selling
   - ✅ Booking Management  
   - ✅ Check-in
   - ✅ Members
   - ❌ Không có Admin functions

### **Test Case 3.2: Ticket Selling**
1. **Truy cập**: `/employee/ticket-selling`
2. **Select Movie & Schedule**:
   - Choose movie từ dropdown
   - Select time slot
   - Choose cinema room
3. **Seat Selection**:
   - Visual seat map
   - Select multiple seats
   - Show pricing calculation
4. **Customer Info**:
   - Guest booking hoặc Member lookup
   - Payment method selection
5. **Complete Sale**: Generate ticket

### **Test Case 3.3: Booking Management**
1. **Truy cập**: `/employee/booking-management`
2. **View All Bookings**:
   - Filter by date, status, customer
   - Search functionality
3. **Booking Actions**:
   - View booking details
   - Modify booking (if allowed)
   - Cancel booking
   - Print tickets

### **Test Case 3.4: Check-in Process**
1. **Truy cập**: `/employee/checkin`
2. **Scan/Enter Ticket**:
   - QR code scanner
   - Manual ticket ID entry
3. **Verify Booking**:
   - Customer info display
   - Seat numbers
   - Movie details
4. **Complete Check-in**: Mark as attended

---

## 👤 **PHẦN 4: MEMBER WORKFLOWS**

### **Test Case 4.1: Member Dashboard**
1. **Login**: member credentials
2. **Truy cập**: `/member`
3. **Dashboard Overview**:
   - Welcome message
   - Quick stats (bookings, points)
   - Upcoming movies
   - Recent bookings

### **Test Case 4.2: Movie Browsing & Booking**
1. **Browse Movies**:
   - `/movies` hoặc `/NowShowing`
   - Filter by genre, rating
   - Search functionality
2. **Movie Details**:
   - Click vào movie
   - Xem trailer, description, showtimes
3. **Book Tickets**:
   - Select showtime
   - Choose seats
   - Add concessions
   - Payment process
   - Confirmation

### **Test Case 4.3: Profile Management**
1. **Truy cập**: `/member/profile`
2. **View Profile**: Personal information
3. **Edit Profile**: Update name, phone, preferences
4. **Change Password**: Security settings
5. **Loyalty Points**: View points balance, history

### **Test Case 4.4: Booking History**
1. **Truy cập**: `/member/bookings`
2. **View Bookings**:
   - Upcoming bookings
   - Past bookings
   - Cancelled bookings
3. **Booking Actions**:
   - View e-tickets
   - Download QR codes
   - Cancel booking (if allowed)
   - Rate movie (after watching)

---

## 🔄 **PHẦN 5: INTEGRATION TESTING**

### **Test Case 5.1: End-to-End Booking Flow**
1. **Admin**: Create new movie và schedule
2. **Member**: Book tickets for the movie
3. **Employee**: Check customer in
4. **Admin**: View booking analytics

### **Test Case 5.2: Room Management Impact**
1. **Admin**: Modify room capacity
2. **System**: Update available seats for future shows
3. **Member**: See updated seat availability
4. **Employee**: Confirm seat map changes

### **Test Case 5.3: Cross-Role Data Consistency**
1. **Admin Dashboard**: Shows total bookings
2. **Employee Management**: Shows same booking count
3. **Member History**: Individual bookings sum up correctly
4. **Analytics**: Revenue calculations match bookings

---

## 🚀 **PHẦN 6: PERFORMANCE & UX TESTING**

### **Test Case 6.1: Backend Connection**
1. **With Backend Connected**: Full functionality
2. **Backend Disconnected**: 
   - Fallback to demo data
   - Warning banners displayed
   - CRUD operations disabled gracefully

### **Test Case 6.2: Responsive Design**
1. **Desktop**: Full layout với sidebar
2. **Tablet**: Collapsed sidebar, responsive grids
3. **Mobile**: Mobile-optimized navigation

### **Test Case 6.3: Error Handling**
1. **Invalid Login**: Clear error messages
2. **Network Errors**: Retry mechanisms
3. **Form Validation**: Proper field validation
4. **403/404 Errors**: User-friendly error pages

---

## 📝 **DEMO SCRIPT FOR MENTOR**

### **5-Minute Quick Demo**:
1. **Login as Admin** (30s)
   - Show dashboard analytics
   - Quick tour of sidebar navigation

2. **Room Management** (1.5min)
   - Show room list with statistics
   - **Demo filter clearing bug fix**
   - Create/Edit room flow

3. **Movie Management** (1.5min)
   - Movie list view
   - **Demo description field fix in edit form**
   - **Show improved movie detail page**

4. **Employee Role** (1min)
   - Switch to employee account
   - Show limited permissions
   - Ticket selling interface

5. **Member Experience** (30s)
   - Member dashboard
   - Booking flow preview

### **Detailed Demo Points**:
- ✅ **Backend API Integration**: Real data from Spring Boot backend
- ✅ **Role-based Access Control**: Different UI per role
- ✅ **Recent Bug Fixes**: Filter clear, description field, movie detail
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Error Handling**: Graceful fallbacks when backend unavailable
- ✅ **Modern UI**: Professional cinema management interface

---

## 🎯 **SUCCESS CRITERIA**

- [ ] All authentication flows work
- [ ] Admin can manage rooms, movies, view analytics  
- [ ] Employee can sell tickets, manage bookings
- [ ] Member can browse, book, view history
- [ ] Filter clearing works properly
- [ ] Movie description field populates correctly
- [ ] Movie detail shows description with icon
- [ ] Backend integration stable
- [ ] Error handling graceful
- [ ] Responsive design working

---

## 🔧 **ENVIRONMENT SETUP**

**Prerequisites**:
- Backend: `http://localhost:8080` (Spring Boot)
- Frontend: `http://localhost:3001` (Next.js)
- Database: Connected and seeded

**Test Accounts**:
```
Admin: admin@cinema.com / admin123
Employee: employee@cinema.com / employee123  
Member: member@cinema.com / member123
```

**Start Demo**:
```bash
cd fe_team_1
npm run dev
# Navigate to http://localhost:3001
```

---

*Kịch bản test này cover toàn bộ functionality và highlights những improvements bạn đã thực hiện!*
