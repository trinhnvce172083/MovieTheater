package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.dto.booking.*;
import com.swp.MovieTheaterService.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Booking Service Interface
 * Business logic for booking management
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
public interface BookingService {

    /**
     * Create a new booking
     */
    BookingResponse createBooking(BookingCreateRequest request, Long accountId);

    /**
     * Create guest booking (without account)
     */
    BookingResponse createGuestBooking(BookingCreateRequest request);

    /**
     * Update an existing booking
     */
    BookingResponse updateBooking(Long bookingId, BookingUpdateRequest request);

    /**
     * Get booking by ID
     */
    BookingResponse getBookingById(Long bookingId);

    /**
     * Get booking by booking code
     */
    BookingResponse getBookingByCode(String bookingCode);

    /**
     * Get all bookings with pagination
     */
    Page<BookingResponse> getAllBookings(Pageable pageable);

    /**
     * Get bookings by account
     */
    List<BookingResponse> getBookingsByAccount(Long accountId);

    Page<BookingResponse> getBookingsByAccount(Long accountId, Pageable pageable);

    /**
     * Get bookings by schedule
     */
    List<BookingResponse> getBookingsBySchedule(Long scheduleId);

    Page<BookingResponse> getBookingsBySchedule(Long scheduleId, Pageable pageable);

    /**
     * Get bookings by status
     */
    List<BookingResponse> getBookingsByStatus(BookingStatus status);

    Page<BookingResponse> getBookingsByStatus(BookingStatus status, Pageable pageable);

    /**
     * Get bookings by date range
     */
    List<BookingResponse> getBookingsByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    Page<BookingResponse> getBookingsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    /**
     * Get bookings by customer info (for guest bookings)
     */
    List<BookingResponse> getBookingsByCustomerEmail(String customerEmail);

    List<BookingResponse> getBookingsByCustomerPhone(String customerPhone);

    /**
     * Get bookings by payment method
     */
    List<BookingResponse> getBookingsByPaymentMethod(String paymentMethod);

    /**
     * Search bookings by keyword
     */
    Page<BookingResponse> searchBookings(String keyword, Pageable pageable);

    /**
     * Get today's bookings
     */
    List<BookingResponse> getTodayBookings();

    /**
     * Get upcoming show bookings
     */
    List<BookingResponse> getUpcomingShowBookings();

    /**
     * Get bookings for check-in
     */
    List<BookingResponse> getBookingsForCheckIn();

    /**
     * Get bookings by movie
     */
    List<BookingResponse> getBookingsByMovie(Long movieId);

    /**
     * Get bookings by cinema room
     */
    List<BookingResponse> getBookingsByCinemaRoom(Long cinemaRoomId);

    /**
     * Confirm booking
     */
    BookingResponse confirmBooking(Long bookingId);

    /**
     * Process payment for booking
     */
    BookingResponse processPayment(PaymentRequest paymentRequest);

    /**
     * Cancel booking
     */
    BookingResponse cancelBooking(Long bookingId, String cancellationReason);

    /**
     * Check-in booking
     */
    BookingResponse checkInBooking(String bookingCode);

    BookingResponse checkInBooking(String qrCode, boolean useQrCode);

    /**
     * Apply promotion to booking
     */
    BookingResponse applyPromotion(Long bookingId, String promotionCode);

    /**
     * Remove promotion from booking
     */
    BookingResponse removePromotion(Long bookingId);

    /**
     * Get available seats for schedule
     */
    List<Long> getAvailableSeats(Long scheduleId);

    /**
     * Get booked seats for schedule
     */
    List<Long> getBookedSeats(Long scheduleId);

    /**
     * Check if seats are available for booking
     */
    boolean areSeatsAvailable(Long scheduleId, List<Long> seatIds);

    /**
     * Generate QR code for booking
     */
    String generateQRCode(Long bookingId);

    /**
     * Validate QR code
     */
    BookingResponse validateQRCode(String qrCode);

    /**
     * Soft delete booking
     */
    void deleteBooking(Long bookingId);

    /**
     * Restore deleted booking
     */
    BookingResponse restoreBooking(Long bookingId);

    /**
     * Clean up expired pending bookings
     */
    int cleanupExpiredBookings();

    /**
     * Get booking statistics
     */
    BookingStatistics getBookingStatistics();

    /**
     * Get booking statistics by date range
     */
    BookingStatistics getBookingStatistics(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Get revenue by date range
     */
    Double getRevenue(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Get revenue by payment method
     */
    Double getRevenueByPaymentMethod(String paymentMethod);

    /**
     * Get average booking amount
     */
    Double getAverageBookingAmount();

    /**
     * Get bookings requiring refund
     */
    List<BookingResponse> getBookingsRequiringRefund();

    /**
     * Process refund for cancelled booking
     */
    BookingResponse processRefund(Long bookingId, Double refundAmount);

    // ==================== CONCESSION MANAGEMENT ====================

    /**
     * Get concession orders for booking
     */
    List<BookingConcessionResponse> getBookingConcessions(Long bookingId);

    /**
     * Add concession to existing booking
     */
    BookingResponse addConcessionToBooking(Long bookingId, ConcessionOrderRequest request);

    /**
     * Remove concession from booking
     */
    BookingResponse removeConcessionFromBooking(Long bookingId, Long concessionId);

    /**
     * Update concession quantity in booking
     */
    BookingResponse updateConcessionQuantity(Long bookingId, Long concessionId, Integer quantity);

    /**
     * Get booking summary including concessions
     */
    BookingSummaryResponse getBookingSummary(Long bookingId);

    /**
     * Inner class for booking statistics
     */
    class BookingStatistics {
        private Long totalBookings;
        private Long pendingCount;
        private Long confirmedCount;
        private Long paidCount;
        private Long completedCount;
        private Long cancelledCount;
        private Long totalSeatsBooked;
        private Double totalRevenue;
        private Double averageBookingAmount;
        private Long guestBookings;
        private Long memberBookings;
        private Long cashPayments;
        private Long cardPayments;
        private Long onlinePayments;
        private Long walletPayments;
        private Double refundAmount;
        private Long checkedInBookings;

        // Constructors, getters, setters
        public BookingStatistics() {
        }

        public BookingStatistics(Long totalBookings, Long pendingCount, Long confirmedCount,
                Long paidCount, Long completedCount, Long cancelledCount,
                Long totalSeatsBooked, Double totalRevenue, Double averageBookingAmount,
                Long guestBookings, Long memberBookings, Long cashPayments,
                Long cardPayments, Long onlinePayments, Long walletPayments,
                Double refundAmount, Long checkedInBookings) {
            this.totalBookings = totalBookings;
            this.pendingCount = pendingCount;
            this.confirmedCount = confirmedCount;
            this.paidCount = paidCount;
            this.completedCount = completedCount;
            this.cancelledCount = cancelledCount;
            this.totalSeatsBooked = totalSeatsBooked;
            this.totalRevenue = totalRevenue;
            this.averageBookingAmount = averageBookingAmount;
            this.guestBookings = guestBookings;
            this.memberBookings = memberBookings;
            this.cashPayments = cashPayments;
            this.cardPayments = cardPayments;
            this.onlinePayments = onlinePayments;
            this.walletPayments = walletPayments;
            this.refundAmount = refundAmount;
            this.checkedInBookings = checkedInBookings;
        }

        // Getters and setters
        public Long getTotalBookings() {
            return totalBookings;
        }

        public void setTotalBookings(Long totalBookings) {
            this.totalBookings = totalBookings;
        }

        public Long getPendingCount() {
            return pendingCount;
        }

        public void setPendingCount(Long pendingCount) {
            this.pendingCount = pendingCount;
        }

        public Long getConfirmedCount() {
            return confirmedCount;
        }

        public void setConfirmedCount(Long confirmedCount) {
            this.confirmedCount = confirmedCount;
        }

        public Long getPaidCount() {
            return paidCount;
        }

        public void setPaidCount(Long paidCount) {
            this.paidCount = paidCount;
        }

        public Long getCompletedCount() {
            return completedCount;
        }

        public void setCompletedCount(Long completedCount) {
            this.completedCount = completedCount;
        }

        public Long getCancelledCount() {
            return cancelledCount;
        }

        public void setCancelledCount(Long cancelledCount) {
            this.cancelledCount = cancelledCount;
        }

        public Long getTotalSeatsBooked() {
            return totalSeatsBooked;
        }

        public void setTotalSeatsBooked(Long totalSeatsBooked) {
            this.totalSeatsBooked = totalSeatsBooked;
        }

        public Double getTotalRevenue() {
            return totalRevenue;
        }

        public void setTotalRevenue(Double totalRevenue) {
            this.totalRevenue = totalRevenue;
        }

        public Double getAverageBookingAmount() {
            return averageBookingAmount;
        }

        public void setAverageBookingAmount(Double averageBookingAmount) {
            this.averageBookingAmount = averageBookingAmount;
        }

        public Long getGuestBookings() {
            return guestBookings;
        }

        public void setGuestBookings(Long guestBookings) {
            this.guestBookings = guestBookings;
        }

        public Long getMemberBookings() {
            return memberBookings;
        }

        public void setMemberBookings(Long memberBookings) {
            this.memberBookings = memberBookings;
        }

        public Long getCashPayments() {
            return cashPayments;
        }

        public void setCashPayments(Long cashPayments) {
            this.cashPayments = cashPayments;
        }

        public Long getCardPayments() {
            return cardPayments;
        }

        public void setCardPayments(Long cardPayments) {
            this.cardPayments = cardPayments;
        }

        public Long getOnlinePayments() {
            return onlinePayments;
        }

        public void setOnlinePayments(Long onlinePayments) {
            this.onlinePayments = onlinePayments;
        }

        public Long getWalletPayments() {
            return walletPayments;
        }

        public void setWalletPayments(Long walletPayments) {
            this.walletPayments = walletPayments;
        }

        public Double getRefundAmount() {
            return refundAmount;
        }

        public void setRefundAmount(Double refundAmount) {
            this.refundAmount = refundAmount;
        }

        public Long getCheckedInBookings() {
            return checkedInBookings;
        }

        public void setCheckedInBookings(Long checkedInBookings) {
            this.checkedInBookings = checkedInBookings;
        }
    }
}