package com.swp.MovieTheaterService.enums;

/**
 * Room Type Enum
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
public enum RoomType {
    STANDARD("Standard Room"),
    VIP("VIP Room");

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