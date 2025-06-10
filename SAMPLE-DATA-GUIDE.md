# 🎬 Lumiere Cinema - Sample Data Guide

Hướng dẫn sử dụng sample data có sẵn trong hệ thống Movie Theater Management.

## 🔐 **Test Accounts**

### **Admin Account**
- **Email**: `admin@lumiere.com`
- **Password**: `admin123`
- **Role**: ADMIN
- **Permissions**: Full system access, movie management, user management, reports

### **Employee Account**
- **Email**: `employee@lumiere.com`
- **Password**: `employee123`
- **Role**: EMPLOYEE
- **Permissions**: Schedule management, booking management, customer service

### **Member Account**
- **Email**: `member@lumiere.com`
- **Password**: `member123`
- **Role**: MEMBER
- **Membership Level**: SILVER (1,250 points)
- **Benefits**: Member discounts, priority booking

### **Customer Account**
- **Email**: `customer@lumiere.com`
- **Password**: `customer123`
- **Role**: CUSTOMER
- **Membership Level**: BRONZE (500 points)
- **Benefits**: Basic customer features

## 🎭 **Sample Movies**

### **1. Avengers: Endgame**
- **Duration**: 181 minutes
- **Genre**: Action, Adventure, Sci-Fi
- **Director**: Anthony Russo, Joe Russo
- **Rating**: PG-13
- **Base Price**: 120,000 VND

### **2. Spider-Man: No Way Home**
- **Duration**: 148 minutes
- **Genre**: Action, Adventure, Sci-Fi
- **Director**: Jon Watts
- **Rating**: PG-13
- **Base Price**: 110,000 VND

### **3. Top Gun: Maverick**
- **Duration**: 131 minutes
- **Genre**: Action, Drama, Thriller
- **Director**: Joseph Kosinski
- **Rating**: PG-13
- **Base Price**: 115,000 VND

### **4. Everything Everywhere All at Once**
- **Duration**: 139 minutes
- **Genre**: Action, Adventure, Comedy, Drama, Sci-Fi
- **Director**: Daniels
- **Rating**: R
- **Base Price**: 105,000 VND

### **5. Avatar: The Way of Water**
- **Duration**: 192 minutes
- **Genre**: Action, Adventure, Drama, Sci-Fi
- **Director**: James Cameron
- **Rating**: PG-13
- **Base Price**: 130,000 VND

## 🏛️ **Cinema Rooms**

### **Standard Rooms**

#### **Cinema Room A**
- **Capacity**: 120 seats (10 rows × 12 columns)
- **Features**: Standard seating
- **Price Multiplier**: 1.0x
- **Seat Layout**: First 2 rows are VIP (A1-A12, B1-B12)

#### **Cinema Room B**
- **Capacity**: 100 seats (10 rows × 10 columns)
- **Features**: Standard seating + Dolby Atmos
- **Price Multiplier**: 1.0x

### **Premium Rooms**

#### **VIP Cinema Room**
- **Capacity**: 60 seats (6 rows × 10 columns)
- **Features**: All VIP seats, recliners, tables, 3D, Dolby Atmos
- **Price Multiplier**: 1.8x
- **All seats**: Premium experience

#### **IMAX Theater**
- **Capacity**: 200 seats (15 rows × 14 columns)
- **Features**: IMAX screen, 3D, Dolby Atmos
- **Price Multiplier**: 2.2x
- **Experience**: Large format cinema

#### **4DX Experience**
- **Capacity**: 80 seats (8 rows × 10 columns)
- **Features**: Motion seats, 3D, Dolby Atmos, recliners
- **Price Multiplier**: 2.5x
- **Experience**: Immersive 4D effects

## 📅 **Sample Schedules**

### **Today's Schedules**

#### **Standard Rooms**
- **Cinema Room A**:
  - 09:00 - Avengers: Endgame (120,000 VND)
  - 14:30 - Spider-Man: No Way Home (110,000 VND)
  - 19:30 - Top Gun: Maverick (115,000 VND)

- **Cinema Room B**:
  - 10:15 - Everything Everywhere All at Once (105,000 VND)
  - 15:00 - Avatar: The Way of Water (130,000 VND)
  - 20:45 - Avengers: Endgame (120,000 VND)

#### **Premium Rooms**
- **VIP Cinema Room** (1.8x pricing):
  - 11:00 - Avatar: The Way of Water 3D (234,000 VND)
  - 16:30 - Top Gun: Maverick (207,000 VND)
  - 21:00 - Spider-Man: No Way Home 3D (198,000 VND)

- **IMAX Theater** (2.2x pricing):
  - 10:30 - Avengers: Endgame IMAX 3D (264,000 VND)
  - 17:00 - Avatar: The Way of Water IMAX 3D (286,000 VND)

- **4DX Experience** (2.5x pricing):
  - 13:00 - Spider-Man: No Way Home 4DX 3D (275,000 VND)
  - 18:15 - Top Gun: Maverick 4DX 3D (287,500 VND)

## 🎁 **Sample Promotions**

### **1. Weekend Special**
- **Discount**: 20% off
- **Valid**: Weekends only
- **Terms**: All movies and showtimes
- **Max Usage**: 5 times per user

### **2. Student Discount**
- **Discount**: 15% off
- **Valid**: All days, all times
- **Terms**: Valid student ID required
- **Max Usage**: 10 times per user

### **3. Happy Hour Matinee**
- **Price**: Fixed 80,000 VND
- **Valid**: Weekdays before 12 PM
- **Terms**: Standard and VIP rooms only
- **Max Usage**: 3 times per user

### **4. VIP Member Exclusive**
- **Discount**: 25% off
- **Valid**: Gold and Platinum members only
- **Terms**: VIP, IMAX, and 4DX rooms
- **Max Usage**: 2 times per user

### **5. Couple Night Special**
- **Offer**: Buy 2 tickets, get 1 free popcorn combo
- **Valid**: After 6 PM
- **Terms**: Any 2 movie tickets
- **Max Usage**: 1 time per user

## 🧪 **Testing Scenarios**

### **User Registration & Login**
1. Test with existing emails (should fail)
2. Register new users with different roles
3. Login with sample accounts
4. Test password reset functionality

### **Movie Booking Flow**
1. Browse movies as guest/user
2. Select movie and showtime
3. Choose seats (test different seat types)
4. Apply promotions/discounts
5. Complete booking process

### **Admin Operations**
1. Login as admin
2. Create new movies
3. Manage schedules
4. View booking reports
5. Manage user accounts

### **Employee Operations**
1. Login as employee
2. Check-in customers
3. Process bookings
4. Handle customer inquiries

### **Premium Experience Testing**
1. Book VIP seats (recliners, tables)
2. Book IMAX experience (premium pricing)
3. Book 4DX experience (motion seats)
4. Test 3D movie selections

## 🔄 **Database Reset**

Để reset database về sample data ban đầu:

```bash
# Stop database
.\dev.ps1 stop

# Remove database volume (this will delete all data)
docker volume rm movie-theater-local-network_mysql-local-data

# Start database again (will recreate with sample data)
.\dev.ps1 db
```

## 📊 **Sample Data Statistics**

- **📱 User Accounts**: 4 (1 Admin, 1 Employee, 1 Member, 1 Customer)
- **🎬 Movies**: 5 popular movies
- **🏛️ Cinema Rooms**: 5 rooms (2 Standard, 3 Premium)
- **💺 Total Seats**: 560 seats
- **📅 Schedules**: 15+ daily schedules
- **🎁 Promotions**: 5 active promotions
- **🎫 Seat Types**: Standard, VIP, Couple, Recliner

## 🚀 **Quick Start Testing**

1. **Start Database**: `.\dev.ps1 db`
2. **Start Backend**: Spring Boot application
3. **Start Frontend**: `npm run dev`
4. **Login**: Use admin@lumiere.com / admin123
5. **Explore**: Navigate through movies, schedules, bookings

**Perfect for development và demo!** 🎬✨ 