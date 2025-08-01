package com.swp.MovieTheaterService.dto.promotion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Promotion Summary Response DTO
 * Data transfer object for promotion summary information
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionSummaryResponse {

    private Long id;
    private String code;
    private String name;
    private String description;
    private String discountType;
    private Double discountValue;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isActive;
    private String discountDisplay;
    private String statusDisplay;
    private Boolean isValid;
    private Boolean isExpired;
    private Boolean isNotStarted;
    private Integer remainingUsage;
    private String bannerImageUrl;
    private Boolean isFeatured;
    private Boolean isPointsPromotion;
    private Integer pointsRequired;
} 