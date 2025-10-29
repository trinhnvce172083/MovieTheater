package com.swp.MovieTheaterService.dto.movie;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Movie Response DTO
 * Data transfer object for movie responses
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieResponse {

    private Long movieId;
    private String title;
    private String description;
    private Integer duration;
    private String formattedDuration;
    private String genre;
    private String director;
    private String cast;
    private String language;
    private String country;
    private LocalDate releaseDate;
    private String rating;
    private String posterUrl;
    private String backdropUrl;
    private String trailerUrl;
    private Boolean isActive;
    private Boolean isFeatured;
    private Double price;
    private String status;
    private Double imdbRating;
    private String productionCompany;
    private Long budget;
    private Long boxOffice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional computed fields
    private Boolean isAdultContent;
    private Boolean isNowShowing;
    private Boolean isComingSoon;
    private Boolean isEnded;
    private Integer scheduleCount; // Number of schedules for this movie
}