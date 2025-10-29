package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.dto.booking.*;
import com.swp.MovieTheaterService.entity.*;
import com.swp.MovieTheaterService.enums.BookingStatus;
import com.swp.MovieTheaterService.enums.SeatStatus;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.mapper.BookingMapper;
import com.swp.MovieTheaterService.repository.*;
import com.swp.MovieTheaterService.service.BookingService;
import com.swp.MovieTheaterService.service.ConcessionService;
import com.swp.MovieTheaterService.service.PromotionService;
import com.swp.MovieTheaterService.service.SeatReservationService;
import com.swp.MovieTheaterService.service.LoyaltyService;
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
 * @author Ngo Viet Trinh
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
    private final PromotionRepository promotionRepository;
    private final BookingMapper bookingMapper;
    private final ConcessionService concessionService;
    private final PromotionService promotionService;
    private final SeatReservationService seatReservationService;
    private final LoyaltyService loyaltyService;

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
            throw new AppException(ErrorCode.BOOKING_INVALID_CUSTOMER_INFO);
        }

        // Validate selected seats
        if (request.getSeatIds() == null || request.getSeatIds().isEmpty()) {
            log.warn("No seats selected for booking");
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Vui lòng chọn ít nhất một ghế");
        }

        // Check seat availability
        List<Long> selectedSeatIds = request.getSeatIds();

        // Validate seat count
        if (selectedSeatIds.size() > 10) {
            log.warn("Too many seats selected: {}", selectedSeatIds.size());
            throw new AppException(ErrorCode.BOOKING_SEAT_LIMIT_EXCEEDED);
        }

        // Seat availability will be checked in the main booking flow via SeatReservationService

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

        // 6. Validate seats adjacency if booking multiple seats
        if (seatIds.size() >= 2) {
            validateSeatsAdjacency(seatIds);
        }

        // ===== TEMPORARY SEAT RESERVATION OPERATION =====
        // Reserve seats temporarily for 15 minutes using SeatReservationService
        
        // 7. Create temporary reservation for seats using booking code as session
        String sessionId = "BOOKING_" + generateBookingCode();
        Long userId = account != null ? account.getAccountId() : null;
        
        if (!seatReservationService.reserveSeatsTemporarily(request.getScheduleId(), seatIds, sessionId, userId)) {
            throw new AppException(ErrorCode.SEAT_ALREADY_BOOKED);
        }
        
        log.info("Successfully reserved {} seats temporarily for session: {}", seatIds.size(), sessionId);

        try {
            // 7. Calculate seat amount
            Double seatAmount = calculateSeatAmount(request.getScheduleId(), seatIds);
            request.setSeatAmount(seatAmount);
            log.info("Calculated seat amount: {}", seatAmount);

            // 8. Validate and calculate concession amount
            Double concessionAmount = 0.0;
            if (request.hasConcessionOrders()) {
                log.info("Processing {} concession orders", request.getConcessionOrders().size());
                log.debug("Concession orders details: {}", request.getConcessionOrders());

                // Validate each concession order
                for (ConcessionOrderRequest concessionOrder : request.getConcessionOrders()) {
                    validateConcessionOrder(concessionOrder);
                }

                // Calculate total concession amount from database prices
                concessionAmount = calculateConcessionAmount(request.getConcessionOrders());
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
                log.info("Starting to create {} concession orders for booking {}", 
                        request.getConcessionOrders().size(), savedBooking.getBookingId());
                createBookingConcessions(savedBooking, request.getConcessionOrders());
                log.info("Successfully created {} concession orders for booking {}",
                        request.getConcessionOrders().size(), savedBooking.getBookingId());
            } else {
                log.warn("No concession orders found in request for booking {}", savedBooking.getBookingId());
            }

            // 16. Update schedule seat counts
            updateScheduleSeatCounts(schedule, seatIds.size(), 0);

            // 17. Generate QR code for the booking
            generateQRCode(savedBooking.getBookingId());

            // 18. Apply promotion usage if promotion was applied successfully
            if (request.hasPromotionCode() && discountAmount > 0) {
                try {
                    promotionService.applyPromotion(request.getPromotionCode());
                    log.info("Applied promotion usage for code: {} on booking: {}", 
                            request.getPromotionCode(), savedBooking.getBookingId());
                } catch (Exception e) {
                    log.warn("Could not apply promotion usage for code: {} - {}", 
                            request.getPromotionCode(), e.getMessage());
                }
            }

            log.info("Booking created successfully with ID: {} and final amount: {}", 
                    savedBooking.getBookingId(), finalAmount);

            // 19. Reload booking with concessions for response mapping
            Booking bookingWithConcessions = findBookingByIdWithConcessions(savedBooking.getBookingId());
            return bookingMapper.toResponse(bookingWithConcessions);

        } catch (Exception e) {
            // Release seats if something goes wrong
            releaseSeatLocks(request.getScheduleId(), seatIds);
            log.error("Error creating booking: {}", e.getMessage(), e);
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

        // Auto-populate customer information from account if available
        String customerName = getCustomerName(request, account);
        String customerEmail = getCustomerEmail(request, account);
        String customerPhone = getCustomerPhone(request, account);
        
        Booking booking = Booking.builder()
                .bookingCode(generateBookingCode())
                .bookingDate(LocalDateTime.now())
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .bookingStatus(BookingStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .customerName(customerName)
                .customerEmail(customerEmail)
                .customerPhone(customerPhone)
                .seatCount(request.getSeatIds().size())
                .notes(request.getNotes())
                .qrCode(generateQRCodeInternal())
                .isCheckedIn(false)
                .account(account)
                .schedule(schedule)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Set promotion if applicable
        if (request.hasPromotionCode() && discountAmount > 0) {
            try {
                Promotion promotion = promotionRepository.findByPromotionCodeAndIsActiveTrue(request.getPromotionCode())
                        .orElse(null);
                if (promotion != null) {
                    booking.setPromotion(promotion);
                    log.info("Applied promotion {} to booking with discount {}", 
                            promotion.getPromotionCode(), discountAmount);
                }
            } catch (Exception e) {
                log.warn("Could not set promotion reference for booking: {}", e.getMessage());
            }
        }

        return booking;
    }

    /**
     * Get customer name from request or account
     */
    private String getCustomerName(BookingCreateRequest request, Account account) {
        // Priority: request > account > null
        if (request.getCustomerName() != null && !request.getCustomerName().trim().isEmpty()) {
            return request.getCustomerName().trim();
        }

        if (account != null && account.getFullName() != null && !account.getFullName().trim().isEmpty()) {
            return account.getFullName().trim();
        }

        // For guest bookings, customer name is required
        if (Boolean.TRUE.equals(request.getIsGuestBooking())) {
            throw new IllegalArgumentException("Tên khách hàng là bắt buộc cho đặt vé khách vãng lai");
        }

        // For member bookings, try to get from account
        if (account != null) {
            return account.getUsername(); // Fallback to username if no full name
        }

        throw new IllegalArgumentException("Không thể xác định tên khách hàng");
    }

    /**
     * Get customer email from request or account
     */
    private String getCustomerEmail(BookingCreateRequest request, Account account) {
        // Priority: request > account > null
        if (request.getCustomerEmail() != null && !request.getCustomerEmail().trim().isEmpty()) {
            return request.getCustomerEmail().trim();
        }

        if (account != null && account.getEmail() != null && !account.getEmail().trim().isEmpty()) {
            return account.getEmail().trim();
        }

        // For guest bookings, email is required
        if (Boolean.TRUE.equals(request.getIsGuestBooking())) {
            throw new IllegalArgumentException("Email khách hàng là bắt buộc cho đặt vé khách vãng lai");
        }

        // For member bookings, email should be available from account
        if (account != null) {
            return account.getEmail();
        }

        throw new IllegalArgumentException("Không thể xác định email khách hàng");
    }

    /**
     * Get customer phone from request or account
     */
    private String getCustomerPhone(BookingCreateRequest request, Account account) {
        // Priority: request > account > null
        if (request.getCustomerPhone() != null && !request.getCustomerPhone().trim().isEmpty()) {
            return request.getCustomerPhone().trim();
        }

        if (account != null && account.getPhoneNumber() != null && !account.getPhoneNumber().trim().isEmpty()) {
            return account.getPhoneNumber().trim();
        }

        // For guest bookings, phone is required
        if (Boolean.TRUE.equals(request.getIsGuestBooking())) {
            throw new IllegalArgumentException("Số điện thoại khách hàng là bắt buộc cho đặt vé khách vãng lai");
        }

        // For member bookings, phone might be optional
        return null; // Allow null for member bookings
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

        // Validate booking status
        if (!booking.isPending()) {
            log.warn("❌ Cannot confirm booking - current status: {}", booking.getBookingStatus());
            throw new AppException(ErrorCode.BOOKING_INVALID_STATUS);
        }

        // Update booking status
        BookingStatus oldStatus = booking.getBookingStatus();
        booking.setBookingStatus(BookingStatus.CONFIRMED);
        
        // Update timestamps
        booking.setUpdatedAt(LocalDateTime.now());
        
        Booking updatedBooking = bookingRepository.save(booking);

        // Enhanced logging with status tracking
        log.info("📋 Booking status changed: {} → {} for booking ID: {}", 
                oldStatus.getDisplayName(), 
                BookingStatus.CONFIRMED.getDisplayName(), 
                bookingId);
        
        // Send notification (if customer has account)
        if (booking.getAccount() != null) {
            sendBookingConfirmationNotification(booking);
        }

        log.info("✅ Booking confirmed successfully with ID: {}", bookingId);
        return bookingMapper.toResponse(updatedBooking);
    }

    @Override
    @Transactional
    public BookingResponse updatePaymentStatus(Long bookingId, PaymentStatusUpdateRequest request) {
        log.info("Updating payment status for booking ID: {} to {}", bookingId, request.getPaymentStatus());
        
        Booking booking = findBookingById(bookingId);
        
        // Validate business rules for payment status transition
        validatePaymentStatusTransition(booking, request.getPaymentStatus());
        
        // Store old payment status for logging
        com.swp.MovieTheaterService.enums.PaymentStatus oldPaymentStatus = booking.getPaymentStatus();
        
        // Update payment status
        booking.setPaymentStatus(request.getPaymentStatus());
        
        // Update payment details if provided
        if (request.getPaymentReference() != null) {
            booking.setPaymentReference(request.getPaymentReference());
        }
        
        if (request.getPaymentMethod() != null) {
            booking.setPaymentMethod(request.getPaymentMethod());
        }
        
        // Handle specific payment status changes
        switch (request.getPaymentStatus()) {
            case SUCCESS:
                booking.setPaymentDate(LocalDateTime.now());
                booking.setBookingStatus(BookingStatus.PAID);
                log.info("💰 Payment completed for booking {}", bookingId);
                break;
                
            case FAILED:
            case CANCELLED:
            case EXPIRED:
                // Keep booking status as is, just update payment status
                log.info("❌ Payment failed/cancelled/expired for booking {}", bookingId);
                break;
                
            case REFUNDED:
            case PARTIAL_REFUNDED:
                if (request.getRefundAmount() != null) {
                    booking.setRefundAmount(request.getRefundAmount());
                }
                log.info("💸 Refund processed for booking {}", bookingId);
                break;
                
            case PROCESSING:
                log.info("⏳ Payment processing for booking {}", bookingId);
                break;
                
            default:
                break;
        }
        
        // Update notes if provided
        if (request.getNotes() != null && !request.getNotes().trim().isEmpty()) {
            String currentNotes = booking.getNotes() != null ? booking.getNotes() : "";
            String timestamp = LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            String newNote = String.format("[%s] Payment Status Update: %s", timestamp, request.getNotes());
            booking.setNotes(currentNotes + "\n" + newNote);
        }
        
        // Update timestamp
        booking.setUpdatedAt(LocalDateTime.now());
        
        // Save booking
        Booking updatedBooking = bookingRepository.save(booking);
        
        // Enhanced logging
        log.info("💳 Payment status changed: {} → {} for booking ID: {}", 
                oldPaymentStatus != null ? oldPaymentStatus.getDisplayName() : "N/A",
                request.getPaymentStatus().getDisplayName(), 
                bookingId);
        
        // Send notification if payment is successful
        if (request.getPaymentStatus() == com.swp.MovieTheaterService.enums.PaymentStatus.SUCCESS && booking.getAccount() != null) {
            sendPaymentSuccessNotification(booking);
        }
        
        log.info("✅ Payment status updated successfully for booking ID: {}", bookingId);
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
        
        // Convert temporary reservations to permanent reservations
        // Note: We'll use booking code as session identifier for now
        String sessionId = "BOOKING_" + booking.getBookingCode();
        seatReservationService.convertToPermanentReservation(sessionId, booking.getBookingId());
        log.info("Converted temporary seat reservations to permanent for booking: {}", booking.getBookingId());
        
        // Update booking seat status from TEMPORARILY_RESERVED to OCCUPIED
        List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingBookingIdAndActiveTrue(booking.getBookingId());
        convertBookingSeatsToOccupied(bookingSeats);
        
        Booking updatedBooking = bookingRepository.save(booking);

        // 🎯 CỘNG ĐIỂM CHO USER SAU KHI PAYMENT THÀNH CÔNG
        if (booking.getAccount() != null) {
            try {
                log.info("🎁 Cộng điểm cho user {} từ booking {}",
                        booking.getAccount().getEmail(), booking.getBookingId());

                // Cộng điểm dựa trên số tiền đã thanh toán (finalAmount)
                loyaltyService.earnPointsFromBooking(booking.getAccount(), booking);

                log.info("✅ Đã cộng điểm thành công cho user: {}", booking.getAccount().getEmail());
            } catch (Exception e) {
                log.error("❌ Lỗi khi cộng điểm cho user {}: {}",
                        booking.getAccount().getEmail(), e.getMessage());
                // Không throw exception để không ảnh hưởng đến payment
            }
        } else {
            log.info("ℹ️ Booking của guest - không cộng điểm");
        }

        log.info("Payment processed successfully for booking ID: {} - Seats converted to OCCUPIED", booking.getBookingId());
        return bookingMapper.toResponse(updatedBooking);
    }

    @Override
    public BookingResponse cancelBooking(Long bookingId, String cancellationReason) {
        log.info("Cancelling booking with ID: {}", bookingId);
        Booking booking = findBookingById(bookingId);

        // Validate if booking can be cancelled
        if (!booking.canBeCancelled()) {
            log.warn("❌ Cannot cancel booking - current status: {}, show time: {}", 
                    booking.getBookingStatus(), 
                    booking.getSchedule().getShowDateTime());
            throw new AppException(ErrorCode.BOOKING_CANNOT_BE_CANCELLED);
        }

        // Store old status for logging
        BookingStatus oldStatus = booking.getBookingStatus();
        
        // Cancel booking (includes refund calculation)
        booking.cancel(cancellationReason);

        // Release temporary reservations if exists
        String sessionId = "BOOKING_" + booking.getBookingCode();
        seatReservationService.releaseTemporaryReservations(sessionId);
        log.info("Released temporary seat reservations for cancelled booking: {}", bookingId);

        // Release booking seats and update status back to AVAILABLE
        List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingBookingIdAndActiveTrue(bookingId);
        releaseBookingSeatStatus(bookingSeats);
        updateScheduleSeatCounts(booking.getSchedule(), 0, bookingSeats.size());

        Booking updatedBooking = bookingRepository.save(booking);

        // Enhanced logging with status tracking
        log.info("📋 Booking status changed: {} → {} for booking ID: {}", 
                oldStatus.getDisplayName(), 
                BookingStatus.CANCELLED.getDisplayName(), 
                bookingId);
        
        log.info("💰 Refund calculated: {}/{} ({}%)", 
                booking.getRefundAmount(), 
                booking.getFinalAmount(),
                booking.getRefundAmount() / booking.getFinalAmount() * 100);

        // Send notification (if customer has account)
        if (booking.getAccount() != null) {
            sendBookingCancellationNotification(booking);
        }

        log.info("✅ Booking cancelled successfully with ID: {}, refund: {}", 
                bookingId, booking.getRefundAmount());
        return bookingMapper.toResponse(updatedBooking);
    }

    // Notification methods
    private void sendBookingConfirmationNotification(Booking booking) {
        try {
            log.info("📧 Sending confirmation notification to: {}", booking.getAccount().getEmail());
            // TODO: Implement email/SMS notification
            // emailService.sendBookingConfirmation(booking);
        } catch (Exception e) {
            log.error("❌ Failed to send confirmation notification: {}", e.getMessage());
        }
    }

    private void sendBookingCancellationNotification(Booking booking) {
        try {
            log.info("📧 Sending cancellation notification to: {}", booking.getAccount().getEmail());
            // TODO: Implement email/SMS notification with refund info
            // emailService.sendBookingCancellation(booking);
        } catch (Exception e) {
            log.error("❌ Failed to send cancellation notification: {}", e.getMessage());
        }
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

        // Check if booking is in valid state for promotion
        if (!booking.isPending() && !booking.isConfirmed()) {
            throw new AppException(ErrorCode.PROMOTION_NOT_APPLICABLE);
        }

        try {
            // Get account for member validation (can be null for guest bookings)
            Account account = booking.getAccount();
            
            // Get schedule information for validation
            Schedule schedule = booking.getSchedule();
            
            // Validate promotion for this booking
            boolean isValid = promotionService.validatePromotionForBooking(
                promotionCode, 
                booking.getTotalAmount()
            );

            if (!isValid) {
                log.warn("Promotion validation failed for code: {} on booking: {}", promotionCode, bookingId);
                throw new AppException(ErrorCode.PROMOTION_NOT_APPLICABLE);
            }

            // Calculate discount amount
            Double discountAmount = promotionService.calculateDiscount(promotionCode, booking.getTotalAmount());
            
            if (discountAmount <= 0) {
                log.warn("No discount calculated for promotion: {} on booking: {}", promotionCode, bookingId);
                throw new AppException(ErrorCode.PROMOTION_NOT_APPLICABLE);
            }

            // Get promotion entity to save reference
            Promotion promotion = promotionRepository.findByPromotionCodeAndIsActiveTrue(promotionCode)
                    .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

            // Apply promotion to booking
            booking.setPromotion(promotion);
            booking.setDiscountAmount(discountAmount);
            booking.setFinalAmount(booking.getTotalAmount() - discountAmount);
            booking.setUpdatedAt(LocalDateTime.now());

            // Save booking with promotion
            Booking updatedBooking = bookingRepository.save(booking);

            // Apply promotion usage (increment usage count)
            promotionService.applyPromotion(promotionCode);

            log.info("Promotion {} applied successfully to booking {}. Discount: {}", 
                    promotionCode, bookingId, discountAmount);
            
            return bookingMapper.toResponse(updatedBooking);

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error applying promotion {} to booking {}: {}", promotionCode, bookingId, e.getMessage(), e);
            throw new AppException(ErrorCode.PROMOTION_APPLICATION_FAILED);
        }
    }

    @Override
    public BookingResponse removePromotion(Long bookingId) {
        log.info("Removing promotion from booking ID: {}", bookingId);
        
        Booking booking = findBookingById(bookingId);

        // Check if booking is in valid state for promotion removal
        if (!booking.isPending() && !booking.isConfirmed()) {
            throw new AppException(ErrorCode.PROMOTION_NOT_APPLICABLE);
        }

        // Check if booking has promotion to remove
        if (booking.getPromotion() == null) {
            log.warn("No promotion found on booking ID: {}", bookingId);
            throw new AppException(ErrorCode.PROMOTION_NOT_FOUND);
        }

        try {
            String promotionCode = booking.getPromotion().getPromotionCode();
            Double discountAmount = booking.getDiscountAmount();

            // Remove promotion from booking
            booking.setPromotion(null);
            booking.setDiscountAmount(0.0);
            booking.setFinalAmount(booking.getTotalAmount());
            booking.setUpdatedAt(LocalDateTime.now());

            // Save updated booking
            Booking updatedBooking = bookingRepository.save(booking);

            log.info("Promotion {} removed successfully from booking {}. Discount removed: {}", 
                    promotionCode, bookingId, discountAmount);
            
            return bookingMapper.toResponse(updatedBooking);

        } catch (Exception e) {
            log.error("Error removing promotion from booking {}: {}", bookingId, e.getMessage(), e);
            throw new AppException(ErrorCode.PROMOTION_REMOVAL_FAILED);
        }
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
            throw new AppException(ErrorCode.BOOKING_INVALID_STATUS);
        }

        // Validate concession availability
        if (!concessionService.isAvailableForOrder(request.getConcessionId(), request.getQuantity())) {
            Concession concession = concessionService.getConcessionById(request.getConcessionId());
            throw new AppException(ErrorCode.CONCESSION_OUT_OF_STOCK,
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
            throw new AppException(ErrorCode.BOOKING_INVALID_STATUS);
        }

        // Find and remove concession
        List<BookingConcession> concessions = bookingConcessionRepository
                .findByBookingBookingIdAndIsActiveTrue(bookingId);
        BookingConcession toRemove = concessions.stream()
                .filter(bc -> bc.getConcession().getConcessionId().equals(concessionId))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.CONCESSION_NOT_FOUND));

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
            throw new AppException(ErrorCode.BOOKING_INVALID_STATUS);
        }

        // Find concession in booking
        List<BookingConcession> concessions = bookingConcessionRepository
                .findByBookingBookingIdAndIsActiveTrue(bookingId);
        BookingConcession toUpdate = concessions.stream()
                .filter(bc -> bc.getConcession().getConcessionId().equals(concessionId))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.CONCESSION_NOT_FOUND));

        // Calculate stock change
        Integer oldQuantity = toUpdate.getQuantity();
        Integer stockChange = quantity - oldQuantity;

        // Validate availability for increase
        if (stockChange > 0 && !concessionService.isAvailableForOrder(concessionId, stockChange)) {
            Concession concession = concessionService.getConcessionById(concessionId);
            throw new AppException(ErrorCode.CONCESSION_OUT_OF_STOCK,
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

    /**
     * Find booking by ID with concessions loaded (force fetch)
     */
    private Booking findBookingByIdWithConcessions(Long bookingId) {
        Booking booking = findBookingById(bookingId);
        
        // Force load concessions to avoid lazy loading issues
        if (booking.getBookingConcessions() != null) {
            booking.getBookingConcessions().size(); // Trigger lazy loading
        }
        
        return booking;
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

        // Get schedule to calculate correct seat prices using movie base price
        Schedule schedule = booking.getSchedule();
        Double basePrice = schedule.getMovie().getPrice();

        for (Long seatId : seatIds) {
            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new AppException(ErrorCode.SEAT_NOT_FOUND));

            // Note: Seats are already TEMPORARILY_RESERVED by SeatReservationService
            // They will be converted to OCCUPIED only when payment is confirmed

            // Calculate correct seat price: movie base price * seat price multiplier
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

        // Save booking seats
        bookingSeatRepository.saveAll(bookingSeats);
        log.info("Created {} booking seats with correct pricing. Seats remain TEMPORARILY_RESERVED until payment confirmation.", 
                bookingSeats.size());
    }

    /**
     * Create booking concessions relationships
     */
    private void createBookingConcessions(Booking booking, List<ConcessionOrderRequest> concessionOrders) {
        log.debug("Creating booking concessions for booking ID: {} with {} orders", 
                booking.getBookingId(), concessionOrders.size());
        List<BookingConcession> bookingConcessions = new ArrayList<>();

        for (ConcessionOrderRequest order : concessionOrders) {
            log.debug("Processing concession order - ID: {}, Quantity: {}", 
                    order.getConcessionId(), order.getQuantity());
            
            // Get concession details
            Concession concession = concessionService.getConcessionById(order.getConcessionId());
            log.debug("Found concession: {} - Stock: {}, IsActive: {}, IsAvailable: {}", 
                    concession.getFullName(), concession.getStockQuantity(), 
                    concession.getIsActive(), concession.getIsAvailable());

            // Validate availability again (double check)
            boolean isAvailable = concessionService.isAvailableForOrder(order.getConcessionId(), order.getQuantity());
            log.debug("Availability check for {} x {}: {}", concession.getFullName(), order.getQuantity(), isAvailable);
            
            if (!isAvailable) {
                log.error("Concession {} not available - Stock: {}, Required: {}, IsActive: {}, IsAvailable: {}", 
                        concession.getFullName(), concession.getStockQuantity(), order.getQuantity(),
                        concession.getIsActive(), concession.getIsAvailable());
                throw new AppException(ErrorCode.CONCESSION_OUT_OF_STOCK,
                        String.format("Không đủ số lượng cho %s", concession.getFullName()));
            }

            // Get unit price from concession entity (not from DTO)
            BigDecimal unitPrice = concession.getPrice();
            BigDecimal totalPrice = unitPrice.multiply(new BigDecimal(order.getQuantity()));

            // Create booking concession entity
            BookingConcession bookingConcession = BookingConcession.builder()
                    .booking(booking)
                    .concession(concession)
                    .quantity(order.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(totalPrice)
                    .notes(order.getNotes())
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            bookingConcessions.add(bookingConcession);

            // Update concession stock
            concessionService.updateStock(order.getConcessionId(), order.getQuantity());

            log.debug("Created concession order: {} x {} = {}",
                    concession.getFullName(), order.getQuantity(),
                    String.format("%,.0f VND", totalPrice));
        }

        bookingConcessionRepository.saveAll(bookingConcessions);
        log.info("Saved {} concession orders for booking {}",
                bookingConcessions.size(), booking.getBookingId());
    }

    /**
     * Convert booking seats from TEMPORARILY_RESERVED to OCCUPIED when payment is confirmed
     */
    private void convertBookingSeatsToOccupied(List<BookingSeat> bookingSeats) {
        List<BookingSeat> seatsToUpdate = new ArrayList<>();
        
        for (BookingSeat bookingSeat : bookingSeats) {
            // Only update if booking seat is currently TEMPORARILY_RESERVED
            if (bookingSeat.getStatus() == SeatStatus.TEMPORARILY_RESERVED) {
                bookingSeat.setStatus(SeatStatus.OCCUPIED);
                bookingSeat.setUpdatedAt(LocalDateTime.now());
                seatsToUpdate.add(bookingSeat);
                
                log.debug("Converted booking seat {} status from TEMPORARILY_RESERVED to OCCUPIED", 
                        bookingSeat.getSeatNumber());
            }
        }
        
        if (!seatsToUpdate.isEmpty()) {
            bookingSeatRepository.saveAll(seatsToUpdate);
            log.info("Converted {} booking seats status to OCCUPIED after payment confirmation", 
                    seatsToUpdate.size());
        }
    }

    /**
     * Release booking seat status back to AVAILABLE when booking is cancelled
     */
    private void releaseBookingSeatStatus(List<BookingSeat> bookingSeats) {
        List<BookingSeat> seatsToUpdate = new ArrayList<>();
        
        for (BookingSeat bookingSeat : bookingSeats) {
            // Update booking seat status from either OCCUPIED or TEMPORARILY_RESERVED to AVAILABLE
            if (bookingSeat.getStatus() == SeatStatus.OCCUPIED || 
                bookingSeat.getStatus() == SeatStatus.TEMPORARILY_RESERVED) {
                
                SeatStatus oldStatus = bookingSeat.getStatus();
                bookingSeat.setStatus(SeatStatus.AVAILABLE);
                bookingSeat.setUpdatedAt(LocalDateTime.now());
                seatsToUpdate.add(bookingSeat);
                
                log.debug("Released booking seat {} status from {} to AVAILABLE", 
                        bookingSeat.getSeatNumber(), oldStatus);
            }
        }
        
        if (!seatsToUpdate.isEmpty()) {
            bookingSeatRepository.saveAll(seatsToUpdate);
            log.info("Released {} booking seats status to AVAILABLE", seatsToUpdate.size());
        }
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

            // Get schedule to get movie base price
            Schedule schedule = findScheduleById(scheduleId);
            Double basePrice = schedule.getMovie().getPrice();

            // Calculate total seat prices based on movie price and seat multiplier
            for (Long seatId : seatIds) {
                Seat seat = seatRepository.findById(seatId)
                        .orElseThrow(() -> new AppException(ErrorCode.SEAT_NOT_FOUND));

                // Calculate seat price: movie base price * seat price multiplier
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
        try {
            if (!request.hasPromotionCode()) {
                return 0.0;
            }

            String promotionCode = request.getPromotionCode();
            log.info("Calculating discount for promotion code: {} with total amount: {}", 
                    promotionCode, totalAmount);

            // Validate promotion exists and is active
            if (!promotionService.validatePromotionForBooking(promotionCode, totalAmount)) {
                log.warn("Promotion validation failed for code: {}", promotionCode);
                return 0.0;
            }

            // Calculate discount amount
            Double discountAmount = promotionService.calculateDiscount(promotionCode, totalAmount);
            log.info("Calculated discount amount: {} for promotion: {}", discountAmount, promotionCode);
            
            return discountAmount;
            
        } catch (Exception e) {
            log.error("Error calculating promotion discount: {}", e.getMessage(), e);
            return 0.0;
        }
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
            throw new AppException(ErrorCode.CONCESSION_ORDER_INVALID);
        }

        // Validate concession exists and is available
        Concession concession = concessionService.getConcessionById(order.getConcessionId());
        if (!concession.getIsAvailable() || !concession.getIsActive()) {
            throw new AppException(ErrorCode.CONCESSION_OUT_OF_STOCK,
                    String.format("Món %s hiện không có sẵn", concession.getFullName()));
        }

        // Validate stock availability
        if (!concessionService.isAvailableForOrder(order.getConcessionId(), order.getQuantity())) {
            throw new AppException(ErrorCode.CONCESSION_OUT_OF_STOCK,
                    String.format("Không đủ số lượng cho %s", concession.getFullName()));
        }

        log.debug("Validated concession order: {} x {}",
                concession.getFullName(), order.getQuantity());
    }

    /**
     * Calculate total concession amount from database prices
     */
    private Double calculateConcessionAmount(List<ConcessionOrderRequest> concessionOrders) {
        if (concessionOrders == null || concessionOrders.isEmpty()) {
            return 0.0;
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (ConcessionOrderRequest order : concessionOrders) {
            // Get concession from database to get current price
            Concession concession = concessionService.getConcessionById(order.getConcessionId());
            BigDecimal unitPrice = concession.getPrice();
            BigDecimal orderTotal = unitPrice.multiply(new BigDecimal(order.getQuantity()));
            totalAmount = totalAmount.add(orderTotal);

            log.debug("Concession {}: {} x {} = {}",
                    concession.getFullName(),
                    order.getQuantity(),
                    String.format("%,.0f VND", unitPrice),
                    String.format("%,.0f VND", orderTotal));
        }

        log.info("Total concession amount: {}", String.format("%,.0f VND", totalAmount));
        return totalAmount.doubleValue();
    }

    /**
     * Validate that seats are adjacent (liền nhau) to avoid scattered seats
     * Only applies when booking 2 or more seats
     */
    private void validateSeatsAdjacency(List<Long> seatIds) {
        log.info("Validating adjacency for {} seats: {}", seatIds.size(), seatIds);
        
        // Get seat details
        List<Seat> seats = seatRepository.findAllById(seatIds);
        
        if (seats.size() != seatIds.size()) {
            throw new AppException(ErrorCode.SEAT_NOT_FOUND);
        }
        
        // Sort seats by row and column for adjacency check
        seats.sort((s1, s2) -> {
            int rowCompare = s1.getSeatRow().compareTo(s2.getSeatRow());
            if (rowCompare != 0) return rowCompare;
            return s1.getSeatColumn().compareTo(s2.getSeatColumn());
        });
        
        // Check if all seats are in the same row
        Integer firstRow = seats.get(0).getSeatRow();
        boolean allSameRow = seats.stream().allMatch(seat -> seat.getSeatRow().equals(firstRow));
        
        if (!allSameRow) {
            throw new AppException(ErrorCode.SEATS_NOT_ADJACENT);
        }
        
        // Check if seats are consecutive (liền nhau)
        for (int i = 1; i < seats.size(); i++) {
            Integer currentColumn = seats.get(i).getSeatColumn();
            Integer previousColumn = seats.get(i-1).getSeatColumn();
            
            if (currentColumn - previousColumn != 1) {
                log.warn("Seats not adjacent - gap between {} and {}", 
                        seats.get(i-1).getSeatNumber(), seats.get(i).getSeatNumber());
                throw new AppException(ErrorCode.SEATS_NOT_ADJACENT);
            }
        }
        
        log.info("Seat adjacency validation passed - all {} seats are consecutive in row {}", 
                seats.size(), firstRow);
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

    /**
     * Validate payment status transition rules
     */
    private void validatePaymentStatusTransition(Booking booking, com.swp.MovieTheaterService.enums.PaymentStatus newStatus) {
        com.swp.MovieTheaterService.enums.PaymentStatus currentStatus = booking.getPaymentStatus();
        
        // Allow any transition if current status is null (new booking)
        if (currentStatus == null) {
            return;
        }
        
        // Define valid transitions
        switch (currentStatus) {
            case PENDING:
                // From PENDING: can go to any status
                break;
                
            case PROCESSING:
                // From PROCESSING: can go to SUCCESS, FAILED, CANCELLED, EXPIRED
                if (newStatus == com.swp.MovieTheaterService.enums.PaymentStatus.PENDING) {
                    throw new AppException(ErrorCode.PAYMENT_INVALID_STATUS_TRANSITION, 
                        "Không thể chuyển từ PROCESSING về PENDING");
                }
                break;
                
            case SUCCESS:
                // From SUCCESS: only allow REFUNDED or PARTIAL_REFUNDED
                if (newStatus != com.swp.MovieTheaterService.enums.PaymentStatus.REFUNDED && 
                    newStatus != com.swp.MovieTheaterService.enums.PaymentStatus.PARTIAL_REFUNDED) {
                    throw new AppException(ErrorCode.PAYMENT_INVALID_STATUS_TRANSITION, 
                        "Từ trạng thái SUCCESS chỉ có thể chuyển sang REFUNDED hoặc PARTIAL_REFUNDED");
                }
                break;
                
            case FAILED:
            case CANCELLED:
            case EXPIRED:
                // From terminal failure states: only allow back to PENDING for retry
                if (newStatus != com.swp.MovieTheaterService.enums.PaymentStatus.PENDING &&
                    newStatus != com.swp.MovieTheaterService.enums.PaymentStatus.PROCESSING) {
                    throw new AppException(ErrorCode.PAYMENT_INVALID_STATUS_TRANSITION, 
                        "Từ trạng thái thất bại chỉ có thể chuyển sang PENDING hoặc PROCESSING để thử lại");
                }
                break;
                
            case REFUNDED:
            case PARTIAL_REFUNDED:
                // From refund states: no transitions allowed (final states)
                throw new AppException(ErrorCode.PAYMENT_INVALID_STATUS_TRANSITION, 
                    "Không thể thay đổi trạng thái thanh toán từ " + currentStatus.getDisplayName());
                
            default:
                break;
        }
        
        log.info("✅ Payment status transition validated: {} → {}", currentStatus, newStatus);
    }

    /**
     * Send payment success notification
     */
    private void sendPaymentSuccessNotification(Booking booking) {
        try {
            if (booking.getAccount() != null && booking.getAccount().getEmail() != null) {
                // TODO: Implement email notification for payment success
                log.info("📧 Would send payment success notification to: {}", booking.getAccount().getEmail());
                // emailService.sendPaymentSuccessNotification(booking);
            }
        } catch (Exception e) {
            log.warn("Failed to send payment success notification for booking {}: {}", 
                    booking.getBookingId(), e.getMessage());
        }
    }
}