# 🔑 TEST ACCOUNTS & SAMPLE DATA

## 👥 **DEMO ACCOUNTS**

### **ADMIN ACCOUNT**
```
Email: admin@cinema.com
Password: admin123
Role: ADMIN
Permissions: Full system access
Landing: /admin
```

### **EMPLOYEE ACCOUNT**
```
Email: employee@cinema.com  
Password: employee123
Role: EMPLOYEE
Permissions: Ticket sales, booking management, check-in
Landing: /employee
```

### **MEMBER ACCOUNT**
```
Email: member@cinema.com
Password: member123
Role: MEMBER
Permissions: Browse movies, book tickets, view history
Landing: /member
```

---

## 🎬 **SAMPLE MOVIES DATA**

### **Now Showing**
1. **Spider-Man: No Way Home**
   - Genre: Action, Adventure
   - Duration: 148 min
   - Rating: PG-13
   - Price: 75,000 VNĐ

2. **Avengers: Endgame**
   - Genre: Action, Sci-Fi
   - Duration: 181 min
   - Rating: PG-13
   - Price: 80,000 VNĐ

3. **The Lion King**
   - Genre: Animation, Family
   - Duration: 118 min
   - Rating: G
   - Price: 65,000 VNĐ

### **Coming Soon**
1. **Avatar: The Way of Water**
2. **Black Panther: Wakanda Forever**
3. **Top Gun: Maverick**

---

## 🏢 **CINEMA ROOMS DATA**

### **Standard Room 1**
- Type: STANDARD
- Capacity: 120 seats (10x12)
- Features: 3D, Dolby Atmos
- Status: Active

### **Standard Room 2**
- Type: STANDARD  
- Capacity: 120 seats (10x12)
- Features: 3D, Dolby Atmos
- Status: Active

### **Standard Room 3**
- Type: STANDARD
- Capacity: 120 seats (10x12)
- Features: 3D
- Status: Active

### **VIP Cinema Room**
- Type: VIP
- Capacity: 60 seats (6x10)
- Features: 3D, Dolby Atmos, Recliner Seats
- Price Multiplier: 1.8x
- Status: Active

---

## 📊 **ANALYTICS DATA**

### **Overview Metrics**
- Total Customers: ~11
- Total Bookings: Variable (based on demo)
- Total Revenue: ~125M VNĐ (mock)
- Total Movies: ~12
- Active Movies: ~8
- Cinema Halls: 4
- Average Rating: 4.2/5
- Occupancy Rate: 75%

### **Growth Metrics**
- Customer Growth: +12.5%
- Booking Growth: +8.3%
- Revenue Growth: +15.7%
- Show Growth: +5.2%

---

## 🎫 **BOOKING SCENARIOS**

### **Successful Booking Flow**
1. Login as Member
2. Browse `/movies` or `/NowShowing`
3. Select "Spider-Man: No Way Home"
4. Choose showtime: "19:00 - 21:28"
5. Select 2 seats in VIP room
6. Add concessions (optional)
7. Enter payment details
8. Receive confirmation & QR code

### **Employee Sale Scenario**
1. Login as Employee
2. Go to `/employee/ticket-selling`
3. Select movie & showtime
4. Choose seats on visual map
5. Enter customer details (guest or member lookup)
6. Process payment
7. Print tickets

### **Check-in Scenario**
1. Employee at `/employee/checkin`
2. Scan QR code or enter ticket ID
3. Verify customer & seat details
4. Mark as checked-in
5. Customer granted entry

---

## 🛠️ **DEMO TROUBLESHOOTING**

### **Common Issues & Solutions**

#### **Login Issues**
- **Problem**: Login fails
- **Solution**: Check backend running on port 8080
- **Fallback**: Use demo mode without authentication

#### **No Data Showing**
- **Problem**: Empty tables/charts
- **Solution**: Check API endpoints in Network tab
- **Fallback**: Mock data should auto-populate

#### **Role Access Issues**
- **Problem**: Wrong permissions after login
- **Solution**: Clear localStorage and re-login
- **Check**: `localStorage.getItem('userInfo')`

#### **Backend Connection**
- **Problem**: 403/500 errors
- **Solution**: Restart backend service
- **Verification**: `curl http://localhost:8080/cinema/api/cinema-rooms`

---

## 🎯 **DEMO SCRIPT VARIATIONS**

### **5-Minute Lightning Demo**
1. Admin dashboard overview (1 min)
2. Room filter bug fix (1 min)
3. Movie description fix (1 min)
4. Employee role demo (1 min)
5. Member booking flow (1 min)

### **10-Minute Detailed Demo**
1. Authentication & roles (2 min)
2. Admin room management (3 min)
3. Admin movie management (2 min)
4. Employee workflows (2 min)
5. Member experience (1 min)

### **15-Minute Comprehensive Demo**
1. System overview & tech stack (2 min)
2. Admin analytics deep dive (4 min)
3. Complete booking workflow (4 min)
4. Employee operations (3 min)
5. Technical highlights & Q&A (2 min)

---

## 📱 **MOBILE DEMO POINTS**

### **Responsive Features**
- Mobile-optimized navigation
- Touch-friendly seat selection
- Responsive movie grids
- Mobile booking flow
- QR code scanning ready

### **Mobile Test URLs**
- Home: `localhost:3001`
- Movies: `localhost:3001/movies`
- Booking: `localhost:3001/booking`
- Member: `localhost:3001/member`

---

## 🚀 **POST-DEMO FOLLOW-UP**

### **Code Repository**
- GitHub: [Repository URL]
- Documentation: README.md
- API Docs: Swagger/OpenAPI
- Test Results: Coverage reports

### **Technical Specs**
- Frontend: Next.js 15, React 19, TypeScript
- Backend: Spring Boot, MySQL
- Authentication: JWT
- Styling: Tailwind CSS, Ant Design
- Testing: Jest, React Testing Library

### **Future Roadmap**
- Payment integration (VNPay, MoMo)
- Real-time seat updates (WebSocket)
- Mobile app development
- Advanced analytics dashboard
- Multi-language support

---

*Ready for a successful demo! 🎉*
