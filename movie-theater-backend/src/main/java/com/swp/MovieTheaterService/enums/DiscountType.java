package com.swp.MovieTheaterService.enums;

/**
 * Discount Type Enumeration
 * Defines the types of discounts available in promotions
 *
 * @author Dũng_Solo
 * @version 1.0.0
 */
public enum DiscountType {

    /**
     * PERCENTAGE discount - Giảm giá theo phần trăm
     * Ví dụ: 20% giảm giá
     */
    PERCENTAGE("PERCENTAGE", "Giảm giá theo phần trăm", "Giảm giá tính theo % của tổng đơn hàng"),

    /**
     * FIXED discount - Giảm giá cố định
     * Ví dụ: Giảm 50,000 VNĐ
     */
    FIXED("FIXED", "Giảm giá cố định", "Giảm giá số tiền cố định"),

    /**
     * POINTS discount - Giảm giá bằng điểm
     * Ví dụ: Đổi 100 điểm để giảm 30,000 VNĐ
     */
    POINTS("POINTS", "Giảm giá bằng điểm", "Giảm giá bằng cách đổi điểm tích lũy");

    private final String code;
    private final String displayName;
    private final String description;

    DiscountType(String code, String displayName, String description) {
        this.code = code;
        this.displayName = displayName;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public boolean isPercentage() {
        return this == PERCENTAGE;
    }

    public boolean isFixed() {
        return this == FIXED;
    }

    public boolean isPoints() {
        return this == POINTS;
    }
} 