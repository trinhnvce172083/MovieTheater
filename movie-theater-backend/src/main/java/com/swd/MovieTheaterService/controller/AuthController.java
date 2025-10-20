package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.request.*;
import com.swp.MovieTheaterService.dto.response.ApiResponse;
import com.swp.MovieTheaterService.dto.response.AuthResponse;
import com.swp.MovieTheaterService.dto.response.UserProfileResponse;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Authentication Controller - Simplified Version
 * ✅ JSON parsing working với Spring's @RequestBody
 * ✅ Clean code, easy maintenance
 *
 * @author Ngo Viet Trinh
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

    // ==================== PROFILE MANAGEMENT ====================

    @GetMapping("/profile")
    @Operation(summary = "Lấy thông tin profile", description = "Lấy thông tin chi tiết profile của user hiện tại")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(Authentication authentication) {
        String username = authentication.getName();
        log.info("Getting profile for user: {}", username);

        UserProfileResponse profile = authService.getUserProfile(username);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin profile thành công", profile));
    }

    @PutMapping("/profile")
    @Operation(summary = "Cập nhật profile", description = "Cập nhật thông tin profile của user hiện tại")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @Valid @RequestBody UserProfileUpdateRequest request,
            Authentication authentication) {

        String username = authentication.getName();
        log.info("Updating profile for user: {}", username);

        UserProfileResponse updatedProfile = authService.updateUserProfile(username, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật profile thành công", updatedProfile));
    }

    @PostMapping(value = "/profile/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload avatar", description = "Upload avatar cho user hiện tại")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        String username = authentication.getName();
        log.info("Uploading avatar for user: {}", username);

        Map<String, Object> result = authService.uploadUserAvatar(username, file);
        return ResponseEntity.ok(ApiResponse.success("Upload avatar thành công", result));
    }

    @DeleteMapping("/profile/avatar")
    @Operation(summary = "Xóa avatar", description = "Xóa avatar của user hiện tại")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteAvatar(Authentication authentication) {
        String username = authentication.getName();
        log.info("Deleting avatar for user: {}", username);

        Map<String, Object> result = authService.deleteUserAvatar(username);
        return ResponseEntity.ok(ApiResponse.success("Xóa avatar thành công", result));
    }

    @PutMapping(value = "/profile/with-avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Cập nhật profile kèm avatar", description = "Cập nhật thông tin profile và avatar cùng lúc")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfileWithAvatar(
            @RequestParam(value = "profileData", required = false) String profileDataJson,
            @RequestParam(value = "avatar", required = false) MultipartFile avatarFile,
            Authentication authentication) {

        String username = authentication.getName();
        log.info("Updating profile with avatar for user: {}", username);

        UserProfileResponse updatedProfile = authService.updateProfileWithAvatar(username, profileDataJson, avatarFile);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật profile và avatar thành công", updatedProfile));
    }

}
