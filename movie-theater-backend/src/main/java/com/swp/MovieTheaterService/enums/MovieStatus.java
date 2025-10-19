package com.swp.MovieTheaterService.enums;

import lombok.Getter;

/**
 * Movie Status Enum
 * Các trạng thái của phim trong hệ thống rạp chiếu phim
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Getter
public enum MovieStatus {
    COMING_SOON("COMING_SOON", "Sắp chiếu", "Phim sẽ được chiếu trong tương lai"),
    NOW_SHOWING("NOW_SHOWING", "Đang chiếu", "Phim đang được chiếu tại rạp"),
    ENDED("ENDED", "Đã kết thúc", "Phim đã kết thúc chiếu");

    private final String code;
    private final String displayName;
    private final String description;

    MovieStatus(String code, String displayName, String description) {
        this.code = code;
        this.displayName = displayName;
        this.description = description;
    }

    /**
     * Lấy MovieStatus từ code string
     */
    public static MovieStatus fromCode(String code) {
        if (code == null) {
            return COMING_SOON; // Default
        }

        for (MovieStatus status : values()) {
            if (status.code.equalsIgnoreCase(code)) {
                return status;
            }
        }

        throw new IllegalArgumentException("Invalid movie status: " + code);
    }

    /**
     * Kiểm tra xem status có hợp lệ không
     */
    public static boolean isValid(String code) {
        if (code == null) {
            return false;
        }

        for (MovieStatus status : values()) {
            if (status.code.equalsIgnoreCase(code)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Lấy tất cả status codes
     */
    public static String[] getAllCodes() {
        return new String[] {
                COMING_SOON.getCode(),
                NOW_SHOWING.getCode(),
                ENDED.getCode()
        };
    }

    @Override
    public String toString() {
        return this.code;
    }
}
