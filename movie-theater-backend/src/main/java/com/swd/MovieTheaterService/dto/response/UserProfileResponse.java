package com.swp.MovieTheaterService.dto.response;

import com.swp.MovieTheaterService.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * User Profile Response DTO
 * Response for user profile information
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "User profile response")
public class UserProfileResponse {

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

    @Schema(description = "Avatar URL", example = "https://supabase.co/storage/v1/object/public/avatars/user123.jpg")
    private String avatarUrl;

    @Schema(description = "User role", example = "MEMBER")
    private Role role;

    @Schema(description = "Membership level", example = "GOLD")
    private String membershipLevel;

    @Schema(description = "Membership points", example = "1500")
    private Integer membershipPoints;

    @Schema(description = "Account active status", example = "true")
    private Boolean isActive;

    @Schema(description = "Email verified status", example = "true")
    private Boolean emailVerified;

    @Schema(description = "Accept marketing", example = "false")
    private Boolean acceptMarketing;

    @Schema(description = "Account creation date", example = "2024-01-01T00:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "Last update date", example = "2024-01-15T10:30:00")
    private LocalDateTime updatedAt;
} 
