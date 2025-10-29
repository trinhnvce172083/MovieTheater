package com.swp.MovieTheaterService.dto.promotion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

/**
 * Promotion Update Request DTO
 * Data transfer object for updating promotions
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionUpdateRequest {

    @Size(max = 100, message = "Promotion name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    private String discountType; // PERCENTAGE, FIXED_AMOUNT, POINTS

    @DecimalMin(value = "0.0", message = "Discount value must be positive")
    private Double discountValue;

    @DecimalMin(value = "0.0", message = "Max discount amount must be positive")
    private Double maxDiscountAmount;

    @DecimalMin(value = "0.0", message = "Min purchase amount must be positive")
    private Double minPurchaseAmount;

    private LocalDate startDate;
    private LocalDate endDate;

    @Min(value = 1, message = "Max usage count must be at least 1")
    private Integer maxUsageCount;

    @Min(value = 1, message = "Max usage per user must be at least 1")
    private Integer maxUsagePerUser;

    private String applicableDays; // JSON array of days
    private String applicableTimes; // JSON array of time ranges
    private String applicableMovies; // JSON array of movie IDs
    private String applicableRooms; // JSON array of room IDs

    private Boolean memberOnly;
    private String membershipLevels; // JSON array of membership levels

    private String bannerImageUrl;
    private Boolean isFeatured;
    private Integer displayOrder;
    private Boolean isActive;

    // Points-related fields
    private Boolean isPointsPromotion;
    private Integer pointsRequired;
    private Integer pointsValue;
}