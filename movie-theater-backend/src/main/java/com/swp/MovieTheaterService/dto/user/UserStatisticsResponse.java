package com.swp.MovieTheaterService.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * User Statistics Response DTO
 * Data Transfer Object for user statistics
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "User statistics response")
public class UserStatisticsResponse {

    @Schema(description = "Total users count", example = "1000")
    private Long totalUsers;

    @Schema(description = "Active users count", example = "950")
    private Long activeUsers;

    @Schema(description = "Verified users count", example = "800")
    private Long verifiedUsers;

    @Schema(description = "Locked accounts count", example = "5")
    private Long lockedAccounts;

    @Schema(description = "Users by role distribution")
    private Map<String, Long> usersByRole;

    @Schema(description = "Users by membership level distribution")
    private Map<String, Long> usersByMembershipLevel;

    @Schema(description = "Users by department distribution (employees only)")
    private Map<String, Long> usersByDepartment;

    @Schema(description = "New users this month", example = "50")
    private Long newUsersThisMonth;

    @Schema(description = "New users this week", example = "12")
    private Long newUsersThisWeek;

    @Schema(description = "Users logged in today", example = "150")
    private Long usersLoggedInToday;

    @Schema(description = "Users logged in this week", example = "400")
    private Long usersLoggedInThisWeek;

    @Schema(description = "Average membership points", example = "250.5")
    private Double averageMembershipPoints;

    @Schema(description = "Total membership points distributed", example = "250000")
    private Long totalMembershipPointsDistributed;

    @Schema(description = "Users with OAuth accounts", example = "120")
    private Long oauthUsers;

    @Schema(description = "Marketing acceptance rate", example = "0.65")
    private Double marketingAcceptanceRate;

    @Schema(description = "Average user age", example = "28.5")
    private Double averageUserAge;

    @Schema(description = "Top cities distribution")
    private Map<String, Long> topCities;
}