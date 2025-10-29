package com.swp.MovieTheaterService.dto.loyalty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Loyalty Redeem Request DTO
 * Data transfer object for redeeming loyalty points
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyRedeemRequest {

    private Long bookingId;
    private Integer pointsToRedeem;
}