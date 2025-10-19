package com.swp.MovieTheaterService.dto.promotion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for promotion purchase results
 * Trả về thông tin unique code sau khi mua thành công
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionPurchaseResponse {

    private String uniqueCode; // Unique promotion code generated
    private String promotionName;
    private String promotionDescription;
    private Integer pointsSpent;
    private Integer remainingPoints; // User's remaining points after purchase
    private LocalDateTime expiresAt;
    private LocalDateTime purchasedAt;
    private String discountDisplayText;
    private String statusMessage;
} 
