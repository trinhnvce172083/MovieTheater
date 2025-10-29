package com.swp.MovieTheaterService.repository;

import com.swp.MovieTheaterService.entity.BookingSeat;
import com.swp.MovieTheaterService.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Booking Seat Repository
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Repository
public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {

       /**
        * Find booking seats by booking ID
        */
       List<BookingSeat> findByBookingBookingId(Long bookingId);

       /**
        * Find booking seats by seat ID
        */
       List<BookingSeat> findBySeatSeatId(Long seatId);

       /**
        * Find booking seats by schedule ID
        */
       @Query("SELECT bs FROM BookingSeat bs " +
                     "JOIN bs.booking b " +
                     "WHERE b.schedule.id = :scheduleId")
       List<BookingSeat> findByScheduleId(@Param("scheduleId") Long scheduleId);

       /**
        * Find booking seats by schedule ID and booking status
        */
       @Query("SELECT bs FROM BookingSeat bs " +
                     "JOIN bs.booking b " +
                     "WHERE b.schedule.id = :scheduleId AND b.bookingStatus = :status")
       List<BookingSeat> findByScheduleIdAndBookingStatus(@Param("scheduleId") Long scheduleId,
                     @Param("status") BookingStatus status);

       /**
        * Find occupied seats for a schedule
        */
       @Query("SELECT bs FROM BookingSeat bs " +
                     "JOIN bs.booking b " +
                     "WHERE b.schedule.id = :scheduleId AND " +
                     "b.bookingStatus IN ('CONFIRMED', 'PAID')")
       List<BookingSeat> findOccupiedSeatsBySchedule(@Param("scheduleId") Long scheduleId);

       /**
        * Find occupied seats by schedule and specific seat IDs (for atomic booking)
        */
       @Query("SELECT bs FROM BookingSeat bs " +
                     "JOIN bs.booking b " +
                     "WHERE b.schedule.scheduleId = :scheduleId AND " +
                     "bs.seat.seatId IN :seatIds AND " +
                     "b.bookingStatus IN ('PENDING', 'CONFIRMED', 'PAID') AND " +
                     "b.isActive = true")
       List<BookingSeat> findOccupiedSeatsByScheduleAndSeatIds(@Param("scheduleId") Long scheduleId,
                     @Param("seatIds") List<Long> seatIds);

       /**
        * Check if seat is occupied for a schedule
        */
       @Query("SELECT CASE WHEN COUNT(bs) > 0 THEN true ELSE false END FROM BookingSeat bs " +
                     "JOIN bs.booking b " +
                     "WHERE b.schedule.scheduleId = :scheduleId AND " +
                     "bs.seat.seatId = :seatId AND " +
                     "b.bookingStatus IN ('PENDING', 'CONFIRMED', 'PAID') AND " +
                     "b.isActive = true")
       boolean isSeatOccupied(@Param("scheduleId") Long scheduleId, @Param("seatId") Long seatId);

       /**
        * Count occupied seats for a schedule
        */
       @Query("SELECT COUNT(bs) FROM BookingSeat bs " +
                     "JOIN bs.booking b " +
                     "WHERE b.schedule.id = :scheduleId AND " +
                     "b.bookingStatus IN ('CONFIRMED', 'PAID')")
       long countOccupiedSeatsBySchedule(@Param("scheduleId") Long scheduleId);

       /**
        * Delete booking seats by booking ID
        */
       void deleteByBookingBookingId(Long bookingId);

       List<BookingSeat> findByBookingBookingIdAndActiveTrue(Long bookingId);

       @Query("SELECT bs.seat.seatId FROM BookingSeat bs " +
                     "JOIN bs.booking b " +
                     "JOIN b.schedule s " +
                     "WHERE s.scheduleId = :scheduleId " +
                     "AND b.bookingStatus IN ('CONFIRMED', 'PAID', 'COMPLETED') " +
                     "AND b.isActive = true " +
                     "AND bs.active = true")
       List<Long> getBookedSeatIdsForSchedule(@Param("scheduleId") Long scheduleId);

       /**
        * Find booking seats by schedule and booking status for cleanup
        */
       @Query("SELECT bs FROM BookingSeat bs " +
                     "JOIN bs.booking b " +
                     "WHERE b.schedule.scheduleId = :scheduleId AND " +
                     "b.bookingStatus = :status AND " +
                     "b.isActive = true")
       List<BookingSeat> findByScheduleAndBookingStatus(@Param("scheduleId") Long scheduleId,
                     @Param("status") BookingStatus status);
}