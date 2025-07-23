# Hướng dẫn sử dụng Promotion API

## Tổng quan

Hệ thống Promotion API đã được tích hợp đầy đủ để quản lý các chương trình khuyến mãi trong ứng dụng cinema. API này hỗ trợ các chức năng CRUD cơ bản và các tính năng nâng cao.

## Cấu trúc API

### 1. API Endpoints

#### Lấy danh sách promotions
```typescript
GET /promotions?page=0&size=10&sortBy=startDate&sortDirection=DESC
```

#### Tạo promotion mới
```typescript
POST /promotions
```

#### Cập nhật promotion
```typescript
PUT /promotions/{id}
```

#### Xóa promotion
```typescript
DELETE /promotions/{id}
```

#### Lấy promotion theo code
```typescript
GET /promotions/code/{code}
```

#### Lấy active promotions
```typescript
GET /promotions/active
```

### 2. Data Types

#### PromotionDto
```typescript
interface PromotionDto {
  promotionId: number;
  promotionCode: string;
  promotionName: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_ONE_GET_ONE';
  discountValue: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  currentUsageCount: number;
  maxUsageCount?: number;
  maxUsagePerUser?: number;
  memberOnly: boolean;
  membershipLevels?: string;
  bannerUrl?: string;
  bannerImageUrl?: string;
  promotionType: 'PUBLIC' | 'POINT_BASED';
  isExpired: boolean;
  isValid: boolean;
  // ... và các trường khác
}
```

## Cách sử dụng trong Frontend

### 1. Hook usePromotions

Hook này cung cấp tất cả các chức năng cần thiết để quản lý promotions:

```typescript
const {
  promotions,
  loading,
  totalCount,
  currentPage,
  pageSize,
  searchTerm,
  selectedRowKeys,
  selectedPromotions,
  statistics,
  setCurrentPage,
  setPageSize,
  setSearchTerm,
  setSelectedRowKeys,
  setSelectedPromotions,
  handleDelete,
  handleBulkDelete,
  handleSavePromotion,
  refreshPromotions,
} = usePromotions();
```

### 2. Các hàm chính

#### Lấy danh sách promotions
```typescript
// Tự động được gọi khi component mount
// Có thể gọi lại bằng refreshPromotions()
```

#### Tạo/Cập nhật promotion
```typescript
const success = await handleSavePromotion(formValues, editingPromotion);
if (success) {
  // Thành công
}
```

#### Xóa promotion
```typescript
await handleDelete(promotion);
```

#### Xóa nhiều promotions
```typescript
await handleBulkDelete();
```

### 3. Components đã được tích hợp

- **PromotionPage**: Trang chính quản lý promotions
- **PromotionTable**: Bảng hiển thị danh sách
- **PromotionModal**: Modal tạo/sửa promotion
- **PromotionFilters**: Bộ lọc tìm kiếm
- **PromotionHeader**: Header với thống kê
- **PromotionViewModal**: Modal xem chi tiết
- **PromotionDetailModal**: Modal chi tiết nâng cao

## Cách test API

### 1. Sử dụng component test
```typescript
import { PromotionAPITest } from '@/components/PromotionAPITest';

// Thêm vào trang admin để test
<PromotionAPITest />
```

### 2. Test thủ công
```typescript
import { testPromotionAPI } from '@/utils/promotion-test-utils';

// Gọi trong console browser
await testPromotionAPI();
```

### 3. Chạy Jest tests
```bash
# Chạy tất cả test promotion
npm test -- __tests__/Promotion

# Chạy test API
npm test -- __tests__/Promotion/PromotionAPI.test.ts

# Chạy test components
npm test -- __tests__/Promotion/PromotionComponents.test.tsx

# Chạy test hook
npm test -- __tests__/Promotion/PromotionHook.test.ts
```

## Cấu hình

### 1. Base URL
API sử dụng base URL: `http://localhost:8080/cinema/api`

### 2. Authentication
API tự động gắn Bearer token từ localStorage vào header Authorization.

### 3. Error Handling
- Tự động refresh token khi gặp lỗi 401/403
- Hiển thị toast messages cho user
- Log chi tiết lỗi vào console

## Lưu ý quan trọng

1. **Mapping dữ liệu**: Frontend đã được cấu hình để map dữ liệu đúng với backend
2. **Validation**: Form validation được thực hiện ở cả frontend và backend
3. **File upload**: Banner upload được hỗ trợ với FormData
4. **Pagination**: Hỗ trợ phân trang với sorting và filtering
5. **Real-time updates**: Danh sách tự động refresh sau khi thao tác

## Troubleshooting

### Lỗi thường gặp

1. **401 Unauthorized**: Kiểm tra token trong localStorage
2. **403 Forbidden**: Kiểm tra quyền truy cập
3. **500 Internal Server Error**: Kiểm tra format dữ liệu gửi lên

### Debug

1. Mở Developer Tools > Console
2. Kiểm tra Network tab để xem API calls
3. Sử dụng component PromotionAPITest để test từng endpoint

## Kết luận

Promotion API đã được tích hợp đầy đủ và sẵn sàng sử dụng. Tất cả các chức năng CRUD cơ bản và nâng cao đều đã được implement với error handling và user experience tốt. 