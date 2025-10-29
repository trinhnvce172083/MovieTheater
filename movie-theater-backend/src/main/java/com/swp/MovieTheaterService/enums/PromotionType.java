package com.swp.MovieTheaterService.enums;

/**
 * Promotion Type Enumeration
 * Defines the types of promotions available in the system
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
public enum PromotionType {
    
    /**
     * PUBLIC promotions - Admin tạo với code giống nhau
     * VD: NEWYEAR25, SUMMER2024
     * Mọi người có thể dùng cùng code này
     */
    PUBLIC("PUBLIC", "Khuyến mãi công khai", "Promotion code chung cho mọi người"),
    
    /**
     * POINT_BASED promotions - User đổi điểm để nhận unique code
     * User phải có đủ điểm → hệ thống tạo unique code cá nhân
     * Code chỉ dùng được 1 lần và thuộc về user đó
     */
    POINT_BASED("POINT_BASED", "Khuyến mãi đổi điểm", "Promotion cần đổi điểm để nhận code riêng");

    private final String code;
    private final String displayName;
    private final String description;

    PromotionType(String code, String displayName, String description) {
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

    public boolean isPublic() {
        return this == PUBLIC;
    }

    public boolean isPointBased() {
        return this == POINT_BASED;
    }
}