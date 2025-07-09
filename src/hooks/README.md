# Hooks Organization

## Cấu trúc thư mục

```
src/hooks/
├── booking/                    # Tất cả hooks liên quan đến booking
│   ├── useBooking.ts          # Hook xử lý tạo booking, lấy thông tin booking
│   ├── useSeatSelection.ts    # Hook xử lý chọn ghế, trạng thái ghế
│   ├── useConcession.ts       # Hook xử lý đồ ăn, thức uống
│   ├── usePayment.ts          # Hook xử lý thanh toán
│   └── usePromotion.ts        # Hook xử lý khuyến mãi
├── member/                    # Hooks cho member
├── HomePage/                  # Hooks cho trang chủ
├── Login/                     # Hooks cho đăng nhập
├── NowShowing/                # Hooks cho phim đang chiếu
├── MoviesApi/                 # Hooks cho API phim
├── ResetPassword/             # Hooks cho reset password
├── VerifyEmail/               # Hooks cho xác thực email
├── useAuth.ts                 # Hook xác thực
├── useDebounce.ts             # Hook debounce
├── usePermisson.ts            # Hook phân quyền
├── decodeJwt.ts               # Utility decode JWT
├── use-mobile.ts              # Hook responsive mobile
└── index.ts                   # Export tất cả hooks
```

## Booking Hooks

### useBooking
- **Chức năng**: Xử lý tạo booking, lấy thông tin booking
- **API**: Tạo booking, lấy booking details, hủy booking
- **Redux**: Quản lý state booking

### useSeatSelection
- **Chức năng**: Xử lý chọn ghế, trạng thái ghế
- **API**: Lấy trạng thái ghế, giữ chỗ tạm thời, layout ghế
- **Redux**: Quản lý selectedSeats, seatTotal

### useConcession
- **Chức năng**: Xử lý đồ ăn, thức uống
- **API**: Lấy danh sách concessions, thêm/xóa khỏi booking
- **Redux**: Quản lý selectedConcessions, concessionsTotal

### usePayment
- **Chức năng**: Xử lý thanh toán
- **API**: Tạo payment, xử lý callback
- **Redux**: Quản lý payment state

### usePromotion
- **Chức năng**: Xử lý khuyến mãi
- **API**: Lấy promotions, áp dụng mã giảm giá
- **Redux**: Quản lý appliedPromotions, discountAmount

## Cách sử dụng

### Import từ thư mục booking
```typescript
import { useBooking } from '@/hooks/booking/useBooking';
import { useSeatSelection } from '@/hooks/booking/useSeatSelection';
import { useConcession } from '@/hooks/booking/useConcession';
import { usePayment } from '@/hooks/booking/usePayment';
import { usePromotion } from '@/hooks/booking/usePromotion';
```

### Import từ index (khuyến nghị)
```typescript
import { 
  useBooking, 
  useSeatSelection, 
  useConcession, 
  usePayment, 
  usePromotion 
} from '@/hooks';
```

## Lưu ý

1. **Không trùng lặp**: Đã xóa các file trùng lặp ở thư mục gốc
2. **Import paths**: Cập nhật tất cả import để sử dụng từ thư mục booking
3. **Interface consistency**: Đảm bảo interface của các hooks nhất quán
4. **Type safety**: Tất cả hooks đều có TypeScript types đầy đủ

## Migration

Nếu bạn đang sử dụng hooks cũ, hãy cập nhật import:

```typescript
// Cũ
import { useBooking } from '@/hooks/useBooking';

// Mới
import { useBooking } from '@/hooks/booking/useBooking';
// hoặc
import { useBooking } from '@/hooks';
``` 