package com.swp.MovieTheaterService.dto.movie;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * Movie Filter Request DTO
 * Data Transfer Object for movie filtering and pagination
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieFilterRequest {
    
    // Pagination
    private int page = 0;
    private int size = 20;
    private String sortBy = "releaseDate";
    private String sortDirection = "desc"; // asc or desc
    
    // Filters
    private String keyword; // Search in title, description, cast
    private List<String> genres; // Multiple genre filter
    private String status; // NOW_SHOWING, COMING_SOON, ENDED
    private String rating; // G, PG, PG-13, R, NC-17
    private String language;
    private String country;
    private LocalDate releaseDateFrom;
    private LocalDate releaseDateTo;
    private Integer durationMin; // Minimum duration in minutes
    private Integer durationMax; // Maximum duration in minutes
    private Double priceMin;
    private Double priceMax;
    private Double imdbRatingMin;
    private Boolean isActive;
    private Boolean isFeatured;
    
    // Special filters
    private Boolean isAdultContent; // Filter based on rating
    private Boolean availableToday; // Has schedules today
}