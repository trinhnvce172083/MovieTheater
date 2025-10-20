package com.swp.MovieTheaterService.dto.loyalty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Loyalty Reward Redemption Response DTO
 * Data transfer object for loyalty reward redemption responses
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyRewardRedemptionResponse {

    private String message;
    private String status;
    private Long rewardId;
    private String rewardName;
    private Integer pointsDeducted;
    private Integer newBalance;
    private String voucherCode;
    private LocalDate expiryDate;
} 
