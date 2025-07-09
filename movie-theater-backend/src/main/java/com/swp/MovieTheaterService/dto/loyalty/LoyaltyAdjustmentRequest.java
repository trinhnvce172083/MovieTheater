package com.swp.MovieTheaterService.dto.loyalty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Loyalty Adjustment Request DTO
 * Data transfer object for adjusting loyalty points
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyAdjustmentRequest {

    private Long userId;
    private Integer pointsAdjustment;
    private String reason;
} 