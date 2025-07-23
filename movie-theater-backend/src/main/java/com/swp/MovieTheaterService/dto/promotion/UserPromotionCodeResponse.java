package com.swp.MovieTheaterService.dto.promotion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for user promotion codes
 * Hiển thị thông tin promotion code của user
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPromotionCodeResponse {

    private Long userPromotionCodeId;
    private String uniqueCode;
    private String promotionName;
    private String promotionDescription;
    private String discountDisplayText;
    private Integer pointsSpent;
    private Boolean isUsed;
    private Boolean isActive;
    private LocalDateTime purchasedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime usedAt;
    private String statusDisplay;
    private Long hoursUntilExpiry;
    
    // Booking info if used
    private Long bookingId;
    private String movieTitle;
    private String showTime;
} 