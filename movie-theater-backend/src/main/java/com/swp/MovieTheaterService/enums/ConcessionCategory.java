package com.swp.MovieTheaterService.enums;

/**
 * ConcessionCategory Enum - Loại đồ ăn/uống
 * Simple categories for popcorn and drinks only
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
public enum ConcessionCategory {
    POPCORN("Bắp rang", "Bắp rang với các vị khác nhau"),
    DRINKS("Nước uống", "Các loại nước uống");

    private final String displayName;
    private final String description;

    ConcessionCategory(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
} 