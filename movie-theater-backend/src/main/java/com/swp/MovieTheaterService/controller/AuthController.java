package com.swp.MovieTheaterService.controller;

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
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Authentication Controller - Simplified Version
 * ✅ JSON parsing working với Spring's @RequestBody
 * ✅ Clean code, easy maintenance
 * 
 * @author Dũng_Solo
 * @version 2.5.0 - Simplified
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "🔐 Authentication", description = "API xác thực người dùng")
public class AuthController {

    private final AuthService authService;
    private final RateLimitService rateLimitService;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản mới", description = "Đăng ký tài khoản khách hàng mới")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {

        String clientIp = IpUtils.getClientIpAddress(httpRequest);

        // Debug logging
        log.info("=== REGISTER DEBUG ===");
        log.info("Content-Type: {}", httpRequest.getContentType());
        log.info("Content-Length: {}", httpRequest.getContentLength());
        log.info("Method: {}", httpRequest.getMethod());
        log.info("Request object: {}", request);
        log.info("Client IP: {}", clientIp);
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
    @Operation(summary = "Đăng nhập hệ thống", description = "Xác thực người dùng và trả về JWT token")
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
    @Operation(summary = "Làm mới token", description = "Làm mới access token bằng refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Token refresh request received");
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Token làm mới thành công", response));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Quên mật khẩu", description = "Gửi email đặt lại mật khẩu cho người dùng")
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
    @Operation(summary = "Đặt lại mật khẩu", description = "Đặt lại mật khẩu với token được gửi qua email")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("Password reset request received");
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Mật khẩu đã được đặt lại thành công", null));
    }

    @GetMapping("/check-email")
    @Operation(summary = "Kiểm tra email có sẵn", description = "Kiểm tra xem email có thể dùng để đăng ký không")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailAvailability(@RequestParam String email) {
        boolean isAvailable = authService.isEmailAvailable(email);
        return ResponseEntity.ok(ApiResponse.success("Kiểm tra email thành công", isAvailable));
    }

    @GetMapping("/check-username")
    @Operation(summary = "Kiểm tra username có sẵn", description = "Kiểm tra xem username có thể dùng để đăng ký không")
    public ResponseEntity<ApiResponse<Boolean>> checkUsernameAvailability(@RequestParam String username) {
        boolean isAvailable = authService.isUsernameAvailable(username);
        return ResponseEntity.ok(ApiResponse.success("Kiểm tra username thành công", isAvailable));
    }

    @GetMapping("/verify-email")
    @Operation(summary = "Xác thực email", description = "Xác thực email của người dùng bằng token")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success("Email đã được xác thực thành công", null));
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
                    "Quá nhiều yêu cầu gửi email xác thực. Vui lòng thử lại sau 1 giờ.");
        }

        // Record the attempt
        rateLimitService.recordEmailSendingAttempt(email);

        authService.resendVerificationEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Email xác thực đã được gửi lại", null));
    }

    @PostMapping("/test-registration")
    @Operation(summary = "Test registration with debug info", description = "Test registration và debug email sending")
    public ResponseEntity<Map<String, Object>> testRegistration(
            @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {

        String clientIp = IpUtils.getClientIpAddress(httpRequest);
        log.info("=== TEST REGISTRATION DEBUG START ===");
        log.info("Test registration request from IP: {}", clientIp);
        log.info("Request email: {}", request.getEmail());
        log.info("Request username: {}", request.getUsername());

        try {
            // Attempt registration
            log.info("🔄 Attempting registration...");
            AuthResponse response = authService.register(request);

            log.info("✅ Registration successful!");
            log.info("User ID: {}", response.getUser().getId());
            log.info("Email: {}", response.getUser().getEmail());
            log.info("Email Verified: {}", response.getUser().isEmailVerified());

            Map<String, Object> debugResponse = new HashMap<>();
            debugResponse.put("registrationSuccessful", true);
            debugResponse.put("userId", response.getUser().getId());
            debugResponse.put("email", response.getUser().getEmail());
            debugResponse.put("emailVerified", response.getUser().isEmailVerified());
            debugResponse.put("accessToken", response.getAccessToken());
            debugResponse.put("refreshToken", response.getRefreshToken());
            debugResponse.put("message", "Registration thành công! Kiểm tra log để xem email verification status");
            debugResponse.put("timestamp", java.time.LocalDateTime.now().toString());

            log.info("=== TEST REGISTRATION DEBUG END ===");
            return ResponseEntity.ok(debugResponse);

        } catch (Exception e) {
            log.error("❌ Registration failed: {}", e.getMessage(), e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("registrationSuccessful", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("errorType", e.getClass().getSimpleName());
            errorResponse.put("timestamp", java.time.LocalDateTime.now().toString());

            log.info("=== TEST REGISTRATION DEBUG END (WITH ERROR) ===");
            return ResponseEntity.status(400).body(errorResponse);
        }
    }

}