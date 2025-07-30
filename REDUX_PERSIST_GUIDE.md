# Redux Persist Implementation Guide

## Tổng quan

Redux Persist được implement để lưu trữ trạng thái booking (ghế đã chọn, concessions, promotion) trong localStorage, giúp user không bị mất dữ liệu khi refresh trang hoặc navigate.

## Cấu hình

### 1. Store Configuration (`src/store/index.ts`)

```typescript
// Cấu hình persist cho booking slice
const bookingPersistConfig = {
  key: "booking",
  storage,
  whitelist: [
    "scheduleId",
    "roomId", 
    "selectedSeats",
    "movieInfo",
    "scheduleInfo",
    "selectedConcessions",
    "concessionsTotal",
    "appliedPromotion",
    "promotionCode",
    "discountAmount",
    "seatTotal",
    "totalAmount",
    "finalAmount"
  ],
  // Không persist paymentInfo vì nó có thể chứa thông tin nhạy cảm
  blacklist: ["paymentInfo"]
};
```

### 2. Layout Configuration (`src/app/layout.tsx`)

```typescript
<Provider store={store}>
  <PersistGate loading={null} persistor={persistor}>
    {/* App content */}
  </PersistGate>
</Provider>
```

## Tính năng

### 1. Auto-cleanup
- Booking data tự động được xóa sau 24h không hoạt động
- Được track qua `localStorage.getItem('booking_last_activity')`

### 2. Booking Status Indicator
- Component `BookingStatusIndicator` hiển thị trạng thái booking hiện tại
- Cho phép user tiếp tục từ nơi họ dừng
- Có thể reset booking data

### 3. Conflict Resolution
- Khi user vào booking mới trong khi đang có booking cũ
- Hiển thị confirm dialog để user chọn
- Có thể redirect về booking cũ hoặc bắt đầu booking mới

## Actions mới

### Booking Slice Actions
```typescript
// Clear chỉ selectedSeats (giữ lại thông tin khác)
clearSelectedSeats: (state) => {
  state.selectedSeats = [];
  state.seatTotal = 0;
  state.totalAmount = state.concessionsTotal;
  state.finalAmount = state.totalAmount - state.discountAmount;
},

// Clear concessions (giữ lại ghế đã chọn)
clearConcessions: (state) => {
  state.selectedConcessions = [];
  state.concessionsTotal = 0;
  state.totalAmount = state.seatTotal;
  state.finalAmount = state.totalAmount - state.discountAmount;
},

// Clear promotion (giữ lại ghế và concessions)
clearPromotion: (state) => {
  state.appliedPromotion = null;
  state.promotionCode = '';
  state.discountAmount = 0;
  state.finalAmount = state.totalAmount;
},
```

### useBooking Hook Methods
```typescript
// Check if booking data is valid
const isBookingValid = () => {
  return !!(bookingData.scheduleId && bookingData.roomId);
};

// Check if seats are selected
const hasSelectedSeats = () => {
  return bookingData.selectedSeats.length > 0;
};

// Check if concessions are selected
const hasSelectedConcessions = () => {
  return bookingData.selectedConcessions.length > 0;
};
```

## Sử dụng

### 1. Hiển thị Booking Status
```typescript
import BookingStatusIndicator from "@/components/BookingStatusIndicator";

// Trong component
<BookingStatusIndicator />
```

### 2. Kiểm tra trạng thái booking
```typescript
const { isBookingValid, hasSelectedSeats } = useBooking();

if (isBookingValid()) {
  // Có booking đang thực hiện
  if (hasSelectedSeats()) {
    // Đã chọn ghế
  }
}
```

### 3. Clear booking data
```typescript
const { resetBookingData, clearSelectedSeatsData } = useBooking();

// Clear toàn bộ
resetBookingData();

// Clear chỉ ghế
clearSelectedSeatsData();
```

## Lợi ích

1. **UX tốt hơn**: User không bị mất dữ liệu khi refresh
2. **Resume booking**: Có thể tiếp tục booking từ nơi dừng
3. **Conflict handling**: Xử lý tốt khi có nhiều booking
4. **Auto-cleanup**: Tự động dọn dẹp data cũ
5. **Security**: Không persist thông tin nhạy cảm

## Lưu ý

1. **Storage limit**: localStorage có giới hạn ~5-10MB
2. **Performance**: Persist có thể ảnh hưởng performance khi data lớn
3. **Browser compatibility**: Một số browser cũ có thể không support
4. **Privacy**: Data được lưu locally, không sync với server

## Troubleshooting

### 1. Data không persist
- Kiểm tra whitelist/blacklist configuration
- Kiểm tra browser localStorage support
- Kiểm tra console errors

### 2. Performance issues
- Giảm data size trong whitelist
- Sử dụng blacklist để loại bỏ data không cần thiết
- Implement data compression nếu cần

### 3. Conflict resolution
- Kiểm tra logic trong seat selection page
- Đảm bảo user được thông báo rõ ràng
- Test các trường hợp edge case 