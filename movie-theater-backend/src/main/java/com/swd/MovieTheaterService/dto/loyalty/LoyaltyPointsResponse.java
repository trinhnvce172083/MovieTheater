package com.swp.MovieTheaterService.dto.loyalty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Loyalty Points Response DTO
 * Data transfer object for member loyalty points information
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyPointsResponse {

    private Long accountId;
    private String memberName;
    private String memberEmail;
    private String membershipLevel;
    private Integer currentPoints;
    private Integer totalEarnedPoints;
    private Integer totalRedeemedPoints;
    private Integer expiringPoints;
    private LocalDateTime lastTransactionDate;

    // Recent transactions
    private List<LoyaltyTransactionInfo> recentTransactions;

    // Available promotions for redemption
    private List<PromotionSummary> availablePromotions;

    // Points breakdown
    private PointsBreakdown pointsBreakdown;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoyaltyTransactionInfo {
        private Long transactionId;
        private String transactionType;
        private Integer points;
        private String description;
        private LocalDateTime transactionDate;
        private LocalDateTime expiryDate;
        private String referenceType;
        private Long referenceId;
        private String displayText;
        private Boolean isExpiring;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PromotionSummary {
        private Long promotionId;
        private String promotionCode;
        private String promotionName;
        private String discountDisplay;
        private Integer pointsRequired;
        private Boolean canRedeem;
        private String bannerImageUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PointsBreakdown {
        private Integer availablePoints;
        private Integer expiringIn30Days;
        private Integer expiringIn60Days;
        private Integer expiringIn90Days;
        private Integer thisMonthEarned;
        private Integer thisMonthRedeemed;
        private Integer thisYearEarned;
        private Integer thisYearRedeemed;
    }

    // Helper methods
    public String getMembershipLevelDisplay() {
        switch (membershipLevel) {
            case "BRONZE":
                return "Đồng";
            case "SILVER":
                return "Bạc";
            case "GOLD":
                return "Vàng";
            case "PLATINUM":
                return "Bạch kim";
            default:
                return membershipLevel;
        }
    }

    public String getPointsDisplay() {
        return String.format("%,d điểm", currentPoints);
    }

    public String getExpiringPointsWarning() {
        if (expiringPoints > 0) {
            return String.format("%,d điểm sắp hết hạn trong 30 ngày", expiringPoints);
        }
        return null;
    }

    public Integer getPointsToNextLevel() {
        switch (membershipLevel) {
            case "BRONZE":
                return 2000 - currentPoints;
            case "SILVER":
                return 5000 - currentPoints;
            case "GOLD":
                return 10000 - currentPoints;
            case "PLATINUM":
                return 0; // Already at highest level
            default:
                return 0;
        }
    }

    public String getNextMembershipLevel() {
        switch (membershipLevel) {
            case "BRONZE":
                return "SILVER";
            case "SILVER":
                return "GOLD";
            case "GOLD":
                return "PLATINUM";
            case "PLATINUM":
                return "PLATINUM"; // Already at highest level
            default:
                return "BRONZE";
        }
    }
} 
