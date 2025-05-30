package com.swp.MovieTheaterService.dto.promotion;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Promotion Create Request DTO
 * Data transfer object for creating promotions
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionCreateRequest {

    @NotBlank(message = "Promotion code is required")
    @Size(max = 50, message = "Promotion code must not exceed 50 characters")
    private String code;

    @NotBlank(message = "Promotion name is required")
    @Size(max = 100, message = "Promotion name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotBlank(message = "Discount type is required")
    private String discountType; // PERCENTAGE, FIXED_AMOUNT, POINTS

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.0", message = "Discount value must be positive")
    private Double discountValue;

    @DecimalMin(value = "0.0", message = "Max discount amount must be positive")
    private Double maxDiscountAmount;

    @DecimalMin(value = "0.0", message = "Min purchase amount must be positive")
    private Double minPurchaseAmount;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @Min(value = 1, message = "Max usage count must be at least 1")
    private Integer maxUsageCount;

    @Min(value = 1, message = "Max usage per user must be at least 1")
    private Integer maxUsagePerUser = 1;

    private String applicableDays; // JSON array of days
    private String applicableTimes; // JSON array of time ranges
    private String applicableMovies; // JSON array of movie IDs
    private String applicableRooms; // JSON array of room IDs

    private Boolean memberOnly = false;
    private String membershipLevels; // JSON array of membership levels

    private String bannerImageUrl;
    private Boolean isFeatured = false;
    private Integer displayOrder = 0;

    // Points-related fields
    private Boolean isPointsPromotion = false;
    private Integer pointsRequired;
    private Integer pointsValue;

    // Validation methods
    @AssertTrue(message = "Ngày kết thúc phải sau ngày bắt đầu")
    public boolean isValidDateRange() {
        if (startDate == null || endDate == null) {
            return true; // Let @NotNull handle null validation
        }
        return endDate.isAfter(startDate);
    }

    @AssertTrue(message = "Khuyến mãi điểm phải có điểm yêu cầu")
    public boolean isValidPointsPromotion() {
        if (isPointsPromotion == null || !isPointsPromotion) {
            return true;
        }
        return pointsRequired != null && pointsRequired > 0;
    }

    @AssertTrue(message = "Giảm giá phần trăm phải <= 100%")
    public boolean isValidPercentageDiscount() {
        if (!"PERCENTAGE".equals(discountType) || discountValue == null) {
            return true;
        }
        return discountValue <= 100.0;
    }

    @AssertTrue(message = "Giảm giá cố định phải có giá trị hợp lý")
    public boolean isValidFixedAmountDiscount() {
        if (!"FIXED_AMOUNT".equals(discountType) || discountValue == null) {
            return true;
        }
        return discountValue <= 1000000.0; // Max 1M VND
    }
} 