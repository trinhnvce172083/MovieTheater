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
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "User search and filter request")
public class UserSearchRequest {

    @Schema(description = "Search keyword (username, email, full name)", example = "john")
    private String keyword;

    @Schema(description = "Filter by role", example = "CUSTOMER")
    private Role role;

    @Schema(description = "Filter by active status", example = "true")
    private Boolean isActive;

    @Schema(description = "Filter by verified status", example = "true")
    private Boolean isVerified;

    @Schema(description = "Filter by email verified status", example = "true")
    private Boolean emailVerified;

    @Schema(description = "Filter by membership level", example = "GOLD")
    private String membershipLevel;

    @Schema(description = "Filter by department (for employees)", example = "Customer Service")
    private String department;

    @Schema(description = "Filter by registration date from", example = "2024-01-01")
    private LocalDate registrationDateFrom;

    @Schema(description = "Filter by registration date to", example = "2024-12-31")
    private LocalDate registrationDateTo;

    @Schema(description = "Filter by last login date from", example = "2024-01-01")
    private LocalDate lastLoginDateFrom;

    @Schema(description = "Filter by last login date to", example = "2024-12-31")
    private LocalDate lastLoginDateTo;

    @Schema(description = "Filter by minimum membership points", example = "100")
    private Integer minMembershipPoints;

    @Schema(description = "Filter by maximum membership points", example = "10000")
    private Integer maxMembershipPoints;

    @Schema(description = "Filter by minimum total spent", example = "100000.0")
    private Double minTotalSpent;

    @Schema(description = "Filter by maximum total spent", example = "5000000.0")
    private Double maxTotalSpent;

    @Schema(description = "Filter by OAuth provider", example = "google")
    private String provider;

    @Schema(description = "Include locked accounts", example = "false")
    private Boolean includeLocked;

    @Schema(description = "Sort by field", example = "createdAt")
    private String sortBy;

    @Schema(description = "Sort direction", example = "DESC")
    private String sortDirection;
}