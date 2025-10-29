package com.swp.MovieTheaterService.dto.response;

import com.swp.MovieTheaterService.entity.Account;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Login Response DTO
 * Data transfer object for login responses
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Login response payload")
public class LoginResponse {

    @Schema(description = "JWT access token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String accessToken;

    @Schema(description = "JWT refresh token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String refreshToken;

    @Schema(description = "Token type", example = "Bearer")
    private String tokenType = "Bearer";

    @Schema(description = "Access token expiration time in milliseconds", example = "900000")
    private Long expiresIn;

    @Schema(description = "User account information")
    private UserInfo user;

    @Schema(description = "Login success message", example = "Login successful")
    private String message;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "User information")
    public static class UserInfo {
        
        @Schema(description = "Account ID", example = "5")
        private Long accountId;

        @Schema(description = "Username", example = "lumieretest")
        private String username;

        @Schema(description = "Email address", example = "lumierecinema25@gmail.com")
        private String email;

        @Schema(description = "Full name", example = "Lumiere Test User")
        private String fullName;

        @Schema(description = "User role", example = "CUSTOMER")
        private String role;

        @Schema(description = "Email verification status", example = "true")
        private Boolean isVerified;

        @Schema(description = "Account active status", example = "true")
        private Boolean isActive;

        @Schema(description = "Membership level", example = "BRONZE")
        private String membershipLevel;

        @Schema(description = "Membership points", example = "0")
        private Integer membershipPoints;

        @Schema(description = "Avatar URL", example = "https://example.com/avatar.jpg")
        private String avatarUrl;

        @Schema(description = "Last login time", example = "2025-05-25T18:30:00")
        private LocalDateTime lastLogin;

        // Employee specific fields
        @Schema(description = "Employee code (for employees only)", example = "EMP001")
        private String employeeCode;

        @Schema(description = "Department (for employees only)", example = "Customer Service")
        private String department;
    }

    /**
     * Create LoginResponse from Account entity
     * 
     * @param account user account
     * @param accessToken JWT access token
     * @param refreshToken JWT refresh token
     * @param expiresIn token expiration time
     * @return LoginResponse object
     */
    public static LoginResponse fromAccount(Account account, String accessToken, String refreshToken, Long expiresIn) {
        UserInfo userInfo = UserInfo.builder()
                .accountId(account.getAccountId())
                .username(account.getUsername())
                .email(account.getEmail())
                .fullName(account.getFullName())
                .role(account.getRole().name())
                .isVerified(account.getIsVerified())
                .isActive(account.getIsActive())
                .membershipLevel(account.getMembershipLevel())
                .membershipPoints(account.getMembershipPoints())
                .avatarUrl(account.getAvatarUrl())
                .lastLogin(account.getLastLogin())
                .employeeCode(account.getEmployeeCode())
                .department(account.getDepartment())
                .build();

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .user(userInfo)
                .message("Login successful")
                .build();
    }
}