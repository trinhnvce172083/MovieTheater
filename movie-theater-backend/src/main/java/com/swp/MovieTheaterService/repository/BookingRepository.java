package com.swp.MovieTheaterService.repository;

import com.swp.MovieTheaterService.entity.Booking;
import com.swp.MovieTheaterService.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Booking Repository Interface
 * Data access layer for Booking entity
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

       // Find by booking code
       Optional<Booking> findByBookingCodeAndIsActiveTrue(String bookingCode);

       // Find bookings by account
       List<Booking> findByAccountAccountIdAndIsActiveTrueOrderByBookingDateDesc(Long accountId);

       Page<Booking> findByAccountAccountIdAndIsActiveTrueOrderByBookingDateDesc(Long accountId, Pageable pageable);

       // Find bookings by schedule
       List<Booking> findByScheduleScheduleIdAndIsActiveTrue(Long scheduleId);

       Page<Booking> findByScheduleScheduleIdAndIsActiveTrue(Long scheduleId, Pageable pageable);

       // Find bookings by status
       List<Booking> findByBookingStatusAndIsActiveTrue(BookingStatus status);

       Page<Booking> findByBookingStatusAndIsActiveTrue(BookingStatus status, Pageable pageable);

       // Find bookings by date range
       List<Booking> findByBookingDateBetweenAndIsActiveTrue(LocalDateTime startDate, LocalDateTime endDate);

       Page<Booking> findByBookingDateBetweenAndIsActiveTrue(LocalDateTime startDate, LocalDateTime endDate,
                     Pageable pageable);

       // Find bookings by customer info (for guest bookings)
       List<Booking> findByCustomerEmailAndIsActiveTrueOrderByBookingDateDesc(String customerEmail);

       List<Booking> findByCustomerPhoneAndIsActiveTrueOrderByBookingDateDesc(String customerPhone);

       // Find bookings by payment method
       List<Booking> findByPaymentMethodAndIsActiveTrue(String paymentMethod);

       // Find pending bookings (for cleanup)
       @Query("SELECT b FROM Booking b WHERE b.bookingStatus = 'PENDING' AND " +
                     "b.bookingDate < :expiredTime AND b.isActive = true")
       List<Booking> findExpiredPendingBookings(@Param("expiredTime") LocalDateTime expiredTime);

       // Find bookings for check-in
       @Query("SELECT b FROM Booking b WHERE b.bookingStatus = 'PAID' AND b.isCheckedIn = false AND " +
                     "b.schedule.showDate = CURRENT_DATE AND b.isActive = true " +
                     "ORDER BY b.schedule.startTime")
       List<Booking> findBookingsForCheckIn();

       // Find bookings by movie
       @Query("SELECT b FROM Booking b WHERE b.schedule.movie.movieId = :movieId AND b.isActive = true " +
                     "ORDER BY b.bookingDate DESC")
       List<Booking> findByMovieId(@Param("movieId") Long movieId);

       // Find bookings by cinema room
       @Query("SELECT b FROM Booking b WHERE b.schedule.cinemaRoom.cinemaRoomId = :cinemaRoomId AND b.isActive = true "
                     +
                     "ORDER BY b.bookingDate DESC")
       List<Booking> findByCinemaRoomId(@Param("cinemaRoomId") Long cinemaRoomId);

       // Search bookings
       @Query("SELECT b FROM Booking b WHERE b.isActive = true AND " +
                     "(LOWER(b.bookingCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(b.customerName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(b.customerEmail) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(b.customerPhone) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(b.schedule.movie.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                     "ORDER BY b.bookingDate DESC")
       Page<Booking> searchBookings(@Param("keyword") String keyword, Pageable pageable);

       // Count bookings by status
       @Query("SELECT COUNT(b) FROM Booking b WHERE b.bookingStatus = :status AND b.isActive = true")
       Long countBookingsByStatus(@Param("status") BookingStatus status);

       // Count bookings by account
       @Query("SELECT COUNT(b) FROM Booking b WHERE b.account.accountId = :accountId AND b.isActive = true")
       Long countBookingsByAccount(@Param("accountId") Long accountId);

       // Count bookings by schedule
       @Query("SELECT COUNT(b) FROM Booking b WHERE b.schedule.scheduleId = :scheduleId AND b.isActive = true")
       Long countBookingsBySchedule(@Param("scheduleId") Long scheduleId);

       // Get total revenue by date range
       @Query("SELECT SUM(b.finalAmount) FROM Booking b WHERE " +
                     "b.bookingStatus IN ('PAID', 'COMPLETED') AND " +
                     "b.bookingDate BETWEEN :startDate AND :endDate AND b.isActive = true")
       Double getTotalRevenue(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

       // Get total revenue by payment method
       @Query("SELECT SUM(b.finalAmount) FROM Booking b WHERE " +
                     "b.bookingStatus IN ('PAID', 'COMPLETED') AND " +
                     "b.paymentMethod = :paymentMethod AND b.isActive = true")
       Double getRevenueByPaymentMethod(@Param("paymentMethod") String paymentMethod);

       // Get average booking amount
       @Query("SELECT AVG(b.finalAmount) FROM Booking b WHERE " +
                     "b.bookingStatus IN ('PAID', 'COMPLETED') AND b.isActive = true")
       Double getAverageBookingAmount();

       // Get total amount by account
       @Query("SELECT SUM(b.finalAmount) FROM Booking b WHERE " +
                     "b.account.accountId = :accountId AND " +
                     "b.bookingStatus IN ('PAID', 'COMPLETED') AND b.isActive = true")
       Double getTotalAmountByAccount(@Param("accountId") Long accountId);

       // Find today's bookings
       @Query("SELECT b FROM Booking b WHERE DATE(b.bookingDate) = CURRENT_DATE AND b.isActive = true " +
                     "ORDER BY b.bookingDate DESC")
       List<Booking> findTodayBookings();

       // Find upcoming show bookings
       @Query("SELECT b FROM Booking b WHERE b.schedule.showDate >= CURRENT_DATE AND " +
                     "b.bookingStatus IN ('CONFIRMED', 'PAID') AND b.isActive = true " +
                     "ORDER BY b.schedule.showDate, b.schedule.startTime")
       List<Booking> findUpcomingShowBookings();

       // Find bookings requiring refund
       @Query("SELECT b FROM Booking b WHERE b.bookingStatus = 'CANCELLED' AND " +
                     "b.refundAmount > 0 AND b.isActive = true")
       List<Booking> findBookingsRequiringRefund();

       // Find bookings by QR code
       Optional<Booking> findByQrCodeAndIsActiveTrue(String qrCode);

       // Delete bookings by schedule (for schedule deletion)
       void deleteByScheduleScheduleId(Long scheduleId);

       // Delete bookings by account (for account deletion)
       void deleteByAccountAccountId(Long accountId);
}