package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.booking.*;
import com.swp.MovieTheaterService.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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

/**
 * Booking Controller
 * REST API endpoints for ticket booking management
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Booking Management", description = "APIs for managing ticket bookings")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Create new booking", description = "Create a new ticket booking")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<BookingResponse> createBooking(
            @RequestBody BookingCreateRequest request,
            Authentication authentication) {
        log.info("Creating new booking for schedule: {}", request.getScheduleId());
        
        // Get user ID from authentication (simplified)
        Long accountId = 1L; // TODO: Get from authentication
        BookingResponse response = bookingService.createBooking(request, accountId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update booking", description = "Update an existing booking (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable Long id,
            @RequestBody BookingUpdateRequest request) {
        log.info("Updating booking with ID: {}", id);
        
        BookingResponse response = bookingService.updateBooking(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Get booking by ID", description = "Retrieve booking details by ID")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable Long id) {
        log.info("Fetching booking with ID: {}", id);
        
        BookingResponse response = bookingService.getBookingById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/payment")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Process payment", description = "Process payment for a booking")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<BookingResponse> processPayment(
            @PathVariable Long id,
            @RequestBody PaymentRequest paymentRequest) {
        log.info("Processing payment for booking ID: {}", id);
        
        BookingResponse response = bookingService.processPayment(paymentRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Confirm booking", description = "Confirm a pending booking")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<BookingResponse> confirmBooking(@PathVariable Long id) {
        log.info("Confirming booking with ID: {}", id);
        
        BookingResponse response = bookingService.confirmBooking(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Cancel booking", description = "Cancel a booking")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @RequestParam(defaultValue = "User cancelled") String reason) {
        log.info("Cancelling booking with ID: {}", id);
        
        BookingResponse response = bookingService.cancelBooking(id, reason);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/qr-code")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Generate QR code", description = "Generate QR code for a booking")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<String> generateQRCode(@PathVariable Long id) {
        log.info("Generating QR code for booking ID: {}", id);
        
        String qrCode = bookingService.generateQRCode(id);
        return ResponseEntity.ok(qrCode);
    }

    @PostMapping("/validate-qr")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Validate QR code", description = "Validate booking QR code")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<BookingResponse> validateQRCode(@RequestParam String qrCode) {
        log.info("Validating QR code: {}", qrCode);
        
        BookingResponse response = bookingService.validateQRCode(qrCode);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete booking", description = "Delete a booking (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        log.info("Deleting booking with ID: {}", id);
        
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all bookings", description = "Retrieve all bookings with pagination (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Page<BookingResponse>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "bookingDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        log.info("Fetching all bookings - page: {}, size: {}", page, size);
        
        Sort sort = Sort.by(sortDirection.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<BookingResponse> bookings = bookingService.getAllBookings(pageable);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Get user bookings", description = "Retrieve bookings for a specific user")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<BookingResponse>> getUserBookings(@PathVariable Long userId) {
        log.info("Fetching bookings for user ID: {}", userId);
        
        List<BookingResponse> bookings = bookingService.getBookingsByAccount(userId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Get current user bookings", description = "Retrieve bookings for current authenticated user")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Page<BookingResponse>> getMyBookings(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Fetching bookings for current user");
        
        // Get user ID from authentication (simplified)
        Long accountId = 1L; // TODO: Get from authentication
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<BookingResponse> bookings = bookingService.getBookingsByAccount(accountId, pageable);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/schedule/{scheduleId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get bookings by schedule", description = "Retrieve bookings for a specific schedule (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<BookingResponse>> getBookingsBySchedule(@PathVariable Long scheduleId) {
        log.info("Fetching bookings for schedule ID: {}", scheduleId);
        
        List<BookingResponse> bookings = bookingService.getBookingsBySchedule(scheduleId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get bookings by status", description = "Retrieve bookings filtered by status (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<BookingResponse>> getBookingsByStatus(@PathVariable String status) {
        log.info("Fetching bookings by status: {}", status);
        
        // Convert string to enum (simplified)
        // TODO: Proper enum conversion with error handling
        List<BookingResponse> bookings = bookingService.getBookingsByStatus(null); // Simplified
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get bookings by date range", description = "Retrieve bookings within a date range (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Page<BookingResponse>> getBookingsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Fetching bookings from {} to {}", fromDate, toDate);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<BookingResponse> bookings = bookingService.getBookingsByDateRange(fromDate, toDate, pageable);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get booking statistics", description = "Get comprehensive booking statistics (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<BookingService.BookingStatistics> getBookingStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {
        
        log.info("Fetching booking statistics from {} to {}", fromDate, toDate);
        
        BookingService.BookingStatistics statistics = bookingService.getBookingStatistics(fromDate, toDate);
        return ResponseEntity.ok(statistics);
    }
} 