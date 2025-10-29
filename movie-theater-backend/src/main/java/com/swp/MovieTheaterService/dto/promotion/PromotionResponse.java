package com.swp.MovieTheaterService.dto.promotion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Promotion Response DTO
 * Data transfer object for promotion responses
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionResponse {

    private Long promotionId;
    private String promotionCode;
    private String promotionName;
    private String description;
    private String promotionType; // PUBLIC or POINT_BASED
    private String promotionTypeDisplay;
    private String discountType;
    private Double discountValue;
    private Double maxDiscountAmount;
    private Double minPurchaseAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isActive;
    private Integer maxUsageCount;
    private Integer currentUsageCount;
    private Integer maxUsagePerUser;
    private String applicableDays;
    private String applicableTimes;
    private String applicableMovies;
    private String applicableRooms;
    private Boolean memberOnly;
    private String membershipLevels;
    private String bannerUrl; // Updated field name
    private Boolean isFeatured;
    private Integer displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Points-related fields
    private Boolean isPointsPromotion;
    private Integer pointsRequired;
    private Integer pointsValue;
    
    // Code generation settings for POINT_BASED promotions
    private Integer codeValidityHours;
    private Integer maxCodesPerUser;

    // Computed fields
    private String statusDisplay;
    private String discountDisplay;
    private String pointsDisplay;
    private Boolean isValid;
    private Boolean isExpired;
    private Boolean isNotStarted;
    private Boolean isUsageLimitReached;
    private Integer remainingUsage;
    private String validityDisplay;
    private String usageDisplay;
    private String membershipDisplay;
    private String applicabilityDisplay;

    // Statistics
    private Long totalBookings;
    private Double totalRevenue;
    private Double totalDiscount;

    // Display methods
    public String getStatusDisplay() {
        if (isActive == null || !isActive) return "Không hoạt động";
        if (Boolean.TRUE.equals(isExpired)) return "Đã hết hạn";
        if (Boolean.TRUE.equals(isNotStarted)) return "Chưa bắt đầu";
        if (Boolean.TRUE.equals(isUsageLimitReached)) return "Đã hết lượt";
        if (Boolean.TRUE.equals(isValid)) return "Đang hoạt động";
        return "Không xác định";
    }

    public String getDiscountDisplay() {
        if ("PERCENTAGE".equals(discountType)) {
            return discountValue.intValue() + "% OFF";
        } else if ("FIXED_AMOUNT".equals(discountType)) {
            return discountValue.intValue() + ".000₫ OFF";
        } else if ("BUY_ONE_GET_ONE".equals(discountType)) {
            return "MUA 1 TẶNG 1";
        }
        return "GIẢM GIÁ";
    }

    public String getPointsDisplay() {
        if (Boolean.TRUE.equals(isPointsPromotion) && pointsRequired != null) {
            return pointsRequired + " điểm";
        }
        return "Không áp dụng";
    }

    public String getValidityDisplay() {
        return startDate.toString() + " - " + endDate.toString();
    }

    public String getUsageDisplay() {
        if (maxUsageCount == null) {
            return "Không giới hạn";
        }
        return currentUsageCount + "/" + maxUsageCount;
    }

    public String getMembershipDisplay() {
        if (memberOnly == null || !memberOnly) {
            return "Tất cả khách hàng";
        }
        if (membershipLevels == null || membershipLevels.isEmpty()) {
            return "Chỉ thành viên";
        }
        return "Thành viên: " + membershipLevels;
    }

    public String getApplicabilityDisplay() {
        StringBuilder sb = new StringBuilder();
        
        if (applicableDays != null && !"ALL".equals(applicableDays)) {
            sb.append("Ngày: ").append(getApplicableDaysDisplay()).append("; ");
        }
        
        if (applicableTimes != null && !"ALL".equals(applicableTimes)) {
            sb.append("Giờ: ").append(getApplicableTimesDisplay()).append("; ");
        }
        
        if (applicableMovies != null && !applicableMovies.isEmpty()) {
            sb.append("Phim giới hạn; ");
        }
        
        if (applicableRooms != null && !applicableRooms.isEmpty()) {
            sb.append("Phòng giới hạn; ");
        }
        
        if (sb.length() == 0) {
            return "Áp dụng toàn bộ";
        }
        
        return sb.toString().replaceAll("; $", "");
    }

    private String getApplicableDaysDisplay() {
        if (applicableDays == null) return "Tất cả";
        switch (applicableDays) {
            case "WEEKDAYS": return "Thứ 2-6";
            case "WEEKENDS": return "Cuối tuần";
            default: return "Tất cả";
        }
    }

    private String getApplicableTimesDisplay() {
        if (applicableTimes == null) return "Tất cả";
        switch (applicableTimes) {
            case "MORNING": return "Sáng";
            case "AFTERNOON": return "Chiều";
            case "EVENING": return "Tối";
            default: return "Tất cả";
        }
    }
}