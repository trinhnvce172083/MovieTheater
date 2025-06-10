package com.swp.MovieTheaterService.repository;

import com.swp.MovieTheaterService.entity.Schedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * Schedule Repository Interface
 * Data access layer for Schedule entity
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    // Find schedules by movie
    List<Schedule> findByMovieMovieIdAndIsActiveTrue(Long movieId);
    Page<Schedule> findByMovieMovieIdAndIsActiveTrue(Long movieId, Pageable pageable);
    List<Schedule> findByMovieMovieIdAndShowDateBetweenAndIsActiveTrue(Long movieId, LocalDate startDate, LocalDate endDate);
    
    // Find schedules by cinema room
    List<Schedule> findByCinemaRoomCinemaRoomIdAndIsActiveTrue(Long cinemaRoomId);
    Page<Schedule> findByCinemaRoomCinemaRoomIdAndIsActiveTrue(Long cinemaRoomId, Pageable pageable);
    List<Schedule> findByCinemaRoomCinemaRoomIdAndShowDateBetweenAndIsActiveTrue(Long roomId, LocalDate startDate, LocalDate endDate);
    
    // Find schedules by date
    List<Schedule> findByShowDateAndIsActiveTrue(LocalDate showDate);
    Page<Schedule> findByShowDateAndIsActiveTrue(LocalDate showDate, Pageable pageable);
    
    // Find schedules by date range
    List<Schedule> findByShowDateBetweenAndIsActiveTrue(LocalDate startDate, LocalDate endDate);
    Page<Schedule> findByShowDateBetweenAndIsActiveTrue(LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    // Find schedules by status
    List<Schedule> findByStatusAndIsActiveTrue(String status);
    Page<Schedule> findByStatusAndIsActiveTrue(String status, Pageable pageable);
    
    // Find schedules by movie and date
    List<Schedule> findByMovieMovieIdAndShowDateAndIsActiveTrue(Long movieId, LocalDate showDate);
    
    // Find schedules by cinema room and date
    List<Schedule> findByCinemaRoomCinemaRoomIdAndShowDateAndIsActiveTrue(Long cinemaRoomId, LocalDate showDate);
    
    // Find schedules by movie, cinema room and date
    Optional<Schedule> findByMovieMovieIdAndCinemaRoomCinemaRoomIdAndShowDateAndStartTimeAndIsActiveTrue(
            Long movieId, Long cinemaRoomId, LocalDate showDate, LocalTime startTime);
    
    // Check for overlapping schedules
    @Query("SELECT s FROM Schedule s WHERE s.cinemaRoom.cinemaRoomId = :cinemaRoomId AND " +
           "s.showDate = :showDate AND s.isActive = true AND " +
           "((s.startTime <= :startTime AND s.endTime > :startTime) OR " +
           "(s.startTime < :endTime AND s.endTime >= :endTime) OR " +
           "(s.startTime >= :startTime AND s.endTime <= :endTime))")
    List<Schedule> findOverlappingSchedules(@Param("cinemaRoomId") Long cinemaRoomId,
                                          @Param("showDate") LocalDate showDate,
                                          @Param("startTime") LocalTime startTime,
                                          @Param("endTime") LocalTime endTime);
    
    // Find available schedules for booking
    @Query("SELECT s FROM Schedule s WHERE s.isActive = true AND s.status = 'SCHEDULED' AND " +
           "s.availableSeats > 0 AND s.showDate >= :currentDate ORDER BY s.showDate, s.startTime")
    List<Schedule> findAvailableSchedules(@Param("currentDate") LocalDate currentDate);
    
    // Find schedules by special features
    @Query("SELECT s FROM Schedule s WHERE s.isActive = true AND s.is3D = true ORDER BY s.showDate, s.startTime")
    List<Schedule> find3DSchedules();
    
    @Query("SELECT s FROM Schedule s WHERE s.isActive = true AND s.isIMAX = true ORDER BY s.showDate, s.startTime")
    List<Schedule> findIMAXSchedules();
    
    @Query("SELECT s FROM Schedule s WHERE s.isActive = true AND s.is4DX = true ORDER BY s.showDate, s.startTime")
    List<Schedule> find4DXSchedules();
    
    // Find schedules by time range
    @Query("SELECT s FROM Schedule s WHERE s.showDate = :showDate AND s.isActive = true AND " +
           "s.startTime BETWEEN :startTime AND :endTime ORDER BY s.startTime")
    List<Schedule> findSchedulesByTimeRange(@Param("showDate") LocalDate showDate,
                                          @Param("startTime") LocalTime startTime,
                                          @Param("endTime") LocalTime endTime);
    
    // Find today's schedules
    @Query("SELECT s FROM Schedule s WHERE s.showDate = :today AND s.isActive = true " +
           "ORDER BY s.startTime")
    List<Schedule> findTodaySchedules(@Param("today") LocalDate today);
    
    // Find upcoming schedules
    @Query("SELECT s FROM Schedule s WHERE s.showDate > :currentDate AND s.isActive = true " +
           "ORDER BY s.showDate, s.startTime")
    List<Schedule> findUpcomingSchedules(@Param("currentDate") LocalDate currentDate);
    
    // Find past schedules
    @Query("SELECT s FROM Schedule s WHERE s.showDate < :currentDate AND s.isActive = true " +
           "ORDER BY s.showDate DESC, s.startTime DESC")
    List<Schedule> findPastSchedules(@Param("currentDate") LocalDate currentDate);
    
    // Find schedules by price range
    @Query("SELECT s FROM Schedule s WHERE s.isActive = true AND s.price BETWEEN :minPrice AND :maxPrice " +
           "ORDER BY s.price")
    List<Schedule> findSchedulesByPriceRange(@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice);
    
    // Find popular schedules (high booking rate)
    @Query("SELECT s FROM Schedule s WHERE s.isActive = true AND " +
           "(CAST(s.bookedSeats AS double) / (s.availableSeats + s.bookedSeats)) >= :minOccupancyRate " +
           "ORDER BY (CAST(s.bookedSeats AS double) / (s.availableSeats + s.bookedSeats)) DESC")
    List<Schedule> findPopularSchedules(@Param("minOccupancyRate") Double minOccupancyRate);
    
    // Search schedules
    @Query("SELECT s FROM Schedule s WHERE s.isActive = true AND " +
           "(LOWER(s.movie.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.cinemaRoom.cinemaRoomName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.status) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY s.showDate, s.startTime")
    Page<Schedule> searchSchedules(@Param("keyword") String keyword, Pageable pageable);
    
    // Count schedules by status
    @Query("SELECT COUNT(s) FROM Schedule s WHERE s.status = :status AND s.isActive = true")
    Long countSchedulesByStatus(@Param("status") String status);
    
    // Count schedules by movie
    @Query("SELECT COUNT(s) FROM Schedule s WHERE s.movie.movieId = :movieId AND s.isActive = true")
    Long countSchedulesByMovie(@Param("movieId") Long movieId);
    
    // Count schedules by cinema room
    @Query("SELECT COUNT(s) FROM Schedule s WHERE s.cinemaRoom.cinemaRoomId = :cinemaRoomId AND s.isActive = true")
    Long countSchedulesByCinemaRoom(@Param("cinemaRoomId") Long cinemaRoomId);
    
    // Get total revenue by date range
    @Query("SELECT SUM(s.price * s.bookedSeats) FROM Schedule s WHERE " +
           "s.showDate BETWEEN :startDate AND :endDate AND s.isActive = true")
    Double getTotalRevenue(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Get average occupancy rate
    @Query("SELECT AVG(CAST(s.bookedSeats AS double) / (s.availableSeats + s.bookedSeats)) FROM Schedule s " +
           "WHERE s.isActive = true AND (s.availableSeats + s.bookedSeats) > 0")
    Double getAverageOccupancyRate();
    
    // Find schedules by language
    List<Schedule> findBySubtitleLanguageAndIsActiveTrue(String subtitleLanguage);
    List<Schedule> findByAudioLanguageAndIsActiveTrue(String audioLanguage);
    
    // Delete schedules by movie (for movie deletion)
    void deleteByMovieMovieId(Long movieId);
    
    // Delete schedules by cinema room (for room deletion)
    void deleteByCinemaRoomCinemaRoomId(Long cinemaRoomId);
} 