package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.dto.request.LoginRequest;
import com.swp.MovieTheaterService.dto.request.RegisterRequest;
import com.swp.MovieTheaterService.dto.request.ForgotPasswordRequest;
import com.swp.MovieTheaterService.dto.request.ResetPasswordRequest;
import com.swp.MovieTheaterService.dto.response.AuthResponse;
import com.swp.MovieTheaterService.entity.Account;
import com.swp.MovieTheaterService.enums.Role;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.repository.AccountRepository;
import com.swp.MovieTheaterService.service.AuthService;
import com.swp.MovieTheaterService.service.EmailService;
import com.swp.MovieTheaterService.service.JwtService;
import com.swp.MovieTheaterService.service.TokenBlacklistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import jakarta.annotation.PostConstruct;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final EmailService emailService;
    private final TokenBlacklistService tokenBlacklistService;

    @PostConstruct
    private void validateDependencies() {
        log.info("=== VALIDATING DEPENDENCIES ===");
        if (accountRepository == null) {
            log.error("❌ AccountRepository is null");
            throw new IllegalStateException("AccountRepository dependency is null");
        }
        log.info("✅ AccountRepository initialized");

        if (passwordEncoder == null) {
            log.error("❌ PasswordEncoder is null");
            throw new IllegalStateException("PasswordEncoder dependency is null");
        }
        log.info("✅ PasswordEncoder initialized");

        if (jwtService == null) {
            log.error("❌ JwtService is null");
            throw new IllegalStateException("JwtService dependency is null");
        }
        log.info("✅ JwtService initialized");

        if (authenticationManager == null) {
            log.error("❌ AuthenticationManager is null");
            throw new IllegalStateException("AuthenticationManager dependency is null");
        }
        log.info("✅ AuthenticationManager initialized");

        if (userDetailsService == null) {
            log.error("❌ UserDetailsService is null");
            throw new IllegalStateException("UserDetailsService dependency is null");
        }
        log.info("✅ UserDetailsService initialized");

        if (emailService == null) {
            log.warn("⚠️ EmailService is null - email functionality will be disabled");
        } else {
            log.info("✅ EmailService initialized");
        }

        if (tokenBlacklistService == null) {
            log.error("❌ TokenBlacklistService is null");
            throw new IllegalStateException("TokenBlacklistService dependency is null");
        }
        log.info("✅ TokenBlacklistService initialized");
        log.info("=== ALL DEPENDENCIES VALIDATED ===");
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("=== REGISTER METHOD START ===");

        // 1. Validate request object
        if (request == null) {
            log.error("RegisterRequest object is null");
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Request object is null");
        }
        log.info("✅ Request object is not null");

        // 2. Validate critical dependencies (should not happen in production)
        if (accountRepository == null) {
            log.error("AccountRepository is null");
            throw new AppException(ErrorCode.VALIDATION_ERROR, "System configuration error");
        }
        log.info("✅ AccountRepository is not null");

        if (passwordEncoder == null) {
            log.error("PasswordEncoder is null");
            throw new AppException(ErrorCode.VALIDATION_ERROR, "System configuration error");
        }
        log.info("✅ PasswordEncoder is not null");

        if (jwtService == null) {
            log.error("JwtService is null");
            throw new AppException(ErrorCode.VALIDATION_ERROR, "System configuration error");
        }
        log.info("✅ JwtService is not null");

        // 3. Validate request fields
        log.info("Validating request fields...");

        // Validate critical fields
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            log.error("Username is null or empty: [{}]", request.getUsername());
            throw new AppException(ErrorCode.USERNAME_INVALID, "Username cannot be null or empty");
        }

        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            log.error("Email is null or empty: [{}]", request.getEmail());
            throw new AppException(ErrorCode.EMAIL_INVALID, "Email cannot be null or empty");
        }

        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            log.error("Password is null or empty");
            throw new AppException(ErrorCode.PASSWORD_INVALID, "Password cannot be null or empty");
        }

        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            log.error("FullName is null or empty: [{}]", request.getFullName());
            throw new AppException(ErrorCode.FULLNAME_INVALID, "Full name cannot be null or empty");
        }

        // DEBUG: Log all field values
        log.info("=== AUTHSERVICE DEBUG ===");
        log.info("Username: [{}] (null: {})", request.getUsername(), request.getUsername() == null);
        log.info("Email: [{}] (null: {})", request.getEmail(), request.getEmail() == null);
        log.info("FullName: [{}] (null: {})", request.getFullName(), request.getFullName() == null);
        log.info("Password: [PROTECTED] (null: {})", request.getPassword() == null);
        log.info("PhoneNumber: [{}] (null: {})", request.getPhoneNumber(), request.getPhoneNumber() == null);
        log.info("DateOfBirth: [{}] (null: {})", request.getDateOfBirth(), request.getDateOfBirth() == null);
        log.info("Address: [{}] (null: {})", request.getAddress(), request.getAddress() == null);
        log.info("AgreeToTerms: [{}] (null: {})", request.getAgreeToTerms(), request.getAgreeToTerms() == null);
        log.info("AcceptMarketing: [{}] (null: {})", request.getAcceptMarketing(),
                request.getAcceptMarketing() == null);
        log.info("========================");

        log.info("✅ Validation skipped for debugging - email: {}", request.getEmail());

        // 4. Check existing records
        log.info("Checking for existing records...");
        try {
            // Kiểm tra username đã tồn tại
            if (accountRepository.existsByUsername(request.getUsername())) {
                log.warn("Username already exists: {}", request.getUsername());
                throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
            }

            // Kiểm tra email đã tồn tại
            if (accountRepository.existsByEmail(request.getEmail())) {
                log.warn("Email already exists: {}", request.getEmail());
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
            }

            // Kiểm tra số điện thoại đã tồn tại (nếu có)
            if (request.getPhoneNumber() != null && accountRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                log.warn("Phone number already exists: {}", request.getPhoneNumber());
                throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
            }
            log.info("✅ No existing records found");
        } catch (AppException e) {
            // Re-throw AppException với error code đúng
            throw e;
        } catch (Exception e) {
            log.error("Database error checking existing records: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Unable to validate user data");
        }

        // 5. Encode password
        String encodedPassword;
        try {
            log.info("Encoding password...");
            encodedPassword = passwordEncoder.encode(request.getPassword());
            if (encodedPassword == null || encodedPassword.trim().isEmpty()) {
                log.error("Password encoding returned null or empty");
                throw new AppException(ErrorCode.PASSWORD_INVALID, "Password processing failed");
            }
            log.info("✅ Password encoded successfully");
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error encoding password: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.PASSWORD_INVALID, "Password processing failed");
        }

        // 6. Build Account object
        Account account;
        try {
            log.info("Building Account object...");
            account = Account.builder()
                    .username(request.getUsername())
                    .email(request.getEmail())
                    .password(encodedPassword)
                    .fullName(request.getFullName())
                    .phoneNumber(request.getPhoneNumber())
                    .dateOfBirth(request.getDateOfBirth())
                    .address(request.getAddress())
                    .role(Role.CUSTOMER)
                    .isActive(true)
                    .isVerified(false)
                    .emailVerified(false)
                    .emailVerificationToken(UUID.randomUUID().toString())
                    .emailVerificationExpiry(LocalDateTime.now().plusHours(24))
                    .membershipPoints(0)
                    .membershipLevel("BRONZE")
                    .acceptMarketing(request.getAcceptMarketing() != null ? request.getAcceptMarketing() : false)
                    .build();

            if (account == null) {
                log.error("Account.builder() returned null");
                throw new AppException(ErrorCode.VALIDATION_ERROR, "Account creation failed");
            }
            log.info("✅ Account object built successfully");
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error building Account object: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Account creation failed");
        }

        // 7. Save to database
        try {
            log.info("Saving account to database...");
            account = accountRepository.save(account);
            if (account == null) {
                log.error("accountRepository.save() returned null");
                throw new AppException(ErrorCode.VALIDATION_ERROR, "Registration failed");
            }
            if (account.getAccountId() == null) {
                log.error("Saved account has null accountId");
                throw new AppException(ErrorCode.VALIDATION_ERROR, "Registration failed");
            }
            log.info("✅ Account saved successfully with ID: {}", account.getAccountId());
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error saving account: {}", e.getMessage(), e);

            // Check for common database constraints
            String errorMessage = e.getMessage();
            if (errorMessage != null && errorMessage.toLowerCase().contains("duplicate")) {
                if (errorMessage.contains("username")) {
                    throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
                } else if (errorMessage.contains("email")) {
                    throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
                } else if (errorMessage.contains("phone")) {
                    throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
                }
                throw new AppException(ErrorCode.USER_ALREADY_EXISTS);
            }

            throw new AppException(ErrorCode.VALIDATION_ERROR, "Registration failed");
        }

        // 8. Send verification email (optional, don't fail registration)
        try {
            if (emailService != null) {
                emailService.sendVerificationEmail(account.getFullName(), account.getEmail(),
                        account.getEmailVerificationToken());
                log.info("✅ Verification email sent to: {}", account.getEmail());
            } else {
                log.warn("EmailService is null, skipping email sending");
            }
        } catch (Exception e) {
            log.warn("Failed to send verification email to: {} - {}", account.getEmail(), e.getMessage());
            // Don't fail registration if email sending fails
        }

        // 9. Generate JWT tokens
        String accessToken;
        String refreshToken;
        try {
            log.info("Generating JWT tokens...");
            accessToken = jwtService.generateAccessToken(account);
            if (accessToken == null || accessToken.trim().isEmpty()) {
                log.error("Access token generation returned null or empty");
                throw new AppException(ErrorCode.TOKEN_INVALID, "Token generation failed");
            }

            refreshToken = jwtService.generateRefreshToken(account);
            if (refreshToken == null || refreshToken.trim().isEmpty()) {
                log.error("Refresh token generation returned null or empty");
                throw new AppException(ErrorCode.TOKEN_INVALID, "Token generation failed");
            }
            log.info("✅ JWT tokens generated successfully");
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error generating JWT tokens: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.TOKEN_INVALID, "Token generation failed");
        }

        // 10. Build response
        try {
            log.info("Building response...");
            AuthResponse response = AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .expiresIn(jwtService.getExpirationTime())
                    .user(AuthResponse.UserInfo.builder()
                            .id(account.getAccountId())
                            .username(account.getUsername())
                            .email(account.getEmail())
                            .fullName(account.getFullName())
                            .phoneNumber(account.getPhoneNumber())
                            .role(account.getRole())
                            .emailVerified(account.isEmailVerified())
                            .build())
                    .build();

            if (response == null) {
                log.error("AuthResponse.builder() returned null");
                throw new AppException(ErrorCode.VALIDATION_ERROR, "Registration failed");
            }

            log.info("✅ REGISTER METHOD COMPLETED SUCCESSFULLY ===");
            return response;
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error building response: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Registration failed");
        }
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("User login attempt with username: {}", request.getUsername());

        // Validate request
        if (request == null || request.getUsername() == null || request.getPassword() == null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Username and password are required");
        }

        // Lấy thông tin user trước khi authenticate
        Account account = accountRepository.findByUsername(request.getUsername())
                .orElseThrow(
                        () -> new AppException(ErrorCode.INVALID_CREDENTIALS, "Username hoặc mật khẩu không đúng"));

        // Kiểm tra account active
        if (!account.getIsActive()) {
            log.warn("Login attempt on inactive account: {}", request.getUsername());
            throw new AppException(ErrorCode.ACCOUNT_LOCKED, "Tài khoản đã bị vô hiệu hóa");
        }

        // Kiểm tra account lockout
        if (account.isAccountLocked()) {
            log.warn("Login attempt on locked account: {}", request.getUsername());
            throw new AppException(ErrorCode.ACCOUNT_LOCKED, "Tài khoản đã bị khóa do quá nhiều lần đăng nhập sai");
        }

        try {
            // Xác thực người dùng
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()));

            // Reset failed login attempts on successful login
            account.resetFailedLoginAttempts();
            account.setLastLogin(LocalDateTime.now());
            accountRepository.save(account);

        } catch (BadCredentialsException e) {
            // Increment failed login attempts
            account.incrementFailedLoginAttempts();
            accountRepository.save(account);

            log.warn("Failed login attempt for user: {}. Attempt count: {}",
                    request.getUsername(), account.getFailedLoginAttempts());

            if (account.isAccountLocked()) {
                throw new AppException(ErrorCode.ACCOUNT_LOCKED, "Tài khoản đã bị khóa do quá nhiều lần đăng nhập sai");
            } else {
                int remainingAttempts = 5 - account.getFailedLoginAttempts();
                throw new AppException(ErrorCode.INVALID_CREDENTIALS,
                        "Username hoặc mật khẩu không đúng. Còn " + remainingAttempts + " lần thử.");
            }
        } catch (Exception e) {
            log.error("Unexpected error during authentication for user: {} - {}", request.getUsername(),
                    e.getMessage());
            throw new AppException(ErrorCode.AUTHENTICATION_FAILED, "Đăng nhập thất bại");
        }

        // Tạo JWT token
        try {
            String accessToken = jwtService.generateAccessToken(account);
            String refreshToken = jwtService.generateRefreshToken(account);

            if (accessToken == null || refreshToken == null) {
                throw new AppException(ErrorCode.TOKEN_INVALID, "Token generation failed");
            }

            log.info("User logged in successfully: {}", account.getUsername());

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .expiresIn(jwtService.getExpirationTime())
                    .user(AuthResponse.UserInfo.builder()
                            .id(account.getAccountId())
                            .username(account.getUsername())
                            .email(account.getEmail())
                            .fullName(account.getFullName())
                            .phoneNumber(account.getPhoneNumber())
                            .role(account.getRole())
                            .emailVerified(account.isEmailVerified())
                            .build())
                    .build();
        } catch (Exception e) {
            log.error("Error generating tokens for user: {} - {}", request.getUsername(), e.getMessage());
            throw new AppException(ErrorCode.TOKEN_INVALID, "Đăng nhập thành công nhưng không thể tạo token");
        }
    }

    @Override
    public void logout(String token) {
        if (token != null && !token.isEmpty()) {
            tokenBlacklistService.blacklistToken(token);
            log.info("Token blacklisted successfully on logout");
        }
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        try {
            // Verify và lấy thông tin từ refresh token
            if (jwtService.isTokenExpired(refreshToken)) {
                throw new AppException(ErrorCode.TOKEN_EXPIRED);
            }

            Long accountId = jwtService.extractAccountId(refreshToken);
            if (accountId == null) {
                throw new AppException(ErrorCode.TOKEN_INVALID);
            }

            // Lấy thông tin user
            Account account = accountRepository.findById(accountId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            // Tạo JWT token mới
            String newAccessToken = jwtService.generateAccessToken(account);
            String newRefreshToken = jwtService.generateRefreshToken(account);

            log.info("Token refreshed successfully for user: {}", account.getEmail());

            return AuthResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .expiresIn(jwtService.getExpirationTime())
                    .user(AuthResponse.UserInfo.builder()
                            .id(account.getAccountId())
                            .username(account.getUsername())
                            .email(account.getEmail())
                            .fullName(account.getFullName())
                            .phoneNumber(account.getPhoneNumber())
                            .role(account.getRole())
                            .emailVerified(account.isEmailVerified())
                            .build())
                    .build();
        } catch (Exception e) {
            log.error("Error refreshing token: {}", e.getMessage());
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        Account account = accountRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new AppException(ErrorCode.TOKEN_INVALID));

        if (account.getEmailVerificationExpiry().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.TOKEN_EXPIRED);
        }

        account.setEmailVerified(true);
        account.setEmailVerificationToken(null);
        account.setEmailVerificationExpiry(null);
        accountRepository.save(account);

        log.info("Email verified successfully for user: {}", account.getEmail());
    }

    @Override
    @Transactional
    public void resendVerificationEmail(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (account.isEmailVerified()) {
            throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED);
        }

        account.setEmailVerificationToken(UUID.randomUUID().toString());
        account.setEmailVerificationExpiry(LocalDateTime.now().plusHours(24));
        accountRepository.save(account);

        // Send verification email
        try {
            emailService.sendVerificationEmail(account.getFullName(), account.getEmail(),
                    account.getEmailVerificationToken());
            log.info("Verification email resent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to resend verification email to: {} - {}", email, e.getMessage());
            throw new RuntimeException("Không thể gửi email xác thực", e);
        }
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Generate reset token
        String resetToken = UUID.randomUUID().toString();
        account.setResetPasswordToken(resetToken);
        account.setResetPasswordExpires(LocalDateTime.now().plusHours(1)); // 1 hour expiry
        accountRepository.save(account);

        // Send reset password email
        try {
            emailService.sendPasswordResetEmail(account.getEmail(), resetToken);
            log.info("Reset password email sent to: {}", request.getEmail());
        } catch (Exception e) {
            log.error("Failed to send reset password email to: {} - {}", request.getEmail(), e.getMessage());
            throw new RuntimeException("Không thể gửi email đặt lại mật khẩu", e);
        }
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        Account account = accountRepository.findByResetPasswordToken(request.getToken())
                .orElseThrow(() -> new AppException(ErrorCode.TOKEN_INVALID));

        if (account.getResetPasswordExpires().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.TOKEN_EXPIRED);
        }

        // Update password
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        account.setResetPasswordToken(null);
        account.setResetPasswordExpires(null);
        accountRepository.save(account);

        log.info("Password reset successfully for user: {}", account.getEmail());
    }

    @Override
    public boolean isUsernameAvailable(String username) {
        return !accountRepository.existsByUsername(username);
    }

    @Override
    public boolean isEmailAvailable(String email) {
        return !accountRepository.existsByEmail(email);
    }

}