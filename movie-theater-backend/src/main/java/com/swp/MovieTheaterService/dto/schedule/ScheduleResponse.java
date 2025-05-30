package com.swp.MovieTheaterService.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Schedule Response DTO
 * Data transfer object for schedule responses
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleResponse {

    private Long scheduleId;
    private LocalDate showDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Double price;
    private Boolean isActive;
    private String status;
    private Boolean is3D;
    private Boolean isIMAX;
    private Boolean is4DX;
    private String subtitleLanguage;
    private String audioLanguage;
    private Integer availableSeats;
    private Integer bookedSeats;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Movie information
    private Long movieId;
    private String movieName;
    private String moviePoster;
    private Integer movieDuration;
    private String movieRating;
    private String movieGenre;

    // Cinema room information
    private Long cinemaRoomId;
    private String cinemaRoomName;
    private String roomType;
    private Integer totalSeats;
    private Boolean roomHas3D;
    private Boolean roomHasDolbyAtmos;
    private Boolean roomHasReclinerSeats;
    private Double roomPriceMultiplier;

    // Additional computed fields
    private LocalDateTime showDateTime;
    private LocalDateTime endDateTime;
    private String displayTime;
    private String displayDate;
    private Boolean isToday;
    private Boolean isPast;
    private Boolean isFuture;
    private Boolean isBookable;
    private Double occupancyRate;
    private Integer totalCapacity;
    private String specialFeatures;
    private Boolean hasSpecialFeatures;
    private String statusDisplay;
    private Boolean canCancel;
    private Boolean canUpdate;
    private Boolean canDelete;
    private String priceDisplay;
    private String durationDisplay;
} 