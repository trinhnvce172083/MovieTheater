package com.swp.MovieTheaterService.dto.loyalty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Loyalty Tier Response DTO
 * Data transfer object for loyalty tier information
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyTierResponse {

    private String tier;
    private Integer minPoints;
    private Integer maxPoints;
    private List<String> benefits;
    private Integer discountPercentage;
    private String color;
}