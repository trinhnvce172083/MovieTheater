package com.swp.MovieTheaterService.repository;

import com.swp.MovieTheaterService.entity.CinemaRoom;
import com.swp.MovieTheaterService.enums.RoomType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Cinema Room Repository
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Repository
public interface CinemaRoomRepository extends JpaRepository<CinemaRoom, Long> {
    
    /**
     * Find cinema room by name
     */
    Optional<CinemaRoom> findByRoomName(String roomName);
    
    /**
     * Find all active cinema rooms
     */
    List<CinemaRoom> findByIsActiveTrue();
    
    /**
     * Find cinema rooms by type
     */
    List<CinemaRoom> findByRoomType(RoomType roomType);
    
    /**
     * Find cinema rooms by type and active status
     */
    List<CinemaRoom> findByRoomTypeAndIsActiveTrue(RoomType roomType);
    
    /**
     * Search cinema rooms by name containing keyword
     */
    @Query("SELECT cr FROM CinemaRoom cr WHERE " +
           "LOWER(cr.roomName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(cr.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<CinemaRoom> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * Find cinema rooms with available seats for a specific schedule
     */
    @Query("SELECT cr FROM CinemaRoom cr WHERE cr.id = :roomId AND " +
           "cr.totalSeats > (SELECT COUNT(bs) FROM BookingSeat bs " +
           "JOIN bs.booking b JOIN b.schedule s " +
           "WHERE s.cinemaRoom.id = :roomId AND s.id = :scheduleId AND " +
           "b.status IN ('CONFIRMED', 'PAID'))")
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
    boolean existsByRoomNameAndIdNot(String roomName, Long id);
    
    /**
     * Check if room name exists
     */
    boolean existsByRoomName(String roomName);
} 