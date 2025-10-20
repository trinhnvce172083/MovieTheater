package com.swp.MovieTheaterService.dto.user;

import com.swp.MovieTheaterService.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * User Search Request DTO
 * Data Transfer Object for searching and filtering users
 *
 * @author Ngo Viet Trinh
 * @version 2.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "User search and filter request with advanced options")
public class UserSearchRequest {

    // ==================== BASIC SEARCH ====================

    @Schema(description = "Search keyword (username, email, full name, phone)", example = "john")
    private String keyword;

    @Schema(description = "Advanced search in specific fields", example = "john@example.com")
    private String email;

    @Schema(description = "Search by username", example = "john_doe")
    private String username;

    @Schema(description = "Search by full name", example = "John Doe")
    private String fullName;

    @Schema(description = "Search by phone number", example = "0901234567")
    private String phoneNumber;

    // ==================== FILTERS ====================

    @Schema(description = "Filter by role", example = "CUSTOMER")
    private Role role;

    @Schema(description = "Filter by active status", example = "true")
    private Boolean isActive;

    @Schema(description = "Filter by verified status", example = "true")
    private Boolean isVerified;

    @Schema(description = "Filter by email verified status", example = "true")
    private Boolean emailVerified;

    @Schema(description = "Filter by locked status", example = "false")
    private Boolean isLocked;

    // ==================== MEMBERSHIP FILTERS ====================

    @Schema(description = "Filter by membership level", example = "GOLD", allowableValues = {"BRONZE", "SILVER",
            "GOLD", "PLATINUM"})
    private String membershipLevel;

    @Schema(description = "Filter by minimum membership points", example = "100")
    private Integer minMembershipPoints;

    @Schema(description = "Filter by maximum membership points", example = "10000")
    private Integer maxMembershipPoints;

    @Schema(description = "Filter by minimum total spent", example = "100000.0")
    private Double minTotalSpent;

    @Schema(description = "Filter by maximum total spent", example = "5000000.0")
    private Double maxTotalSpent;

    @Schema(description = "Filter by minimum total bookings", example = "5")
    private Integer minTotalBookings;

    @Schema(description = "Filter by maximum total bookings", example = "100")
    private Integer maxTotalBookings;

    // ==================== EMPLOYEE FILTERS ====================

    @Schema(description = "Filter by department (for employees)", example = "Customer Service")
    private String department;

    @Schema(description = "Filter by employee code", example = "EMP001")
    private String employeeCode;

    @Schema(description = "Filter by minimum salary", example = "10000000.0")
    private Double minSalary;

    @Schema(description = "Filter by maximum salary", example = "50000000.0")
    private Double maxSalary;

    // ==================== DATE FILTERS ====================

    @Schema(description = "Filter by registration date from", example = "2024-01-01")
    private LocalDate registrationDateFrom;

    @Schema(description = "Filter by registration date to", example = "2024-12-31")
    private LocalDate registrationDateTo;

    @Schema(description = "Filter by last login date from", example = "2024-01-01")
    private LocalDate lastLoginDateFrom;

    @Schema(description = "Filter by last login date to", example = "2024-12-31")
    private LocalDate lastLoginDateTo;

    @Schema(description = "Filter by birth date from", example = "1980-01-01")
    private LocalDate birthDateFrom;

    @Schema(description = "Filter by birth date to", example = "2000-12-31")
    private LocalDate birthDateTo;

    @Schema(description = "Filter by hire date from (employees)", example = "2023-01-01")
    private LocalDate hireDateFrom;

    @Schema(description = "Filter by hire date to (employees)", example = "2024-12-31")
    private LocalDate hireDateTo;

    // ==================== OAUTH & PROVIDER FILTERS ====================

    @Schema(description = "Filter by OAuth provider", example = "google")
    private String provider;

    @Schema(description = "Filter by users with OAuth accounts", example = "true")
    private Boolean hasOAuthAccount;

    @Schema(description = "Filter by marketing acceptance", example = "true")
    private Boolean acceptMarketing;

    // ==================== LOCATION FILTERS ====================

    @Schema(description = "Filter by address (contains)", example = "Ho Chi Minh")
    private String address;

    @Schema(description = "Filter by city", example = "Ho Chi Minh City")
    private String city;

    @Schema(description = "Filter by district", example = "District 1")
    private String district;

    // ==================== ACTIVITY FILTERS ====================

    @Schema(description = "Filter by minimum failed login attempts", example = "0")
    private Integer minFailedLoginAttempts;

    @Schema(description = "Filter by maximum failed login attempts", example = "5")
    private Integer maxFailedLoginAttempts;

    @Schema(description = "Filter users who logged in within last N days", example = "30")
    private Integer lastLoginWithinDays;

    @Schema(description = "Filter users who haven't logged in for N days", example = "90")
    private Integer notLoggedInForDays;

    // ==================== SORT OPTIONS ====================

    @Schema(description = "Sort by field", example = "createdAt", allowableValues = {
            "createdAt", "updatedAt", "username", "email", "fullName",
            "lastLogin", "membershipPoints", "membershipLevel",
            "totalBookings", "totalSpent", "dateOfBirth", "hireDate",
            "salary", "employeeCode", "department", "isActive",
            "isVerified", "emailVerified", "failedLoginAttempts"
    })
    private String sortBy = "createdAt";

    @Schema(description = "Sort direction", example = "DESC", allowableValues = {"ASC", "DESC"})
    private String sortDirection = "DESC";

    // ==================== ADVANCED OPTIONS ====================

    @Schema(description = "Include locked accounts in results", example = "false")
    private Boolean includeLocked = true;

    @Schema(description = "Include inactive accounts in results", example = "false")
    private Boolean includeInactive = true;

    @Schema(description = "Include deleted accounts in results", example = "false")
    private Boolean includeDeleted = false;

    @Schema(description = "Search mode: EXACT or CONTAINS", example = "CONTAINS")
    private String searchMode = "CONTAINS";
}
