package com.swp.MovieTheaterService.enums;

/**
 * SeatStatus Enum - Seat Status
 * Defines different seat statuses in the system
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
public enum SeatStatus {
    AVAILABLE("Available"),
    OCCUPIED("Occupied"),
    MAINTENANCE("Maintenance");

    private final String displayName;

    SeatStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isAvailable() {
        return this == AVAILABLE;
    }

    public boolean isOccupied() {
        return this == OCCUPIED;
    }

    public boolean isMaintenance() {
        return this == MAINTENANCE;
    }

    public boolean isBookable() {
        return this == AVAILABLE;
    }
} 