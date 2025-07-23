# Promotion Tests

Thư mục này chứa các file test cho hệ thống Promotion API và components.

## Cấu trúc thư mục

```
__tests__/Promotion/
├── README.md                    # File này
├── PromotionAPI.test.ts         # Test cho API endpoints
├── PromotionComponents.test.tsx # Test cho React components
└── PromotionHook.test.ts        # Test cho usePromotions hook
```

## Các file test

### 1. PromotionAPI.test.ts
Test các API endpoints của promotion:
- `getAllPromotions` - Lấy danh sách promotions
- `createPromotion` - Tạo promotion mới
- `updatePromotion` - Cập nhật promotion
- `deletePromotion` - Xóa promotion

### 2. PromotionComponents.test.tsx
Test các React components:
- `PromotionAPITest` - Component test API
- `PromotionDemo` - Component demo

### 3. PromotionHook.test.ts
Test custom hook `usePromotions`:
- Khởi tạo state
- Các hàm setter
- Tính toán statistics

## Cách chạy test

### Chạy tất cả test promotion
```bash
npm test -- __tests__/Promotion
```

### Chạy test API
```bash
npm test -- __tests__/Promotion/PromotionAPI.test.ts
```

### Chạy test components
```bash
npm test -- __tests__/Promotion/PromotionComponents.test.tsx
```

### Chạy test hook
```bash
npm test -- __tests__/Promotion/PromotionHook.test.ts
```

## Mocks

Các test sử dụng mocks cho:
- API functions từ `@/api/admin/getAllPromotions`
- Toast notifications từ `react-toastify`
- React components và hooks

## Lưu ý

1. **API Tests**: Cần có backend server chạy để test API thực tế
2. **Component Tests**: Sử dụng React Testing Library
3. **Hook Tests**: Sử dụng `@testing-library/react-hooks`
4. **Type Safety**: Tất cả test đều có TypeScript support

## Cập nhật test

Khi thêm tính năng mới cho promotion:
1. Cập nhật API test nếu có endpoint mới
2. Cập nhật component test nếu có component mới
3. Cập nhật hook test nếu có logic mới trong hook 