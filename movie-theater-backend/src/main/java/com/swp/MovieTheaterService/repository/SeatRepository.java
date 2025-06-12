package com.swp.MovieTheaterService.repository;

import com.swp.MovieTheaterService.entity.Seat;
import com.swp.MovieTheaterService.enums.SeatStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

/**
 * Seat Repository Interface
 * Data access layer for Seat entity
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

       // Find seats by cinema room
       List<Seat> findByCinemaRoomCinemaRoomIdAndIsActiveTrue(Long cinemaRoomId);

       // Find seats by cinema room with pagination
       Page<Seat> findByCinemaRoomCinemaRoomIdAndIsActiveTrue(Long cinemaRoomId, Pageable pageable);

       // Find seats by cinema room and status
       List<Seat> findByCinemaRoomCinemaRoomIdAndSeatStatusAndIsActiveTrue(Long cinemaRoomId, SeatStatus seatStatus);

       // Find seats by cinema room and type
       List<Seat> findByCinemaRoomCinemaRoomIdAndSeatTypeAndIsActiveTrue(Long cinemaRoomId, String seatType);

       // Find seat by cinema room and position
       Optional<Seat> findByCinemaRoomCinemaRoomIdAndSeatRowAndSeatColumnAndIsActiveTrue(
                     Long cinemaRoomId, Integer seatRow, Integer seatColumn);

       // Find seat by cinema room and seat number
       Optional<Seat> findByCinemaRoomCinemaRoomIdAndSeatNumberIgnoreCaseAndIsActiveTrue(
                     Long cinemaRoomId, String seatNumber);

       // Check if seat exists at position
       boolean existsByCinemaRoomCinemaRoomIdAndSeatRowAndSeatColumnAndIsActiveTrue(
                     Long cinemaRoomId, Integer seatRow, Integer seatColumn);

       // Check if seat number exists in room
       boolean existsByCinemaRoomCinemaRoomIdAndSeatNumberIgnoreCaseAndIsActiveTrue(
                     Long cinemaRoomId, String seatNumber);

       // Find available seats in cinema room
       @Query("SELECT s FROM Seat s WHERE s.cinemaRoom.cinemaRoomId = :cinemaRoomId AND " +
                     "s.seatStatus = 'AVAILABLE' AND s.isActive = true ORDER BY s.seatRow, s.seatColumn")
       List<Seat> findAvailableSeats(@Param("cinemaRoomId") Long cinemaRoomId);

       // Find occupied seats in cinema room
       @Query("SELECT s FROM Seat s WHERE s.cinemaRoom.cinemaRoomId = :cinemaRoomId AND " +
                     "s.seatStatus = 'OCCUPIED' AND s.isActive = true ORDER BY s.seatRow, s.seatColumn")
       List<Seat> findOccupiedSeats(@Param("cinemaRoomId") Long cinemaRoomId);

       // Find maintenance seats in cinema room
       @Query("SELECT s FROM Seat s WHERE s.cinemaRoom.cinemaRoomId = :cinemaRoomId AND " +
                     "s.seatStatus = 'MAINTENANCE' AND s.isActive = true ORDER BY s.seatRow, s.seatColumn")
       List<Seat> findMaintenanceSeats(@Param("cinemaRoomId") Long cinemaRoomId);

       // Count seats by status in cinema room
       @Query("SELECT COUNT(s) FROM Seat s WHERE s.cinemaRoom.cinemaRoomId = :cinemaRoomId AND " +
                     "s.seatStatus = :status AND s.isActive = true")
       Long countSeatsByStatus(@Param("cinemaRoomId") Long cinemaRoomId, @Param("status") SeatStatus status);

       // Find VIP seats in cinema room
       @Query("SELECT s FROM Seat s WHERE s.cinemaRoom.cinemaRoomId = :cinemaRoomId AND " +
                     "s.seatType = 'VIP' AND s.isActive = true ORDER BY s.seatRow, s.seatColumn")
       List<Seat> findVIPSeats(@Param("cinemaRoomId") Long cinemaRoomId);

       // Find couple seats in cinema room
       @Query("SELECT s FROM Seat s WHERE s.cinemaRoom.cinemaRoomId = :cinemaRoomId AND " +
                     "s.seatType = 'COUPLE' AND s.isActive = true ORDER BY s.seatRow, s.seatColumn")
       List<Seat> findCoupleSeats(@Param("cinemaRoomId") Long cinemaRoomId);

       // Find wheelchair accessible seats in cinema room
       @Query("SELECT s FROM Seat s WHERE s.cinemaRoom.cinemaRoomId = :cinemaRoomId AND " +
                     "s.seatType = 'WHEELCHAIR' AND s.isActive = true ORDER BY s.seatRow, s.seatColumn")
       List<Seat> findWheelchairSeats(@Param("cinemaRoomId") Long cinemaRoomId);

       // Find recliner seats in cinema room
       @Query("SELECT s FROM Seat s WHERE s.cinemaRoom.cinemaRoomId = :cinemaRoomId AND " +
                     "s.isRecliner = true AND s.isActive = true ORDER BY s.seatRow, s.seatColumn")
       List<Seat> findReclinerSeats(@Param("cinemaRoomId") Long cinemaRoomId);

       // Find seats with table in cinema room
       @Query("SELECT s FROM Seat s WHERE s.cinemaRoom.cinemaRoomId = :cinemaRoomId AND " +
                     "s.hasTable = true AND s.isActive = true ORDER BY s.seatRow, s.seatColumn")
       List<Seat> findSeatsWithTable(@Param("cinemaRoomId") Long cinemaRoomId);

       // Find seats by row in cinema room
       @Query("SELECT s FROM Seat s WHERE s.cinemaRoom.cinemaRoomId = :cinemaRoomId AND " +
                     "s.seatRow = :row AND s.isActive = true ORDER BY s.seatColumn")
       List<Seat> findSeatsByRow(@Param("cinemaRoomId") Long cinemaRoomId, @Param("row") Integer row);

       // Find seats by row range in cinema room
       @Query("SELECT s FROM Seat s WHERE s.cinemaRoom.cinemaRoomId = :cinemaRoomId AND " +
                     "s.seatRow BETWEEN :startRow AND :endRow AND s.isActive = true ORDER BY s.seatRow, s.seatColumn")
       List<Seat> findSeatsByRowRange(@Param("cinemaRoomId") Long cinemaRoomId,
                     @Param("startRow") Integer startRow,
                     @Param("endRow") Integer endRow);

       // Get seat layout matrix for cinema room
       @Query("SELECT s FROM Seat s WHERE s.cinemaRoom.cinemaRoomId = :cinemaRoomId AND " +
                     "s.isActive = true ORDER BY s.seatRow, s.seatColumn")
       List<Seat> getSeatLayout(@Param("cinemaRoomId") Long cinemaRoomId);

       // Find premium seats (VIP, COUPLE, Recliner)
       @Query("SELECT s FROM Seat s WHERE s.cinemaRoom.cinemaRoomId = :cinemaRoomId AND " +
                     "(s.seatType IN ('VIP', 'COUPLE') OR s.isRecliner = true) AND s.isActive = true " +
                     "ORDER BY s.seatRow, s.seatColumn")
       List<Seat> findPremiumSeats(@Param("cinemaRoomId") Long cinemaRoomId);

       // Count total seats in cinema room
       @Query("SELECT COUNT(s) FROM Seat s WHERE s.cinemaRoom.cinemaRoomId = :cinemaRoomId AND s.isActive = true")
       Long countTotalSeats(@Param("cinemaRoomId") Long cinemaRoomId);

       // Delete all seats in cinema room (for room layout reset)
       void deleteByCinemaRoomCinemaRoomId(Long cinemaRoomId);

       // Get all seats in cinema room ordered by position
       @Query("SELECT s FROM Seat s WHERE s.cinemaRoom.cinemaRoomId = :cinemaRoomId AND s.isActive = true " +
                     "ORDER BY s.seatRow, s.seatColumn")
       List<Seat> findByCinemaRoomIdOrderByPosition(@Param("cinemaRoomId") Long cinemaRoomId);

       // ==================== ATOMIC BOOKING OPERATIONS ====================

       /**
        * Find seats by IDs with pessimistic lock for atomic booking operations
        * This prevents race conditions when multiple users try to book same seats
        */
       @Lock(LockModeType.PESSIMISTIC_WRITE)
       @Query("SELECT s FROM Seat s WHERE s.seatId IN :seatIds AND s.isActive = true")
       List<Seat> findByIdInAndLockForUpdate(@Param("seatIds") List<Long> seatIds);

       /**
        * Check if seats exist and are valid for booking
        */
       @Query("SELECT s FROM Seat s WHERE s.seatId IN :seatIds AND s.isActive = true " +
                     "AND s.cinemaRoom.cinemaRoomId = :cinemaRoomId")
       List<Seat> findByIdInAndCinemaRoom(@Param("seatIds") List<Long> seatIds,
                     @Param("cinemaRoomId") Long cinemaRoomId);

       /**
        * Get seat counts for validation
        */
       @Query("SELECT COUNT(s) FROM Seat s WHERE s.cinemaRoom.cinemaRoomId = :cinemaRoomId AND s.isActive = true")
       Long countActiveSeatsByCinemaRoom(@Param("cinemaRoomId") Long cinemaRoomId);
}