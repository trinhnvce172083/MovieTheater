package com.swp.MovieTheaterService.dto.promotion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;

/**
 * Promotion Validation Request DTO
 * Data transfer object for validating promotion codes
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionValidationRequest {

    @NotBlank(message = "Promotion code is required")
    private String code;

    @NotNull(message = "Order amount is required")
    @DecimalMin(value = "0.0", message = "Order amount must be positive")
    private Double orderAmount;

    private Long userId;
    private Long movieId;
    private Long roomId;
    private String showDate;
    private String showTime;
} 
