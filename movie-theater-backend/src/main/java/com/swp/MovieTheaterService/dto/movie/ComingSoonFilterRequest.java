package com.swp.MovieTheaterService.dto.movie;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * Coming Soon Movie Filter Request DTO
 * Data Transfer Object for filtering upcoming movies
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComingSoonFilterRequest {
    
    // Pagination
    private int page = 0;
    private int size = 20;
    private String sortBy = "releaseDate";
    private String sortDirection = "asc"; // asc for coming soon (earliest first)
    
    // Filters
    private String keyword; // Search in title, description, cast
    private List<String> genres; // Multiple genre filter
    private String rating; // G, PG, PG-13, R, NC-17
    private String language;
    private String country;
    private LocalDate releaseDateFrom;
    private LocalDate releaseDateTo;
    private Integer durationMin; // Minimum duration in minutes
    private Integer durationMax; // Maximum duration in minutes
    private Double imdbRatingMin;
    private Boolean isActive;
    private Boolean isFeatured;
    
    // Special filters for coming soon
    private Boolean hasTrailer; // Has trailer available
    private Boolean isHighlyAnticipated; // Based on pre-booking or ratings
    private Integer daysUntilRelease; // Filter by days until release
    private Boolean isAdultContent; // Filter based on rating
    
    // Convert to general MovieFilterRequest
    public MovieFilterRequest toMovieFilterRequest() {
        MovieFilterRequest request = new MovieFilterRequest();
        request.setPage(this.page);
        request.setSize(this.size);
        request.setSortBy(this.sortBy);
        request.setSortDirection(this.sortDirection);
        request.setKeyword(this.keyword);
        request.setGenres(this.genres);
        request.setStatus("COMING_SOON"); // Force status to COMING_SOON
        request.setRating(this.rating);
        request.setLanguage(this.language);
        request.setCountry(this.country);
        request.setReleaseDateFrom(this.releaseDateFrom);
        request.setReleaseDateTo(this.releaseDateTo);
        request.setDurationMin(this.durationMin);
        request.setDurationMax(this.durationMax);
        request.setImdbRatingMin(this.imdbRatingMin);
        request.setIsActive(this.isActive);
        request.setIsFeatured(this.isFeatured);
        request.setIsAdultContent(this.isAdultContent);
        return request;
    }
} 