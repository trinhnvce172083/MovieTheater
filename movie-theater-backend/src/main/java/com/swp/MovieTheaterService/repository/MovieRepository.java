package com.swp.MovieTheaterService.repository;

import com.swp.MovieTheaterService.entity.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Movie Repository Interface
 * Data access layer for Movie entity
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Repository
public interface MovieRepository extends JpaRepository<Movie, Long>, JpaSpecificationExecutor<Movie> {

       // Find active movies
       List<Movie> findByIsActiveTrue();

       // Find movies by status
       List<Movie> findByStatusAndIsActiveTrue(String status);

       // Find featured movies
       List<Movie> findByIsFeaturedTrueAndIsActiveTrue();

       // Find movies by genre
       List<Movie> findByGenresContainingIgnoreCaseAndIsActiveTrue(String genres);

       // Find movies by title (search)
       @Query("SELECT m FROM Movie m WHERE m.isActive = true AND " +
                     "(LOWER(m.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(m.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(m.director) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(m.cast) LIKE LOWER(CONCAT('%', :keyword, '%')))")
       Page<Movie> searchMovies(@Param("keyword") String keyword, Pageable pageable);

       // Find movies by release date range
       List<Movie> findByReleaseDateBetweenAndIsActiveTrue(LocalDate startDate, LocalDate endDate);

       // Find movies by rating
       List<Movie> findByRatingAndIsActiveTrue(String rating);

       // Find movies by price range
       @Query("SELECT m FROM Movie m WHERE m.isActive = true AND m.price BETWEEN :minPrice AND :maxPrice")
       List<Movie> findByPriceRange(@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice);

       // Find movies with pagination
       Page<Movie> findByIsActiveTrue(Pageable pageable);

       // Find movies by status with pagination
       Page<Movie> findByStatusAndIsActiveTrue(String status, Pageable pageable);

       // Find movies by genre with pagination
       Page<Movie> findByGenresContainingIgnoreCaseAndIsActiveTrue(String genres, Pageable pageable);

       // Check if movie title exists
       boolean existsByTitleIgnoreCaseAndIsActiveTrue(String title);

       // Find movie by title
       Optional<Movie> findByTitleIgnoreCaseAndIsActiveTrue(String title);

       // Get movies count by status
       @Query("SELECT COUNT(m) FROM Movie m WHERE m.status = :status AND m.isActive = true")
       Long countByStatus(@Param("status") String status);

       // Get top rated movies
       @Query("SELECT m FROM Movie m WHERE m.isActive = true AND m.imdbRating IS NOT NULL " +
                     "ORDER BY m.imdbRating DESC")
       List<Movie> findTopRatedMovies(Pageable pageable);

       // Get recently added movies
       @Query("SELECT m FROM Movie m WHERE m.isActive = true ORDER BY m.createdAt DESC")
       List<Movie> findRecentlyAddedMovies(Pageable pageable);

       // Get movies by duration range
       @Query("SELECT m FROM Movie m WHERE m.isActive = true AND m.duration BETWEEN :minDuration AND :maxDuration")
       List<Movie> findByDurationRange(@Param("minDuration") Integer minDuration,
                     @Param("maxDuration") Integer maxDuration);

       // ==================== MOVIE STATUS AUTO UPDATE ====================

       /**
        * Tìm các phim COMING_SOON đã đến ngày ra mắt (để chuyển thành NOW_SHOWING)
        */
       @Query("SELECT m FROM Movie m WHERE m.status = :status AND m.isActive = true " +
                     "AND m.releaseDate IS NOT NULL AND m.releaseDate <= :currentDate")
       List<Movie> findMoviesForStatusUpdate(@Param("status") String status,
                     @Param("currentDate") LocalDate currentDate);

       /**
        * Đếm số phim theo status và isActive
        */
       @Query("SELECT COUNT(m) FROM Movie m WHERE m.status = :status AND m.isActive = :isActive")
       Long countByStatusAndIsActive(@Param("status") String status, @Param("isActive") Boolean isActive);

       /**
        * Đếm số phim theo status và isActive = true
        */
       default Long countByStatusAndIsActiveTrue(String status) {
              return countByStatusAndIsActive(status, true);
       }
}