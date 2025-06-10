package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.dto.movie.MovieCreateRequest;
import com.swp.MovieTheaterService.dto.movie.MovieFilterRequest;
import com.swp.MovieTheaterService.dto.movie.MovieListResponse;
import com.swp.MovieTheaterService.dto.movie.MovieResponse;
import com.swp.MovieTheaterService.dto.movie.MovieSummaryResponse;
import com.swp.MovieTheaterService.dto.movie.MovieUpdateRequest;
import com.swp.MovieTheaterService.entity.Movie;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.mapper.MovieMapper;
import com.swp.MovieTheaterService.repository.MovieRepository;
import com.swp.MovieTheaterService.service.MovieService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Movie Service Implementation
 * Business logic implementation for movie management
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final MovieMapper movieMapper;

    @Override
    public MovieResponse createMovie(MovieCreateRequest request) {
        log.info("Creating new movie with title: {}", request.getTitle());

        // Check if movie title already exists
        if (movieRepository.existsByTitleIgnoreCaseAndIsActiveTrue(request.getTitle())) {
            throw new AppException(ErrorCode.MOVIE_ALREADY_EXISTS);
        }

        // Convert DTO to entity
        Movie movie = movieMapper.toEntity(request);

        // Save movie
        Movie savedMovie = movieRepository.save(movie);
        log.info("Movie created successfully with ID: {}", savedMovie.getMovieId());

        return movieMapper.toResponse(savedMovie);
    }

    @Override
    public MovieResponse updateMovie(Long movieId, MovieUpdateRequest request) {
        log.info("Updating movie with ID: {}", movieId);

        Movie movie = findMovieById(movieId);

        // Check if title is being changed and already exists
        if (request.getTitle() != null && !request.getTitle().equalsIgnoreCase(movie.getTitle())) {
            if (movieRepository.existsByTitleIgnoreCaseAndIsActiveTrue(request.getTitle())) {
                throw new AppException(ErrorCode.MOVIE_ALREADY_EXISTS);
            }
        }

        // Update movie
        movieMapper.updateEntity(movie, request);
        Movie updatedMovie = movieRepository.save(movie);
        log.info("Movie updated successfully with ID: {}", updatedMovie.getMovieId());

        return movieMapper.toResponse(updatedMovie);
    }

    @Override
    @Transactional(readOnly = true)
    public MovieResponse getMovieById(Long movieId) {
        log.info("Getting movie by ID: {}", movieId);
        Movie movie = findMovieById(movieId);
        return movieMapper.toResponse(movie);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MovieSummaryResponse> getAllMovies(Pageable pageable) {
        log.info("Getting all movies with pagination: page={}, size={}", pageable.getPageNumber(), pageable.getPageSize());
        Page<Movie> movies = movieRepository.findByIsActiveTrue(pageable);
        return movies.map(movieMapper::toSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieSummaryResponse> getMoviesByStatus(String status) {
        log.info("Getting movies by status: {}", status);
        List<Movie> movies = movieRepository.findByStatusAndIsActiveTrue(status);
        return movies.stream()
                .map(movieMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MovieSummaryResponse> getMoviesByStatus(String status, Pageable pageable) {
        log.info("Getting movies by status with pagination: status={}, page={}, size={}", 
                status, pageable.getPageNumber(), pageable.getPageSize());
        Page<Movie> movies = movieRepository.findByStatusAndIsActiveTrue(status, pageable);
        return movies.map(movieMapper::toSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieSummaryResponse> getFeaturedMovies() {
        log.info("Getting featured movies");
        List<Movie> movies = movieRepository.findByIsFeaturedTrueAndIsActiveTrue();
        return movies.stream()
                .map(movieMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieSummaryResponse> getMoviesByGenre(String genre) {
        log.info("Getting movies by genre: {}", genre);
        List<Movie> movies = movieRepository.findByGenresContainingIgnoreCaseAndIsActiveTrue(genre);
        return movies.stream()
                .map(movieMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MovieSummaryResponse> getMoviesByGenre(String genre, Pageable pageable) {
        log.info("Getting movies by genre with pagination: genre={}, page={}, size={}", 
                genre, pageable.getPageNumber(), pageable.getPageSize());
        Page<Movie> movies = movieRepository.findByGenresContainingIgnoreCaseAndIsActiveTrue(genre, pageable);
        return movies.map(movieMapper::toSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MovieSummaryResponse> searchMovies(String keyword, Pageable pageable) {
        log.info("Searching movies with keyword: {}, page={}, size={}", 
                keyword, pageable.getPageNumber(), pageable.getPageSize());
        Page<Movie> movies = movieRepository.searchMovies(keyword, pageable);
        return movies.map(movieMapper::toSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieSummaryResponse> getMoviesByDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Getting movies by date range: {} to {}", startDate, endDate);
        List<Movie> movies = movieRepository.findByReleaseDateBetweenAndIsActiveTrue(startDate, endDate);
        return movies.stream()
                .map(movieMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieSummaryResponse> getMoviesByRating(String rating) {
        log.info("Getting movies by rating: {}", rating);
        List<Movie> movies = movieRepository.findByRatingAndIsActiveTrue(rating);
        return movies.stream()
                .map(movieMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieSummaryResponse> getMoviesByPriceRange(Double minPrice, Double maxPrice) {
        log.info("Getting movies by price range: {} to {}", minPrice, maxPrice);
        List<Movie> movies = movieRepository.findByPriceRange(minPrice, maxPrice);
        return movies.stream()
                .map(movieMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieSummaryResponse> getTopRatedMovies(int limit) {
        log.info("Getting top {} rated movies", limit);
        Pageable pageable = PageRequest.of(0, limit);
        List<Movie> movies = movieRepository.findTopRatedMovies(pageable);
        return movies.stream()
                .map(movieMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieSummaryResponse> getRecentlyAddedMovies(int limit) {
        log.info("Getting {} recently added movies", limit);
        Pageable pageable = PageRequest.of(0, limit);
        List<Movie> movies = movieRepository.findRecentlyAddedMovies(pageable);
        return movies.stream()
                .map(movieMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieSummaryResponse> getMoviesByDurationRange(Integer minDuration, Integer maxDuration) {
        log.info("Getting movies by duration range: {} to {} minutes", minDuration, maxDuration);
        List<Movie> movies = movieRepository.findByDurationRange(minDuration, maxDuration);
        return movies.stream()
                .map(movieMapper::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteMovie(Long movieId) {
        log.info("Soft deleting movie with ID: {}", movieId);
        Movie movie = findMovieById(movieId);
        movie.setIsActive(false);
        movieRepository.save(movie);
        log.info("Movie soft deleted successfully with ID: {}", movieId);
    }

    @Override
    public MovieResponse restoreMovie(Long movieId) {
        log.info("Restoring movie with ID: {}", movieId);
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));
        movie.setIsActive(true);
        Movie restoredMovie = movieRepository.save(movie);
        log.info("Movie restored successfully with ID: {}", movieId);
        return movieMapper.toResponse(restoredMovie);
    }

    @Override
    public MovieResponse toggleFeaturedStatus(Long movieId) {
        log.info("Toggling featured status for movie with ID: {}", movieId);
        Movie movie = findMovieById(movieId);
        movie.setIsFeatured(!movie.getIsFeatured());
        Movie updatedMovie = movieRepository.save(movie);
        log.info("Movie featured status toggled successfully with ID: {}, new status: {}", 
                movieId, updatedMovie.getIsFeatured());
        return movieMapper.toResponse(updatedMovie);
    }

    @Override
    public MovieResponse updateMovieStatus(Long movieId, String status) {
        log.info("Updating movie status with ID: {}, new status: {}", movieId, status);
        Movie movie = findMovieById(movieId);
        movie.setStatus(status);
        Movie updatedMovie = movieRepository.save(movie);
        log.info("Movie status updated successfully with ID: {}", movieId);
        return movieMapper.toResponse(updatedMovie);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isMovieTitleExists(String title) {
        return movieRepository.existsByTitleIgnoreCaseAndIsActiveTrue(title);
    }

    @Override
    @Transactional(readOnly = true)
    public MovieStatistics getMovieStatistics() {
        log.info("Getting movie statistics");
        
        Long totalMovies = movieRepository.count();
        Long nowShowingCount = movieRepository.countByStatus("NOW_SHOWING");
        Long comingSoonCount = movieRepository.countByStatus("COMING_SOON");
        Long endedCount = movieRepository.countByStatus("ENDED");
        
        List<Movie> featuredMovies = movieRepository.findByIsFeaturedTrueAndIsActiveTrue();
        Long featuredCount = (long) featuredMovies.size();
        
        List<Movie> allMovies = movieRepository.findByIsActiveTrue();
        Double averageRating = allMovies.stream()
                .filter(movie -> movie.getImdbRating() != null)
                .mapToDouble(Movie::getImdbRating)
                .average()
                .orElse(0.0);
        
        Double averagePrice = allMovies.stream()
                .filter(movie -> movie.getPrice() != null)
                .mapToDouble(Movie::getPrice)
                .average()
                .orElse(0.0);

        return new MovieStatistics(totalMovies, nowShowingCount, comingSoonCount, 
                                 endedCount, featuredCount, averageRating, averagePrice);
    }

    @Override
    public MovieListResponse getMoviesWithFilter(MovieFilterRequest filterRequest) {
        log.info("Getting movies with filter: {}", filterRequest);
        
        try {
            // Create pageable
            Pageable pageable = PageRequest.of(
                filterRequest.getPage(), 
                filterRequest.getSize(),
                Sort.by(Sort.Direction.fromString(filterRequest.getSortDirection()), filterRequest.getSortBy())
            );
            
            // Get movies with filter (simplified implementation)
            Page<Movie> movies = movieRepository.findAll(pageable);
            
            // Convert to MovieSummaryDTO
            List<MovieListResponse.MovieSummaryDTO> movieSummaries = movies.getContent().stream()
                    .map(this::convertToMovieSummaryDTO)
                    .collect(Collectors.toList());
            
            // Create pagination info
            MovieListResponse.PaginationInfo paginationInfo = MovieListResponse.PaginationInfo.builder()
                    .currentPage(movies.getNumber())
                    .totalPages(movies.getTotalPages())
                    .totalElements(movies.getTotalElements())
                    .pageSize(movies.getSize())
                    .hasNext(movies.hasNext())
                    .hasPrevious(movies.hasPrevious())
                    .isFirst(movies.isFirst())
                    .isLast(movies.isLast())
                    .build();
            
            return MovieListResponse.builder()
                    .movies(movieSummaries)
                    .pagination(paginationInfo)
                    .build();
                    
        } catch (Exception e) {
            log.error("Error getting movies with filter: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể lấy danh sách phim", e);
        }
    }

    /**
     * Convert Movie entity to MovieSummaryDTO
     */
    private MovieListResponse.MovieSummaryDTO convertToMovieSummaryDTO(Movie movie) {
        return MovieListResponse.MovieSummaryDTO.builder()
                .movieId(movie.getMovieId())
                .title(movie.getTitle())
                .originalTitle(movie.getOriginalTitle())
                .description(movie.getDescription())
                .duration(movie.getDuration())
                .genres(movie.getGenres())
                .director(movie.getDirector())
                .language(movie.getLanguage())
                .country(movie.getCountry())
                .releaseDate(movie.getReleaseDate() != null ? movie.getReleaseDate().toString() : null)
                .endDate(movie.getEndDate() != null ? movie.getEndDate().toString() : null)
                .rating(movie.getRating())
                .posterUrl(movie.getPosterUrl())
                .backdropUrl(movie.getBackdropUrl())
                .trailerUrl(movie.getTrailerUrl())
                .isActive(movie.getIsActive())
                .isFeatured(movie.getIsFeatured())
                .price(movie.getPrice())
                .status(movie.getStatus())
                .imdbRating(movie.getImdbRating())
                .formattedDuration(formatDuration(movie.getDuration()))
                .isAdultContent(movie.isAdultContent())
                .availableToday(isAvailableToday(movie))
                .build();
    }

    /**
     * Format duration to readable string
     */
    private String formatDuration(Integer duration) {
        if (duration == null) return "";
        int hours = duration / 60;
        int minutes = duration % 60;
        return hours > 0 ? String.format("%dh %dm", hours, minutes) : String.format("%dm", minutes);
    }

    /**
     * Check if movie is available today
     */
    private boolean isAvailableToday(Movie movie) {
        if (movie.getReleaseDate() == null) return false;
        LocalDate today = LocalDate.now();
        LocalDate releaseDate = movie.getReleaseDate();
        LocalDate endDate = movie.getEndDate();
        
        return !releaseDate.isAfter(today) && 
               (endDate == null || !endDate.isBefore(today)) &&
               movie.getIsActive();
    }

    /**
     * Helper method to find movie by ID
     */
    private Movie findMovieById(Long movieId) {
        return movieRepository.findById(movieId)
                .filter(Movie::getIsActive)
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));
    }
} 