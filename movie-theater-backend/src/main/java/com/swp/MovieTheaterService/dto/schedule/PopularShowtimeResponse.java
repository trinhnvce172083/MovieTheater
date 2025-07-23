package com.swp.MovieTheaterService.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

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

    private LocalTime showtime;
    private Long totalBookings;
    private Long totalRevenue;
    private Double averageOccupancyRate;
    private String timeCategory; // MORNING, AFTERNOON, EVENING, NIGHT
    private Integer totalSchedules;
    private String displayTime;
    private Double popularityScore;
} 