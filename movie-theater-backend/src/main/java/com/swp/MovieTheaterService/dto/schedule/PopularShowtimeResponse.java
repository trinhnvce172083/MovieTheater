package com.swp.MovieTheaterService.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Popular Showtime Response DTO
 * Data transfer object for popular showtime statistics
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PopularShowtimeResponse {

    private String time;
    private Integer bookingCount;
    private Double percentage;
} 