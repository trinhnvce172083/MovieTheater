package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.booking.BookingCreateRequest;
import com.swp.MovieTheaterService.dto.booking.BookingResponse;
import com.swp.MovieTheaterService.service.BookingService;
import com.swp.MovieTheaterService.service.SeatReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Booking Controller
 * REST API endpoints for movie ticket booking system
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Booking Management", description = "APIs for movie ticket booking")
public class BookingController {

    private final BookingService bookingService;
    private final SeatReservationService seatReservationService;

    // ==================== SEAT SELECTION ENDPOINTS ====================
    
    @GetMapping("/schedules/{scheduleId}/seats")
    @Operation(summary = "Get seat status", description = "Get real-time seat availability for a schedule")
    public ResponseEntity<SeatReservationService.SeatStatusResponse> getSeatStatus(
            @PathVariable Long scheduleId) {
        log.info("Getting seat status for schedule: {}", scheduleId);
        
        SeatReservationService.SeatStatusResponse response = seatReservationService.getSeatStatus(scheduleId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/schedules/{scheduleId}/seats/reserve")
    @Operation(summary = "Reserve seats temporarily", 
               description = "Reserve seats temporarily for 15 minutes during booking process")
    public ResponseEntity<Map<String, Object>> reserveSeats(
            @PathVariable Long scheduleId,
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest,
            Authentication authentication) {
        
        String sessionId = httpRequest.getSession().getId();
        List<Long> seatIds = (List<Long>) request.get("seatIds");
        Long userId = authentication != null ? extractUserId(authentication) : null;
        
        log.info("Reserving seats temporarily - schedule: {}, seats: {}, session: {}", 
                scheduleId, seatIds, sessionId);
        
        boolean success = seatReservationService.reserveSeatsTemporarily(
                scheduleId, seatIds, sessionId, userId);
        
        if (success) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Ghế đã được giữ chỗ tạm thời trong 15 phút",
                "sessionId", sessionId,
                "expiryMinutes", 15
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Một hoặc nhiều ghế đã được đặt"
            ));
        }
    }

    @DeleteMapping("/sessions/{sessionId}/seats/release")
    @Operation(summary = "Release seat reservations", 
               description = "Release temporarily reserved seats")
    public ResponseEntity<Map<String, Object>> releaseSeats(@PathVariable String sessionId) {
        log.info("Releasing temporary reservations for session: {}", sessionId);
        
        seatReservationService.releaseTemporaryReservations(sessionId);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Đã hủy giữ chỗ tạm thời"
        ));
    }

    @PostMapping("/sessions/{sessionId}/seats/extend")
    @Operation(summary = "Extend seat reservations", 
               description = "Extend temporarily reserved seats by additional minutes")
    public ResponseEntity<Map<String, Object>> extendReservation(
            @PathVariable String sessionId,
            @RequestBody Map<String, Integer> request) {
        
        Integer additionalMinutes = request.getOrDefault("additionalMinutes", 5);
        log.info("Extending reservation for session: {} by {} minutes", sessionId, additionalMinutes);
        
        boolean success = seatReservationService.extendReservation(sessionId, additionalMinutes);
        
        if (success) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã gia hạn giữ chỗ thêm " + additionalMinutes + " phút"
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Không thể gia hạn (có thể đã hết hạn)"
            ));
        }
    }

    // ==================== BOOKING LIFECYCLE ENDPOINTS ====================

    @PostMapping
    @Operation(summary = "Create booking", description = "Create new booking with seat selection")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingCreateRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        
        String sessionId = httpRequest.getSession().getId();
        Long userId = authentication != null ? extractUserId(authentication) : null;
        
        log.info("Creating booking - user: {}, session: {}, schedule: {}", 
                userId, sessionId, request.getScheduleId());
        
        // Use existing method for now - TODO: Update BookingService interface
        BookingResponse response;
        if (userId != null) {
            response = bookingService.createBooking(request, userId);
        } else {
            response = bookingService.createGuestBooking(request);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{bookingId}")
    @Operation(summary = "Get booking details", description = "Get detailed booking information")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<BookingResponse> getBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {
        
        Long userId = authentication != null ? extractUserId(authentication) : null;
        log.info("Getting booking details - booking: {}, user: {}", bookingId, userId);
        
        // Use existing method without userId parameter for now
        BookingResponse response = bookingService.getBookingById(bookingId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{bookingId}/confirm")
    @Operation(summary = "Confirm booking", description = "Confirm booking and process payment")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<BookingResponse> confirmBooking(
            @PathVariable Long bookingId,
            @RequestBody Map<String, String> paymentInfo,
            Authentication authentication) {
        
        Long userId = authentication != null ? extractUserId(authentication) : null;
        String paymentMethod = paymentInfo.get("paymentMethod");
        String paymentReference = paymentInfo.get("paymentReference");
        
        log.info("Confirming booking - booking: {}, user: {}, payment: {}", 
                bookingId, userId, paymentMethod);
        
        // Use existing method - TODO: Update to handle payment details
        BookingResponse response = bookingService.confirmBooking(bookingId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{bookingId}/cancel")
    @Operation(summary = "Cancel booking", description = "Cancel booking and process refund")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long bookingId,
            @RequestBody Map<String, String> cancellationInfo,
            Authentication authentication) {
        
        Long userId = authentication != null ? extractUserId(authentication) : null;
        String reason = cancellationInfo.get("reason");
        
        log.info("Cancelling booking - booking: {}, user: {}, reason: {}", 
                bookingId, userId, reason);
        
        BookingResponse response = bookingService.cancelBooking(bookingId, reason);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{bookingId}/checkin")
    @Operation(summary = "Check-in booking", description = "Check-in for movie show")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<BookingResponse> checkInBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {
        
        Long userId = authentication != null ? extractUserId(authentication) : null;
        log.info("Checking in booking - booking: {}, user: {}", bookingId, userId);
        
        // Get booking code first then check-in
        BookingResponse bookingDetails = bookingService.getBookingById(bookingId);
        BookingResponse response = bookingService.checkInBooking(bookingDetails.getBookingCode());
        return ResponseEntity.ok(response);
    }

    // ==================== BOOKING HISTORY & MANAGEMENT ====================

    @GetMapping("/my-bookings")
    @Operation(summary = "Get user bookings", description = "Get user's booking history with pagination")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('MEMBER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Page<BookingResponse>> getUserBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "bookingDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(required = false) String status,
            Authentication authentication) {
        
        Long userId = extractUserId(authentication);
        Sort sort = Sort.by(sortDirection.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        log.info("Getting user bookings - user: {}, page: {}, status: {}", userId, page, status);
        
        // Use existing method - ignore status filter for now
        Page<BookingResponse> bookings = bookingService.getBookingsByAccount(userId, pageable);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/search")
    @Operation(summary = "Search bookings", description = "Search bookings by various criteria")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Page<BookingResponse>> searchBookings(
            @RequestParam(required = false) String bookingCode,
            @RequestParam(required = false) String customerEmail,
            @RequestParam(required = false) String customerPhone,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long movieId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "bookingDate"));
        
        log.info("Searching bookings - code: {}, email: {}, status: {}", 
                bookingCode, customerEmail, status);
        
        // Use basic search for now - TODO: Implement advanced search
        String keyword = bookingCode != null ? bookingCode : 
                        customerEmail != null ? customerEmail : "";
        Page<BookingResponse> bookings = bookingService.searchBookings(keyword, pageable);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get booking statistics", description = "Get booking statistics for analytics")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<BookingService.BookingStatistics> getBookingStatistics(
            @RequestParam(required = false) String period) {
        
        log.info("Getting booking statistics for period: {}", period);
        
        // Use existing method - ignore period filter for now
        BookingService.BookingStatistics statistics = bookingService.getBookingStatistics();
        return ResponseEntity.ok(statistics);
    }

    // ==================== HELPER METHODS ====================

    private Long extractUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            // Extract user ID from UserDetails or JWT token
            // This is a placeholder - implement based on your JWT structure
            return 1L; // TODO: Implement proper user ID extraction
        }
        return null;
    }
} 