package com.swp.MovieTheaterService.mapper;

import com.swp.MovieTheaterService.dto.movie.MovieCreateRequest;
import com.swp.MovieTheaterService.dto.movie.MovieResponse;
import com.swp.MovieTheaterService.dto.movie.MovieSummaryResponse;
import com.swp.MovieTheaterService.dto.movie.MovieUpdateRequest;
import com.swp.MovieTheaterService.entity.Movie;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

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
        movie.setPosterUrl(request.getPosterUrl());
        movie.setTrailerUrl(request.getTrailerUrl());
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
     */
    public void updateEntity(Movie movie, MovieUpdateRequest request) {
        if (movie == null || request == null) {
            return;
        }

        if (request.getTitle() != null) {
            movie.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            movie.setDescription(request.getDescription());
        }
        if (request.getDuration() != null) {
            movie.setDuration(request.getDuration());
        }
        if (request.getGenre() != null) {
            movie.setGenre(request.getGenre());
        }
        if (request.getDirector() != null) {
            movie.setDirector(request.getDirector());
        }
        if (request.getCast() != null) {
            movie.setCast(request.getCast());
        }
        if (request.getLanguage() != null) {
            movie.setLanguage(request.getLanguage());
        }
        if (request.getCountry() != null) {
            movie.setCountry(request.getCountry());
        }
        if (request.getReleaseDate() != null) {
            movie.setReleaseDate(request.getReleaseDate());
        }
        if (request.getRating() != null) {
            movie.setRating(request.getRating());
        }
        if (request.getPosterUrl() != null) {
            movie.setPosterUrl(request.getPosterUrl());
        }
        if (request.getTrailerUrl() != null) {
            movie.setTrailerUrl(request.getTrailerUrl());
        }
        if (request.getPrice() != null) {
            movie.setPrice(request.getPrice());
        }
        if (request.getStatus() != null) {
            movie.setStatus(request.getStatus());
        }
        if (request.getIsFeatured() != null) {
            movie.setIsFeatured(request.getIsFeatured());
        }
        if (request.getIsActive() != null) {
            movie.setIsActive(request.getIsActive());
        }
        if (request.getImdbRating() != null) {
            movie.setImdbRating(request.getImdbRating());
        }
        if (request.getProductionCompany() != null) {
            movie.setProductionCompany(request.getProductionCompany());
        }
        if (request.getBudget() != null) {
            movie.setBudget(request.getBudget());
        }
        if (request.getBoxOffice() != null) {
            movie.setBoxOffice(request.getBoxOffice());
        }

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