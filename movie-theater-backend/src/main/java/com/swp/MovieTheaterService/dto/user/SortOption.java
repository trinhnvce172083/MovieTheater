package com.swp.MovieTheaterService.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Sort Options for User Search
 * Định nghĩa các tùy chọn sắp xếp cho API tìm kiếm user
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Schema(description = "Available sort options for user search")
public enum SortOption {

    // Basic fields
    CREATED_AT("createdAt", "Ngày tạo tài khoản"),
    UPDATED_AT("updatedAt", "Ngày cập nhật cuối"),
    USERNAME("username", "Tên đăng nhập"),
    EMAIL("email", "Địa chỉ email"),
    FULL_NAME("fullName", "Họ và tên"),

    // Activity fields
    LAST_LOGIN("lastLogin", "Lần đăng nhập cuối"),
    FAILED_LOGIN_ATTEMPTS("failedLoginAttempts", "Số lần đăng nhập thất bại"),

    // Membership fields
    MEMBERSHIP_POINTS("membershipPoints", "Điểm thành viên"),
    MEMBERSHIP_LEVEL("membershipLevel", "Cấp độ thành viên"),

    // Business fields
    TOTAL_BOOKINGS("totalBookings", "Tổng số lượt đặt vé"),
    TOTAL_SPENT("totalSpent", "Tổng số tiền đã chi tiêu"),

    // Date fields
    DATE_OF_BIRTH("dateOfBirth", "Ngày sinh"),

    // Employee fields
    HIRE_DATE("hireDate", "Ngày bắt đầu làm việc"),
    SALARY("salary", "Lương"),
    EMPLOYEE_CODE("employeeCode", "Mã nhân viên"),
    DEPARTMENT("department", "Phòng ban"),

    // Status fields
    IS_ACTIVE("isActive", "Trạng thái hoạt động"),
    IS_VERIFIED("isVerified", "Trạng thái xác thực"),
    EMAIL_VERIFIED("emailVerified", "Trạng thái xác thực email"),
    ACCOUNT_LOCKED_UNTIL("accountLockedUntil", "Thời gian khóa tài khoản"),

    // Location
    ADDRESS("address", "Địa chỉ"),
    PHONE_NUMBER("phoneNumber", "Số điện thoại");

    private final String fieldName;
    private final String description;

    SortOption(String fieldName, String description) {
        this.fieldName = fieldName;
        this.description = description;
    }

    public String getFieldName() {
        return fieldName;
    }

    public String getDescription() {
        return description;
    }

    @Schema(description = "Available sort directions")
    public enum Direction {
        ASC("ASC", "Sắp xếp tăng dần"),
        DESC("DESC", "Sắp xếp giảm dần");

        private final String value;
        private final String description;

        Direction(String value, String description) {
            this.value = value;
            this.description = description;
        }

        public String getValue() {
            return value;
        }

        public String getDescription() {
            return description;
        }
    }
}