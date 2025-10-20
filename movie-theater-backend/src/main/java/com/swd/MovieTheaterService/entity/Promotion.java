package com.swp.MovieTheaterService.entity;

import com.swp.MovieTheaterService.enums.DiscountType;
import jakarta.persistence.*;
import lombok.*;
import lombok.Builder.Default;

import java.time.LocalDate;
import java.util.List;

/**
 * Promotion Entity - Simplified Promotion Management
 * Represents promotions and discounts in the system
 *
 * @author Ngo Viet Trinh
 * @version 3.0.0 - Simplified structure
 */
@Entity
@Table(name = "movietheater_promotion")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Promotion extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "promotion_id")
    private Long promotionId;

    @Column(name = "promotion_code", unique = true, nullable = false, length = 20)
    private String promotionCode;

    @Column(name = "promotion_name", nullable = false, length = 100)
    private String promotionName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false)
    private Double discountValue; // Percentage (0-100) or fixed amount

    @Column(name = "max_discount_amount")
    private Double maxDiscountAmount; // For percentage discounts

    @Column(name = "min_purchase_amount")
    private Double minPurchaseAmount; // Minimum amount to apply promotion

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "max_usage_count", nullable = false)
    @Default
    private Integer maxUsageCount = 1000; // Default 1000

    @Column(name = "current_usage_count", nullable = false)
    @Default
    private Integer currentUsageCount = 0;

    @Column(name = "max_usage_per_user", nullable = false)
    @Default
    private Integer maxUsagePerUser = 1; // Default 1

    @Column(name = "is_featured", nullable = false)
    @Default
    private Boolean isFeatured = false;

    @Column(name = "banner_image_url")
    private String bannerImageUrl;

    @Column(name = "points_required")
    @Default
    private Integer pointsRequired = 0; // Points needed to redeem this promotion

    @Column(name = "code_validity_hours", nullable = false)
    @Default
    private Integer codeValidityHours = 24; // Default 24 hours validity

    @Column(name = "is_active", nullable = false)
    @Default
    private Boolean isActive = true;

    // Relationships
    @OneToMany(mappedBy = "promotion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Booking> bookings;

    @OneToMany(mappedBy = "promotion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UserPromotionCode> userPromotionCodes;

    // Business methods
    public boolean isValid() {
        LocalDate today = LocalDate.now();
        return isActive &&
                !today.isBefore(startDate) &&
                !today.isAfter(endDate) &&
                currentUsageCount < maxUsageCount;
    }

    public boolean isExpired() {
        return LocalDate.now().isAfter(endDate);
    }

    public boolean isNotStarted() {
        return LocalDate.now().isBefore(startDate);
    }

    public boolean isUsageLimitReached() {
        return currentUsageCount >= maxUsageCount;
    }

    public boolean isPercentageDiscount() {
        return DiscountType.PERCENTAGE.equals(discountType);
    }

    public boolean isFixedAmountDiscount() {
        return DiscountType.FIXED.equals(discountType);
    }

    public boolean isPointsDiscount() {
        return DiscountType.POINTS.equals(discountType);
    }

    public double calculateDiscount(double totalAmount) {
        if (!isValid() || totalAmount < (minPurchaseAmount != null ? minPurchaseAmount : 0)) {
            return 0.0;
        }

        double discount = 0.0;

        switch (discountType) {
            case PERCENTAGE:
                discount = totalAmount * (discountValue / 100.0);
                if (maxDiscountAmount != null && discount > maxDiscountAmount) {
                    discount = maxDiscountAmount;
                }
                break;
            case FIXED:
                discount = Math.min(discountValue, totalAmount);
                break;
            case POINTS:
                discount = discountValue;
                break;
        }

        return discount;
    }

    public void incrementUsage() {
        currentUsageCount++;
    }

    public int getRemainingUsage() {
        return Math.max(0, maxUsageCount - currentUsageCount);
    }

    public String getDiscountDisplayText() {
        switch (discountType) {
            case PERCENTAGE:
                return discountValue.intValue() + "% OFF";
            case FIXED:
                return discountValue.intValue() + ".000₫ OFF";
            case POINTS:
                return "Đổi " + pointsRequired + " điểm";
            default:
                return "DISCOUNT";
        }
    }

    public boolean canBeRedeemedWithPoints() {
        return pointsRequired != null && pointsRequired > 0;
    }

    public String getPointsDisplayText() {
        if (canBeRedeemedWithPoints()) {
            return pointsRequired + " điểm";
        }
        return "Không áp dụng";
    }

    // Compatibility methods
    public String getPromotionName() {
        return promotionName;
    }

    public String getPromotionCode() {
        return promotionCode;
    }
} 
