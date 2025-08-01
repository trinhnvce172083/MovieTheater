package com.swp.MovieTheaterService.mapper;

import com.swp.MovieTheaterService.dto.movie.MovieCreateRequest;
import com.swp.MovieTheaterService.dto.movie.MovieResponse;
import com.swp.MovieTheaterService.dto.movie.MovieSummaryResponse;
import com.swp.MovieTheaterService.dto.movie.MovieUpdateRequest;
import com.swp.MovieTheaterService.entity.Movie;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.function.Consumer;

/**
 * Movie Mapper
 * Maps between Movie entity and DTOs
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Component
public class MovieMapper {

    /**
     * Check if string has meaningful content (not null, empty, or whitespace only)
     */
    private boolean hasContent(String value) {
        return value != null && !value.trim().isEmpty();
    }

    /**
     * Check if object has content (not null)
     */
    private boolean hasContent(Object value) {
        return value != null;
    }

    /**
     * Check if field should be cleared
     */
    private boolean shouldClearField(String value) {
        return MovieUpdateRequest.CLEAR_FIELD.equals(value);
    }

    /**
     * Update string field with smart logic:
     * - CLEAR_FIELD: set field to null
     * - Has content: trim and set value
     * - No content: skip update
     */
    private void updateStringField(String newValue, java.util.function.Consumer<String> setter) {
        if (shouldClearField(newValue)) {
            setter.accept(null);
        } else if (hasContent(newValue)) {
            setter.accept(newValue.trim());
        }
        // If newValue is null or empty, skip update (keep existing value)
    }

    /**
     * Convert MovieCreateRequest to Movie entity
     */
    public Movie toEntity(MovieCreateRequest request) {
        if (request == null) {
            return null;
        }

        Movie movie = new Movie();
        movie.setTitle(request.getTitle());
        movie.setDescription(request.getDescription());
        movie.setDuration(request.getDuration());
        movie.setGenre(request.getGenre());
        movie.setDirector(request.getDirector());
        movie.setCast(request.getCast());
        movie.setLanguage(request.getLanguage());
        movie.setCountry(request.getCountry());
        movie.setReleaseDate(request.getReleaseDate());
        movie.setRating(request.getRating());

        movie.setPrice(request.getPrice());
        movie.setStatus(request.getStatus() != null ? request.getStatus() : "COMING_SOON");
        movie.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);
        movie.setIsActive(true);
        movie.setImdbRating(request.getImdbRating());
        movie.setProductionCompany(request.getProductionCompany());
        movie.setBudget(request.getBudget());
        movie.setBoxOffice(request.getBoxOffice());
        movie.setCreatedAt(LocalDateTime.now());
        movie.setUpdatedAt(LocalDateTime.now());

        return movie;
    }

    /**
     * Update Movie entity from MovieUpdateRequest
     * Chỉ update các field có nội dung thực sự (không null, empty, hoặc chỉ có
     * whitespace)
     */
    public void updateEntity(Movie movie, MovieUpdateRequest request) {
        if (movie == null || request == null) {
            return;
        }

        // Update String fields only if they have meaningful content
        updateStringField(request.getTitle(), movie::setTitle);
        updateStringField(request.getDescription(), movie::setDescription);
        updateStringField(request.getGenre(), movie::setGenre);
        updateStringField(request.getDirector(), movie::setDirector);
        updateStringField(request.getCast(), movie::setCast);
        updateStringField(request.getLanguage(), movie::setLanguage);
        updateStringField(request.getCountry(), movie::setCountry);
        updateStringField(request.getRating(), movie::setRating);
        updateStringField(request.getPosterUrl(), movie::setPosterUrl);
        updateStringField(request.getTrailerUrl(), movie::setTrailerUrl);
        updateStringField(request.getStatus(), movie::setStatus);
        updateStringField(request.getProductionCompany(), movie::setProductionCompany);

        // Update non-String fields only if they have content (not null)
        if (hasContent(request.getDuration())) {
            movie.setDuration(request.getDuration());
        }
        if (hasContent(request.getReleaseDate())) {
            movie.setReleaseDate(request.getReleaseDate());
        }
        if (hasContent(request.getPrice())) {
            movie.setPrice(request.getPrice());
        }
        if (hasContent(request.getIsFeatured())) {
            movie.setIsFeatured(request.getIsFeatured());
        }
        if (hasContent(request.getIsActive())) {
            movie.setIsActive(request.getIsActive());
        }
        if (hasContent(request.getImdbRating())) {
            movie.setImdbRating(request.getImdbRating());
        }
        if (hasContent(request.getBudget())) {
            movie.setBudget(request.getBudget());
        }
        if (hasContent(request.getBoxOffice())) {
            movie.setBoxOffice(request.getBoxOffice());
        }

        // Always update timestamp
        movie.setUpdatedAt(LocalDateTime.now());
    }

    /**
     * Convert Movie entity to MovieResponse
     */
    public MovieResponse toResponse(Movie movie) {
        if (movie == null) {
            return null;
        }

        MovieResponse response = new MovieResponse();
        response.setMovieId(movie.getMovieId());
        response.setTitle(movie.getTitle());
        response.setDescription(movie.getDescription());
        response.setDuration(movie.getDuration());
        response.setFormattedDuration(movie.getFormattedDuration());
        response.setGenre(movie.getGenre());
        response.setDirector(movie.getDirector());
        response.setCast(movie.getCast());
        response.setLanguage(movie.getLanguage());
        response.setCountry(movie.getCountry());
        response.setReleaseDate(movie.getReleaseDate());
        response.setRating(movie.getRating());
        response.setPosterUrl(movie.getPosterUrl());
        response.setTrailerUrl(movie.getTrailerUrl());
        response.setIsActive(movie.getIsActive());
        response.setIsFeatured(movie.getIsFeatured());
        response.setPrice(movie.getPrice());
        response.setStatus(movie.getStatus());
        response.setImdbRating(movie.getImdbRating());
        response.setProductionCompany(movie.getProductionCompany());
        response.setBudget(movie.getBudget());
        response.setBoxOffice(movie.getBoxOffice());
        response.setCreatedAt(movie.getCreatedAt());
        response.setUpdatedAt(movie.getUpdatedAt());

        // Set computed fields
        response.setIsAdultContent(movie.isAdultContent());
        response.setIsNowShowing(movie.isNowShowing());
        response.setIsComingSoon(movie.isComingSoon());
        response.setIsEnded(movie.isEnded());

        // Schedule count will be set by service layer
        response.setScheduleCount(movie.getSchedules() != null ? movie.getSchedules().size() : 0);

        return response;
    }

    /**
     * Convert Movie entity to MovieSummaryResponse
     */
    public MovieSummaryResponse toSummaryResponse(Movie movie) {
        if (movie == null) {
            return null;
        }

        MovieSummaryResponse response = new MovieSummaryResponse();
        response.setMovieId(movie.getMovieId());
        response.setTitle(movie.getTitle());
        response.setGenre(movie.getGenre());
        response.setDuration(movie.getDuration());
        response.setFormattedDuration(movie.getFormattedDuration());
        response.setReleaseDate(movie.getReleaseDate());
        response.setRating(movie.getRating());
        response.setPosterUrl(movie.getPosterUrl());
        response.setPrice(movie.getPrice());
        response.setStatus(movie.getStatus());
        response.setImdbRating(movie.getImdbRating());
        response.setIsFeatured(movie.getIsFeatured());
        response.setIsAdultContent(movie.isAdultContent());

        return response;
    }
}