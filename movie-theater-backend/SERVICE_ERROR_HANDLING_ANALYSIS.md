# 📊 Phân tích Error Handling trong Services - Movie Theater Service

## 🎯 Tổng quan

Phân tích việc áp dụng Error Handling trong các service của dự án và đưa ra hướng dẫn cải thiện.

## ✅ Những gì đã được áp dụng ĐÚNG

### 1. **AppException với ErrorCode**

```java
// ✅ Đúng cách - sử dụng ErrorCode enum
throw new AppException(ErrorCode.USER_NOT_FOUND);
throw new AppException(ErrorCode.MOVIE_ALREADY_EXISTS);
throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
```

### 2. **AppException với message parameters**

```java
// ✅ Đúng cách - sử dụng message parameters
throw new AppException(ErrorCode.AGE_INVALID, 1, 120);
throw new AppException(ErrorCode.USERNAME_INVALID, 3);
```

### 3. **AppException với custom message**

```java
// ✅ Đúng cách - override message
throw new AppException(ErrorCode.VALIDATION_ERROR, "User ID không được để trống");
throw new AppException(ErrorCode.ACCESS_DENIED, "Không thể xóa tài khoản ADMIN");
```

### 4. **AppException với cause**

```java
// ✅ Đúng cách - wrap exception với cause
throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, e);
```

### 5. **Business logic validation**

```java
// ✅ Đúng cách - kiểm tra business rules
if (account.getRole() == Role.ADMIN) {
    throw new AppException(ErrorCode.ACCESS_DENIED, "Không thể xóa tài khoản ADMIN");
}

if (fromAccount.getMembershipPoints() < points) {
    throw new AppException(ErrorCode.PAYMENT_INSUFFICIENT_BALANCE, "Số điểm không đủ");
}
```

## ❌ Những gì cần cải thiện

### 1. **Thiếu ValidationUtils**

```java
// ❌ Hiện tại - validation thủ công
if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
    throw new AppException(ErrorCode.USERNAME_INVALID, "Username cannot be null or empty");
}

// ✅ Nên sử dụng - ValidationUtils
ValidationUtils.validateRequiredParameters("username", request.getUsername());
if (!ValidationUtils.isValidLength(request.getUsername(), 3, 50)) {
    throw new AppException(ErrorCode.USERNAME_INVALID, 3);
}
```

### 2. **Thiếu MultipleParameterValidationException**

```java
// ❌ Hiện tại - validate từng field riêng lẻ
if(username ==null)throw new

AppException(ErrorCode.VALIDATION_ERROR);
if(email ==null)throw new

AppException(ErrorCode.VALIDATION_ERROR);

// ✅ Nên sử dụng - MultipleParameterValidationException
ValidationUtils.

validateRequiredParameters(
    "username",username,
    "email",email,
    "phone",phone
    );
```

### 3. **Thiếu comprehensive validation**

```java
// ❌ Hiện tại - chỉ check null/empty
if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
    throw new AppException(ErrorCode.USERNAME_INVALID, "Username cannot be null or empty");
}

// ✅ Nên sử dụng - comprehensive validation
ValidationUtils.validateRequiredParameters("username", request.getUsername());
if (!ValidationUtils.isValidLength(request.getUsername(), 3, 50)) {
    throw new AppException(ErrorCode.USERNAME_INVALID, 3);
}
if (!ValidationUtils.isValidEmail(request.getEmail())) {
    throw new AppException(ErrorCode.EMAIL_INVALID);
}
```

## 🔧 Hướng dẫn cải thiện Services

### 1. **AuthServiceImpl - Đã cải thiện**

```java
// ✅ Đã cập nhật - sử dụng ValidationUtils
ValidationUtils.validateRequiredParameters(
    "username", request.getUsername(),
    "email", request.getEmail(),
    "password", request.getPassword(),
    "fullName", request.getFullName()
);

// Validate field formats
if (!ValidationUtils.isValidLength(request.getUsername(), 3, 50)) {
    throw new AppException(ErrorCode.USERNAME_INVALID, 3);
}

if (!ValidationUtils.isValidEmail(request.getEmail())) {
    throw new AppException(ErrorCode.EMAIL_INVALID);
}
```

### 2. **UserManagementServiceImpl - Cần cải thiện**

```java
// ❌ Hiện tại
private void validateUniqueFields(UserManagementRequest request, Long excludeUserId) {
    if (!isUsernameAvailable(request.getUsername(), excludeUserId)) {
        throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
    }
    // ...
}

// ✅ Nên cải thiện
private void validateUniqueFields(UserManagementRequest request, Long excludeUserId) {
    // Validate required fields first
    ValidationUtils.validateRequiredParameters(
            "username", request.getUsername(),
            "email", request.getEmail()
    );

    // Validate formats
    if (!ValidationUtils.isValidLength(request.getUsername(), 3, 50)) {
        throw new AppException(ErrorCode.USERNAME_INVALID, 3);
    }

    if (!ValidationUtils.isValidEmail(request.getEmail())) {
        throw new AppException(ErrorCode.EMAIL_INVALID);
    }

    // Check uniqueness
    if (!isUsernameAvailable(request.getUsername(), excludeUserId)) {
        throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
    }

    if (!isEmailAvailable(request.getEmail(), excludeUserId)) {
        throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
    }
}
```

### 3. **MovieServiceImpl - Cần cải thiện**

```java
// ❌ Hiện tại
@Override
public MovieResponse createMovie(MovieCreateRequest request) {
    if (movieRepository.existsByTitleIgnoreCaseAndIsActiveTrue(request.getTitle())) {
        throw new AppException(ErrorCode.MOVIE_ALREADY_EXISTS);
    }
    // ...
}

// ✅ Nên cải thiện
@Override
public MovieResponse createMovie(MovieCreateRequest request) {
    // Validate required fields
    ValidationUtils.validateRequiredParameters(
        "title", request.getTitle(),
        "description", request.getDescription()
    );
    
    // Validate formats
    if (!ValidationUtils.isValidLength(request.getTitle(), 1, 200)) {
        throw new AppException(ErrorCode.MOVIE_TITLE_INVALID);
    }
    
    if (!ValidationUtils.isValidLength(request.getDescription(), 10, 1000)) {
        throw new AppException(ErrorCode.VALIDATION_ERROR, "Mô tả phim phải từ 10-1000 ký tự");
    }
    
    // Check business rules
    if (movieRepository.existsByTitleIgnoreCaseAndIsActiveTrue(request.getTitle())) {
        throw new AppException(ErrorCode.MOVIE_ALREADY_EXISTS);
    }
    
    // Continue with creation...
}
```

### 4. **CinemaRoomServiceImpl - Cần cải thiện**

```java
// ❌ Hiện tại
@Override
public CinemaRoomResponse createCinemaRoom(CinemaRoomCreateRequest request) {
    if (!request.isSeatQuantityValid()) {
        throw new AppException(ErrorCode.CINEMA_ROOM_CAPACITY_INVALID);
    }
    // ...
}

// ✅ Nên cải thiện
@Override
public CinemaRoomResponse createCinemaRoom(CinemaRoomCreateRequest request) {
    // Validate required fields
    ValidationUtils.validateRequiredParameters(
        "cinemaRoomName", request.getCinemaRoomName(),
        "seatQuantity", request.getSeatQuantity()
    );
    
    // Validate formats
    if (!ValidationUtils.isValidLength(request.getCinemaRoomName(), 2, 100)) {
        throw new AppException(ErrorCode.VALIDATION_ERROR, "Tên phòng chiếu phải từ 2-100 ký tự");
    }
    
    // Validate business rules
    if (!request.isSeatQuantityValid()) {
        throw new AppException(ErrorCode.CINEMA_ROOM_CAPACITY_INVALID);
    }
    
    if (cinemaRoomRepository.existsByCinemaRoomNameIgnoreCaseAndIsActiveTrue(request.getCinemaRoomName())) {
        throw new AppException(ErrorCode.CINEMA_ROOM_ALREADY_EXISTS);
    }
    
    // Continue with creation...
}
```

## 📋 Checklist cải thiện Services

### Services đã được cải thiện:

- [x] **AuthServiceImpl** - Đã thêm ValidationUtils
- [x] **UserManagementServiceImpl** - Đã thêm ValidationUtils cho validateUniqueFields()
- [x] **MovieServiceImpl** - Đã thêm ValidationUtils cho createMovie()
- [x] **CinemaRoomServiceImpl** - Đã thêm ValidationUtils cho createCinemaRoom()
- [x] **ScheduleServiceImpl** - Đã thêm ValidationUtils cho createSchedule()
- [x] **BookingServiceImpl** - Đã thêm ValidationUtils cho createGuestBooking()
- [x] **PromotionServiceImpl** - Đã thêm ValidationUtils cho createPromotion()
- [x] **LoyaltyService** - Đã thêm ValidationUtils cho earnPointsFromBooking()

### Services đã hoàn thiện:

✅ **Tất cả services chính đã được bổ sung ValidationUtils và comprehensive validation!**

## 🎯 Best Practices cho Services

### 1. **Validation Order**

```java
// 1. Validate required parameters first
ValidationUtils.validateRequiredParameters("field1", value1, "field2", value2);

// 2. Validate formats
if (!ValidationUtils.isValidEmail(email)) {
    throw new AppException(ErrorCode.EMAIL_INVALID);
}

// 3. Validate business rules
if (repository.existsByField(value)) {
    throw new AppException(ErrorCode.RESOURCE_ALREADY_EXISTS);
}

// 4. Proceed with business logic
```

### 2. **Error Code Usage**

```java
// ✅ Đúng - sử dụng specific error codes
throw new AppException(ErrorCode.USER_NOT_FOUND);
throw new AppException(ErrorCode.EMAIL_INVALID);
throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);

// ❌ Sai - sử dụng generic error codes
throw new AppException(ErrorCode.VALIDATION_ERROR, "User not found");
throw new AppException(ErrorCode.VALIDATION_ERROR, "Invalid email");
```

### 3. **Message Parameters**

```java
// ✅ Đúng - sử dụng message parameters
throw new AppException(ErrorCode.USERNAME_INVALID, 3);
throw new AppException(ErrorCode.AGE_INVALID, 18, 65);

// ❌ Sai - hardcode values
throw new AppException(ErrorCode.USERNAME_INVALID, "Username must be at least 3 characters");
```

### 4. **Exception Wrapping**

```java
// ✅ Đúng - wrap external exceptions
try {
    externalService.call();
} catch (ExternalException e) {
    log.error("External service error", e);
    throw new AppException(ErrorCode.EXTERNAL_SERVICE_ERROR, e);
}
```

## 📚 Tài liệu tham khảo

- [Error Handling System Guide](../docs/Error_Handling_System_Guide.md)
- [ValidationUtils Documentation](../src/main/java/com/swp/MovieTheaterService/utils/ValidationUtils.java)
- [ErrorCode Documentation](../src/main/java/com/swp/MovieTheaterService/exception/ErrorCode.java)
- [AppException Documentation](../src/main/java/com/swp/MovieTheaterService/exception/AppException.java)

---
*Cập nhật lần cuối: 06/01/2025*
*Tác giả: Dũng_Solo* 