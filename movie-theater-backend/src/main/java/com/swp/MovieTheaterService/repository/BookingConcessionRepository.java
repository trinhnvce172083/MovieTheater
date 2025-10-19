package com.swp.MovieTheaterService.repository;

import com.swp.MovieTheaterService.entity.BookingConcession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Booking Concession Repository
 * Data access layer for BookingConcession entity
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Repository
public interface BookingConcessionRepository extends JpaRepository<BookingConcession, Long> {

    /**
     * Find booking concessions by booking ID
     */
    List<BookingConcession> findByBookingBookingIdAndIsActiveTrue(Long bookingId);

    /**
     * Find booking concessions by concession ID
     */
    List<BookingConcession> findByConcessionConcessionIdAndIsActiveTrue(Long concessionId);

    /**
     * Calculate total concession amount for booking
     */
    @Query("SELECT COALESCE(SUM(bc.totalPrice), 0) FROM BookingConcession bc " +
            "WHERE bc.booking.bookingId = :bookingId AND bc.isActive = true")
    BigDecimal calculateTotalConcessionAmount(@Param("bookingId") Long bookingId);

    /**
     * Find popular concessions (most ordered)
     */
    @Query("SELECT bc.concession.concessionId, bc.concession.name, SUM(bc.quantity) as totalQuantity " +
            "FROM BookingConcession bc " +
            "WHERE bc.isActive = true " +
            "GROUP BY bc.concession.concessionId, bc.concession.name " +
            "ORDER BY totalQuantity DESC")
    List<Object[]> findPopularConcessions();

    /**
     * Count total concession items for booking
     */
    @Query("SELECT COALESCE(SUM(bc.quantity), 0) FROM BookingConcession bc " +
            "WHERE bc.booking.bookingId = :bookingId AND bc.isActive = true")
    Integer countTotalConcessionItems(@Param("bookingId") Long bookingId);

    /**
     * Check if concession is used in any booking
     */
    boolean existsByConcessionConcessionIdAndIsActiveTrue(Long concessionId);

    /**
     * Delete booking concessions by booking ID
     */
    void deleteByBookingBookingId(Long bookingId);
}
