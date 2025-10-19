package com.swp.MovieTheaterService.dto.cinema;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Cinema Room Response DTO
 * Data transfer object for cinema room responses
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CinemaRoomResponse {

    private Long cinemaRoomId;
    private String cinemaRoomName;
    private Integer seatQuantity;
    private String roomType;
    private Boolean isActive;
    private String description;
    private Integer rows;
    private Integer columns;
    private Boolean has3D;
    private Boolean hasDolbyAtmos;
    private Boolean hasReclinerSeats;
    private Double priceMultiplier;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional computed fields
    private String displayName;
    private Boolean isVIP;
    private Boolean isIMAX;
    private Boolean is4DX;
    private Boolean isPremium;
    private Integer availableSeats;
    private Integer occupiedSeats;
    private Integer temporarilyReservedSeats;
    private Integer scheduleCount; // Number of schedules for this room
} 
