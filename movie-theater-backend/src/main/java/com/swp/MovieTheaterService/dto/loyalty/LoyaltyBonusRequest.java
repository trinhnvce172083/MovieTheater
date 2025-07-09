package com.swp.MovieTheaterService.dto.loyalty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Loyalty Bonus Request DTO
 * Data transfer object for awarding bonus points
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyBonusRequest {

    private Long userId;
    private Integer bonusPoints;
    private String reason;
} 