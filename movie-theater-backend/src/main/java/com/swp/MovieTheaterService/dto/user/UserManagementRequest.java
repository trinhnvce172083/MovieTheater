package com.swp.MovieTheaterService.dto.user;

import com.swp.MovieTheaterService.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * User Management Request DTO
 * Data Transfer Object for user management operations (Admin CRUD)
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "User management request payload")
public class UserManagementRequest {

    @Schema(description = "Username", example = "john_doe", required = true)
    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 50, message = "Username phải từ 3-50 ký tự")
    private String username;

    @Schema(description = "Email address", example = "john@example.com", required = true)
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @Size(max = 100, message = "Email không được quá 100 ký tự")
    private String email;

    @Schema(description = "Password", example = "newPassword123", required = false)
    @Size(min = 6, max = 255, message = "Password phải từ 6-255 ký tự")
    private String password;

    @Schema(description = "Full name", example = "John Doe", required = true)
    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 100, message = "Họ tên không được quá 100 ký tự")
    private String fullName;

    @Schema(description = "Phone number", example = "0901234567")
    @Size(max = 15, message = "Số điện thoại không được quá 15 ký tự")
    private String phoneNumber;

    @Schema(description = "Date of birth", example = "1990-01-01")
    private LocalDate dateOfBirth;

    @Schema(description = "Address", example = "123 Main St, District 1, Ho Chi Minh City")
    @Size(max = 255, message = "Địa chỉ không được quá 255 ký tự")
    private String address;

    @Schema(description = "Avatar URL", example = "https://example.com/avatar.jpg")
    private String avatarUrl;

    @Schema(description = "User role", example = "CUSTOMER", required = true)
    @NotNull(message = "Role không được để trống")
    private Role role;

    @Schema(description = "Account active status", example = "true")
    private Boolean isActive;

    @Schema(description = "Email verified status", example = "true")
    private Boolean emailVerified;

    @Schema(description = "Accept marketing", example = "false")
    private Boolean acceptMarketing;

    // Employee specific fields
    @Schema(description = "Employee code", example = "EMP001")
    @Size(max = 20, message = "Mã nhân viên không được quá 20 ký tự")
    private String employeeCode;

    @Schema(description = "Hire date", example = "2023-01-01")
    private LocalDate hireDate;

    @Schema(description = "Salary", example = "15000000.0")
    private Double salary;

    @Schema(description = "Department", example = "Customer Service")
    @Size(max = 50, message = "Phòng ban không được quá 50 ký tự")
    private String department;

    // Membership specific fields
    @Schema(description = "Membership points", example = "100")
    private Integer membershipPoints;

    @Schema(description = "Membership level", example = "BRONZE")
    private String membershipLevel;
}
