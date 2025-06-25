package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.entity.BookingSeat;
import com.swp.MovieTheaterService.entity.Schedule;
import com.swp.MovieTheaterService.entity.Seat;
import com.swp.MovieTheaterService.enums.SeatStatus;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.repository.BookingSeatRepository;
import com.swp.MovieTheaterService.repository.ScheduleRepository;
import com.swp.MovieTheaterService.repository.SeatRepository;
import com.swp.MovieTheaterService.service.SeatReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;
import java.util.Optional;

/**
 * Seat Reservation Service Implementation
 * Handles real-time seat selection with in-memory cache
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SeatReservationServiceImpl implements SeatReservationService {
    
    private final SeatRepository seatRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final ScheduleRepository scheduleRepository;
    
    // In-memory storage for temporary reservations
    // Key: sessionId, Value: TempReservation
    private final ConcurrentMap<String, TempReservation> temporaryReservations = new ConcurrentHashMap<>();
    
    // Reservation timeout in minutes
    private static final int RESERVATION_TIMEOUT_MINUTES = 15;
    
    @Override
    public boolean reserveSeatsTemporarily(Long scheduleId, List<Long> seatIds, String sessionId, Long userId) {
        log.info("Attempting to reserve seats temporarily for session: {}, seats: {}", sessionId, seatIds);
        
        // Check if seats are available
        if (!areSeatsAvailable(scheduleId, seatIds)) {
            log.warn("Some seats are not available for reservation: {}", seatIds);
            return false;
        }
        
        // Release any existing reservations for this session
        releaseTemporaryReservations(sessionId);
        
        // Create new temporary reservation
        TempReservation reservation = new TempReservation(
            scheduleId,
            seatIds,
            sessionId,
            userId,
            LocalDateTime.now().plusMinutes(RESERVATION_TIMEOUT_MINUTES)
        );
        
        temporaryReservations.put(sessionId, reservation);
        log.info("Seats reserved temporarily for session: {}, expires at: {}", 
                sessionId, reservation.getExpiryTime());
        
        return true;
    }
    
    @Override
    public void releaseTemporaryReservations(String sessionId) {
        TempReservation removed = temporaryReservations.remove(sessionId);
        if (removed != null) {
            log.info("Released temporary reservations for session: {}, seats: {}", 
                    sessionId, removed.getSeatIds());
        }
    }
    
    @Override
    public List<Long> getAvailableSeats(Long scheduleId) {
        log.debug("Getting available seats for schedule ID: {}", scheduleId);
        
        try {
            // Get schedule and cinema room
            Schedule schedule = scheduleRepository.findById(scheduleId)
                    .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));
            
            Long cinemaRoomId = schedule.getCinemaRoom().getCinemaRoomId();
            
            // Get all seats for the cinema room
            List<Seat> allSeats = seatRepository.findByCinemaRoomCinemaRoomIdAndIsActiveTrue(cinemaRoomId);
            
            // Get permanently booked seats (CONFIRMED, PAID, COMPLETED bookings only)
            List<Long> bookedSeatIds = bookingSeatRepository.getBookedSeatIdsForSchedule(scheduleId);
            
            // Get temporarily reserved seats
            List<Long> tempReservedSeatIds = getTemporaryReservedSeats(scheduleId);
            
            // Filter available seats
            List<Long> availableSeats = allSeats.stream()
                    .map(Seat::getSeatId)
                    .filter(seatId -> !bookedSeatIds.contains(seatId))
                    .filter(seatId -> !tempReservedSeatIds.contains(seatId))
                    .collect(Collectors.toList());
                    
            log.debug("Schedule {}: Total seats: {}, Booked: {}, Temp reserved: {}, Available: {}", 
                    scheduleId, allSeats.size(), bookedSeatIds.size(), tempReservedSeatIds.size(), availableSeats.size());
                    
            return availableSeats;
            
        } catch (Exception e) {
            log.error("Error getting available seats for schedule {}: {}", scheduleId, e.getMessage(), e);
            return new ArrayList<>();
        }
    }
    
    @Override
    public List<Long> getTemporaryReservations(String sessionId) {
        TempReservation reservation = temporaryReservations.get(sessionId);
        return reservation != null ? new ArrayList<>(reservation.getSeatIds()) : new ArrayList<>();
    }
    
    @Override
    public boolean areSeatsAvailable(Long scheduleId, List<Long> seatIds) {
        List<Long> availableSeats = getAvailableSeats(scheduleId);
        return availableSeats.containsAll(seatIds);
    }
    
    @Override
    public boolean convertToPermanentReservation(String sessionId, Long bookingId) {
        TempReservation reservation = temporaryReservations.get(sessionId);
        
        if (reservation == null) {
            log.warn("No temporary reservation found for session: {}", sessionId);
            return false;
        }
        
        if (reservation.isExpired()) {
            log.warn("Temporary reservation expired for session: {}", sessionId);
            releaseTemporaryReservations(sessionId);
            return false;
        }
        
        // Remove from temporary reservations (will be handled by booking process)
        temporaryReservations.remove(sessionId);
        log.info("Converted temporary reservation to permanent for session: {}, booking: {}", 
                sessionId, bookingId);
        
        return true;
    }
    
    @Override
    public SeatStatusResponse getSeatStatus(Long scheduleId) {
        log.info("Lấy trạng thái ghế cho lịch chiếu: {}", scheduleId);
        
        try {
            // Lấy tất cả ghế của phòng chiếu cho lịch này
            Schedule schedule = scheduleRepository.findById(scheduleId)
                    .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));
            
            Long cinemaRoomId = schedule.getCinemaRoom().getCinemaRoomId();
            
            // Lấy tất cả ghế trong phòng chiếu
            List<Seat> allSeats = seatRepository.findByCinemaRoomCinemaRoomIdAndIsActiveTrue(cinemaRoomId);
            log.debug("Tìm thấy {} ghế cho phòng chiếu: {}", allSeats.size(), cinemaRoomId);
            
            // Lấy ID ghế đã được đặt cho lịch chiếu này (chỉ CONFIRMED hoặc PAID)
            List<BookingSeat> bookedSeats = bookingSeatRepository.findOccupiedSeatsBySchedule(scheduleId);
            List<Long> bookedSeatIds = bookedSeats.stream()
                    .map(bs -> bs.getSeat().getSeatId())
                    .collect(Collectors.toList());
            
            log.debug("Tìm thấy {} ghế đã đặt cho lịch chiếu: {}. IDs: {}", 
                    bookedSeatIds.size(), scheduleId, bookedSeatIds);
            
            // Xây dựng response trạng thái ghế
            List<SeatStatus> seatStatuses = allSeats.stream()
                    .map(seat -> {
                        String status = com.swp.MovieTheaterService.enums.SeatStatus.AVAILABLE.name();
                        String reservedBySession = null;
                        LocalDateTime reservationExpiry = null;
                        
                        // Kiểm tra ghế đã được đặt vĩnh viễn
                        if (bookedSeatIds.contains(seat.getSeatId())) {
                            status = com.swp.MovieTheaterService.enums.SeatStatus.OCCUPIED.name();
                        } else {
                            // Kiểm tra đặt chỗ tạm thời
                            for (TempReservation tempReservation : temporaryReservations.values()) {
                                if (tempReservation.getScheduleId().equals(scheduleId) && 
                                    tempReservation.getSeatIds().contains(seat.getSeatId())) {
                                    
                                    if (tempReservation.isExpired()) {
                                        continue; // Bỏ qua đặt chỗ đã hết hạn
                                    }
                                    
                                    status = com.swp.MovieTheaterService.enums.SeatStatus.TEMPORARILY_RESERVED.name();
                                    reservedBySession = tempReservation.getSessionId();
                                    reservationExpiry = tempReservation.getExpiryTime();
                                    break;
                                }
                            }
                        }
                        
                        SeatStatus seatStatus = new SeatStatus(
                                seat.getSeatId(),
                                seat.getSeatNumber(),
                                String.valueOf(seat.getSeatRow()), // Convert integer row to string
                                status
                        );
                        seatStatus.setReservedBySession(reservedBySession);
                        seatStatus.setReservationExpiry(reservationExpiry);
                        
                        return seatStatus;
                    })
                    .collect(Collectors.toList());
            
            log.info("Trả về {} trạng thái ghế cho lịch chiếu: {}", seatStatuses.size(), scheduleId);
            return new SeatStatusResponse(seatStatuses, LocalDateTime.now());
            
        } catch (AppException e) {
            // Re-throw AppException để giữ nguyên error code
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi lấy trạng thái ghế cho lịch chiếu: {}", scheduleId, e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }
    
    @Override
    @Scheduled(fixedRate = 60000) // Run every minute
    public void cleanupExpiredReservations() {
        List<String> expiredSessions = temporaryReservations.entrySet().stream()
                .filter(entry -> entry.getValue().isExpired())
                .map(entry -> entry.getKey())
                .collect(Collectors.toList());
        
        for (String sessionId : expiredSessions) {
            releaseTemporaryReservations(sessionId);
        }
        
        if (!expiredSessions.isEmpty()) {
            log.info("Cleaned up {} expired temporary reservations", expiredSessions.size());
        }
    }
    
    @Override
    public boolean extendReservation(String sessionId, int additionalMinutes) {
        TempReservation reservation = temporaryReservations.get(sessionId);
        
        if (reservation == null || reservation.isExpired()) {
            return false;
        }
        
        // Extend expiry time
        reservation.setExpiryTime(reservation.getExpiryTime().plusMinutes(additionalMinutes));
        log.info("Extended reservation for session: {} by {} minutes", sessionId, additionalMinutes);
        
        return true;
    }
    
    private List<Long> getTemporaryReservedSeats(Long scheduleId) {
        return temporaryReservations.values().stream()
                .filter(reservation -> reservation.getScheduleId().equals(scheduleId))
                .filter(reservation -> !reservation.isExpired())
                .flatMap(reservation -> reservation.getSeatIds().stream())
                .collect(Collectors.toList());
    }
    
    /**
     * Internal class for temporary reservations
     */
    private static class TempReservation {
        private final Long scheduleId;
        private final List<Long> seatIds;
        private final String sessionId;
        private final Long userId;
        private LocalDateTime expiryTime;
        
        public TempReservation(Long scheduleId, List<Long> seatIds, String sessionId, 
                              Long userId, LocalDateTime expiryTime) {
            this.scheduleId = scheduleId;
            this.seatIds = new ArrayList<>(seatIds);
            this.sessionId = sessionId;
            this.userId = userId;
            this.expiryTime = expiryTime;
        }
        
        public boolean isExpired() {
            return LocalDateTime.now().isAfter(expiryTime);
        }
        
        // Getters and setters
        public Long getScheduleId() { return scheduleId; }
        public List<Long> getSeatIds() { return seatIds; }
        public String getSessionId() { return sessionId; }
        public Long getUserId() { return userId; }
        public LocalDateTime getExpiryTime() { return expiryTime; }
        public void setExpiryTime(LocalDateTime expiryTime) { this.expiryTime = expiryTime; }
    }
} 