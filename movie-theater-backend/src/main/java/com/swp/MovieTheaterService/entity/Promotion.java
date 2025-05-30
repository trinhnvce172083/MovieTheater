package com.swp.MovieTheaterService.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.math.BigDecimal;

/**
 * Promotion Entity - Promotion Management
 * Represents promotions and discounts in the system
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Entity
@Table(name = "movietheater_promotion")
@Data
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

    @Column(name = "discount_type", nullable = false, length = 20)
    private String discountType; // PERCENTAGE, FIXED_AMOUNT, BUY_ONE_GET_ONE

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

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Usage limitations
    @Column(name = "max_usage_count")
    private Integer maxUsageCount; // null = unlimited

    @Column(name = "current_usage_count", nullable = false)
    private Integer currentUsageCount = 0;

    @Column(name = "max_usage_per_user")
    private Integer maxUsagePerUser; // null = unlimited

    // Promotion conditions
    @Column(name = "applicable_days", length = 20)
    private String applicableDays; // WEEKDAYS, WEEKENDS, ALL

    @Column(name = "applicable_times", length = 50)
    private String applicableTimes; // MORNING, AFTERNOON, EVENING, ALL

    @Column(name = "applicable_movies", columnDefinition = "TEXT")
    private String applicableMovies; // Comma-separated movie IDs, null = all movies

    @Column(name = "applicable_rooms", columnDefinition = "TEXT")
    private String applicableRooms; // Comma-separated room IDs, null = all rooms

    @Column(name = "member_only", nullable = false)
    private Boolean memberOnly = false;

    @Column(name = "membership_levels", length = 100)
    private String membershipLevels; // BRONZE,SILVER,GOLD,PLATINUM or null = all levels

    // Display settings
    @Column(name = "banner_image_url")
    private String bannerImageUrl;

    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured = false;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    // Points-based promotion fields
    @Column(name = "points_required")
    private Integer pointsRequired; // Points needed to redeem this promotion

    @Column(name = "is_points_promotion", nullable = false)
    private Boolean isPointsPromotion = false; // Can be redeemed with points

    @Column(name = "points_value")
    private Integer pointsValue; // Points equivalent value for this promotion

    // Relationships
    @OneToMany(mappedBy = "promotion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Booking> bookings;

    @OneToMany(mappedBy = "promotion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LoyaltyTransaction> loyaltyTransactions;

    // Business methods
    public boolean isValid() {
        LocalDate today = LocalDate.now();
        return isActive && 
               !today.isBefore(startDate) && 
               !today.isAfter(endDate) &&
               (maxUsageCount == null || currentUsageCount < maxUsageCount);
    }

    public boolean isExpired() {
        return LocalDate.now().isAfter(endDate);
    }

    public boolean isNotStarted() {
        return LocalDate.now().isBefore(startDate);
    }

    public boolean isUsageLimitReached() {
        return maxUsageCount != null && currentUsageCount >= maxUsageCount;
    }

    public boolean isPercentageDiscount() {
        return "PERCENTAGE".equals(discountType);
    }

    public boolean isFixedAmountDiscount() {
        return "FIXED_AMOUNT".equals(discountType);
    }

    public boolean isBuyOneGetOne() {
        return "BUY_ONE_GET_ONE".equals(discountType);
    }

    public double calculateDiscount(double totalAmount) {
        if (!isValid() || totalAmount < (minPurchaseAmount != null ? minPurchaseAmount : 0)) {
            return 0.0;
        }

        double discount = 0.0;
        
        if (isPercentageDiscount()) {
            discount = totalAmount * (discountValue / 100);
            if (maxDiscountAmount != null && discount > maxDiscountAmount) {
                discount = maxDiscountAmount;
            }
        } else if (isFixedAmountDiscount()) {
            discount = Math.min(discountValue, totalAmount);
        } else if (isBuyOneGetOne()) {
            // For BOGO, return the discount value as calculated by business logic
            discount = discountValue;
        }

        return discount;
    }

    public boolean canBeUsedBy(Account account) {
        if (memberOnly && account == null) {
            return false;
        }

        if (membershipLevels != null && account != null) {
            String userLevel = account.getMembershipLevel();
            return membershipLevels.contains(userLevel);
        }

        return true;
    }

    public boolean canBeUsedForMovie(Long movieId) {
        if (applicableMovies == null) {
            return true;
        }
        return applicableMovies.contains(movieId.toString());
    }

    public boolean canBeUsedForRoom(Long roomId) {
        if (applicableRooms == null) {
            return true;
        }
        return applicableRooms.contains(roomId.toString());
    }

    public boolean canBeUsedOnDay(LocalDate date) {
        if ("ALL".equals(applicableDays)) {
            return true;
        }
        
        int dayOfWeek = date.getDayOfWeek().getValue(); // 1=Monday, 7=Sunday
        
        if ("WEEKDAYS".equals(applicableDays)) {
            return dayOfWeek >= 1 && dayOfWeek <= 5;
        } else if ("WEEKENDS".equals(applicableDays)) {
            return dayOfWeek == 6 || dayOfWeek == 7;
        }
        
        return true;
    }

    public void incrementUsage() {
        currentUsageCount++;
    }

    public int getRemainingUsage() {
        if (maxUsageCount == null) {
            return Integer.MAX_VALUE;
        }
        return Math.max(0, maxUsageCount - currentUsageCount);
    }

    public String getDiscountDisplayText() {
        if (isPercentageDiscount()) {
            return discountValue.intValue() + "% OFF";
        } else if (isFixedAmountDiscount()) {
            return discountValue.intValue() + ".000₫ OFF";
        } else if (isBuyOneGetOne()) {
            return "BUY 1 GET 1";
        }
        return "DISCOUNT";
    }

    // Points-related methods
    public boolean canBeRedeemedWithPoints() {
        return isPointsPromotion && pointsRequired != null && pointsRequired > 0;
    }

    public boolean canBeRedeemedBy(Account account) {
        if (!canBeRedeemedWithPoints()) {
            return false;
        }
        return account.getMembershipPoints() >= pointsRequired;
    }

    public String getPointsDisplayText() {
        if (canBeRedeemedWithPoints()) {
            return pointsRequired + " điểm";
        }
        return "Không áp dụng";
    }

    // Thêm phương thức để tương thích với mã cũ
    public BigDecimal getDiscountAmount() {
        return BigDecimal.valueOf(discountValue);
    }
} 