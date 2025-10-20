package com.swp.MovieTheaterService.repository;

import com.swp.MovieTheaterService.entity.CinemaRoom;
import com.swp.MovieTheaterService.enums.RoomType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * Cinema Room Repository
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Repository
public interface CinemaRoomRepository extends JpaRepository<CinemaRoom, Long> {

    /**
     * Find cinema room by name
     */
    Optional<CinemaRoom> findByCinemaRoomName(String cinemaRoomName);

    /**
     * Find all active cinema rooms
     */
    List<CinemaRoom> findByIsActiveTrue();

    /**
     * Find active cinema rooms with pagination
     */
    Page<CinemaRoom> findByIsActiveTrue(Pageable pageable);

    /**
     * Find cinema rooms by type
     */
    List<CinemaRoom> findByRoomType(RoomType roomType);

    /**
     * Find cinema rooms by type and active status
     */
    List<CinemaRoom> findByRoomTypeAndIsActiveTrue(RoomType roomType);

    /**
     * Find cinema rooms by type and active status with pagination
     */
    Page<CinemaRoom> findByRoomTypeAndIsActiveTrue(RoomType roomType, Pageable pageable);

    // Compatibility methods for cinemaRoomName calls
    boolean existsByCinemaRoomNameIgnoreCaseAndIsActiveTrue(String cinemaRoomName);

    Optional<CinemaRoom> findByCinemaRoomNameAndIsActiveTrue(String cinemaRoomName);

    /**
     * Search cinema rooms by name containing keyword
     */
    @Query("SELECT cr FROM CinemaRoom cr WHERE " +
            "LOWER(cr.cinemaRoomName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(cr.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<CinemaRoom> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Search cinema rooms
     */
    @Query("SELECT cr FROM CinemaRoom cr WHERE cr.isActive = true AND " +
            "(LOWER(cr.cinemaRoomName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(cr.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY cr.cinemaRoomName ASC")
    Page<CinemaRoom> searchCinemaRooms(@Param("keyword") String keyword, Pageable pageable);

    // Feature-based queries
    List<CinemaRoom> findByHas3DTrueAndIsActiveTrue();

    List<CinemaRoom> findByHasDolbyAtmosTrueAndIsActiveTrue();

    List<CinemaRoom> findByHasReclinerSeatsTrueAndIsActiveTrue();

    // Capacity queries
    @Query("SELECT c FROM CinemaRoom c WHERE c.isActive = true AND " +
            "c.seatQuantity BETWEEN :minSeats AND :maxSeats " +
            "ORDER BY c.seatQuantity ASC")
    List<CinemaRoom> findBySeatsRange(@Param("minSeats") Integer minSeats, @Param("maxSeats") Integer maxSeats);

    // Availability queries
    @Query("SELECT c FROM CinemaRoom c WHERE c.isActive = true")
    List<CinemaRoom> findAvailableRooms(@Param("date") LocalDate date,
                                        @Param("startTime") LocalTime startTime,
                                        @Param("endTime") LocalTime endTime);

    // Premium rooms
    @Query("SELECT c FROM CinemaRoom c WHERE c.isActive = true " +
            "ORDER BY c.cinemaRoomName ASC")
    List<CinemaRoom> findPremiumRooms();

    // Sorting methods
    List<CinemaRoom> findByIsActiveTrueOrderBySeatQuantityAsc();

    List<CinemaRoom> findByIsActiveTrueOrderBySeatQuantityDesc();

    // Count methods  
    Long countByRoomType(String roomType);

    // Capacity statistics
    @Query("SELECT SUM(c.seatQuantity) FROM CinemaRoom c WHERE c.isActive = true")
    Integer getTotalSeatCapacity();

    @Query("SELECT AVG(c.seatQuantity) FROM CinemaRoom c WHERE c.isActive = true")
    Double getAverageSeatCapacity();

    /**
     * Find cinema rooms with available seats for a specific schedule
     */
    @Query("SELECT cr FROM CinemaRoom cr WHERE cr.id = :roomId AND " +
            "cr.seatQuantity > (SELECT COUNT(bs) FROM BookingSeat bs " +
            "JOIN bs.booking b JOIN b.schedule s " +
            "WHERE s.cinemaRoom.id = :roomId AND s.id = :scheduleId AND " +
            "b.bookingStatus IN ('CONFIRMED', 'PAID'))")
    Optional<CinemaRoom> findRoomWithAvailableSeats(@Param("roomId") Long roomId,
                                                    @Param("scheduleId") Long scheduleId);

    /**
     * Count total cinema rooms
     */
    long countByIsActiveTrue();

    /**
     * Count cinema rooms by type
     */
    long countByRoomTypeAndIsActiveTrue(RoomType roomType);

    /**
     * Check if room name exists (excluding specific id)
     */
    boolean existsByCinemaRoomNameAndCinemaRoomIdNot(String cinemaRoomName, Long cinemaRoomId);

    /**
     * Check if room name exists
     */
    boolean existsByCinemaRoomName(String cinemaRoomName);
} 
