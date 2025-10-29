package com.swp.MovieTheaterService.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * Seat Reservation Service Interface
 * Handles real-time seat selection and temporary reservations
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
public interface SeatReservationService {
    
    /**
     * Reserve seats temporarily for a user session
     * 
     * @param scheduleId schedule ID
     * @param seatIds list of seat IDs to reserve
     * @param sessionId user session ID
     * @param userId user ID (null for guests)
     * @return true if reservation successful
     */
    boolean reserveSeatsTemporarily(Long scheduleId, List<Long> seatIds, String sessionId, Long userId);
    
    /**
     * Release temporary seat reservations
     * 
     * @param sessionId user session ID
     */
    void releaseTemporaryReservations(String sessionId);
    
    /**
     * Get available seats for a schedule
     * 
     * @param scheduleId schedule ID
     * @return list of available seat IDs
     */
    List<Long> getAvailableSeats(Long scheduleId);
    
    /**
     * Get temporarily reserved seats for a session
     * 
     * @param sessionId user session ID
     * @return list of temporarily reserved seat IDs
     */
    List<Long> getTemporaryReservations(String sessionId);
    
    /**
     * Check if seats are available for booking
     * 
     * @param scheduleId schedule ID
     * @param seatIds list of seat IDs to check
     * @return true if all seats are available
     */
    boolean areSeatsAvailable(Long scheduleId, List<Long> seatIds);
    
    /**
     * Convert temporary reservations to permanent bookings
     * 
     * @param sessionId user session ID
     * @param bookingId booking ID
     * @return true if conversion successful
     */
    boolean convertToPermanentReservation(String sessionId, Long bookingId);
    
    /**
     * Lấy trạng thái tất cả ghế cho một lịch chiếu
     * 
     * @param scheduleId ID lịch chiếu
     * @return danh sách trạng thái ghế bao gồm:
     *         - AVAILABLE: ghế có thể đặt
     *         - OCCUPIED: ghế đã được đặt vĩnh viễn
     *         - TEMPORARILY_RESERVED: ghế đang được giữ chỗ tạm thời
     */
    SeatStatusResponse getSeatStatus(Long scheduleId);
    
    /**
     * Clean up expired temporary reservations
     */
    void cleanupExpiredReservations();
    
    /**
     * Extend temporary reservation time
     * 
     * @param sessionId user session ID
     * @param additionalMinutes additional minutes to extend
     * @return true if extension successful
     */
    boolean extendReservation(String sessionId, int additionalMinutes);
    
    /**
     * Response chứa trạng thái tất cả ghế của một lịch chiếu
     */
    class SeatStatusResponse {
        private List<SeatStatus> seats; // Danh sách tất cả ghế với trạng thái
        private LocalDateTime lastUpdated; // Thời gian cập nhật cuối
        
        public SeatStatusResponse(List<SeatStatus> seats, LocalDateTime lastUpdated) {
            this.seats = seats;
            this.lastUpdated = lastUpdated;
        }
        
        // Getters and setters
        public List<SeatStatus> getSeats() { return seats; }
        public void setSeats(List<SeatStatus> seats) { this.seats = seats; }
        public LocalDateTime getLastUpdated() { return lastUpdated; }
        public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
    }
    
    /**
     * Thông tin trạng thái của từng ghế cụ thể
     */
    class SeatStatus {
        private Long seatId; // ID của ghế
        private String seatNumber; // Số ghế (A1, B2, etc.)
        private String seatRow; // Hàng ghế (1, 2, 3, etc.)
        private String status; // Trạng thái: AVAILABLE, TEMPORARILY_RESERVED, OCCUPIED
        private String reservedBySession; // Session ID nếu ghế đang được giữ chỗ tạm thời
        private LocalDateTime reservationExpiry; // Thời gian hết hạn giữ chỗ tạm thời
        
        public SeatStatus(Long seatId, String seatNumber, String seatRow, String status) {
            this.seatId = seatId;
            this.seatNumber = seatNumber;
            this.seatRow = seatRow;
            this.status = status;
        }
        
        // Getters and setters
        public Long getSeatId() { return seatId; }
        public void setSeatId(Long seatId) { this.seatId = seatId; }
        public String getSeatNumber() { return seatNumber; }
        public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }
        public String getSeatRow() { return seatRow; }
        public void setSeatRow(String seatRow) { this.seatRow = seatRow; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getReservedBySession() { return reservedBySession; }
        public void setReservedBySession(String reservedBySession) { this.reservedBySession = reservedBySession; }
        public LocalDateTime getReservationExpiry() { return reservationExpiry; }
        public void setReservationExpiry(LocalDateTime reservationExpiry) { this.reservationExpiry = reservationExpiry; }
    }
}