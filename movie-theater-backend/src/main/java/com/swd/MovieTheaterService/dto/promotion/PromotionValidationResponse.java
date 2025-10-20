package com.swp.MovieTheaterService.dto.promotion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Promotion Validation Response DTO
 * Data transfer object for promotion validation results
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionValidationResponse {

    private String code;
    private Boolean isValid;
    private String message;
    private String discountType;
    private Double discountValue;
    private Double discountAmount;
    private Double finalAmount;
    private Double originalAmount;
    private String errorCode;
    private String validationDetails;
    private Boolean canApply;
    private Long promotionId;
} 
