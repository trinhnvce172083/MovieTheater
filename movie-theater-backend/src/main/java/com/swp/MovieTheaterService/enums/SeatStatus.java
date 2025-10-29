package com.swp.MovieTheaterService.enums;

/**
 * SeatStatus Enum - Seat Status
 * Defines different seat statuses in the system
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
public enum SeatStatus {
    AVAILABLE("Available"),
    TEMPORARILY_RESERVED("Temporarily Reserved"), 
    OCCUPIED("Occupied");

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

    public boolean isTemporarilyReserved() {
        return this == TEMPORARILY_RESERVED;
    }

    public boolean isBookable() {
        return this == AVAILABLE;
    }
}