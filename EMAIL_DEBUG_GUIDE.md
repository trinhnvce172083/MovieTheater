# 🔧 Hướng Dẫn Debug Email Verification Issue

## 📋 Tóm Tắt Vấn Đề
- Khi đăng ký xong không gửi mail cho email
- Cơ chế SMTP có thể bị lỗi
- Có một controller email khác có thể gây conflict

## 🔍 Phân Tích Đã Thực Hiện

### ✅ Code Components Đã Kiểm Tra
1. **EmailService Interface & Implementation** - ✅ OK
2. **EmailServiceImpl** với detailed logging - ✅ Enhanced 
3. **AuthServiceImpl** registration method - ✅ Enhanced với debug logs
4. **Email Templates** (verification.html) - ✅ OK
5. **SMTP Configuration** (application.yml) - ✅ OK
6. **EmailController** - ✅ Không conflict, chỉ là test endpoints

### 🛠️ Improvements Đã Thực Hiện
1. **Enhanced Logging** trong EmailServiceImpl:
   - Added detailed input validation
   - Added step-by-step process logging
   - Added specific exception handling for SMTP errors

2. **Enhanced AuthServiceImpl** registration:
   - Added verbose logging cho email verification process
   - Added null checks cho EmailService
   - Added result verification

3. **Test Endpoints** đã tạo:
   - `POST /cinema/api/emails/test/smtp` - Test SMTP configuration
   - `POST /cinema/api/emails/test/verification` - Test verification email template  
   - `POST /cinema/api/auth/test-registration` - Test registration với debug info

## 🧪 Testing Steps

### Bước 1: Kiểm tra SMTP Configuration
```bash
# Test basic SMTP connection
curl -X POST http://localhost:8080/cinema/api/emails/test/smtp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin-token}" \
  -d '{"email": "gundn.contact@gmail.com"}'
```

### Bước 2: Test Verification Email Template  
```bash
curl -X POST http://localhost:8080/cinema/api/emails/test/verification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin-token}" \
  -d '{
    "to": "gundn.contact@gmail.com", 
    "customerName": "Test User",
    "token": "test-token-123"
  }'
```

### Bước 3: Test Registration với Debug
```bash
curl -X POST http://localhost:8080/cinema/api/auth/test-registration \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser12345",
    "email": "testuser12345@gmail.com",
    "password": "12345Aa!",
    "confirmPassword": "12345Aa!",
    "fullName": "Test User",
    "phoneNumber": "0987654321",
    "dateOfBirth": "1995-01-01",
    "address": "123 Test Street",
    "agreeToTerms": true,
    "acceptMarketing": false
  }'
```

## 🔍 Các Lỗi Có Thể Gặp & Giải Pháp

### 1. EmailService is null
**Nguyên nhân:** Spring không inject EmailService
**Giải pháp:** 
- Kiểm tra @Component/@Service annotation
- Kiểm tra component scan configuration

### 2. SMTP Authentication Error
**Nguyên nhân:** Username/password sai hoặc App Password không đúng
**Giải pháp:**
- Kiểm tra Gmail 2FA đã bật
- Tạo App Password mới
- Cập nhật MAIL_PASSWORD trong application.yml

### 3. Template Processing Error  
**Nguyên nhân:** Thymeleaf không tìm thấy template hoặc variables sai
**Giải pháp:**
- Kiểm tra file `templates/email/verification.html` 
- Kiểm tra template variables mapping

### 4. SMTP Connection Timeout
**Nguyên nhân:** Network issues hoặc firewall blocking
**Giải pháp:**
- Kiểm tra firewall settings
- Thử port 465 thay vì 587
- Kiểm tra network connectivity

## 📊 Expected Log Output

### Khi Email Gửi Thành Công:
```log
🔄 Attempting to send verification email to: test@gmail.com
📧 Verification token: abc123...
⏰ Token expiry: 2025-01-07T15:30:00
🔄 Starting sendVerificationEmail process...
📧 Customer Email: test@gmail.com
👤 Customer Name: Test User
🔑 Verification Token: abc123...
🔗 Verification Link: http://localhost:8080/cinema/auth/verify-email?token=abc123...
📝 Email Subject: [Lumiere Cinema] Xác thực tài khoản của bạn
🔄 Starting sendTemplateEmail process...
🎨 Processing template with Thymeleaf...
✅ Template processed successfully, content length: 8456
🔄 Starting sendHtmlEmail process...
📤 Attempting to send email...
✅ HTML email sent successfully to: test@gmail.com
📬 sendHtmlEmail result: true
📬 Template email send result: true
✅ Verification email sent successfully to: test@gmail.com
```

### Khi Có Lỗi SMTP:
```log
❌ Email Authentication Error: Authentication failed
💡 Check SMTP username/password and app password settings
❌ EmailService returned false for email: test@gmail.com
```

## 🔧 Cấu Hình SMTP Hiện Tại

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: lumierecinema25@gmail.com
    password: juvcrzwuvuwknpqj  # App Password
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
          connectiontimeout: 5000
          timeout: 3000
          writetimeout: 5000
```

## 🚀 Next Steps

1. **Chạy application và monitor logs** để xem detailed error messages
2. **Test từng endpoint** theo thứ tự để isolate issue
3. **Kiểm tra Gmail account settings** cho app password
4. **Nếu vẫn lỗi:** Thử Gmail SMTP khác hoặc SendGrid/AWS SES

## 📞 Support

Nếu vẫn gặp vấn đề, cung cấp:
- Full error logs từ console
- Kết quả test từ các endpoints trên
- Gmail account settings screenshot 