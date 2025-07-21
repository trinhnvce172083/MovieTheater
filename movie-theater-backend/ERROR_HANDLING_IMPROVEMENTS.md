# 🚀 Cải tiến Hệ thống Error Handling - Movie Theater Service

## 📋 Tổng quan

Đã áp dụng và cải tiến hệ thống Error Handling theo hướng dẫn để đảm bảo tất cả API endpoints trả về `ApiResponse` hoàn
chỉnh cho frontend.

## ✅ Những gì đã được cải tiến

### 1. **Thêm MultipleParameterValidationException**

- **File:** `exception/MultipleParameterValidationException.java`
- **Mục đích:** Xử lý validation cho nhiều tham số cùng lúc
- **Sử dụng:** Khi cần validate nhiều field cùng lúc

### 2. **Bổ sung Error Codes**

- **File:** `exception/ErrorCode.java`
- **Thêm:** `NOT_EMPTY`, `MIN_LENGTH`, `MAX_LENGTH`
- **Mục đích:** Hỗ trợ validation tốt hơn

### 3. **Cải tiến GlobalExceptionHandler**

- **File:** `exception/GlobalExceptionHandler.java`
- **Cải tiến:**
    - Enhanced validation error handling với `ErrorDetail`
    - Thêm handler cho `MultipleParameterValidationException`
    - Cải tiến `BindException` handling
    - Thêm helper method `formatMessage()`

### 4. **Thêm Custom Validators**

- **Files:**
    - `validator/CustomConstraint.java`
    - `validator/CustomValidator.java`
- **Mục đích:** Hỗ trợ validation linh hoạt với min/max length

### 5. **Thêm ValidationUtils**

- **File:** `utils/ValidationUtils.java`
- **Chức năng:**
    - Validate required parameters
    - Email format validation
    - Phone format validation
    - Age range validation
    - String length validation
    - Numeric range validation

### 6. **Cập nhật Controllers**

Đã cập nhật các controllers sau để trả về `ApiResponse`:

#### ✅ UserManagementController

- `getAllUsers()` → `ApiResponse<PageResponse<UserManagementResponse>>`
- `getUserById()` → `ApiResponse<UserManagementResponse>`
- `createUser()` → `ApiResponse<UserManagementResponse>`
- `updateUser()` → `ApiResponse<UserManagementResponse>`
- `deleteUser()` → `ApiResponse<String>`

#### ✅ MovieController

- `createMovie()` → `ApiResponse<MovieResponse>`
- `getMovie()` → `ApiResponse<MovieResponse>`
- `deleteMovie()` → `ApiResponse<String>`
- `getAllMovies()` → `ApiResponse<Page<MovieSummaryResponse>>`

#### ✅ CinemaRoomController

- `createCinemaRoom()` → `ApiResponse<CinemaRoomResponse>`
- `updateCinemaRoom()` → `ApiResponse<CinemaRoomResponse>`
- `getCinemaRoom()` → `ApiResponse<CinemaRoomResponse>`
- `deleteCinemaRoom()` → `ApiResponse<String>`
- `getAllCinemaRooms()` → `ApiResponse<Page<CinemaRoomResponse>>`

## 🔧 Cách sử dụng trong Service

### 1. **Sử dụng AppException với ErrorCode**

```java
public Account getUserById(Long userId) {
    if (userId == null) {
        throw new AppException(ErrorCode.VALIDATION_ERROR, "User ID không được để trống");
    }
    
    Account account = accountRepository.findById(userId)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    
    return account;
}
```

### 2. **Sử dụng MultipleParameterValidationException**

```java
public void validateUserData(String username, String email, String phone) {
    ValidationUtils.validateRequiredParameters(
        "username", username,
        "email", email,
        "phone", phone
    );
    
    if (!ValidationUtils.isValidEmail(email)) {
        throw new AppException(ErrorCode.EMAIL_INVALID);
    }
}
```

### 3. **Sử dụng AppException với message parameters**

```java
public void updateUserAge(Long userId, int age) {
    if (!ValidationUtils.isValidAge(age, 1, 120)) {
        throw new AppException(ErrorCode.AGE_INVALID, 1, 120);
    }
}
```

## 🔧 Cách sử dụng trong Controller

### 1. **Success Response**

```java
@GetMapping("/{id}")
public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable Long id) {
    UserResponse result = userService.getUserById(id);
    return ResponseEntity.ok(ApiResponse.success("Lấy thông tin người dùng thành công", result));
}
```

### 2. **Create Response (201)**

```java
@PostMapping
public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserRequest request) {
    UserResponse result = userService.createUser(request);
    return ResponseEntity.status(201).body(ApiResponse.success("Tạo người dùng thành công", result));
}
```

### 3. **Delete Response**

```java
@DeleteMapping("/{id}")
public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
    userService.deleteUser(id);
    return ResponseEntity.ok(ApiResponse.success("Xóa người dùng thành công", null));
}
```

## 📝 Response Format Examples

### ✅ Success Response

```json
{
  "success": true,
  "code": 200,
  "message": "Lấy thông tin người dùng thành công",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  },
  "timestamp": "2025-01-06T12:00:00"
}
```

### ❌ Error Response

```json
{
  "success": false,
  "code": 1001,
  "message": "Người dùng không tồn tại",
  "errorCode": "USER_NOT_FOUND",
  "timestamp": "2025-01-06T12:00:00"
}
```

### ❌ Validation Error Response

```json
{
  "success": false,
  "code": 1002,
  "message": "username: Phải ít nhất 3 ký tự",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "username",
      "message": "username: Phải ít nhất 3 ký tự",
      "rejectedValue": "ab"
    },
    {
      "field": "email",
      "message": "email: Email không đúng định dạng",
      "rejectedValue": "invalid-email"
    }
  ],
  "timestamp": "2025-01-06T12:00:00"
}
```

## 🎯 Best Practices

### 1. **Error Code Organization**

- 1000-1099: General errors
- 1100-1199: Authentication & Authorization
- 1200-1299: User Management
- 1300-1399: Movie Management
- 1400-1499: Cinema & Room Management
- 1500-1599: Schedule Management
- 1600-1699: Booking Management
- 1700-1799: Payment Management
- 1800-1899: Promotion Management
- 1900-1999: Rate Limiting
- 2000-2099: File Upload Management
- 2100-2199: Auto Schedule Management
- 2200-2299: Analytics & Reporting
- 2300-2399: Email & Notification
- 2400-2499: Concession Management

### 2. **Message Format**

- Sử dụng placeholder `{variable}` cho dynamic values
- Message ngắn gọn, rõ ràng bằng tiếng Việt
- Hỗ trợ đa ngôn ngữ (có thể mở rộng)

### 3. **HTTP Status Codes**

- 200: OK (success)
- 201: Created (create success)
- 400: Bad Request (validation, business logic)
- 401: Unauthorized (authentication)
- 403: Forbidden (authorization)
- 404: Not Found (resource not found)
- 409: Conflict (resource already exists)
- 429: Too Many Requests (rate limit)
- 500: Internal Server Error (unexpected errors)

### 4. **Logging**

- Log tất cả exceptions trong GlobalExceptionHandler
- Sử dụng appropriate log levels (warn, error, debug)
- Không log sensitive information

## 🔄 Controllers cần cập nhật tiếp theo

Các controllers sau vẫn cần được cập nhật để sử dụng `ApiResponse`:

- [ ] `LoyaltyController`
- [ ] `ConcessionController`
- [ ] `PromotionController`
- [ ] `AnalyticsController`
- [ ] `ScheduleController`
- [ ] `BookingController`
- [ ] `FileUploadController`
- [ ] `PaymentController`
- [ ] `VNPayController`
- [ ] `EmailController`
- [ ] `ImageController`

## 📚 Tài liệu tham khảo

- [Error Handling System Guide](../docs/Error_Handling_System_Guide.md)
- [ApiResponse Documentation](../src/main/java/com/swp/MovieTheaterService/dto/response/ApiResponse.java)
- [ErrorCode Documentation](../src/main/java/com/swp/MovieTheaterService/exception/ErrorCode.java)
- [GlobalExceptionHandler Documentation](../src/main/java/com/swp/MovieTheaterService/exception/GlobalExceptionHandler.java)

## 🎉 Kết quả

✅ **Đã hoàn thành:**

- Hệ thống Error Handling hoàn chỉnh
- Tất cả controllers chính đã được cập nhật
- Response format nhất quán
- Validation error handling tốt hơn
- Custom validators và utilities

🔄 **Cần tiếp tục:**

- Cập nhật các controllers còn lại
- Test tất cả endpoints
- Cập nhật documentation
- Training team về cách sử dụng

---
*Cập nhật lần cuối: 06/01/2025*
*Tác giả: Dũng_Solo* 