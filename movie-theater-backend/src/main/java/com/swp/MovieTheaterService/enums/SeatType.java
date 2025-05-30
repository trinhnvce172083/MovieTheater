package com.swp.MovieTheaterService.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Seat Type Enum
 * Represents different types of seats in the cinema
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Getter
@AllArgsConstructor
public enum SeatType {
    STANDARD("Standard"),
    VIP("VIP"),
    COUPLE("Couple"),
    WHEELCHAIR("Wheelchair");

    private final String displayName;
    
    @Override
    public String toString() {
        return displayName;
    }
} 