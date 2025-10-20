package com.swp.MovieTheaterService.dto.promotion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Promotion Usage Response DTO
 * Data transfer object for promotion usage statistics
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionUsageResponse {

    private Long promotionId;
    private String promotionName;
    private String code;
    private Integer totalUsageLimit;
    private Integer currentUsageCount;
    private Integer remainingUsage;
    private Double usagePercentage;
    private Double totalDiscountGiven;
    private Double averageDiscountPerUse;
    private List<TopUser> topUsers;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopUser {
        private Long userId;
        private String userName;
        private Integer usageCount;
        private Double totalDiscount;
    }
} 
