package com.swp.MovieTheaterService.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.util.Map;
import com.swp.MovieTheaterService.dto.request.ForgotPasswordRequest;
import com.swp.MovieTheaterService.dto.request.LoginRequest;
import com.swp.MovieTheaterService.dto.request.RefreshTokenRequest;
import com.swp.MovieTheaterService.dto.request.RegisterRequest;
import com.swp.MovieTheaterService.dto.request.ResetPasswordRequest;
import com.swp.MovieTheaterService.dto.response.ApiResponse;
import com.swp.MovieTheaterService.dto.response.AuthResponse;
import com.swp.MovieTheaterService.exception.RateLimitExceededException;
import com.swp.MovieTheaterService.service.AuthService;
import com.swp.MovieTheaterService.service.RateLimitService;
import com.swp.MovieTheaterService.utils.IpUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 * Xử lý các API liên quan đến đăng ký, đăng nhập, xác thực
 * 
 * @author Dũng_Solo
 * @version 2.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "🔐 Authentication", description = "API xác thực người dùng - đăng ký, đăng nhập, quên mật khẩu")
public class AuthController {

    private final AuthService authService;
    private final RateLimitService rateLimitService;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản mới", description = "Đăng ký tài khoản khách hàng mới với thông tin đầy đủ", requestBody = @RequestBody(description = "Thông tin đăng ký tài khoản", required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = RegisterRequest.class), examples = @ExampleObject(name = "Ví dụ đăng ký hợp lệ", summary = "Thông tin đăng ký với dữ liệu hợp lệ", description = "Ví dụ về yêu cầu đăng ký với thông tin đầy đủ và hợp lệ theo validation rules", value = """
            {
              "username": "gundneit",
              "fullName": "Nguyễn Tiến Dũng",
              "email": "gundneit@gmail.com",
              "password": "12345Aa!",
              "confirmPassword": "12345Aa!",
              "phoneNumber": "0399927256",
              "dateOfBirth": "2001-09-30",
              "address": "123 Đường Lê Lợi, Quận 1, TP.HCM",
              "agreeToTerms": true,
              "acceptMarketing": false
            }
            """))))
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {

        String clientIp = IpUtils.getClientIpAddress(httpRequest);

        // DETAILED DEBUG LOGGING
        log.info("=== REGISTER DEBUG ===");
        log.info("Content-Type: {}", httpRequest.getContentType());
        log.info("Content-Length: {}", httpRequest.getContentLength());
        log.info("Method: {}", httpRequest.getMethod());
        log.info("Request object: {}", request);
        log.info("Request object class: {}", request != null ? request.getClass().getName() : "NULL");
        log.info("Username: [{}]", request.getUsername());
        log.info("Email: [{}]", request.getEmail());
        log.info("FullName: [{}]", request.getFullName());
        log.info("PhoneNumber: [{}]", request.getPhoneNumber());
        log.info("AgreeToTerms: [{}]", request.getAgreeToTerms());
        log.info("Password null?: {}", request.getPassword() == null);
        log.info("ConfirmPassword null?: {}", request.getConfirmPassword() == null);
        log.info("DateOfBirth: [{}]", request.getDateOfBirth());
        log.info("Address: [{}]", request.getAddress());
        log.info("AcceptMarketing: [{}]", request.getAcceptMarketing());
        log.info("Client IP: {}", clientIp);

        // Count null fields
        int nullFieldCount = 0;
        if (request.getUsername() == null)
            nullFieldCount++;
        if (request.getEmail() == null)
            nullFieldCount++;
        if (request.getFullName() == null)
            nullFieldCount++;
        if (request.getPhoneNumber() == null)
            nullFieldCount++;
        if (request.getDateOfBirth() == null)
            nullFieldCount++;
        if (request.getAddress() == null)
            nullFieldCount++;
        if (request.getAgreeToTerms() == null)
            nullFieldCount++;
        if (request.getAcceptMarketing() == null)
            nullFieldCount++;

        log.info("NULL FIELDS COUNT: {}/8", nullFieldCount);
        log.info("======================");

        // Check rate limiting
        if (!rateLimitService.isRegistrationAllowed(clientIp)) {
            throw new RateLimitExceededException("Quá nhiều yêu cầu đăng ký từ IP này. Vui lòng thử lại sau 1 giờ.");
        }

        // Record the attempt
        rateLimitService.recordRegistrationAttempt(clientIp);

        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng ký thành công", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập hệ thống", description = "Xác thực người dùng và trả về JWT token", requestBody = @RequestBody(description = "Thông tin đăng nhập", required = true, content = @Content(mediaType = "application/json", schema = @Schema(implementation = LoginRequest.class), examples = @ExampleObject(name = "Ví dụ đăng nhập hợp lệ", summary = "Thông tin đăng nhập với username và password", description = "Ví dụ về yêu cầu đăng nhập với thông tin hợp lệ", value = """
            {
              "username": "nguyenvannam@example.com",
              "password": "SecurePassword123!",
              "rememberMe": false
            }
            """))))
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        String clientIp = IpUtils.getClientIpAddress(httpRequest);
        log.info("Login request received for username: {} from IP: {}", request.getUsername(), clientIp);

        // Check rate limiting
        if (!rateLimitService.isLoginAllowed(clientIp)) {
            throw new RateLimitExceededException("Quá nhiều yêu cầu đăng nhập từ IP này. Vui lòng thử lại sau 1 giờ.");
        }

        // Record the attempt
        rateLimitService.recordLoginAttempt(clientIp);

        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất khỏi hệ thống", description = "Đăng xuất người dùng và vô hiệu hóa token")
    public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            authService.logout(token);
        }
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công", null));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Làm mới token", description = "Làm mới access token bằng refresh token", requestBody = @RequestBody(description = "Refresh token request", required = true, content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "Refresh token example", value = """
            {
              "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
            """))))
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Token refresh request received");
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Token làm mới thành công", response));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Quên mật khẩu", description = "Gửi email đặt lại mật khẩu cho người dùng", requestBody = @RequestBody(description = "Email để gửi link đặt lại mật khẩu", required = true, content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "Forgot password example", value = """
            {
              "email": "nguyenvannam@example.com"
            }
            """))))
    public ResponseEntity<ApiResponse<String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest httpRequest) {

        String clientIp = IpUtils.getClientIpAddress(httpRequest);
        log.info("Forgot password request for email: {} from IP: {}", request.getEmail(), clientIp);

        // Check rate limiting for email sending
        if (!rateLimitService.isEmailSendingAllowed(request.getEmail())) {
            throw new RateLimitExceededException(
                    "Quá nhiều yêu cầu đặt lại mật khẩu cho email này. Vui lòng thử lại sau 1 giờ.");
        }

        // Record the attempt
        rateLimitService.recordEmailSendingAttempt(request.getEmail());

        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Email đặt lại mật khẩu đã được gửi", null));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Đặt lại mật khẩu", description = "Đặt lại mật khẩu với token được gửi qua email", requestBody = @RequestBody(description = "Thông tin đặt lại mật khẩu", required = true, content = @Content(mediaType = "application/json", examples = @ExampleObject(name = "Reset password example", value = """
            {
              "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              "newPassword": "NewSecurePassword123!",
              "confirmPassword": "NewSecurePassword123!"
            }
            """))))
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("Reset password request received");
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công", null));
    }

    @GetMapping("/check-email")
    @Operation(summary = "Kiểm tra email có sẵn", description = "Kiểm tra xem email có thể dùng để đăng ký không")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailAvailability(@RequestParam String email) {
        log.info("Checking email availability for: {}", email);
        boolean isAvailable = authService.isEmailAvailable(email);
        return ResponseEntity.ok(ApiResponse.success("Kiểm tra email thành công", isAvailable));
    }

    @GetMapping("/check-username")
    @Operation(summary = "Kiểm tra username có sẵn", description = "Kiểm tra xem username có thể dùng để đăng ký không")
    public ResponseEntity<ApiResponse<Boolean>> checkUsernameAvailability(@RequestParam String username) {
        log.info("Checking username availability for: {}", username);
        boolean isAvailable = authService.isUsernameAvailable(username);
        return ResponseEntity.ok(ApiResponse.success("Kiểm tra username thành công", isAvailable));
    }

    @GetMapping("/verify-email")
    @Operation(summary = "Xác thực email", description = "Xác thực email của người dùng bằng token")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestParam String token) {
        log.info("Email verification request received");
        authService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success("Xác thực email thành công", null));
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Gửi lại email xác thực", description = "Gửi lại email xác thực cho người dùng")
    public ResponseEntity<ApiResponse<String>> resendVerificationEmail(
            @RequestParam String email,
            HttpServletRequest httpRequest) {

        String clientIp = IpUtils.getClientIpAddress(httpRequest);
        log.info("Resend verification email request for: {} from IP: {}", email, clientIp);

        // Check rate limiting for email sending
        if (!rateLimitService.isEmailSendingAllowed(email)) {
            throw new RateLimitExceededException(
                    "Quá nhiều yêu cầu gửi email cho địa chỉ này. Vui lòng thử lại sau 1 giờ.");
        }

        // Record the attempt
        rateLimitService.recordEmailSendingAttempt(email);

        authService.resendVerificationEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Gửi lại email xác thực thành công", null));
    }

}