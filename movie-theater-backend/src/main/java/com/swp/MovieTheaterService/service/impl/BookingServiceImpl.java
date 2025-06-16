package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.dto.booking.*;
import com.swp.MovieTheaterService.entity.*;
import com.swp.MovieTheaterService.enums.BookingStatus;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.mapper.BookingMapper;
import com.swp.MovieTheaterService.repository.*;
import com.swp.MovieTheaterService.service.BookingService;
import com.swp.MovieTheaterService.service.ConcessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Booking Service Implementation
 * Business logic implementation for booking management
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final BookingConcessionRepository bookingConcessionRepository;
    private final ScheduleRepository scheduleRepository;
    private final SeatRepository seatRepository;
    private final AccountRepository accountRepository;
    private final BookingMapper bookingMapper;
    private final ConcessionService concessionService;

    // Booking expiration time in minutes
    private static final int BOOKING_EXPIRATION_MINUTES = 15;

    @Override
    public BookingResponse createBooking(BookingCreateRequest request, Long accountId) {
        log.info("Creating booking for account ID: {} with schedule ID: {}", accountId, request.getScheduleId());

        // Validate account exists
        Account account = findAccountById(accountId);

        // Validate and create booking
        BookingResponse booking = createBookingInternal(request, account);

        log.info("Booking created successfully with ID: {} for account: {}",
                booking.getBookingId(), account.getEmail());

        return booking;
    }

    @Override
    public BookingResponse createGuestBooking(BookingCreateRequest request) {
        log.info("Creating guest booking for schedule ID: {}", request.getScheduleId());

        // Validate guest booking information
        if (!request.isValidGuestBooking()) {
            log.warn("Invalid guest booking information");
            throw new IllegalArgumentException("Thông tin khách hàng không hợp lệ cho đặt vé khách");
        }

        // Validate selected seats
        if (request.getSeatIds() == null || request.getSeatIds().isEmpty()) {
            log.warn("No seats selected for booking");
            throw new IllegalArgumentException("Vui lòng chọn ít nhất một ghế");
        }

        // Check seat availability
        List<Long> selectedSeatIds = request.getSeatIds();

        // Validate seat count
        if (selectedSeatIds.size() > 10) {
            log.warn("Too many seats selected: {}", selectedSeatIds.size());
            throw new IllegalArgumentException("Không thể đặt quá 10 ghế trong một lần");
        }

        // Check if any seat is already booked for this schedule
        for (Long seatId : selectedSeatIds) {
            if (!areSeatsAvailable(request.getScheduleId(), List.of(seatId))) {
                throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED);
            }
        }

        // Create booking without account
        BookingResponse booking = createBookingInternal(request, null);

        log.info("Guest booking created successfully with ID: {} for customer: {}",
                booking.getBookingId(), request.getCustomerEmail());

        return booking;
    }

    private BookingResponse createBookingInternal(BookingCreateRequest request, Account account) {
        log.info("Creating booking with atomic seat locking for schedule: {}, seats: {}",
                request.getScheduleId(), request.getSeatIds());

        // 1. Validate request completely
        request.validateForBooking();

        // 2. Auto-generate sessionId if not provided
        request.ensureSessionId();
        log.info("Using sessionId: {}", request.getSessionId());

        // 3. Validate schedule exists and is bookable
        Schedule schedule = findScheduleById(request.getScheduleId());
        validateScheduleForBooking(schedule);

        // 4. Remove duplicates and collect seat IDs
        List<Long> seatIds = request.getSeatIds().stream()
                .distinct()
                .collect(Collectors.toList());

        // 5. Validate seat count limits
        if (seatIds.size() > 10) {
            throw new AppException(ErrorCode.BOOKING_SEAT_LIMIT_EXCEEDED);
        }

        // ===== ATOMIC SEAT BOOKING OPERATION =====
        // This entire block needs to be atomic to prevent race conditions

        // 6. Lock and validate seats atomically
        if (!lockAndValidateSeats(request.getScheduleId(), seatIds)) {
            throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED);
        }

        try {
            // 7. Calculate seat amount
            Double seatAmount = calculateSeatAmount(request.getScheduleId(), seatIds);
            request.setSeatAmount(seatAmount);
            log.info("Calculated seat amount: {}", seatAmount);

            // 8. Validate and calculate concession amount
            Double concessionAmount = 0.0;
            if (request.hasConcessionOrders()) {
                log.info("Processing {} concession orders", request.getConcessionOrders().size());

                // Validate each concession order
                for (ConcessionOrderRequest concessionOrder : request.getConcessionOrders()) {
                    validateConcessionOrder(concessionOrder);
                }

                concessionAmount = request.getTotalConcessionAmount().doubleValue();
                request.setConcessionAmount(concessionAmount);
                log.info("Calculated concession amount: {}", concessionAmount);
            }

            // 9. Calculate total amount before discount
            Double totalAmount = seatAmount + concessionAmount;
            request.setTotalAmount(totalAmount);

            // 10. Apply promotion discount if any
            Double discountAmount = calculatePromotionDiscount(request, totalAmount);
            request.setDiscountAmount(discountAmount);
            log.info("Applied promotion discount: {}", discountAmount);

            // 11. Calculate final amount
            Double finalAmount = totalAmount - discountAmount;
            request.setFinalAmount(finalAmount);
            log.info("Final booking amount: {} (Total: {} - Discount: {})",
                    finalAmount, totalAmount, discountAmount);

            // 12. Create booking entity
            Booking booking = createBookingEntity(request, account, schedule, totalAmount, discountAmount, finalAmount);

            // 13. Save booking first to get ID
            Booking savedBooking = bookingRepository.save(booking);
            log.info("Created booking with ID: {} and code: {}",
                    savedBooking.getBookingId(), savedBooking.getBookingCode());

            // 14. Create booking seats relationships
            createBookingSeats(savedBooking, seatIds);

            // 15. Create booking concessions relationships if any
            if (request.hasConcessionOrders()) {
                createBookingConcessions(savedBooking, request.getConcessionOrders());
                log.info("Created {} concession orders for booking {}",
                        request.getConcessionOrders().size(), savedBooking.getBookingId());
            }

            // 16. Update schedule seat counts
            updateScheduleSeatCounts(schedule, seatIds.size(), 0);

            // 17. Generate QR code for the booking
            generateQRCode(savedBooking.getBookingId());



            log.info(
                    "Booking creation completed successfully - ID: {}, Code: {}, Seats: {}, Concessions: {}, Final Amount: {}",
                    savedBooking.getBookingId(), savedBooking.getBookingCode(),
                    seatIds.size(), request.getConcessionOrders().size(), finalAmount);

            return bookingMapper.toResponse(savedBooking);

        } catch (Exception e) {
            // If anything fails, release the locked seats
            log.error("Booking creation failed, releasing locked seats: {}", seatIds, e);
            releaseSeatLocks(request.getScheduleId(), seatIds);
            throw e;
        }
    }

    /**
     * Atomically lock and validate seats for booking
     * Uses database-level locking to prevent race conditions
     */
    private boolean lockAndValidateSeats(Long scheduleId, List<Long> seatIds) {
        log.debug("Attempting to lock {} seats for schedule {}", seatIds.size(), scheduleId);

        // Get all seats with database lock
        List<Seat> seats = seatRepository.findByIdInAndLockForUpdate(seatIds);

        if (seats.size() != seatIds.size()) {
            log.warn("Some seats not found - requested: {}, found: {}", seatIds.size(), seats.size());
            return false;
        }

        // Check if any seats are already booked for this schedule
        List<BookingSeat> existingBookings = bookingSeatRepository
                .findOccupiedSeatsByScheduleAndSeatIds(scheduleId, seatIds);

        if (!existingBookings.isEmpty()) {
            List<Long> bookedSeatIds = existingBookings.stream()
                    .map(bs -> bs.getSeat().getSeatId())
                    .collect(Collectors.toList());
            log.warn("Seats already booked for schedule {}: {}", scheduleId, bookedSeatIds);
            return false;
        }

        // Check schedule capacity
        Schedule schedule = findScheduleById(scheduleId);
        if (schedule.getAvailableSeats() < seatIds.size()) {
            log.warn("Not enough available seats - requested: {}, available: {}",
                    seatIds.size(), schedule.getAvailableSeats());
            return false;
        }

        log.debug("Successfully locked {} seats for schedule {}", seatIds.size(), scheduleId);
        return true;
    }

    /**
     * Release seat locks if booking creation fails
     */
    private void releaseSeatLocks(Long scheduleId, List<Long> seatIds) {
        log.debug("Releasing seat locks for schedule {}, seats: {}", scheduleId, seatIds);
        // In this implementation, locks are released automatically when transaction
        // rollback
        // But we can add explicit cleanup if needed
    }

    /**
     * Create booking entity with all required fields
     */
    private Booking createBookingEntity(BookingCreateRequest request, Account account,
            Schedule schedule, Double totalAmount, Double discountAmount, Double finalAmount) {

        Booking booking = new Booking();

        // Basic info
        booking.setBookingCode(generateBookingCode());
        booking.setBookingDate(LocalDateTime.now());
        booking.setSeatCount(request.getSeatIds().size());

        // Amounts
        booking.setTotalAmount(totalAmount);
        booking.setDiscountAmount(discountAmount);
        booking.setFinalAmount(finalAmount);

        // Status and relationships
        booking.setBookingStatus(BookingStatus.PENDING);
        booking.setAccount(account); // null for guest bookings
        booking.setSchedule(schedule);

        // Customer information (for guest bookings or override)
        if (account == null || request.getIsGuestBooking()) {
            booking.setCustomerName(request.getCustomerName());
            booking.setCustomerEmail(request.getCustomerEmail());
            booking.setCustomerPhone(request.getCustomerPhone());
        } else {
            // Use account info as default, but allow override
            booking.setCustomerName(account.getFullName());
            booking.setCustomerEmail(account.getEmail());
            booking.setCustomerPhone(account.getPhoneNumber());
        }

        // Additional info
        booking.setNotes(request.getNotes());
        booking.setIsActive(true);

        // Timestamps
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        return booking;
    }

    @Override
    public BookingResponse updateBooking(Long bookingId, BookingUpdateRequest request) {
        log.info("Updating booking with ID: {}", bookingId);

        Booking booking = findBookingById(bookingId);

        // Check if booking can be updated
        if (booking.isPaid() || booking.isCompleted()) {
            throw new AppException(ErrorCode.BOOKING_PAYMENT_REQUIRED);
        }

        // Update booking
        bookingMapper.updateEntity(booking, request);
        Booking updatedBooking = bookingRepository.save(booking);

        log.info("Booking updated successfully with ID: {}", bookingId);
        return bookingMapper.toResponse(updatedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId) {
        log.info("Getting booking by ID: {}", bookingId);
        Booking booking = findBookingById(bookingId);
        return bookingMapper.toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingByCode(String bookingCode) {
        log.info("Getting booking by code: {}", bookingCode);

        Booking booking = bookingRepository.findByBookingCodeAndIsActiveTrue(bookingCode)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        return bookingMapper.toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> getAllBookings(Pageable pageable) {
        log.info("Getting all bookings with pagination: page={}, size={}",
                pageable.getPageNumber(), pageable.getPageSize());
        Page<Booking> bookings = bookingRepository.findAll(pageable);
        return bookings.map(bookingMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByAccount(Long accountId) {
        log.info("Getting bookings by account ID: {}", accountId);
        List<Booking> bookings = bookingRepository
                .findByAccountAccountIdAndIsActiveTrueOrderByBookingDateDesc(accountId);
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> getBookingsByAccount(Long accountId, Pageable pageable) {
        log.info("Getting bookings by account ID: {} with pagination", accountId);
        Page<Booking> bookings = bookingRepository
                .findByAccountAccountIdAndIsActiveTrueOrderByBookingDateDesc(accountId, pageable);
        return bookings.map(bookingMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsBySchedule(Long scheduleId) {
        log.info("Getting bookings by schedule ID: {}", scheduleId);
        List<Booking> bookings = bookingRepository.findByScheduleScheduleIdAndIsActiveTrue(scheduleId);
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> getBookingsBySchedule(Long scheduleId, Pageable pageable) {
        log.info("Getting bookings by schedule ID: {} with pagination", scheduleId);
        Page<Booking> bookings = bookingRepository.findByScheduleScheduleIdAndIsActiveTrue(scheduleId, pageable);
        return bookings.map(bookingMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByStatus(BookingStatus status) {
        log.info("Getting bookings by status: {}", status);
        List<Booking> bookings = bookingRepository.findByBookingStatusAndIsActiveTrue(status);
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> getBookingsByStatus(BookingStatus status, Pageable pageable) {
        log.info("Getting bookings by status: {} with pagination", status);
        Page<Booking> bookings = bookingRepository.findByBookingStatusAndIsActiveTrue(status, pageable);
        return bookings.map(bookingMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting bookings by date range: {} to {}", startDate, endDate);
        List<Booking> bookings = bookingRepository.findByBookingDateBetweenAndIsActiveTrue(startDate, endDate);
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> getBookingsByDateRange(LocalDateTime startDate, LocalDateTime endDate,
            Pageable pageable) {
        log.info("Getting bookings by date range: {} to {} with pagination", startDate, endDate);
        Page<Booking> bookings = bookingRepository.findByBookingDateBetweenAndIsActiveTrue(startDate, endDate,
                pageable);
        return bookings.map(bookingMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByCustomerEmail(String customerEmail) {
        log.info("Getting bookings by customer email: {}", customerEmail);
        List<Booking> bookings = bookingRepository
                .findByCustomerEmailAndIsActiveTrueOrderByBookingDateDesc(customerEmail);
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByCustomerPhone(String customerPhone) {
        log.info("Getting bookings by customer phone: {}", customerPhone);
        List<Booking> bookings = bookingRepository
                .findByCustomerPhoneAndIsActiveTrueOrderByBookingDateDesc(customerPhone);
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByPaymentMethod(String paymentMethod) {
        log.info("Getting bookings by payment method: {}", paymentMethod);
        List<Booking> bookings = bookingRepository.findByPaymentMethodAndIsActiveTrue(paymentMethod);
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> searchBookings(String keyword, Pageable pageable) {
        log.info("Searching bookings with keyword: {}", keyword);
        Page<Booking> bookings = bookingRepository.searchBookings(keyword, pageable);
        return bookings.map(bookingMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getTodayBookings() {
        log.info("Getting today's bookings");
        List<Booking> bookings = bookingRepository.findTodayBookings();
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getUpcomingShowBookings() {
        log.info("Getting upcoming show bookings");
        List<Booking> bookings = bookingRepository.findUpcomingShowBookings();
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsForCheckIn() {
        log.info("Getting bookings for check-in");
        List<Booking> bookings = bookingRepository.findBookingsForCheckIn();
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByMovie(Long movieId) {
        log.info("Getting bookings by movie ID: {}", movieId);
        List<Booking> bookings = bookingRepository.findByMovieId(movieId);
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByCinemaRoom(Long cinemaRoomId) {
        log.info("Getting bookings by cinema room ID: {}", cinemaRoomId);
        List<Booking> bookings = bookingRepository.findByCinemaRoomId(cinemaRoomId);
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse confirmBooking(Long bookingId) {
        log.info("Confirming booking with ID: {}", bookingId);
        Booking booking = findBookingById(bookingId);

        if (!booking.isPending()) {
            throw new AppException(ErrorCode.BOOKING_PAYMENT_REQUIRED);
        }

        booking.setBookingStatus(BookingStatus.CONFIRMED);
        Booking updatedBooking = bookingRepository.save(booking);

        log.info("Booking confirmed successfully with ID: {}", bookingId);
        return bookingMapper.toResponse(updatedBooking);
    }

    @Override
    public BookingResponse processPayment(PaymentRequest paymentRequest) {
        log.info("Processing payment for booking code: {}", paymentRequest.getBookingCode());

        // Validate payment request
        validatePaymentRequest(paymentRequest);

        // Find booking
        Booking booking = bookingRepository.findByBookingCodeAndIsActiveTrue(paymentRequest.getBookingCode())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        // Check if booking can be paid
        if (!booking.isPending() && !booking.isConfirmed()) {
            throw new AppException(ErrorCode.BOOKING_PAYMENT_REQUIRED);
        }

        // Validate payment amount
        if (!paymentRequest.getPaidAmount().equals(booking.getFinalAmount())) {
            throw new AppException(ErrorCode.PAYMENT_AMOUNT_INVALID);
        }

        // Process payment
        booking.confirmPayment(paymentRequest.getPaymentMethod(), paymentRequest.getPaymentReference());
        Booking updatedBooking = bookingRepository.save(booking);

        log.info("Payment processed successfully for booking ID: {}", booking.getBookingId());
        return bookingMapper.toResponse(updatedBooking);
    }

    @Override
    public BookingResponse cancelBooking(Long bookingId, String cancellationReason) {
        log.info("Cancelling booking with ID: {}", bookingId);
        Booking booking = findBookingById(bookingId);

        if (!booking.canBeCancelled()) {
            throw new AppException(ErrorCode.BOOKING_CANCELLED);
        }

        // Cancel booking
        booking.cancel(cancellationReason);

        // Release seats
        List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingBookingIdAndActiveTrue(bookingId);
        updateScheduleSeatCounts(booking.getSchedule(), 0, bookingSeats.size());

        Booking updatedBooking = bookingRepository.save(booking);

        log.info("Booking cancelled successfully with ID: {}", bookingId);
        return bookingMapper.toResponse(updatedBooking);
    }

    @Override
    public BookingResponse checkInBooking(String bookingCode) {
        return checkInBooking(bookingCode, false);
    }

    @Override
    public BookingResponse checkInBooking(String qrCode, boolean useQrCode) {
        log.info("Checking in booking with {}: {}", useQrCode ? "QR code" : "booking code", qrCode);

        Booking booking;
        if (useQrCode) {
            booking = bookingRepository.findByQrCodeAndIsActiveTrue(qrCode)
                    .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        } else {
            booking = bookingRepository.findByBookingCodeAndIsActiveTrue(qrCode)
                    .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        }

        if (!booking.canBeCheckedIn()) {
            throw new AppException(ErrorCode.BOOKING_EXPIRED);
        }

        // Check-in booking
        booking.checkIn();
        Booking updatedBooking = bookingRepository.save(booking);

        log.info("Booking checked in successfully with ID: {}", booking.getBookingId());
        return bookingMapper.toResponse(updatedBooking);
    }

    @Override
    public BookingResponse applyPromotion(Long bookingId, String promotionCode) {
        log.info("Applying promotion {} to booking ID: {}", promotionCode, bookingId);
        Booking booking = findBookingById(bookingId);

        if (!booking.isPending() && !booking.isConfirmed()) {
            throw new AppException(ErrorCode.PROMOTION_NOT_APPLICABLE);
        }

        // TODO: Implement promotion logic when Promotion service is available
        // For now, just return the booking as is
        log.warn("Promotion service not implemented yet");
        return bookingMapper.toResponse(booking);
    }

    @Override
    public BookingResponse removePromotion(Long bookingId) {
        log.info("Removing promotion from booking ID: {}", bookingId);
        Booking booking = findBookingById(bookingId);

        if (!booking.isPending() && !booking.isConfirmed()) {
            throw new AppException(ErrorCode.PROMOTION_NOT_APPLICABLE);
        }

        // Remove promotion
        booking.setPromotion(null);
        booking.setDiscountAmount(0.0);
        booking.setFinalAmount(booking.getTotalAmount());

        Booking updatedBooking = bookingRepository.save(booking);

        log.info("Promotion removed successfully from booking ID: {}", bookingId);
        return bookingMapper.toResponse(updatedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getAvailableSeats(Long scheduleId) {
        log.info("Getting available seats for schedule ID: {}", scheduleId);

        // Get all seats for the cinema room
        Schedule schedule = findScheduleById(scheduleId);
        List<Seat> allSeats = seatRepository
                .findByCinemaRoomCinemaRoomIdAndIsActiveTrue(schedule.getCinemaRoom().getCinemaRoomId());

        // Get booked seats
        List<Long> bookedSeatIds = getBookedSeats(scheduleId);

        // Return available seats
        return allSeats.stream()
                .map(Seat::getSeatId)
                .filter(seatId -> !bookedSeatIds.contains(seatId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getBookedSeats(Long scheduleId) {
        log.info("Getting booked seats for schedule ID: {}", scheduleId);
        return bookingSeatRepository.getBookedSeatIdsForSchedule(scheduleId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean areSeatsAvailable(Long scheduleId, List<Long> seatIds) {
        List<Long> bookedSeats = getBookedSeats(scheduleId);
        return seatIds.stream().noneMatch(bookedSeats::contains);
    }

    @Override
    public String generateQRCode(Long bookingId) {
        log.info("Generating QR code for booking ID: {}", bookingId);
        Booking booking = findBookingById(bookingId);

        if (booking.getQrCode() == null) {
            String qrCode = generateQRCodeInternal();
            booking.setQrCode(qrCode);
            bookingRepository.save(booking);
        }

        return booking.getQrCode();
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse validateQRCode(String qrCode) {
        log.info("Validating QR code: {}", qrCode);
        Booking booking = bookingRepository.findByQrCodeAndIsActiveTrue(qrCode)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        return bookingMapper.toResponse(booking);
    }

    @Override
    public void deleteBooking(Long bookingId) {
        log.info("Soft deleting booking with ID: {}", bookingId);
        Booking booking = findBookingById(bookingId);

        if (booking.isPaid() || booking.isCompleted()) {
            throw new AppException(ErrorCode.BOOKING_PAYMENT_REQUIRED);
        }

        // Release seats if booking is confirmed
        if (booking.isConfirmed()) {
            List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingBookingIdAndActiveTrue(bookingId);
            updateScheduleSeatCounts(booking.getSchedule(), 0, bookingSeats.size());
        }

        booking.setIsActive(false);
        bookingRepository.save(booking);

        log.info("Booking soft deleted successfully with ID: {}", bookingId);
    }

    @Override
    public BookingResponse restoreBooking(Long bookingId) {
        log.info("Restoring booking with ID: {}", bookingId);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        booking.setIsActive(true);
        Booking restoredBooking = bookingRepository.save(booking);

        log.info("Booking restored successfully with ID: {}", bookingId);
        return bookingMapper.toResponse(restoredBooking);
    }

    @Override
    public int cleanupExpiredBookings() {
        log.info("Cleaning up expired pending bookings");
        LocalDateTime expiredTime = LocalDateTime.now().minusMinutes(BOOKING_EXPIRATION_MINUTES);
        List<Booking> expiredBookings = bookingRepository.findExpiredPendingBookings(expiredTime);

        int cleanedCount = 0;
        for (Booking booking : expiredBookings) {
            try {
                cancelBooking(booking.getBookingId(), "Tự động hủy do hết hạn");
                cleanedCount++;
            } catch (Exception e) {
                log.error("Failed to cleanup expired booking ID: {}", booking.getBookingId(), e);
            }
        }

        log.info("Cleaned up {} expired bookings", cleanedCount);
        return cleanedCount;
    }

    @Override
    @Transactional(readOnly = true)
    public BookingStatistics getBookingStatistics() {
        log.info("Getting booking statistics");
        return calculateStatistics(null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingStatistics getBookingStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting booking statistics for date range: {} to {}", startDate, endDate);
        return calculateStatistics(startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public Double getRevenue(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting revenue for date range: {} to {}", startDate, endDate);
        Double revenue = bookingRepository.getTotalRevenue(startDate, endDate);
        return revenue != null ? revenue : 0.0;
    }

    @Override
    @Transactional(readOnly = true)
    public Double getRevenueByPaymentMethod(String paymentMethod) {
        log.info("Getting revenue by payment method: {}", paymentMethod);
        Double revenue = bookingRepository.getRevenueByPaymentMethod(paymentMethod);
        return revenue != null ? revenue : 0.0;
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAverageBookingAmount() {
        log.info("Getting average booking amount");
        Double average = bookingRepository.getAverageBookingAmount();
        return average != null ? average : 0.0;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsRequiringRefund() {
        log.info("Getting bookings requiring refund");
        List<Booking> bookings = bookingRepository.findBookingsRequiringRefund();
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse processRefund(Long bookingId, Double refundAmount) {
        log.info("Processing refund for booking ID: {} amount: {}", bookingId, refundAmount);
        Booking booking = findBookingById(bookingId);

        if (!booking.isCancelled()) {
            throw new AppException(ErrorCode.PAYMENT_REFUND_FAILED);
        }

        if (refundAmount > booking.getFinalAmount()) {
            throw new AppException(ErrorCode.PAYMENT_AMOUNT_INVALID);
        }

        booking.setRefundAmount(refundAmount);
        Booking updatedBooking = bookingRepository.save(booking);

        log.info("Refund processed successfully for booking ID: {}", bookingId);
        return bookingMapper.toResponse(updatedBooking);
    }

    // ==================== CONCESSION MANAGEMENT ====================

    @Override
    @Transactional(readOnly = true)
    public List<BookingConcessionResponse> getBookingConcessions(Long bookingId) {
        log.info("Getting concessions for booking ID: {}", bookingId);

        // Validate booking exists
        findBookingById(bookingId);

        List<BookingConcession> concessions = bookingConcessionRepository
                .findByBookingBookingIdAndIsActiveTrue(bookingId);

        List<BookingConcessionResponse> responses = concessions.stream()
                .map(this::mapToBookingConcessionResponse)
                .collect(Collectors.toList());

        log.info("Found {} concession orders for booking {}", responses.size(), bookingId);
        return responses;
    }

    @Override
    public BookingResponse addConcessionToBooking(Long bookingId, ConcessionOrderRequest request) {
        log.info("Adding concession {} to booking {}", request.getConcessionId(), bookingId);

        Booking booking = findBookingById(bookingId);

        // Only allow adding concessions to PENDING bookings
        if (!booking.isPending()) {
            throw new IllegalArgumentException("Chỉ có thể thêm đồ ăn/uống vào booking đang chờ xử lý");
        }

        // Validate concession availability
        if (!concessionService.isAvailableForOrder(request.getConcessionId(), request.getQuantity())) {
            Concession concession = concessionService.getConcessionById(request.getConcessionId());
            throw new IllegalArgumentException(
                    String.format("Không đủ số lượng cho %s (yêu cầu: %d, còn lại: %d)",
                            concession.getFullName(),
                            request.getQuantity(),
                            concession.getStockQuantity()));
        }

        // Create new concession order
        createBookingConcessions(booking, List.of(request));

        // Update booking total amount
        updateBookingAmountWithConcessions(booking);

        log.info("Added concession to booking {} - new total: {}", bookingId, booking.getFinalAmount());
        return bookingMapper.toResponse(booking);
    }

    @Override
    public BookingResponse removeConcessionFromBooking(Long bookingId, Long concessionId) {
        log.info("Removing concession {} from booking {}", concessionId, bookingId);

        Booking booking = findBookingById(bookingId);

        // Only allow removing concessions from PENDING bookings
        if (!booking.isPending()) {
            throw new IllegalArgumentException("Chỉ có thể xóa đồ ăn/uống từ booking đang chờ xử lý");
        }

        // Find and remove concession
        List<BookingConcession> concessions = bookingConcessionRepository
                .findByBookingBookingIdAndIsActiveTrue(bookingId);
        BookingConcession toRemove = concessions.stream()
                .filter(bc -> bc.getConcession().getConcessionId().equals(concessionId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đồ ăn/uống trong booking"));

        // Restore stock
        concessionService.updateStock(concessionId, -toRemove.getQuantity()); // Negative to restore

        // Soft delete concession
        toRemove.setIsActive(false);
        bookingConcessionRepository.save(toRemove);

        // Update booking total amount
        updateBookingAmountWithConcessions(booking);

        log.info("Removed concession from booking {} - new total: {}", bookingId, booking.getFinalAmount());
        return bookingMapper.toResponse(booking);
    }

    @Override
    public BookingResponse updateConcessionQuantity(Long bookingId, Long concessionId, Integer quantity) {
        log.info("Updating concession {} quantity to {} in booking {}", concessionId, quantity, bookingId);

        Booking booking = findBookingById(bookingId);

        // Only allow updating concessions in PENDING bookings
        if (!booking.isPending()) {
            throw new IllegalArgumentException("Chỉ có thể cập nhật đồ ăn/uống trong booking đang chờ xử lý");
        }

        // Find concession in booking
        List<BookingConcession> concessions = bookingConcessionRepository
                .findByBookingBookingIdAndIsActiveTrue(bookingId);
        BookingConcession toUpdate = concessions.stream()
                .filter(bc -> bc.getConcession().getConcessionId().equals(concessionId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đồ ăn/uống trong booking"));

        // Calculate stock change
        Integer oldQuantity = toUpdate.getQuantity();
        Integer stockChange = quantity - oldQuantity;

        // Validate availability for increase
        if (stockChange > 0 && !concessionService.isAvailableForOrder(concessionId, stockChange)) {
            Concession concession = concessionService.getConcessionById(concessionId);
            throw new IllegalArgumentException(
                    String.format("Không đủ số lượng để tăng %s (yêu cầu thêm: %d, còn lại: %d)",
                            concession.getFullName(),
                            stockChange,
                            concession.getStockQuantity()));
        }

        // Update quantity and total price
        toUpdate.setQuantity(quantity);
        toUpdate.setTotalPrice(toUpdate.getUnitPrice().multiply(new BigDecimal(quantity)));
        bookingConcessionRepository.save(toUpdate);

        // Update stock
        concessionService.updateStock(concessionId, stockChange);

        // Update booking total amount
        updateBookingAmountWithConcessions(booking);

        log.info("Updated concession quantity in booking {} - new total: {}", bookingId, booking.getFinalAmount());
        return bookingMapper.toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingSummaryResponse getBookingSummary(Long bookingId) {
        log.info("Getting booking summary for ID: {}", bookingId);

        Booking booking = findBookingById(bookingId);

        // Get booking seats
        List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingBookingId(bookingId);

        // Get booking concessions
        List<BookingConcession> bookingConcessions = bookingConcessionRepository
                .findByBookingBookingIdAndIsActiveTrue(bookingId);

        // Map to summary response
        BookingSummaryResponse summary = mapToBookingSummaryResponse(booking, bookingSeats, bookingConcessions);

        log.info("Generated summary for booking {} - {} seats, {} concessions",
                bookingId, summary.getSeatCount(), summary.getConcessionItems());
        return summary;
    }

    // ==================== HELPER METHODS FOR CONCESSIONS ====================

    private void updateBookingAmountWithConcessions(Booking booking) {
        // Calculate seat amount
        List<BookingSeat> seats = bookingSeatRepository.findByBookingBookingId(booking.getBookingId());
        Double seatAmount = seats.stream()
                .mapToDouble(BookingSeat::getSeatPrice)
                .sum();

        // Calculate concession amount
        BigDecimal concessionAmount = bookingConcessionRepository
                .calculateTotalConcessionAmount(booking.getBookingId());

        // Update booking amounts
        booking.setTotalAmount(seatAmount + concessionAmount.doubleValue());
        booking.setFinalAmount(
                booking.getTotalAmount() - (booking.getDiscountAmount() != null ? booking.getDiscountAmount() : 0.0));

        bookingRepository.save(booking);
    }

    private BookingConcessionResponse mapToBookingConcessionResponse(BookingConcession bookingConcession) {
        BookingConcessionResponse response = new BookingConcessionResponse();
        response.setBookingConcessionId(bookingConcession.getBookingConcessionId());
        response.setBookingId(bookingConcession.getBooking().getBookingId());
        response.setConcessionId(bookingConcession.getConcession().getConcessionId());
        response.setConcessionName(bookingConcession.getConcession().getFullName());
        response.setConcessionCategory(bookingConcession.getConcession().getCategory().name());
        response.setConcessionImageUrl(bookingConcession.getConcession().getImageUrl());
        response.setQuantity(bookingConcession.getQuantity());
        response.setUnitPrice(bookingConcession.getUnitPrice());
        response.setTotalPrice(bookingConcession.getTotalPrice());
        response.setNotes(bookingConcession.getNotes());
        response.setCreatedAt(bookingConcession.getCreatedAt());
        return response;
    }

    private BookingSummaryResponse mapToBookingSummaryResponse(Booking booking,
            List<BookingSeat> bookingSeats,
            List<BookingConcession> bookingConcessions) {
        BookingSummaryResponse summary = new BookingSummaryResponse();

        // Basic booking info
        summary.setBookingId(booking.getBookingId());
        summary.setBookingCode(booking.getBookingCode());
        summary.setBookingStatus(booking.getBookingStatus().name());
        summary.setBookingDate(booking.getBookingDate());

        // Movie and schedule info
        summary.setMovieTitle(booking.getSchedule().getMovie().getTitle());
        summary.setShowDateTime(booking.getSchedule().getShowDateTime());
        summary.setCinemaRoomName(booking.getSchedule().getCinemaRoom().getCinemaRoomName());

        // Customer info
        summary.setCustomerName(booking.getCustomerDisplayName());
        summary.setCustomerEmail(booking.getCustomerDisplayEmail());
        summary.setCustomerPhone(booking.getCustomerDisplayPhone());

        // Seat information
        summary.setSeatCount(booking.getSeatCount());
        List<BookingSummaryResponse.SeatSummary> seats = bookingSeats.stream()
                .map(this::mapToSeatSummary)
                .collect(Collectors.toList());
        summary.setSeats(seats);
        summary.setSeatAmount(bookingSeats.stream().mapToDouble(BookingSeat::getSeatPrice).sum());

        // Concession information
        summary.setConcessionItems(bookingConcessions.size());
        List<BookingConcessionResponse> concessions = bookingConcessions.stream()
                .map(this::mapToBookingConcessionResponse)
                .collect(Collectors.toList());
        summary.setConcessions(concessions);
        summary.setConcessionAmount(bookingConcessions.stream()
                .mapToDouble(bc -> bc.getTotalPrice().doubleValue())
                .sum());

        // Payment information
        summary.setTotalAmount(booking.getTotalAmount());
        summary.setDiscountAmount(booking.getDiscountAmount());
        summary.setFinalAmount(booking.getFinalAmount());
        summary.setPaymentMethod(booking.getPaymentMethod());
        summary.setPaymentDate(booking.getPaymentDate());

        // Additional info
        summary.setNotes(booking.getNotes());
        summary.setQrCode(booking.getQrCode());
        summary.setIsCheckedIn(booking.getIsCheckedIn());
        summary.setCheckInTime(booking.getCheckInTime());

        return summary;
    }

    private BookingSummaryResponse.SeatSummary mapToSeatSummary(BookingSeat bookingSeat) {
        BookingSummaryResponse.SeatSummary seatSummary = new BookingSummaryResponse.SeatSummary();
        seatSummary.setSeatId(bookingSeat.getSeat().getSeatId());
        seatSummary.setSeatNumber(bookingSeat.getSeat().getSeatNumber());
        seatSummary.setSeatType(bookingSeat.getSeat().getSeatType());
        seatSummary.setSeatPrice(bookingSeat.getSeatPrice());
        seatSummary.setIsVIP(bookingSeat.getSeat().isVIP());
        seatSummary.setIsCouple(bookingSeat.getSeat().isCouple());
        return seatSummary;
    }

    // Helper methods
    private Booking findBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .filter(Booking::getIsActive)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
    }

    private Schedule findScheduleById(Long scheduleId) {
        return scheduleRepository.findById(scheduleId)
                .filter(Schedule::getIsActive)
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));
    }

    private Account findAccountById(Long accountId) {
        return accountRepository.findById(accountId)
                .filter(Account::getIsActive)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private void validateScheduleForBooking(Schedule schedule) {
        if (!schedule.isBookable()) {
            throw new AppException(ErrorCode.SCHEDULE_NOT_BOOKABLE);
        }

        if (schedule.getAvailableSeats() <= 0) {
            throw new AppException(ErrorCode.SEAT_NOT_AVAILABLE);
        }
    }

    private void validatePaymentRequest(PaymentRequest request) {
        if (request.isCardPayment() && !request.hasValidCardDetails()) {
            throw new AppException(ErrorCode.PAYMENT_METHOD_INVALID);
        }

        if (request.isOnlinePayment() && !request.hasValidOnlineDetails()) {
            throw new AppException(ErrorCode.PAYMENT_METHOD_INVALID);
        }

        if (request.isWalletPayment() && !request.hasValidWalletDetails()) {
            throw new AppException(ErrorCode.PAYMENT_METHOD_INVALID);
        }
    }

    private void createBookingSeats(Booking booking, List<Long> seatIds) {
        List<BookingSeat> bookingSeats = new ArrayList<>();

        // Get schedule to calculate correct seat prices
        Schedule schedule = booking.getSchedule();
        Double basePrice = schedule.getPrice();

        for (Long seatId : seatIds) {
            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new AppException(ErrorCode.SEAT_NOT_FOUND));

            // Calculate correct seat price: schedule base price * seat price multiplier
            Double correctSeatPrice = basePrice * seat.getPriceMultiplier();

            BookingSeat bookingSeat = new BookingSeat();
            bookingSeat.setBooking(booking);
            bookingSeat.setSeat(seat);
            bookingSeat.setSeatPrice(correctSeatPrice); // Use calculated price instead of seat.getSeatPrice()
            bookingSeat.setSeatType(seat.getSeatType());
            bookingSeat.setSeatNumber(seat.getSeatNumber());
            bookingSeat.setActive(true);
            bookingSeat.setCreatedAt(LocalDateTime.now());
            bookingSeat.setUpdatedAt(LocalDateTime.now());

            bookingSeats.add(bookingSeat);

            log.debug("Created booking seat: {} - Base price: {}, Multiplier: {}, Final price: {}",
                    seat.getSeatNumber(), basePrice, seat.getPriceMultiplier(), correctSeatPrice);
        }

        bookingSeatRepository.saveAll(bookingSeats);
        log.info("Created {} booking seats with correct pricing", bookingSeats.size());
    }

    /**
     * Create booking concessions relationships
     */
    private void createBookingConcessions(Booking booking, List<ConcessionOrderRequest> concessionOrders) {
        List<BookingConcession> bookingConcessions = new ArrayList<>();

        for (ConcessionOrderRequest order : concessionOrders) {
            // Get concession details
            Concession concession = concessionService.getConcessionById(order.getConcessionId());

            // Validate availability again (double check)
            if (!concessionService.isAvailableForOrder(order.getConcessionId(), order.getQuantity())) {
                throw new IllegalArgumentException(
                        String.format("Không đủ số lượng cho %s", concession.getFullName()));
            }

            // Create booking concession entity
            BookingConcession bookingConcession = BookingConcession.builder()
                    .booking(booking)
                    .concession(concession)
                    .quantity(order.getQuantity())
                    .unitPrice(order.getUnitPrice())
                    .totalPrice(order.getTotalPrice())
                    .notes(order.getNotes())
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            bookingConcessions.add(bookingConcession);

            // Update concession stock
            concessionService.updateStock(order.getConcessionId(), order.getQuantity());

            log.debug("Created concession order: {} x {} = {}",
                    concession.getFullName(), order.getQuantity(), order.getFormattedTotalPrice());
        }

        bookingConcessionRepository.saveAll(bookingConcessions);
        log.info("Saved {} concession orders for booking {}",
                bookingConcessions.size(), booking.getBookingId());
    }

    private void updateScheduleSeatCounts(Schedule schedule, int bookedSeatsToAdd, int bookedSeatsToRemove) {
        schedule.setBookedSeats(schedule.getBookedSeats() + bookedSeatsToAdd - bookedSeatsToRemove);
        schedule.setAvailableSeats(schedule.getAvailableSeats() - bookedSeatsToAdd + bookedSeatsToRemove);
        scheduleRepository.save(schedule);
    }

    private String generateQRCodeInternal() {
        return "QR" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generateBookingCode() {
        // Format: BK + timestamp (10 digits) + random (6 chars) = BK + 16 chars = 18
        // chars total
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(3); // Lấy 10 số cuối
        String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        return "BK" + timestamp + randomPart;
    }

    private String generateSessionId() {
        // Format: SESSION-YYYYMMDD-HHMMSS-RANDOM
        LocalDateTime now = LocalDateTime.now();
        String datePart = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String timePart = now.format(DateTimeFormatter.ofPattern("HHmmss"));
        String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "SESSION-" + datePart + "-" + timePart + "-" + randomPart;
    }

    private Double calculateSeatAmount(Long scheduleId, List<Long> seatIds) {
        try {
            Double totalAmount = 0.0;

            // Get schedule to get base price
            Schedule schedule = findScheduleById(scheduleId);
            Double basePrice = schedule.getPrice();

            // Calculate total seat prices based on schedule price and seat multiplier
            for (Long seatId : seatIds) {
                Seat seat = seatRepository.findById(seatId)
                        .orElseThrow(() -> new AppException(ErrorCode.SEAT_NOT_FOUND));

                // Calculate seat price: schedule base price * seat price multiplier
                Double seatPrice = basePrice * seat.getPriceMultiplier();
                totalAmount += seatPrice;

                log.debug("Seat {} - Base price: {}, Multiplier: {}, Final price: {}",
                        seat.getSeatNumber(), basePrice, seat.getPriceMultiplier(), seatPrice);
            }

            log.info("Total seat amount for {} seats: {}", seatIds.size(), totalAmount);
            return totalAmount;
        } catch (Exception e) {
            log.error("Error calculating seat amount: {}", e.getMessage());
            return 0.0;
        }
    }

    private Double calculatePromotionDiscount(BookingCreateRequest request, Double totalAmount) {
        // TODO: Implement promotion logic based on promotion code or ID
        // For now, return 0 - this should be implemented with PromotionService
        if (request.hasPromotionCode()) {
            log.info("Promotion code '{}' will be processed later", request.getPromotionCode());
        }
        if (request.hasPromotionCode()) {
            log.info("Promotion ID {} will be processed later", request.getPromotionCode());
        }
        return 0.0;
    }

    private void applyRewardPointsDiscount(Booking booking, Account account, Integer rewardPointsToUse) {
        // TODO: Implement reward points logic
        // This should integrate with LoyaltyService when available
        log.info("Reward points {} will be applied for account {} later",
                rewardPointsToUse, account.getAccountId());
    }

    private void validateConcessionOrder(ConcessionOrderRequest order) {
        // Validate order structure
        if (!order.isValidOrder()) {
            throw new IllegalArgumentException("Đơn hàng đồ ăn/uống không hợp lệ");
        }

        // Validate concession exists and is available
        Concession concession = concessionService.getConcessionById(order.getConcessionId());

        if (!concession.isInStock()) {
            throw new IllegalArgumentException(
                    String.format("Món %s hiện không có sẵn", concession.getFullName()));
        }

        // Validate quantity availability
        if (!concessionService.isAvailableForOrder(order.getConcessionId(), order.getQuantity())) {
            throw new IllegalArgumentException(
                    String.format("Không đủ số lượng cho %s (yêu cầu: %d, còn lại: %d)",
                            concession.getFullName(),
                            order.getQuantity(),
                            concession.getStockQuantity()));
        }

        // Validate price consistency
        if (order.getUnitPrice().compareTo(concession.getPrice()) != 0) {
            log.warn("Price mismatch for concession {}: expected {}, got {}",
                    concession.getFullName(), concession.getPrice(), order.getUnitPrice());
            // Update to correct price
            order.setUnitPrice(concession.getPrice());
        }

        log.debug("Validated concession order: {} x {} = {}",
                concession.getFullName(), order.getQuantity(), order.getFormattedTotalPrice());
    }

    private BookingStatistics calculateStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        List<Booking> bookings;

        if (startDate != null && endDate != null) {
            bookings = bookingRepository.findByBookingDateBetweenAndIsActiveTrue(startDate, endDate);
        } else {
            bookings = bookingRepository.findAll().stream()
                    .filter(Booking::getIsActive)
                    .collect(Collectors.toList());
        }

        Long totalBookings = (long) bookings.size();
        Long pendingCount = bookings.stream().mapToLong(b -> b.isPending() ? 1 : 0).sum();
        Long confirmedCount = bookings.stream().mapToLong(b -> b.isConfirmed() ? 1 : 0).sum();
        Long paidCount = bookings.stream().mapToLong(b -> b.isPaid() ? 1 : 0).sum();
        Long completedCount = bookings.stream().mapToLong(b -> b.isCompleted() ? 1 : 0).sum();
        Long cancelledCount = bookings.stream().mapToLong(b -> b.isCancelled() ? 1 : 0).sum();

        Long totalSeatsBooked = bookings.stream().mapToLong(Booking::getSeatCount).sum();

        Double totalRevenue = bookings.stream()
                .filter(b -> b.isPaid() || b.isCompleted())
                .mapToDouble(Booking::getFinalAmount)
                .sum();

        Double averageBookingAmount = bookings.stream()
                .filter(b -> b.isPaid() || b.isCompleted())
                .mapToDouble(Booking::getFinalAmount)
                .average()
                .orElse(0.0);

        Long guestBookings = bookings.stream().mapToLong(b -> b.isGuestBooking() ? 1 : 0).sum();
        Long memberBookings = bookings.stream().mapToLong(b -> b.isMemberBooking() ? 1 : 0).sum();

        Long cashPayments = bookings.stream().mapToLong(b -> "CASH".equals(b.getPaymentMethod()) ? 1 : 0).sum();
        Long cardPayments = bookings.stream().mapToLong(b -> "CARD".equals(b.getPaymentMethod()) ? 1 : 0).sum();
        Long onlinePayments = bookings.stream().mapToLong(b -> "ONLINE".equals(b.getPaymentMethod()) ? 1 : 0).sum();
        Long walletPayments = bookings.stream().mapToLong(b -> "WALLET".equals(b.getPaymentMethod()) ? 1 : 0).sum();

        Double refundAmount = bookings.stream()
                .filter(b -> b.getRefundAmount() != null)
                .mapToDouble(Booking::getRefundAmount)
                .sum();

        Long checkedInBookings = bookings.stream().mapToLong(b -> b.getIsCheckedIn() ? 1 : 0).sum();

        return new BookingStatistics(totalBookings, pendingCount, confirmedCount, paidCount,
                completedCount, cancelledCount, totalSeatsBooked, totalRevenue,
                averageBookingAmount, guestBookings, memberBookings, cashPayments,
                cardPayments, onlinePayments, walletPayments, refundAmount, checkedInBookings);
    }
}