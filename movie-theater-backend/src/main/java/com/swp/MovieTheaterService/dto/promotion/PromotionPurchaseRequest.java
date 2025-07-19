package com.swp.MovieTheaterService.dto.promotion;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for purchasing point-based promotions
 * User đổi điểm để nhận unique promotion code
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionPurchaseRequest {

    @NotNull(message = "Promotion ID không được để trống")
    private Long promotionId;

    private String note; // Optional note from user
} 