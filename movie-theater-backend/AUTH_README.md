# Movie Theater Authentication System

## Tổng quan

Hệ thống authentication cho Movie Theater Management System sử dụng JWT (JSON Web Token) để xác thực và phân quyền người dùng.

## Kiến trúc

### 1. Security Configuration
- **JWT Authentication Filter**: Xử lý JWT token từ request header
- **Security Config**: Cấu hình Spring Security với JWT
- **CORS**: Hỗ trợ Cross-Origin Resource Sharing

### 2. User Management
- **Account Entity**: Quản lý thông tin người dùng
- **Role Enum**: 4 roles - ADMIN, EMPLOYEE, MEMBER, CUSTOMER
- **UserDetailsService**: Custom implementation cho Spring Security

### 3. JWT Service
- **Token Generation**: Tạo access token
- **Token Validation**: Xác thực token
- **Token Extraction**: Lấy thông tin từ token

## API Endpoints

### Authentication Endpoints

#### 1. Register
```http
POST /cinema/auth/register
Content-Type: application/json

{
  "fullName": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "Password123",
  "confirmPassword": "Password123",
  "phoneNumber": "0123456789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900000,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "phoneNumber": "0123456789",
      "role": "CUSTOMER",
      "emailVerified": false
    }
  },
  "timestamp": "2025-01-27T10:30:00"
}
```

#### 2. Login
```http
POST /cinema/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

#### 3. Logout
```http
POST /cinema/auth/logout
Authorization: Bearer <token>
```

#### 4. Email Verification
```http
GET /cinema/auth/verify-email?token=<verification_token>
```

#### 5. Resend Verification Email
```http
POST /cinema/auth/resend-verification?email=user@example.com
```

### Test Endpoints

#### 1. Public Endpoint
```http
GET /cinema/test/public
```

#### 2. Protected Endpoint
```http
GET /cinema/test/protected
Authorization: Bearer <token>
```

#### 3. Role-based Endpoints
```http
GET /cinema/test/admin
Authorization: Bearer <token>
# Requires ADMIN role

GET /cinema/test/customer
Authorization: Bearer <token>
# Requires CUSTOMER role
```

## Cấu hình

### JWT Configuration (application.yml)
```yaml
jwt:
  secret: bW92aWVUaGVhdGVyU2VjcmV0S2V5MjAyNUZvckpXVFRva2VuR2VuZXJhdGlvbg==
  expiration: 900000 # 15 minutes
```

### Security Rules
- Public endpoints: `/auth/**`, `/actuator/**`, `/swagger-ui/**`
- Admin endpoints: `/admin/**` - Requires ADMIN role
- Employee endpoints: `/employee/**` - Requires ADMIN or EMPLOYEE role
- Member endpoints: `/member/**` - Requires ADMIN, EMPLOYEE, or MEMBER role
- Customer endpoints: `/customer/**` - Requires any authenticated role

## Roles và Permissions

### 1. ADMIN
- Toàn quyền truy cập hệ thống
- Quản lý users, movies, schedules, promotions
- Truy cập tất cả endpoints

### 2. EMPLOYEE
- Quản lý bookings, schedules
- Xem thông tin movies, customers
- Không thể quản lý users hoặc system settings

### 3. MEMBER
- Đặt vé với ưu đãi
- Xem lịch sử booking
- Tích điểm membership

### 4. CUSTOMER
- Đặt vé cơ bản
- Xem thông tin movies, schedules
- Quản lý profile cá nhân

## Testing

### 1. Sử dụng Script Test
```bash
chmod +x test-auth.sh
./test-auth.sh
```

### 2. Manual Testing với cURL

**Register:**
```bash
curl -X POST http://localhost:8080/cinema/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "Test123456",
    "confirmPassword": "Test123456",
    "phoneNumber": "0123456789"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8080/cinema/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

**Protected Endpoint:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8080/cinema/test/protected
```

### 3. Swagger UI
Truy cập: http://localhost:8080/cinema/swagger-ui.html

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Mật khẩu xác nhận không khớp",
  "timestamp": "2025-01-27T10:30:00"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Email hoặc mật khẩu không đúng",
  "timestamp": "2025-01-27T10:30:00"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": "Không có quyền truy cập",
  "timestamp": "2025-01-27T10:30:00"
}
```

#### 409 Conflict
```json
{
  "success": false,
  "error": "Email đã được sử dụng",
  "timestamp": "2025-01-27T10:30:00"
}
```

## Security Features

### 1. Password Validation
- Tối thiểu 6 ký tự
- Phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số
- Mã hóa bằng BCrypt

### 2. JWT Security
- Token expiration: 15 minutes
- Bearer token authentication
- Stateless session management

### 3. Email Verification
- Token-based email verification
- 24-hour expiration for verification tokens
- Resend verification functionality

### 4. CORS Configuration
- Configured for development and production
- Supports credentials
- Allows common HTTP methods

## Troubleshooting

### 1. Token Issues
- Kiểm tra token format: `Bearer <token>`
- Verify token expiration
- Check JWT secret configuration

### 2. Database Issues
- Ensure MySQL is running
- Check database connection
- Verify table creation

### 3. Email Verification
- Check email configuration in application.yml
- Verify SMTP settings
- Check verification token expiry

## Next Steps

1. **Refresh Token Implementation**: Implement refresh token mechanism
2. **Email Service**: Integrate email service for verification
3. **OAuth2 Integration**: Add Google/Facebook login
4. **Rate Limiting**: Implement API rate limiting
5. **Audit Logging**: Add security audit logs 