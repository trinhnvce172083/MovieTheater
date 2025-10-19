package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.movie.MovieCreateRequest;
import com.swp.MovieTheaterService.dto.movie.MovieFilterRequest;
import com.swp.MovieTheaterService.dto.movie.MovieListResponse;
import com.swp.MovieTheaterService.dto.movie.MovieResponse;
import com.swp.MovieTheaterService.dto.movie.MovieSummaryResponse;
import com.swp.MovieTheaterService.dto.movie.MovieUpdateRequest;
import com.swp.MovieTheaterService.dto.response.ApiResponse;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.service.MovieService;
import com.swp.MovieTheaterService.service.MovieStatusScheduler;
import com.swp.MovieTheaterService.enums.MovieStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * Movie Controller
 * REST API endpoints for movie management
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Movie Management", description = "APIs for managing movies")
public class MovieController {

    private final MovieService movieService;
    private final MovieStatusScheduler movieStatusScheduler;

    @PostMapping
    @Operation(summary = "Create new movie", description = "Create a new movie (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<MovieResponse>> createMovie(@RequestBody MovieCreateRequest request) {
        log.info("Creating new movie: {}", request.getTitle());

        MovieResponse response = movieService.createMovie(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Tạo phim thành công", response));
    }

    @PostMapping(value = "/with-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create movie with images", description = "Create a new movie with poster and backdrop images (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<MovieResponse>> createMovieWithImages(
            @RequestParam("movieData") String movieDataJson,
            @RequestParam(value = "poster", required = false) MultipartFile posterFile,
            @RequestParam(value = "backdrop", required = false) MultipartFile backdropFile) {
        
        log.info("Creating new movie with images");
        
        try {
            // Parse JSON data với JSR310 module
            com.fasterxml.jackson.databind.ObjectMapper objectMapper = createConfiguredObjectMapper();
            MovieCreateRequest request = objectMapper.readValue(movieDataJson, MovieCreateRequest.class);
            
            // Create movie first
            MovieResponse movieResponse = movieService.createMovie(request);
            Long movieId = movieResponse.getMovieId();
            
            // Upload images if provided
            if (posterFile != null && !posterFile.isEmpty()) {
                movieService.updateMoviePoster(movieId, posterFile);
            }
            
            if (backdropFile != null && !backdropFile.isEmpty()) {
                movieService.updateMovieBackdrop(movieId, backdropFile);
            }
            
            // Return updated movie data
            MovieResponse finalResponse = movieService.getMovieById(movieId);

            ApiResponse<MovieResponse> apiResponse = ApiResponse.<MovieResponse>builder()
                    .success(true)
                    .message("Tạo phim với hình ảnh thành công")
                    .data(finalResponse)
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
            
        } catch (Exception e) {
            log.error("Error creating movie with images: {}", e.getMessage());
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update movie", description = """
            Update an existing movie with smart field updating (Admin only)

            **Smart Update Features:**
            - **Partial Update**: Chỉ update các field có nội dung thực sự
            - **CLEAR_FIELD**: Xóa nội dung field bằng cách gửi "CLEAR_FIELD"
            - **Smart Handling**: Bỏ qua null, empty string, và whitespace-only
            - **Preserve Original**: Giữ nguyên giá trị cũ nếu không gửi field

            **Examples:**
            ```json
            {
              "title": "Updated Title",     // Update title
              "description": "CLEAR_FIELD", // Clear description (set to null)
              "genre": "   ",              // Ignored (whitespace only)
              "price": 150000.0            // Update price
              // Other fields not sent -> keep original values
            }
            ```

            **Use Cases:**
            1. Update chỉ title: `{"title": "New Title"}`
            2. Clear description: `{"description": "CLEAR_FIELD"}`
            3. Update multiple fields: `{"title": "New Title", "price": 200000.0}`
            4. Mixed operations: `{"title": "New Title", "description": "CLEAR_FIELD", "genre": "Action"}`
            """)
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<MovieResponse>> updateMovie(
            @PathVariable Long id,
            @RequestBody MovieUpdateRequest request) {
        log.info("Updating movie with ID: {} using smart update", id);

        MovieResponse response = movieService.updateMovie(id, request);

        ApiResponse<MovieResponse> apiResponse = ApiResponse.<MovieResponse>builder()
                .success(true)
                .message("Cập nhật phim thành công")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping(value = "/{id}/with-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update movie with images", description = "Update movie data and upload new images (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<MovieResponse>> updateMovieWithImages(
            @PathVariable Long id,
            @RequestParam(value = "movieData", required = false) String movieDataJson,
            @RequestParam(value = "poster", required = false) MultipartFile posterFile,
            @RequestParam(value = "backdrop", required = false) MultipartFile backdropFile) {
        
        log.info("Updating movie ID: {} with images", id);
        
        try {
            // Update movie data if provided
            if (movieDataJson != null && !movieDataJson.trim().isEmpty()) {
                com.fasterxml.jackson.databind.ObjectMapper objectMapper = createConfiguredObjectMapper();
                MovieUpdateRequest request = objectMapper.readValue(movieDataJson, MovieUpdateRequest.class);
                movieService.updateMovie(id, request);
            }
            
            // Upload images if provided
            if (posterFile != null && !posterFile.isEmpty()) {
                movieService.updateMoviePoster(id, posterFile);
            }
            
            if (backdropFile != null && !backdropFile.isEmpty()) {
                movieService.updateMovieBackdrop(id, backdropFile);
            }
            
            // Return updated movie data
            MovieResponse finalResponse = movieService.getMovieById(id);

            ApiResponse<MovieResponse> apiResponse = ApiResponse.<MovieResponse>builder()
                    .success(true)
                    .message("Cập nhật phim với hình ảnh thành công")
                    .data(finalResponse)
                    .build();

            return ResponseEntity.ok(apiResponse);
            
        } catch (Exception e) {
            log.error("Error updating movie with images: {}", e.getMessage());
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get movie by ID", description = "Retrieve movie details by ID")
    public ResponseEntity<ApiResponse<MovieResponse>> getMovie(@PathVariable Long id) {
        log.info("Fetching movie with ID: {}", id);

        MovieResponse response = movieService.getMovieById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin phim thành công", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete movie", description = "Delete a movie (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<String>> deleteMovie(@PathVariable Long id) {
        log.info("Deleting movie with ID: {}", id);

        movieService.deleteMovie(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa phim thành công", null));
    }

    @GetMapping
    @Operation(summary = "Get all movies", description = "Retrieve all movies with pagination")
    public ResponseEntity<ApiResponse<Page<MovieSummaryResponse>>> getAllMovies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {

        log.info("Fetching all movies with pagination: page={}, size={}, sortBy={}, sortDirection={}",
                page, size, sortBy, sortDirection);

        Sort sort = Sort.by(sortDirection.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<MovieSummaryResponse> movies = movieService.getAllMovies(pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phim thành công", movies));
    }

    @GetMapping("/now-showing")
    @Operation(summary = "Get now showing movies", description = "Retrieve currently showing movies")
    public ResponseEntity<ApiResponse<List<MovieSummaryResponse>>> getNowShowingMovies() {
        log.info("Fetching now showing movies");

        List<MovieSummaryResponse> movies = movieService.getMoviesByStatus("NOW_SHOWING");
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phim đang chiếu thành công", movies));
    }

    @GetMapping("/coming-soon")
    @Operation(summary = "Get coming soon movies", description = "Retrieve upcoming movies")
    public ResponseEntity<ApiResponse<List<MovieSummaryResponse>>> getComingSoonMovies() {
        log.info("Fetching coming soon movies");

        List<MovieSummaryResponse> movies = movieService.getMoviesByStatus("COMING_SOON");
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phim sắp chiếu thành công", movies));
    }

    @GetMapping("/now-showing/filter")
    @Operation(summary = "Get now showing movies with filters", description = "Get currently showing movies with optional filtering by keyword, genre, rating, etc.")
    public ResponseEntity<ApiResponse<MovieListResponse>> getNowShowingMoviesWithFilter(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<String> genres,
            @RequestParam(required = false) String rating,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate releaseDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate releaseDateTo,
            @RequestParam(required = false) Integer durationMin,
            @RequestParam(required = false) Integer durationMax,
            @RequestParam(required = false) Double imdbRatingMin,
            @RequestParam(required = false, defaultValue = "true") Boolean isActive,
            @RequestParam(required = false, defaultValue = "true") Boolean isFeatured,
            @RequestParam(required = false) Boolean isAdultContent,
            @RequestParam(required = false, defaultValue = "true") Boolean availableToday,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "releaseDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        log.info("Getting now showing movies with filters: keyword={}, genres={}, page={}, size={}",
                keyword, genres, page, size);

        MovieFilterRequest filterRequest = MovieFilterRequest.builder()
                .keyword(keyword)
                .genres(genres)
                .rating(rating)
                .language(language)
                .country(country)
                .releaseDateFrom(releaseDateFrom)
                .releaseDateTo(releaseDateTo)
                .durationMin(durationMin)
                .durationMax(durationMax)
                .imdbRatingMin(imdbRatingMin)
                .isActive(isActive)
                .isFeatured(isFeatured)
                .isAdultContent(isAdultContent)
                .availableToday(availableToday)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .status("NOW_SHOWING")
                .build();

        MovieListResponse response = movieService.getMoviesWithFilter(filterRequest);
        return ResponseEntity.ok(ApiResponse.success("Lọc phim đang chiếu thành công", response));
    }

    @GetMapping("/coming-soon/filter")
    @Operation(summary = "Get coming soon movies with filters", description = "Get upcoming movies with optional filtering by keyword, genre, rating, etc.")
    public ResponseEntity<ApiResponse<MovieListResponse>> getComingSoonMoviesWithFilter(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<String> genres,
            @RequestParam(required = false) String rating,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate releaseDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate releaseDateTo,
            @RequestParam(required = false) Integer durationMin,
            @RequestParam(required = false) Integer durationMax,
            @RequestParam(required = false) Double imdbRatingMin,
            @RequestParam(required = false, defaultValue = "true") Boolean isActive,
            @RequestParam(required = false, defaultValue = "true") Boolean isFeatured,
            @RequestParam(required = false) Boolean isAdultContent,
            @RequestParam(required = false, defaultValue = "true") Boolean availableToday,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "releaseDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        log.info("Getting coming soon movies with filters: keyword={}, genres={}, page={}, size={}",
                keyword, genres, page, size);

        MovieFilterRequest filterRequest = MovieFilterRequest.builder()
                .keyword(keyword)
                .genres(genres)
                .rating(rating)
                .language(language)
                .country(country)
                .releaseDateFrom(releaseDateFrom)
                .releaseDateTo(releaseDateTo)
                .durationMin(durationMin)
                .durationMax(durationMax)
                .imdbRatingMin(imdbRatingMin)
                .isActive(isActive)
                .isFeatured(isFeatured)
                .isAdultContent(isAdultContent)
                .availableToday(availableToday)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .status("COMING_SOON")
                .build();

        MovieListResponse response = movieService.getMoviesWithFilter(filterRequest);
        return ResponseEntity.ok(ApiResponse.success("Lọc phim sắp chiếu thành công", response));
    }

    @GetMapping("/search")
    @Operation(summary = "Search movies", description = "Search movies by title, genre, or description")
    public ResponseEntity<ApiResponse<Page<MovieSummaryResponse>>> searchMovies(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("Searching movies with keyword: {}", keyword);

        Pageable pageable = PageRequest.of(page, size);
        Page<MovieSummaryResponse> movies = movieService.searchMovies(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm phim thành công", movies));
    }

    @GetMapping("/genre/{genre}")
    @Operation(summary = "Get movies by genre", description = "Retrieve movies filtered by genre")
    public ResponseEntity<ApiResponse<List<MovieSummaryResponse>>> getMoviesByGenre(@PathVariable String genre) {
        log.info("Fetching movies by genre: {}", genre);

        List<MovieSummaryResponse> movies = movieService.getMoviesByGenre(genre);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phim theo thể loại thành công", movies));
    }

    @GetMapping("/popular")
    @Operation(summary = "Get popular movies", description = "Retrieve popular movies based on ratings")
    public ResponseEntity<ApiResponse<List<MovieSummaryResponse>>> getPopularMovies(
            @RequestParam(defaultValue = "10") int limit) {

        log.info("Fetching popular movies, limit: {}", limit);

        List<MovieSummaryResponse> movies = movieService.getTopRatedMovies(limit);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phim phổ biến thành công", movies));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get movie statistics", description = "Get movie statistics (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<MovieService.MovieStatistics> getMovieStatistics() {
        log.info("Fetching movie statistics");

        MovieService.MovieStatistics statistics = movieService.getMovieStatistics();
        return ResponseEntity.ok(statistics);
    }

    @PostMapping("/auto-update-status")
    @Operation(summary = "Auto update movie status", description = "Manually trigger auto update movie status based on current date (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> autoUpdateMovieStatus() {
        log.info("Manual trigger: Auto updating movie status");

        Map<String, String> updatedMovies = movieStatusScheduler.autoUpdateMovieStatus();

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Movie status auto-update completed");
        response.put("updatedCount", updatedMovies.size());
        response.put("updatedMovies", updatedMovies);
        response.put("timestamp", java.time.LocalDateTime.now());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/status-update-stats")
    @Operation(summary = "Get movie status update statistics", description = "Get statistics about movie status updates (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<MovieStatusScheduler.MovieStatusUpdateStats> getStatusUpdateStats() {
        log.info("Getting movie status update statistics");

        MovieStatusScheduler.MovieStatusUpdateStats stats = movieStatusScheduler.getStatusUpdateStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/status-options")
    @Operation(summary = "Get movie status options", description = "Get all available movie status options")
    public ResponseEntity<Map<String, Object>> getStatusOptions() {
        log.info("Getting movie status options");

        Map<String, Object> statusOptions = new HashMap<>();
        for (MovieStatus status : MovieStatus.values()) {
            Map<String, String> statusInfo = new HashMap<>();
            statusInfo.put("code", status.getCode());
            statusInfo.put("displayName", status.getDisplayName());
            statusInfo.put("description", status.getDescription());
            statusOptions.put(status.name(), statusInfo);
        }

        return ResponseEntity.ok(statusOptions);
    }
    
    // =============== IMAGE MANAGEMENT ENDPOINTS ===============
    
    @PostMapping("/{id}/poster")
    @Operation(summary = "Upload movie poster", description = "Upload poster image for a movie (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<String> uploadMoviePoster(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        
        log.info("Uploading poster for movie ID: {}", id);
        MovieResponse response = movieService.updateMoviePoster(id, file);
        return ResponseEntity.ok(response.getPosterUrl());
    }
    
    @PostMapping("/{id}/backdrop")
    @Operation(summary = "Upload movie backdrop", description = "Upload backdrop image for a movie (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<String> uploadMovieBackdrop(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        
        log.info("Uploading backdrop for movie ID: {}", id);
        movieService.updateMovieBackdrop(id, file);
        return ResponseEntity.ok("Upload backdrop thành công");
    }
    
    @DeleteMapping("/{id}/poster")
    @Operation(summary = "Delete movie poster", description = "Delete poster image of a movie (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<String> deleteMoviePoster(@PathVariable Long id) {
        
        log.info("Deleting poster for movie ID: {}", id);
        movieService.deleteMoviePoster(id);
        return ResponseEntity.ok("Xóa poster thành công");
    }
    
    @DeleteMapping("/{id}/backdrop")
    @Operation(summary = "Delete movie backdrop", description = "Delete backdrop image of a movie (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<String> deleteMovieBackdrop(@PathVariable Long id) {
        
        log.info("Deleting backdrop for movie ID: {}", id);
        movieService.deleteMovieBackdrop(id);
        return ResponseEntity.ok("Xóa backdrop thành công");
    }
    
    // =============== UTILITY METHODS ===============
    
    /**
     * Tạo ObjectMapper với JSR310 module cho xử lý LocalDate/LocalDateTime
     */
    private com.fasterxml.jackson.databind.ObjectMapper createConfiguredObjectMapper() {
        com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return objectMapper;
    }
}
