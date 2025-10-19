package com.swp.MovieTheaterService.dto.movie;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Movie List Response DTO
 * Data Transfer Object for paginated movie list response
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieListResponse {
    
    private List<MovieSummaryDTO> movies;
    private PaginationInfo pagination;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaginationInfo {
        private int currentPage;
        private int totalPages;
        private long totalElements;
        private int pageSize;
        private boolean hasNext;
        private boolean hasPrevious;
        private boolean isFirst;
        private boolean isLast;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MovieSummaryDTO {
        private Long movieId;
        private String title;
        private String originalTitle;
        private String description;
        private Integer duration;
        private String genres;
        private String director;
        private String language;
        private String country;
        private String releaseDate;
        private String endDate;
        private String rating;
        private String posterUrl;
        private String backdropUrl;
        private String trailerUrl;
        private Boolean isActive;
        private Boolean isFeatured;
        private Double price;
        private String status;
        private Double imdbRating;
        private String formattedDuration;
        private boolean isAdultContent;
        private boolean availableToday;
    }
} 
