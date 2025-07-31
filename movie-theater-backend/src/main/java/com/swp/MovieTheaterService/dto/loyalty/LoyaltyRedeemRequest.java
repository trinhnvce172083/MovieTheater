package com.swp.MovieTheaterService.dto.loyalty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Loyalty Redeem Request DTO
 * Data transfer object for redeeming loyalty points
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyRedeemRequest {

    private Long bookingId;
    private Integer pointsToRedeem;
} 