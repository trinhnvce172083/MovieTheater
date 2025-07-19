package com.swp.MovieTheaterService.dto.promotion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Promotion Application Response DTO
 * Data transfer object for promotion application results
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionApplicationResponse {

    private String message;
    private String status;
    private Long bookingId;
    private String promotionCode;
    private Double discountAmount;
    private Double originalAmount;
    private Double finalAmount;
    private Boolean success;
    private String errorCode;
    private Long promotionId;
} 