package com.swp.MovieTheaterService.dto.cinema;

import com.swp.MovieTheaterService.enums.SeatStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Seat Response DTO
 * Data transfer object for seat responses
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatResponse {

    private Long seatId;
    private String seatNumber;
    private Integer seatRow;
    private Integer seatColumn;
    private SeatStatus seatStatus;
    private String seatType;
    private Boolean isActive;
    private Double priceMultiplier;
    private Boolean isRecliner;
    private Boolean hasTable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Cinema room info
    private Long cinemaRoomId;
    private String cinemaRoomName;
    
    // Additional computed fields
    private String rowLetter;
    private String displayName;
    private Boolean isAvailable;
    private Boolean isOccupied;
    private Boolean isMaintenance;
    private Boolean isVIP;
    private Boolean isCouple;
    private Boolean isWheelchair;
    private Boolean isPremium;
} 