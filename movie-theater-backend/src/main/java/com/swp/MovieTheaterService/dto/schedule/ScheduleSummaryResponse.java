package com.swp.MovieTheaterService.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Schedule Summary Response DTO
 * Lightweight data transfer object for schedule lists
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleSummaryResponse {

    private Long scheduleId;
    private LocalDate showDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Double price;
    private String status;
    private Boolean is3D;
    private Boolean isIMAX;
    private Boolean is4DX;
    private Integer availableSeats;
    private Integer bookedSeats;

    // Basic movie info
    private Long movieId;
    private String movieName;
    private String moviePoster;
    private Integer movieDuration;
    private String movieRating;

    // Basic cinema room info
    private Long cinemaRoomId;
    private String cinemaRoomName;
    private String roomType;

    // Computed fields
    private String displayTime;
    private String displayDate;
    private Boolean isBookable;
    private Double occupancyRate;
    private String specialFeatures;
    private String priceDisplay;
} 
