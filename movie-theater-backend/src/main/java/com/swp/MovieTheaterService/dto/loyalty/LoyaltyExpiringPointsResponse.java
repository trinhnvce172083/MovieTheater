package com.swp.MovieTheaterService.dto.loyalty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * Loyalty Expiring Points Response DTO
 * Data transfer object for expiring loyalty points
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyExpiringPointsResponse {

    private String userName;
    private Integer totalExpiringPoints;
    private List<ExpiringBatch> expiringBatches;
    private String recommendedAction;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpiringBatch {
        private Integer points;
        private LocalDate expiryDate;
        private Integer daysLeft;
    }
} 