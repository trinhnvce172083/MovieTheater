package com.swp.MovieTheaterService.enums;

/**
 * Room Type Enum
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
public enum RoomType {
    STANDARD("Standard Room"),
    VIP("VIP Room"),
    IMAX("IMAX Room"),
    FOUR_DX("4DX Room"),
    DOLBY_ATMOS("Dolby Atmos Room");

    private final String displayName;

    RoomType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
} 