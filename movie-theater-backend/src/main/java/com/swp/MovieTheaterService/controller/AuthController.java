package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.request.LoginRequest;
import com.swp.MovieTheaterService.dto.request.RefreshTokenRequest;
import com.swp.MovieTheaterService.dto.request.RegisterRequest;
import com.swp.MovieTheaterService.dto.response.ApiResponse;
import com.swp.MovieTheaterService.dto.response.AuthResponse;
import com.swp.MovieTheaterService.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Register a new user account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration request received for email: {}", request.getEmail());
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng ký thành công", response));
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request received for email: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Logout user and invalidate token")
    public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            authService.logout(token);
        }
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công", null));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh token", description = "Refresh access token using refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Token refresh request received");
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Token làm mới thành công", response));
    }

    @GetMapping("/check-email")
    @Operation(summary = "Check email availability", description = "Check if email is available for registration")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailAvailability(@RequestParam String email) {
        log.info("Checking email availability for: {}", email);
        boolean isAvailable = authService.isEmailAvailable(email);
        return ResponseEntity.ok(ApiResponse.success("Kiểm tra email thành công", isAvailable));
    }

    @GetMapping("/check-username")
    @Operation(summary = "Check username availability", description = "Check if username is available for registration")
    public ResponseEntity<ApiResponse<Boolean>> checkUsernameAvailability(@RequestParam String username) {
        log.info("Checking username availability for: {}", username);
        boolean isAvailable = authService.isUsernameAvailable(username);
        return ResponseEntity.ok(ApiResponse.success("Kiểm tra username thành công", isAvailable));
    }

    @GetMapping("/verify-email")
    @Operation(summary = "Verify email", description = "Verify user email with token")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestParam String token) {
        log.info("Email verification request received");
        authService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success("Xác thực email thành công", null));
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend verification email", description = "Resend verification email to user")
    public ResponseEntity<ApiResponse<String>> resendVerificationEmail(@RequestParam String email) {
        log.info("Resend verification email request for: {}", email);
        authService.resendVerificationEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Gửi lại email xác thực thành công", null));
    }
} 