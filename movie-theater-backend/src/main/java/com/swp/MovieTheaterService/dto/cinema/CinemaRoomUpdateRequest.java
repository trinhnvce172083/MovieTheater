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
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CinemaRoomUpdateRequest {
    
    @NotBlank(message = "Room name is required")
    private String cinemaRoomName;
    
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
    
    // Compatibility methods for mapper and service calls
    public String getCinemaRoomName() {
        return cinemaRoomName;
    }
    
    public Boolean getHas3D() {
        return false; // Default value since field not in this DTO
    }
    
    public Boolean getHasDolbyAtmos() {
        return false; // Default value since field not in this DTO
    }
    
    public Boolean getHasReclinerSeats() {
        return false; // Default value since field not in this DTO
    }
    
    public Double getPriceMultiplier() {
        return 1.0; // Default value since field not in this DTO
    }
} 
