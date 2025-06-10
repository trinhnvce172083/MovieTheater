package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.dto.movie.MovieCreateRequest;
import com.swp.MovieTheaterService.dto.movie.MovieFilterRequest;
import com.swp.MovieTheaterService.dto.movie.MovieListResponse;
import com.swp.MovieTheaterService.dto.movie.MovieResponse;
import com.swp.MovieTheaterService.dto.movie.MovieSummaryResponse;
import com.swp.MovieTheaterService.dto.movie.MovieUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

/**
 * Movie Service Interface
 * Business logic for movie management
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
public interface MovieService {

    /**
     * Create a new movie
     */
    MovieResponse createMovie(MovieCreateRequest request);

    /**
     * Update an existing movie
     */
    MovieResponse updateMovie(Long movieId, MovieUpdateRequest request);

    /**
     * Get movie by ID
     */
    MovieResponse getMovieById(Long movieId);

    /**
     * Get all active movies with pagination
     */
    Page<MovieSummaryResponse> getAllMovies(Pageable pageable);

    /**
     * Get movies with advanced filtering and pagination
     */
    MovieListResponse getMoviesWithFilter(MovieFilterRequest filterRequest);

    /**
     * Get movies by status
     */
    List<MovieSummaryResponse> getMoviesByStatus(String status);

    /**
     * Get movies by status with pagination
     */
    Page<MovieSummaryResponse> getMoviesByStatus(String status, Pageable pageable);

    /**
     * Get featured movies
     */
    List<MovieSummaryResponse> getFeaturedMovies();

    /**
     * Get movies by genre
     */
    List<MovieSummaryResponse> getMoviesByGenre(String genre);

    /**
     * Get movies by genre with pagination
     */
    Page<MovieSummaryResponse> getMoviesByGenre(String genre, Pageable pageable);

    /**
     * Search movies by keyword
     */
    Page<MovieSummaryResponse> searchMovies(String keyword, Pageable pageable);

    /**
     * Get movies by release date range
     */
    List<MovieSummaryResponse> getMoviesByDateRange(LocalDate startDate, LocalDate endDate);

    /**
     * Get movies by rating
     */
    List<MovieSummaryResponse> getMoviesByRating(String rating);

    /**
     * Get movies by price range
     */
    List<MovieSummaryResponse> getMoviesByPriceRange(Double minPrice, Double maxPrice);

    /**
     * Get top rated movies
     */
    List<MovieSummaryResponse> getTopRatedMovies(int limit);

    /**
     * Get recently added movies
     */
    List<MovieSummaryResponse> getRecentlyAddedMovies(int limit);

    /**
     * Get movies by duration range
     */
    List<MovieSummaryResponse> getMoviesByDurationRange(Integer minDuration, Integer maxDuration);

    /**
     * Soft delete movie (set isActive = false)
     */
    void deleteMovie(Long movieId);

    /**
     * Restore deleted movie (set isActive = true)
     */
    MovieResponse restoreMovie(Long movieId);

    /**
     * Toggle featured status
     */
    MovieResponse toggleFeaturedStatus(Long movieId);

    /**
     * Update movie status
     */
    MovieResponse updateMovieStatus(Long movieId, String status);

    /**
     * Check if movie title exists
     */
    boolean isMovieTitleExists(String title);

    /**
     * Get movie statistics
     */
    MovieStatistics getMovieStatistics();

    /**
     * Inner class for movie statistics
     */
    class MovieStatistics {
        private Long totalMovies;
        private Long nowShowingCount;
        private Long comingSoonCount;
        private Long endedCount;
        private Long featuredCount;
        private Double averageRating;
        private Double averagePrice;

        // Constructors, getters, setters
        public MovieStatistics() {}

        public MovieStatistics(Long totalMovies, Long nowShowingCount, Long comingSoonCount, 
                             Long endedCount, Long featuredCount, Double averageRating, Double averagePrice) {
            this.totalMovies = totalMovies;
            this.nowShowingCount = nowShowingCount;
            this.comingSoonCount = comingSoonCount;
            this.endedCount = endedCount;
            this.featuredCount = featuredCount;
            this.averageRating = averageRating;
            this.averagePrice = averagePrice;
        }

        // Getters and setters
        public Long getTotalMovies() { return totalMovies; }
        public void setTotalMovies(Long totalMovies) { this.totalMovies = totalMovies; }

        public Long getNowShowingCount() { return nowShowingCount; }
        public void setNowShowingCount(Long nowShowingCount) { this.nowShowingCount = nowShowingCount; }

        public Long getComingSoonCount() { return comingSoonCount; }
        public void setComingSoonCount(Long comingSoonCount) { this.comingSoonCount = comingSoonCount; }

        public Long getEndedCount() { return endedCount; }
        public void setEndedCount(Long endedCount) { this.endedCount = endedCount; }

        public Long getFeaturedCount() { return featuredCount; }
        public void setFeaturedCount(Long featuredCount) { this.featuredCount = featuredCount; }

        public Double getAverageRating() { return averageRating; }
        public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

        public Double getAveragePrice() { return averagePrice; }
        public void setAveragePrice(Double averagePrice) { this.averagePrice = averagePrice; }
    }
} 