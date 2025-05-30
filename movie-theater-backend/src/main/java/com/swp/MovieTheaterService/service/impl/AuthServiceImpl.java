package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.dto.request.LoginRequest;
import com.swp.MovieTheaterService.dto.request.RegisterRequest;
import com.swp.MovieTheaterService.dto.response.AuthResponse;
import com.swp.MovieTheaterService.entity.Account;
import com.swp.MovieTheaterService.enums.Role;
import com.swp.MovieTheaterService.exception.BadRequestException;
import com.swp.MovieTheaterService.exception.ConflictException;
import com.swp.MovieTheaterService.exception.NotFoundException;
import com.swp.MovieTheaterService.exception.UnauthorizedException;
import com.swp.MovieTheaterService.repository.AccountRepository;
import com.swp.MovieTheaterService.service.AuthService;
import com.swp.MovieTheaterService.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
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

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        // Kiểm tra email đã tồn tại
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email đã được sử dụng");
        }

        // Kiểm tra mật khẩu xác nhận
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Mật khẩu xác nhận không khớp");
        }

        // Tạo account mới
        Account account = Account.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .role(Role.CUSTOMER)
                .emailVerified(false)
                .emailVerificationToken(UUID.randomUUID().toString())
                .emailVerificationExpiry(LocalDateTime.now().plusHours(24))
                .build();

        account = accountRepository.save(account);
        log.info("User registered successfully with ID: {}", account.getAccountId());

        // Tạo JWT token
        String accessToken = jwtService.generateAccessToken(account);
        String refreshToken = jwtService.generateRefreshToken(account);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtService.getExpirationTime())
                .user(AuthResponse.UserInfo.builder()
                        .id(account.getAccountId())
                        .email(account.getEmail())
                        .fullName(account.getFullName())
                        .phoneNumber(account.getPhoneNumber())
                        .role(account.getRole())
                        .emailVerified(account.isEmailVerified())
                        .build())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("User login attempt with email: {}", request.getEmail());

        // Xác thực người dùng
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Lấy thông tin user
        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));

        // Tạo JWT token
        String accessToken = jwtService.generateAccessToken(account);
        String refreshToken = jwtService.generateRefreshToken(account);

        log.info("User logged in successfully: {}", account.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtService.getExpirationTime())
                .user(AuthResponse.UserInfo.builder()
                        .id(account.getAccountId())
                        .email(account.getEmail())
                        .fullName(account.getFullName())
                        .phoneNumber(account.getPhoneNumber())
                        .role(account.getRole())
                        .emailVerified(account.isEmailVerified())
                        .build())
                .build();
    }

    @Override
    public void logout(String token) {
        // TODO: Implement token blacklist
        log.info("User logged out");
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        try {
            // Verify và lấy thông tin từ refresh token
            if (jwtService.isTokenExpired(refreshToken)) {
                throw new UnauthorizedException("Refresh token đã hết hạn");
            }
            
            Long accountId = jwtService.extractAccountId(refreshToken);
            if (accountId == null) {
                throw new BadRequestException("Refresh token không hợp lệ");
            }
            
            // Lấy thông tin user
            Account account = accountRepository.findById(accountId)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));
                    
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
                            .email(account.getEmail())
                            .fullName(account.getFullName())
                            .phoneNumber(account.getPhoneNumber())
                            .role(account.getRole())
                            .emailVerified(account.isEmailVerified())
                            .build())
                    .build();
        } catch (Exception e) {
            log.error("Error refreshing token: {}", e.getMessage());
            throw new UnauthorizedException("Không thể làm mới token: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        Account account = accountRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Token xác thực không hợp lệ"));

        if (account.getEmailVerificationExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Token xác thực đã hết hạn");
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
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));

        if (account.isEmailVerified()) {
            throw new BadRequestException("Email đã được xác thực");
        }

        account.setEmailVerificationToken(UUID.randomUUID().toString());
        account.setEmailVerificationExpiry(LocalDateTime.now().plusHours(24));
        accountRepository.save(account);

        // TODO: Send verification email
        log.info("Verification email resent to: {}", email);
    }
    
    @Override
    public boolean isUsernameAvailable(String username) {
        // TODO: Implement username availability check if needed
        return true; // Since we're using email-based authentication
    }
    
    @Override
    public boolean isEmailAvailable(String email) {
        return !accountRepository.existsByEmail(email);
    }
} 