package com.swp.MovieTheaterService.dto.loyalty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Loyalty Reward Response DTO
 * Data transfer object for loyalty rewards
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyRewardResponse {

    private Long id;
    private String name;
    private Integer pointsCost;
    private String description;
    private String category;
} 
