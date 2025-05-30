package com.swp.MovieTheaterService.dto.cinema;

import com.swp.MovieTheaterService.enums.RoomType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Cinema Room Update Request DTO
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CinemaRoomUpdateRequest {
    
    @NotBlank(message = "Room name is required")
    private String roomName;
    
    @NotNull(message = "Room type is required")
    private RoomType roomType;
    
    @Positive(message = "Total seats must be positive")
    private Integer totalSeats;
    
    @Positive(message = "Rows must be positive")
    private Integer rows;
    
    @Positive(message = "Columns must be positive")
    private Integer columns;
    
    private String description;
    private Boolean isActive;
} 