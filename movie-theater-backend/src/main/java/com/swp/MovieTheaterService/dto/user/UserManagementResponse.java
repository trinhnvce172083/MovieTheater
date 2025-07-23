package com.swp.MovieTheaterService.dto.user;

import com.swp.MovieTheaterService.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * User Management Response DTO
 * Data Transfer Object for user management responses
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "User management response payload")
public class UserManagementResponse {

    @Schema(description = "Account ID", example = "1")
    private Long accountId;

    @Schema(description = "Username", example = "john_doe")
    private String username;

    @Schema(description = "Email address", example = "john@example.com")
    private String email;

    @Schema(description = "Full name", example = "John Doe")
    private String fullName;

    @Schema(description = "Phone number", example = "0901234567")
    private String phoneNumber;

    @Schema(description = "Date of birth", example = "1990-01-01")
    private LocalDate dateOfBirth;

    @Schema(description = "Address", example = "123 Main St, District 1, Ho Chi Minh City")
    private String address;

    @Schema(description = "Avatar URL", example = "https://example.com/avatar.jpg")
    private String avatarUrl;

    @Schema(description = "User role", example = "CUSTOMER")
    private Role role;

    @Schema(description = "Account active status", example = "true")
    private Boolean isActive;

    @Schema(description = "Account verified status", example = "true")
    private Boolean isVerified;

    @Schema(description = "Email verified status", example = "true")
    private Boolean emailVerified;

    @Schema(description = "Accept marketing", example = "false")
    private Boolean acceptMarketing;

    @Schema(description = "Last login time", example = "2024-01-15T10:30:00")
    private LocalDateTime lastLogin;

    @Schema(description = "Failed login attempts", example = "0")
    private Integer failedLoginAttempts;

    @Schema(description = "Account locked until", example = "2024-01-15T11:00:00")
    private LocalDateTime accountLockedUntil;

    // Employee specific fields
    @Schema(description = "Employee code", example = "EMP001")
    private String employeeCode;

    @Schema(description = "Hire date", example = "2023-01-01")
    private LocalDate hireDate;

    @Schema(description = "Salary", example = "15000000.0")
    private Double salary;

    @Schema(description = "Department", example = "Customer Service")
    private String department;

    // Membership specific fields
    @Schema(description = "Membership points", example = "100")
    private Integer membershipPoints;

    @Schema(description = "Membership level", example = "BRONZE")
    private String membershipLevel;

    // OAuth2 fields
    @Schema(description = "OAuth provider", example = "google")
    private String provider;

    @Schema(description = "Provider ID", example = "123456789")
    private String providerId;

    // Audit fields
    @Schema(description = "Created date", example = "2024-01-01T10:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Updated date", example = "2024-01-15T10:30:00")
    private LocalDateTime updatedAt;

    @Schema(description = "Created by", example = "admin")
    private String createdBy;

    @Schema(description = "Updated by", example = "admin")
    private String updatedBy;

    // Business computed fields
    @Schema(description = "Is account locked", example = "false")
    private Boolean isAccountLocked;

    @Schema(description = "Total bookings count", example = "5")
    private Long totalBookings;

    @Schema(description = "Total spent amount", example = "500000.0")
    private Double totalSpent;
}