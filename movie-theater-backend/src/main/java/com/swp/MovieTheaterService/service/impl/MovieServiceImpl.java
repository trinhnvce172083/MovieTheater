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
import com.swp.MovieTheaterService.service.SupabaseStorageService;
import com.swp.MovieTheaterService.utils.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Movie Service Implementation
 * Business logic implementation for movie management
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final MovieMapper movieMapper;
    private final SupabaseStorageService supabaseStorageService;

    @Override
    public MovieResponse createMovie(MovieCreateRequest request) {
        log.info("Creating new movie with title: {}", request.getTitle());

        // DTO đã validate rồi, chỉ cần business logic validation
        log.info("Validating movie creation for title: {}", request.getTitle());

        // Check if movie title already exists (business logic validation)
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
            // Validate and sanitize sort direction
            String sortDirection = validateSortDirection(filterRequest.getSortDirection());
            String sortBy = validateSortBy(filterRequest.getSortBy());
            
            // Create pageable
            Pageable pageable = PageRequest.of(
                filterRequest.getPage(), 
                filterRequest.getSize(),
                    Sort.by(Sort.Direction.fromString(sortDirection), sortBy)
            );

            // Sanitize filter request
            sanitizeFilterRequest(filterRequest);

            // Build specification for filtering
            Specification<Movie> spec = buildMovieSpecification(filterRequest);

            // Get movies with filter
            Page<Movie> movies = movieRepository.findAll(spec, pageable);
            
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
            throw new AppException(ErrorCode.MOVIE_FETCH_FAILED);
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
     * Build specification for movie filtering
     */
    private Specification<Movie> buildMovieSpecification(MovieFilterRequest filterRequest) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Status filter
            if (filterRequest.getStatus() != null && !filterRequest.getStatus().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("status"), filterRequest.getStatus()));
            }

            // Keyword search (title, description, cast, director)
            if (filterRequest.getKeyword() != null && !filterRequest.getKeyword().trim().isEmpty()) {
                String keyword = "%" + filterRequest.getKeyword().toLowerCase() + "%";
                Predicate titlePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")), keyword);
                Predicate descriptionPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")), keyword);
                Predicate castPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("cast")), keyword);
                Predicate directorPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("director")), keyword);

                predicates.add(criteriaBuilder.or(titlePredicate, descriptionPredicate,
                        castPredicate, directorPredicate));
            }

            // Genre filter
            if (filterRequest.getGenres() != null && !filterRequest.getGenres().isEmpty()) {
                List<Predicate> genrePredicates = filterRequest.getGenres().stream()
                        .map(genre -> criteriaBuilder.like(root.get("genres"), "%" + genre + "%"))
                        .collect(Collectors.toList());
                predicates.add(criteriaBuilder.or(genrePredicates.toArray(new Predicate[0])));
            }

            // Rating filter
            if (filterRequest.getRating() != null && !filterRequest.getRating().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("rating"), filterRequest.getRating()));
            }

            // Language filter
            if (filterRequest.getLanguage() != null && !filterRequest.getLanguage().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("language"), filterRequest.getLanguage()));
            }

            // Country filter
            if (filterRequest.getCountry() != null && !filterRequest.getCountry().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("country"), filterRequest.getCountry()));
            }

            // Release date range
            if (filterRequest.getReleaseDateFrom() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("releaseDate"), filterRequest.getReleaseDateFrom()));
            }
            if (filterRequest.getReleaseDateTo() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("releaseDate"), filterRequest.getReleaseDateTo()));
            }

            // Duration range
            if (filterRequest.getDurationMin() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("duration"), filterRequest.getDurationMin()));
            }
            if (filterRequest.getDurationMax() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("duration"), filterRequest.getDurationMax()));
            }

            // IMDb rating
            if (filterRequest.getImdbRatingMin() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("imdbRating"), filterRequest.getImdbRatingMin()));
            }

            // Active status
            if (filterRequest.getIsActive() != null) {
                predicates.add(criteriaBuilder.equal(root.get("isActive"), filterRequest.getIsActive()));
            }

            // Featured status
            if (filterRequest.getIsFeatured() != null) {
                predicates.add(criteriaBuilder.equal(root.get("isFeatured"), filterRequest.getIsFeatured()));
            }

            // Adult content filter
            if (filterRequest.getIsAdultContent() != null) {
                if (filterRequest.getIsAdultContent()) {
                    predicates.add(criteriaBuilder.in(root.get("rating")).value(Arrays.asList("R", "NC-17")));
                } else {
                    predicates.add(criteriaBuilder.in(root.get("rating")).value(Arrays.asList("G", "PG", "PG-13")));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Validate and sanitize sort direction
     */
    private String validateSortDirection(String sortDirection) {
        if (sortDirection == null || sortDirection.trim().isEmpty() ||
                sortDirection.equalsIgnoreCase("string") ||
                sortDirection.equalsIgnoreCase("null")) {
            return "desc"; // Default to desc
        }

        String direction = sortDirection.trim().toLowerCase();
        if (direction.equals("asc") || direction.equals("desc")) {
            return direction;
        }

        log.warn("Invalid sort direction: {}, using default 'desc'", sortDirection);
        return "desc";
    }

    /**
     * Validate and sanitize sort by field
     */
    private String validateSortBy(String sortBy) {
        if (sortBy == null || sortBy.trim().isEmpty() ||
                sortBy.equalsIgnoreCase("string") ||
                sortBy.equalsIgnoreCase("null")) {
            return "releaseDate"; // Default to releaseDate
        }

        String field = sortBy.trim();
        // List of valid sort fields
        List<String> validFields = Arrays.asList(
                "title", "releaseDate", "duration", "imdbRating",
                "createdAt", "updatedAt", "rating", "price"
        );

        if (validFields.contains(field)) {
            return field;
        }

        log.warn("Invalid sort by field: {}, using default 'releaseDate'", sortBy);
        return "releaseDate";
    }

    /**
     * Sanitize filter request to handle invalid values
     */
    private void sanitizeFilterRequest(MovieFilterRequest filterRequest) {
        // Sanitize keyword
        if (filterRequest.getKeyword() != null &&
                (filterRequest.getKeyword().equalsIgnoreCase("string") ||
                        filterRequest.getKeyword().equalsIgnoreCase("null"))) {
            filterRequest.setKeyword(null);
        }

        // Sanitize genres
        if (filterRequest.getGenres() != null) {
            filterRequest.setGenres(filterRequest.getGenres().stream()
                    .filter(genre -> genre != null && !genre.equalsIgnoreCase("string") && !genre.equalsIgnoreCase("null"))
                    .collect(Collectors.toList()));
        }

        // Sanitize rating
        if (filterRequest.getRating() != null &&
                (filterRequest.getRating().equalsIgnoreCase("string") ||
                        filterRequest.getRating().equalsIgnoreCase("null"))) {
            filterRequest.setRating(null);
        }

        // Sanitize language
        if (filterRequest.getLanguage() != null &&
                (filterRequest.getLanguage().equalsIgnoreCase("string") ||
                        filterRequest.getLanguage().equalsIgnoreCase("null"))) {
            filterRequest.setLanguage(null);
        }

        // Sanitize country
        if (filterRequest.getCountry() != null &&
                (filterRequest.getCountry().equalsIgnoreCase("string") ||
                        filterRequest.getCountry().equalsIgnoreCase("null"))) {
            filterRequest.setCountry(null);
        }

        // Sanitize numeric values
        if (filterRequest.getDurationMin() != null && filterRequest.getDurationMin() <= 0) {
            filterRequest.setDurationMin(null);
        }
        if (filterRequest.getDurationMax() != null && filterRequest.getDurationMax() <= 0) {
            filterRequest.setDurationMax(null);
        }
        if (filterRequest.getImdbRatingMin() != null && filterRequest.getImdbRatingMin() <= 0) {
            filterRequest.setImdbRatingMin(null);
        }

        // Sanitize page and size
        if (filterRequest.getPage() < 0) {
            filterRequest.setPage(0);
        }
        if (filterRequest.getSize() <= 0) {
            filterRequest.setSize(20);
        }
    }

    /**
     * Helper method to find movie by ID
     */
    private Movie findMovieById(Long movieId) {
        return movieRepository.findById(movieId)
                .filter(Movie::getIsActive)
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));
    }
    
    // =============== IMAGE MANAGEMENT METHODS ===============
    
    @Override
    @Transactional
    public MovieResponse updateMoviePoster(Long movieId, MultipartFile posterFile) {
        log.info("Updating poster for movie ID: {}", movieId);
        
        Movie movie = findMovieById(movieId);
        
        // Upload poster mới (replaceFile sẽ tự động xóa file cũ)
        String posterUrl = supabaseStorageService.replaceFile(
            movie.getPosterUrl(),
            posterFile,
            "movies/posters"
        );
        movie.setPosterUrl(posterUrl);
        
        Movie updatedMovie = movieRepository.save(movie);
        log.info("Movie poster updated successfully for ID: {}", movieId);
        
        return movieMapper.toResponse(updatedMovie);
    }
    
    @Override
    @Transactional
    public MovieResponse updateMovieBackdrop(Long movieId, MultipartFile backdropFile) {
        log.info("Updating backdrop for movie ID: {}", movieId);
        
        Movie movie = findMovieById(movieId);
        
        // Upload backdrop mới (replaceFile sẽ tự động xóa file cũ)
        String backdropUrl = supabaseStorageService.replaceFile(
            movie.getBackdropUrl(),
            backdropFile,
            "movies/backdrops"
        );
        movie.setBackdropUrl(backdropUrl);
        
        Movie updatedMovie = movieRepository.save(movie);
        log.info("Movie backdrop updated successfully for ID: {}", movieId);
        
        return movieMapper.toResponse(updatedMovie);
    }
    
    @Override
    @Transactional
    public MovieResponse deleteMoviePoster(Long movieId) {
        log.info("Deleting poster for movie ID: {}", movieId);
        
        Movie movie = findMovieById(movieId);
        
        if (movie.getPosterUrl() != null) {
            boolean deleted = supabaseStorageService.deleteFile(movie.getPosterUrl());
            
            if (deleted) {
                movie.setPosterUrl(null);
                movieRepository.save(movie);
                log.info("Movie poster deleted successfully for ID: {}", movieId);
            } else {
                throw new AppException(ErrorCode.FILE_DELETE_FAILED);
            }
        }
        
        return movieMapper.toResponse(movie);
    }
    
    @Override
    @Transactional
    public MovieResponse deleteMovieBackdrop(Long movieId) {
        log.info("Deleting backdrop for movie ID: {}", movieId);
        
        Movie movie = findMovieById(movieId);
        
        if (movie.getBackdropUrl() != null) {
            boolean deleted = supabaseStorageService.deleteFile(movie.getBackdropUrl());
            
            if (deleted) {
                movie.setBackdropUrl(null);
                movieRepository.save(movie);
                log.info("Movie backdrop deleted successfully for ID: {}", movieId);
            } else {
                throw new AppException(ErrorCode.FILE_DELETE_FAILED);
            }
        }
        
        return movieMapper.toResponse(movie);
    }
}