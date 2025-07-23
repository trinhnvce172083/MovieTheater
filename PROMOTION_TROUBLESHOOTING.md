# Promotion API Troubleshooting Guide

## Vấn đề: Không hiển thị dữ liệu promotion

### 🔍 **Các bước kiểm tra:**

#### 1. **Kiểm tra Backend Server**
```bash
# Kiểm tra xem backend có đang chạy không
curl http://localhost:8080/cinema/api/health

# Hoặc kiểm tra endpoint promotions
curl http://localhost:8080/cinema/api/promotions
```

#### 2. **Kiểm tra Authentication**
- Mở Developer Tools > Application > Local Storage
- Kiểm tra có `accessToken` và `refreshToken` không
- Token có hợp lệ không (không bị null hoặc expired)

#### 3. **Kiểm tra Network Requests**
- Mở Developer Tools > Network tab
- Tìm các request đến `/promotions`
- Kiểm tra status code và response

### 🚨 **Các lỗi thường gặp:**

#### **404 Not Found**
```
GET http://localhost:8080/cinema/api/promotions 404
```
**Nguyên nhân:** Backend server chưa chạy hoặc endpoint không đúng
**Giải pháp:**
- Khởi động backend server
- Kiểm tra endpoint URL trong backend
- Kiểm tra base URL trong `axiosClient.ts`

#### **401 Unauthorized**
```
GET http://localhost:8080/cinema/api/promotions 401
```
**Nguyên nhân:** Token không hợp lệ hoặc hết hạn
**Giải pháp:**
- Đăng nhập lại để lấy token mới
- Kiểm tra token trong localStorage
- Kiểm tra backend authentication logic

#### **403 Forbidden**
```
GET http://localhost:8080/cinema/api/promotions 403
```
**Nguyên nhân:** Không có quyền truy cập API
**Giải pháp:**
- Kiểm tra role/permission của user
- Đảm bảo user có quyền admin
- Kiểm tra backend authorization logic

#### **CORS Error**
```
Access to fetch at 'http://localhost:8080/cinema/api/promotions' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Nguyên nhân:** Backend chưa cấu hình CORS
**Giải pháp:**
- Cấu hình CORS trong backend
- Thêm `Access-Control-Allow-Origin` header

#### **Network Error**
```
Network Error
```
**Nguyên nhân:** Backend server không thể kết nối
**Giải pháp:**
- Kiểm tra backend server có đang chạy không
- Kiểm tra port 8080 có bị block không
- Kiểm tra firewall settings

### 🛠️ **Cách sử dụng Debug Components:**

#### **1. PromotionDebug Component**
- Hiển thị thông tin environment
- Test API trực tiếp
- Hiển thị lỗi chi tiết

#### **2. PromotionMockData Component**
- Bật/tắt mock data để test UI
- Hiển thị 3 promotions mẫu
- Không cần backend để test UI

### 📋 **Checklist Debug:**

- [ ] Backend server đang chạy trên port 8080
- [ ] API endpoint `/promotions` tồn tại
- [ ] User đã đăng nhập và có token hợp lệ
- [ ] User có quyền admin
- [ ] CORS được cấu hình đúng
- [ ] Network không bị block
- [ ] Console không có lỗi JavaScript

### 🔧 **Cách sửa nhanh:**

#### **Sử dụng Mock Data (Tạm thời)**
1. Bật switch "Enable Mock Data" trong component PromotionMockData
2. UI sẽ hiển thị 3 promotions mẫu
3. Có thể test tất cả chức năng UI

#### **Test API trực tiếp**
1. Sử dụng component PromotionDebug
2. Click "Test API via Axios" hoặc "Test Direct Fetch"
3. Kiểm tra response và error messages

#### **Kiểm tra Backend**
1. Đảm bảo backend server đang chạy
2. Test endpoint bằng Postman hoặc curl
3. Kiểm tra logs của backend

### 📞 **Liên hệ hỗ trợ:**

Nếu vẫn gặp vấn đề, hãy cung cấp:
1. Screenshot của console error
2. Network tab với request/response
3. Backend logs
4. Environment info từ PromotionDebug component 