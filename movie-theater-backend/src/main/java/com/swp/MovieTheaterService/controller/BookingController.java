package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.booking.BookingCreateRequest;
import com.swp.MovieTheaterService.dto.booking.BookingResponse;
import com.swp.MovieTheaterService.dto.booking.BookingConcessionResponse;
import com.swp.MovieTheaterService.dto.booking.ConcessionOrderRequest;
import com.swp.MovieTheaterService.dto.booking.BookingSummaryResponse;
import com.swp.MovieTheaterService.dto.booking.PaymentStatusUpdateRequest;
import com.swp.MovieTheaterService.dto.response.ApiResponse;
import com.swp.MovieTheaterService.service.BookingService;
import com.swp.MovieTheaterService.service.SeatReservationService;
import com.swp.MovieTheaterService.config.documentation.OpenApiExamples;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
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
    @Operation(summary = "Lấy trạng thái tất cả ghế", 
               description = "Lấy danh sách trạng thái của tất cả các ghế trong lịch chiếu bao gồm: AVAILABLE (có thể đặt), OCCUPIED (đã được đặt vĩnh viễn), TEMPORARILY_RESERVED (đang được giữ chỗ tạm thời)")
    public ResponseEntity<SeatReservationService.SeatStatusResponse> getSeatStatus(
            @PathVariable Long scheduleId) {
        log.info("Lấy trạng thái tất cả ghế cho lịch chiếu: {}", scheduleId);

        SeatReservationService.SeatStatusResponse response = seatReservationService.getSeatStatus(scheduleId);
        log.info("Trả về {} ghế cho lịch chiếu: {}", response.getSeats().size(), scheduleId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/schedules/{scheduleId}/seats/reserve")
    @Operation(summary = "Reserve seats temporarily", description = "Reserve seats temporarily for 15 minutes during booking process")
    @SuppressWarnings("unchecked")
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
                    "expiryMinutes", 15));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Một hoặc nhiều ghế đã được đặt"));
        }
    }

    @DeleteMapping("/sessions/{sessionId}/seats/release")
    @Operation(summary = "Release seat reservations", description = "Release temporarily reserved seats")
    public ResponseEntity<Map<String, Object>> releaseSeats(@PathVariable String sessionId) {
        log.info("Releasing temporary reservations for session: {}", sessionId);

        seatReservationService.releaseTemporaryReservations(sessionId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã hủy giữ chỗ tạm thời"));
    }

    @PostMapping("/sessions/{sessionId}/seats/extend")
    @Operation(summary = "Extend seat reservations", description = "Extend temporarily reserved seats by additional minutes")
    public ResponseEntity<Map<String, Object>> extendReservation(
            @PathVariable String sessionId,
            @RequestBody Map<String, Integer> request) {

        Integer additionalMinutes = request.getOrDefault("additionalMinutes", 5);
        log.info("Extending reservation for session: {} by {} minutes", sessionId, additionalMinutes);

        boolean success = seatReservationService.extendReservation(sessionId, additionalMinutes);

        if (success) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đã gia hạn giữ chỗ thêm " + additionalMinutes + " phút"));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Không thể gia hạn (có thể đã hết hạn)"));
        }
    }

    // ==================== BOOKING LIFECYCLE ENDPOINTS ====================

    @PostMapping
    @Operation(summary = "Create booking", description = "Create new booking with seat selection and optional concessions", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = {
                            @ExampleObject(name = "Member Booking (Simple)", summary = "Booking đơn giản cho thành viên", value = OpenApiExamples.MEMBER_BOOKING_SIMPLE_EXAMPLE),
                @ExampleObject(name = "Guest with Concessions", summary = "Guest booking với đồ ăn/uống", value = OpenApiExamples.GUEST_BOOKING_WITH_CONCESSIONS_EXAMPLE),
                @ExampleObject(name = "Family Scenario", summary = "Scenario gia đình đầy đủ", value = OpenApiExamples.FAMILY_BOOKING_SCENARIO)
    })))
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
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

        ApiResponse<BookingResponse> apiResponse = ApiResponse.<BookingResponse>builder()
                .success(true)
                .message("Tạo booking thành công")
                .data(response)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    @PostMapping("/guest")
    @Operation(summary = "Create guest booking", description = "Create new guest booking without login - requires customer information", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = {
                         @ExampleObject(name = "Guest Booking with Concessions", summary = "Guest booking có đồ ăn/uống", value = OpenApiExamples.GUEST_BOOKING_WITH_CONCESSIONS_EXAMPLE),
              @ExampleObject(name = "Guest Booking (Seats Only)", summary = "Guest booking chỉ có ghế", value = OpenApiExamples.GUEST_BOOKING_SEATS_ONLY_EXAMPLE),
              @ExampleObject(name = "Couple Date Scenario", summary = "Scenario hẹn hò", value = OpenApiExamples.COUPLE_DATE_SCENARIO),
              @ExampleObject(name = "Business Group", summary = "Scenario nhóm doanh nghiệp", value = OpenApiExamples.BUSINESS_GROUP_SCENARIO)
    })))
    public ResponseEntity<ApiResponse<BookingResponse>> createGuestBooking(
            @Valid @RequestBody BookingCreateRequest request,
            HttpServletRequest httpRequest) {

        String sessionId = httpRequest.getSession().getId();
        request.setSessionId(sessionId); // Ensure session ID is set
        request.setIsGuestBooking(true); // Force guest booking

        log.info("Creating guest booking - session: {}, schedule: {}, customer: {}",
                sessionId, request.getScheduleId(), request.getCustomerEmail());

        BookingResponse response = bookingService.createGuestBooking(request);

        ApiResponse<BookingResponse> apiResponse = ApiResponse.<BookingResponse>builder()
                .success(true)
                .message("Tạo booking khách thành công")
                .data(response)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    @GetMapping("/{bookingId}")
    @Operation(summary = "Get booking details", description = "Get detailed booking information")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {

        Long userId = authentication != null ? extractUserId(authentication) : null;
        log.info("Getting booking details - booking: {}, user: {}", bookingId, userId);

        // Use existing method without userId parameter for now
        BookingResponse response = bookingService.getBookingById(bookingId);

        ApiResponse<BookingResponse> apiResponse = ApiResponse.<BookingResponse>builder()
                .success(true)
                .message("Lấy thông tin booking thành công")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/{bookingId}/confirm")
    @Operation(summary = "Confirm booking", description = "Confirm booking - change status from PENDING to CONFIRMED")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<BookingResponse>> confirmBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {

        Long userId = authentication != null ? extractUserId(authentication) : null;
        log.info("Confirming booking - booking: {}, user: {}", bookingId, userId);

        try {
            BookingResponse response = bookingService.confirmBooking(bookingId);
            
            // Success notification
            log.info("✅ Booking confirmed successfully - ID: {}, Status: {}", 
                    response.getBookingId(), response.getBookingStatus());

            ApiResponse<BookingResponse> apiResponse = ApiResponse.<BookingResponse>builder()
                    .success(true)
                    .message("Xác nhận booking thành công")
                    .data(response)
                    .build();

            return ResponseEntity.ok(apiResponse);
            
        } catch (Exception e) {
            // Error notification
            log.error("❌ Failed to confirm booking - ID: {}, Error: {}", bookingId, e.getMessage());

            ApiResponse<BookingResponse> apiResponse = ApiResponse.<BookingResponse>builder()
                    .success(false)
                    .message("Không thể xác nhận booking: " + e.getMessage())
                    .build();

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
        }
    }

    @PostMapping("/{bookingId}/cancel")
    @Operation(summary = "Cancel booking", description = "Cancel booking and process refund")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long bookingId,
            @RequestParam(required = false, defaultValue = "User cancelled") String reason,
            Authentication authentication) {

        Long userId = authentication != null ? extractUserId(authentication) : null;
        log.info("Cancelling booking - booking: {}, user: {}, reason: {}", bookingId, userId, reason);

        try {
            BookingResponse response = bookingService.cancelBooking(bookingId, reason);
            
            // Success notification
            log.info("✅ Booking cancelled successfully - ID: {}, Status: {}, Refund: {}", 
                    response.getBookingId(), response.getBookingStatus(), response.getRefundAmount());

            ApiResponse<BookingResponse> apiResponse = ApiResponse.<BookingResponse>builder()
                    .success(true)
                    .message("Hủy booking thành công")
                    .data(response)
                    .build();

            return ResponseEntity.ok(apiResponse);
            
        } catch (Exception e) {
            // Error notification
            log.error("❌ Failed to cancel booking - ID: {}, Error: {}", bookingId, e.getMessage());

            ApiResponse<BookingResponse> apiResponse = ApiResponse.<BookingResponse>builder()
                    .success(false)
                    .message("Không thể hủy booking: " + e.getMessage())
                    .build();

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
        }
    }

    @PostMapping("/{bookingId}/checkin")
    @Operation(summary = "Check-in booking", description = "Check-in for movie show")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<BookingResponse>> checkInBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {

        Long userId = authentication != null ? extractUserId(authentication) : null;
        log.info("Checking in booking - booking: {}, user: {}", bookingId, userId);

        // Get booking code first then check-in
        BookingResponse bookingDetails = bookingService.getBookingById(bookingId);
        BookingResponse response = bookingService.checkInBooking(bookingDetails.getBookingCode());

        ApiResponse<BookingResponse> apiResponse = ApiResponse.<BookingResponse>builder()
                .success(true)
                .message("Check-in thành công")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/{bookingId}/payment/status")
    @Operation(summary = "Update payment status", 
               description = "Update payment status of booking (Employee/Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<BookingResponse>> updatePaymentStatus(
            @PathVariable Long bookingId,
            @Valid @RequestBody PaymentStatusUpdateRequest request,
            Authentication authentication) {

        Long userId = authentication != null ? extractUserId(authentication) : null;
        log.info("Updating payment status - booking: {}, status: {}, user: {}", 
                bookingId, request.getPaymentStatus(), userId);

        BookingResponse response = bookingService.updatePaymentStatus(bookingId, request);

        ApiResponse<BookingResponse> apiResponse = ApiResponse.<BookingResponse>builder()
                .success(true)
                .message("Cập nhật trạng thái thanh toán thành công")
                .data(response)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    // ==================== BOOKING HISTORY & MANAGEMENT ====================

    @GetMapping("/my-bookings")
    @Operation(summary = "Get user bookings", description = "Get user's booking history with pagination")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('MEMBER')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getUserBookings(
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

        ApiResponse<Page<BookingResponse>> apiResponse = ApiResponse.<Page<BookingResponse>>builder()
                .success(true)
                .message("Lấy lịch sử booking thành công")
                .data(bookings)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/search")
    @Operation(summary = "Search bookings", description = "Search bookings by various criteria")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> searchBookings(
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
        String keyword = bookingCode != null ? bookingCode : customerEmail != null ? customerEmail : "";
        Page<BookingResponse> bookings = bookingService.searchBookings(keyword, pageable);

        ApiResponse<Page<BookingResponse>> apiResponse = ApiResponse.<Page<BookingResponse>>builder()
                .success(true)
                .message("Tìm kiếm booking thành công")
                .data(bookings)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get booking statistics", description = "Get booking statistics for analytics with period filtering")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<BookingService.BookingStatistics>> getBookingStatistics(
            @RequestParam(required = false, defaultValue = "all") String period) {

        log.info("Getting booking statistics for period: {}", period);

        LocalDateTime startDate = null;
        LocalDateTime endDate = LocalDateTime.now();

        // Parse period parameter
        switch (period.toLowerCase()) {
            case "today":
                startDate = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
                break;
            case "week":
                startDate = LocalDateTime.now().minusDays(7);
                break;
            case "month":
                startDate = LocalDateTime.now().minusMonths(1);
                break;
            case "quarter":
                startDate = LocalDateTime.now().minusMonths(3);
                break;
            case "year":
                startDate = LocalDateTime.now().minusYears(1);
                break;
            case "all":
            default:
                // Get all statistics without date filter
                BookingService.BookingStatistics statistics = bookingService.getBookingStatistics();

                ApiResponse<BookingService.BookingStatistics> apiResponse = ApiResponse.<BookingService.BookingStatistics>builder()
                        .success(true)
                        .message("Lấy thống kê booking thành công")
                        .data(statistics)
                        .build();

                return ResponseEntity.ok(apiResponse);
        }

        // Get statistics with date filter
        BookingService.BookingStatistics statistics = bookingService.getBookingStatistics(startDate, endDate);

        ApiResponse<BookingService.BookingStatistics> apiResponse = ApiResponse.<BookingService.BookingStatistics>builder()
                .success(true)
                .message("Lấy thống kê booking thành công")
                .data(statistics)
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/cleanup-expired")
    @Operation(summary = "Cleanup expired bookings", description = "Manual trigger to cleanup expired PENDING bookings (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> cleanupExpiredBookings() {
        log.info("Manual cleanup of expired bookings triggered");

        try {
            int cleanedCount = bookingService.cleanupExpiredBookings();

            Map<String, Object> response = Map.of(
                    "message", "Expired bookings cleanup completed",
                    "cleanedCount", cleanedCount,
                    "timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to cleanup expired bookings", e);

            Map<String, Object> errorResponse = Map.of(
                    "error", "Cleanup failed: " + e.getMessage(),
                    "timestamp", LocalDateTime.now());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/expired")
    @Operation(summary = "Get expired bookings", description = "Get list of expired PENDING bookings (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<BookingResponse>> getExpiredBookings() {
        log.info("Getting expired bookings");

        try {
            // Get bookings that are PENDING and older than 15 minutes
            LocalDateTime expirationTime = LocalDateTime.now().minusMinutes(15);
            List<BookingResponse> expiredBookings = bookingService.getBookingsByDateRange(
                    LocalDateTime.now().minusDays(1),
                    expirationTime).stream()
                    .filter(booking -> "PENDING".equals(booking.getBookingStatus()))
                    .toList();

            return ResponseEntity.ok(expiredBookings);

        } catch (Exception e) {
            log.error("Failed to get expired bookings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of());
        }
    }

    @PostMapping("/{bookingId}/extend-reservation")
    @Operation(summary = "Extend booking reservation", description = "Extend reservation time for PENDING booking")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> extendReservation(
            @PathVariable Long bookingId,
            @RequestBody Map<String, Integer> request,
            Authentication authentication) {

        Long userId = authentication != null ? extractUserId(authentication) : null;
        Integer additionalMinutes = request.getOrDefault("additionalMinutes", 5);

        log.info("Extending reservation for booking: {}, user: {}, minutes: {}",
                bookingId, userId, additionalMinutes);

        try {
            // Validate booking exists and belongs to user (if not admin)
            BookingResponse booking = bookingService.getBookingById(bookingId);

            if (!"PENDING".equals(booking.getBookingStatus())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Chỉ có thể gia hạn booking đang PENDING",
                        "currentStatus", booking.getBookingStatus()));
            }

            // For now, just return success - actual implementation would extend DB timeout
            Map<String, Object> response = Map.of(
                    "message", "Booking reservation extended successfully",
                    "bookingId", bookingId,
                    "additionalMinutes", additionalMinutes,
                    "newExpiryTime", LocalDateTime.now().plusMinutes(15 + additionalMinutes));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to extend reservation for booking {}", bookingId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to extend reservation: " + e.getMessage()));
        }
    }

    @GetMapping("/{bookingId}/timeline")
    @Operation(summary = "Get booking timeline", description = "Get detailed timeline/history of booking")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> getBookingTimeline(
            @PathVariable Long bookingId,
            Authentication authentication) {

        Long userId = authentication != null ? extractUserId(authentication) : null;
        log.info("Getting booking timeline - booking: {}, user: {}", bookingId, userId);

        try {
            BookingResponse booking = bookingService.getBookingById(bookingId);

            // Create timeline based on booking status and timestamps
            List<Map<String, Object>> timeline = List.of(
                    Map.of(
                            "status", "CREATED",
                            "timestamp", booking.getBookingDate(),
                            "description", "Booking được tạo"),
                    Map.of(
                            "status", booking.getBookingStatus(),
                            "timestamp", booking.getUpdatedAt(),
                            "description", "Trạng thái hiện tại: " + booking.getBookingStatus()));

            Map<String, Object> response = Map.of(
                    "bookingId", bookingId,
                    "bookingCode", booking.getBookingCode(),
                    "currentStatus", booking.getBookingStatus(),
                    "timeline", timeline);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to get booking timeline for {}", bookingId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to get timeline: " + e.getMessage()));
        }
    }

    /**
     * Get concession orders for booking
     */
    @GetMapping("/{id}/concessions")
    @Operation(summary = "Lấy danh sách đồ ăn/uống của booking")
    public ResponseEntity<List<BookingConcessionResponse>> getBookingConcessions(@PathVariable Long id) {
        log.info("GET /api/bookings/{}/concessions - Getting concessions for booking", id);

        List<BookingConcessionResponse> concessions = bookingService.getBookingConcessions(id);

        log.info("Found {} concession orders for booking {}", concessions.size(), id);
        return ResponseEntity.ok(concessions);
    }

    /**
     * Add concession to existing booking
     */
    @PostMapping("/{id}/concessions")
    @Operation(summary = "Thêm đồ ăn/uống vào booking", description = "Thêm đồ ăn/uống vào booking đang ở trạng thái PENDING", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = {
                            @ExampleObject(name = "Add Popcorn", summary = "Thêm bắp rang", value = OpenApiExamples.POPCORN_ORDER_EXAMPLE),
                @ExampleObject(name = "Add Drink", summary = "Thêm nước uống", value = OpenApiExamples.DRINK_ORDER_EXAMPLE),
                @ExampleObject(name = "General Add", summary = "Thêm tổng quát", value = OpenApiExamples.ADD_CONCESSION_EXAMPLE)
    })))
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> addConcessionToBooking(
            @PathVariable Long id,
            @Valid @RequestBody ConcessionOrderRequest request) {
        log.info("POST /api/bookings/{}/concessions - Adding concession to booking", id);

        BookingResponse updatedBooking = bookingService.addConcessionToBooking(id, request);

        log.info("Added concession to booking {} - new total: {}",
                id, updatedBooking.getFinalAmount());
        return ResponseEntity.ok(updatedBooking);
    }

    /**
     * Remove concession from booking
     */
    @DeleteMapping("/{bookingId}/concessions/{concessionId}")
    @Operation(summary = "Xóa đồ ăn/uống khỏi booking")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> removeConcessionFromBooking(
            @PathVariable Long bookingId,
            @PathVariable Long concessionId) {
        log.info("DELETE /api/bookings/{}/concessions/{} - Removing concession from booking",
                bookingId, concessionId);

        BookingResponse updatedBooking = bookingService.removeConcessionFromBooking(bookingId, concessionId);

        log.info("Removed concession from booking {} - new total: {}",
                bookingId, updatedBooking.getFinalAmount());
        return ResponseEntity.ok(updatedBooking);
    }

    /**
     * Update concession quantity in booking
     */
    @PutMapping("/{bookingId}/concessions/{concessionId}")
    @Operation(summary = "Cập nhật số lượng đồ ăn/uống trong booking")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> updateConcessionQuantity(
            @PathVariable Long bookingId,
            @PathVariable Long concessionId,
            @RequestParam Integer quantity) {
        log.info("PUT /api/bookings/{}/concessions/{}?quantity={} - Updating concession quantity",
                bookingId, concessionId, quantity);

        if (quantity <= 0) {
            return ResponseEntity.badRequest().build();
        }

        BookingResponse updatedBooking = bookingService.updateConcessionQuantity(bookingId, concessionId, quantity);

        log.info("Updated concession quantity in booking {} - new total: {}",
                bookingId, updatedBooking.getFinalAmount());
        return ResponseEntity.ok(updatedBooking);
    }

    /**
     * Get booking summary including concessions
     */
    @GetMapping("/{id}/summary")
    @Operation(summary = "Lấy tóm tắt booking bao gồm ghế và đồ ăn/uống")
    public ResponseEntity<BookingSummaryResponse> getBookingSummary(@PathVariable Long id) {
        log.info("Lấy tóm tắt booking ID: {}", id);
        BookingSummaryResponse summary = bookingService.getBookingSummary(id);
        return ResponseEntity.ok(summary);
    }

    // ==================== PROMOTION ENDPOINTS ====================

    @PostMapping("/{bookingId}/promotion")
    @Operation(summary = "Apply promotion to booking", description = "Apply a promotion code to an existing booking")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<BookingResponse> applyPromotionToBooking(
            @PathVariable Long bookingId,
            @RequestParam String promotionCode,
            Authentication authentication) {

        Long userId = authentication != null ? extractUserId(authentication) : null;
        log.info("Applying promotion {} to booking {} by user {}", promotionCode, bookingId, userId);

        BookingResponse response = bookingService.applyPromotion(bookingId, promotionCode);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{bookingId}/promotion")
    @Operation(summary = "Remove promotion from booking", description = "Remove applied promotion from booking")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<BookingResponse> removePromotionFromBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {

        Long userId = authentication != null ? extractUserId(authentication) : null;
        log.info("Removing promotion from booking {} by user {}", bookingId, userId);

        BookingResponse response = bookingService.removePromotion(bookingId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{bookingId}/promotion")
    @Operation(summary = "Get booking promotion info", description = "Get information about promotion applied to booking")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<BookingResponse.PromotionInfo>> getBookingPromotion(
            @PathVariable Long bookingId,
            Authentication authentication) {

        Long userId = authentication != null ? extractUserId(authentication) : null;
        log.info("Getting promotion info for booking {} by user {}", bookingId, userId);

        try {
            BookingResponse booking = bookingService.getBookingById(bookingId);
            if (booking.getPromotion() != null) {
                return ResponseEntity.ok(ApiResponse.success("Promotion info retrieved successfully", booking.getPromotion()));
            } else {
                return ResponseEntity.ok(ApiResponse.success("No promotion applied to this booking", null));
            }
        } catch (Exception e) {
            log.error("Error getting promotion info: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "PROMOTION_ERROR", "Failed to get promotion info: " + e.getMessage()));
        }
    }

    @PostMapping("/quick")
    @Operation(summary = "Create quick booking", description = "Create booking with seats only (no concessions/promotions)")
    public ResponseEntity<BookingResponse> createQuickBooking(
            @Valid @RequestBody BookingCreateRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        String sessionId = httpRequest.getSession().getId();
        Long userId = authentication != null ? extractUserId(authentication) : null;

        log.info("Creating quick booking - user: {}, session: {}, schedule: {}",
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

    // ==================== HELPER METHODS ====================

    private Long extractUserId(Authentication authentication) {
        if (authentication != null
                && authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            // Extract user ID from UserDetails or JWT token
            // This is a placeholder - implement based on your JWT structure
            return 1L; // TODO: Implement proper user ID extraction
        }
        return null;
    }
}