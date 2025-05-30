package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.movie.MovieCreateRequest;
import com.swp.MovieTheaterService.dto.movie.MovieResponse;
import com.swp.MovieTheaterService.dto.movie.MovieSummaryResponse;
import com.swp.MovieTheaterService.dto.movie.MovieUpdateRequest;
import com.swp.MovieTheaterService.service.MovieService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Movie Controller
 * REST API endpoints for movie management
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@RestController
@RequestMapping("/movies")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Movie Management", description = "APIs for managing movies")
public class MovieController {

    private final MovieService movieService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create new movie", description = "Create a new movie (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<MovieResponse> createMovie(@RequestBody MovieCreateRequest request) {
        log.info("Creating new movie: {}", request.getTitle());
        
        MovieResponse response = movieService.createMovie(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update movie", description = "Update an existing movie (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<MovieResponse> updateMovie(
            @PathVariable Long id,
            @RequestBody MovieUpdateRequest request) {
        log.info("Updating movie with ID: {}", id);
        
        MovieResponse response = movieService.updateMovie(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get movie by ID", description = "Retrieve movie details by ID")
    public ResponseEntity<MovieResponse> getMovie(@PathVariable Long id) {
        log.info("Fetching movie with ID: {}", id);
        
        MovieResponse response = movieService.getMovieById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete movie", description = "Delete a movie (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> deleteMovie(@PathVariable Long id) {
        log.info("Deleting movie with ID: {}", id);
        
        movieService.deleteMovie(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "Get all movies", description = "Retrieve all movies with pagination")
    public ResponseEntity<Page<MovieSummaryResponse>> getAllMovies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        
        log.info("Fetching movies - page: {}, size: {}", page, size);
        
        Sort sort = Sort.by(sortDirection.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<MovieSummaryResponse> movies = movieService.getAllMovies(pageable);
        return ResponseEntity.ok(movies);
    }

    @GetMapping("/search")
    @Operation(summary = "Search movies", description = "Search movies by title, genre, or description")
    public ResponseEntity<Page<MovieSummaryResponse>> searchMovies(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Searching movies with keyword: {}", keyword);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<MovieSummaryResponse> movies = movieService.searchMovies(keyword, pageable);
        return ResponseEntity.ok(movies);
    }

    @GetMapping("/genre/{genre}")
    @Operation(summary = "Get movies by genre", description = "Retrieve movies filtered by genre")
    public ResponseEntity<List<MovieSummaryResponse>> getMoviesByGenre(@PathVariable String genre) {
        log.info("Fetching movies by genre: {}", genre);
        
        List<MovieSummaryResponse> movies = movieService.getMoviesByGenre(genre);
        return ResponseEntity.ok(movies);
    }

    @GetMapping("/now-showing")
    @Operation(summary = "Get now showing movies", description = "Retrieve currently showing movies")
    public ResponseEntity<List<MovieSummaryResponse>> getNowShowingMovies() {
        log.info("Fetching now showing movies");
        
        List<MovieSummaryResponse> movies = movieService.getMoviesByStatus("NOW_SHOWING");
        return ResponseEntity.ok(movies);
    }

    @GetMapping("/coming-soon")
    @Operation(summary = "Get coming soon movies", description = "Retrieve upcoming movies")
    public ResponseEntity<List<MovieSummaryResponse>> getComingSoonMovies() {
        log.info("Fetching coming soon movies");
        
        List<MovieSummaryResponse> movies = movieService.getMoviesByStatus("COMING_SOON");
        return ResponseEntity.ok(movies);
    }

    @GetMapping("/popular")
    @Operation(summary = "Get popular movies", description = "Retrieve popular movies based on ratings")
    public ResponseEntity<List<MovieSummaryResponse>> getPopularMovies(
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Fetching popular movies, limit: {}", limit);
        
        List<MovieSummaryResponse> movies = movieService.getTopRatedMovies(limit);
        return ResponseEntity.ok(movies);
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get movie statistics", description = "Get movie statistics (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<MovieService.MovieStatistics> getMovieStatistics() {
        log.info("Fetching movie statistics");
        
        MovieService.MovieStatistics statistics = movieService.getMovieStatistics();
        return ResponseEntity.ok(statistics);
    }
} 