package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.dto.booking.*;
import com.swp.MovieTheaterService.entity.*;
import com.swp.MovieTheaterService.enums.BookingStatus;
import com.swp.MovieTheaterService.exception.BadRequestException;
import com.swp.MovieTheaterService.exception.ConflictException;
import com.swp.MovieTheaterService.exception.NotFoundException;
import com.swp.MovieTheaterService.mapper.BookingMapper;
import com.swp.MovieTheaterService.repository.*;
import com.swp.MovieTheaterService.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final ScheduleRepository scheduleRepository;
    private final SeatRepository seatRepository;
    private final AccountRepository accountRepository;
    private final BookingMapper bookingMapper;

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

        // Validate guest customer information
        if (!request.hasValidCustomerInfo()) {
            throw new BadRequestException("Thông tin khách hàng không đầy đủ cho booking khách vãng lai");
        }

        // Create booking without account
        BookingResponse booking = createBookingInternal(request, null);
        
        log.info("Guest booking created successfully with ID: {} for customer: {}", 
                booking.getBookingId(), request.getCustomerEmail());
        
        return booking;
    }

    private BookingResponse createBookingInternal(BookingCreateRequest request, Account account) {
        // Validate schedule exists and is bookable
        Schedule schedule = findScheduleById(request.getScheduleId());
        validateScheduleForBooking(schedule);

        // Validate seats availability
        List<Long> seatIds = request.getSelectedSeats().stream()
                .map(BookingCreateRequest.SeatSelectionRequest::getSeatId)
                .collect(Collectors.toList());
        
        if (!areSeatsAvailable(request.getScheduleId(), seatIds)) {
            throw new ConflictException("Một hoặc nhiều ghế đã được đặt");
        }

        // Create booking entity
        Booking booking = bookingMapper.toEntity(request);
        booking.setSchedule(schedule);
        booking.setAccount(account);

        // Generate QR code
        booking.setQrCode(generateQRCodeInternal());

        // Save booking
        Booking savedBooking = bookingRepository.save(booking);

        // Create booking seats
        createBookingSeats(savedBooking, request.getSelectedSeats());

        // Update schedule seat counts
        updateScheduleSeatCounts(schedule, request.getSelectedSeats().size(), 0);

        return bookingMapper.toResponse(savedBooking);
    }

    @Override
    public BookingResponse updateBooking(Long bookingId, BookingUpdateRequest request) {
        log.info("Updating booking with ID: {}", bookingId);

        Booking booking = findBookingById(bookingId);

        // Check if booking can be updated
        if (booking.isPaid() || booking.isCompleted()) {
            throw new BadRequestException("Không thể cập nhật booking đã thanh toán hoặc hoàn thành");
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
                .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với mã: " + bookingCode));
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
        List<Booking> bookings = bookingRepository.findByAccountAccountIdAndIsActiveTrueOrderByBookingDateDesc(accountId);
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> getBookingsByAccount(Long accountId, Pageable pageable) {
        log.info("Getting bookings by account ID: {} with pagination", accountId);
        Page<Booking> bookings = bookingRepository.findByAccountAccountIdAndIsActiveTrueOrderByBookingDateDesc(accountId, pageable);
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
    public Page<BookingResponse> getBookingsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        log.info("Getting bookings by date range: {} to {} with pagination", startDate, endDate);
        Page<Booking> bookings = bookingRepository.findByBookingDateBetweenAndIsActiveTrue(startDate, endDate, pageable);
        return bookings.map(bookingMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByCustomerEmail(String customerEmail) {
        log.info("Getting bookings by customer email: {}", customerEmail);
        List<Booking> bookings = bookingRepository.findByCustomerEmailAndIsActiveTrueOrderByBookingDateDesc(customerEmail);
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByCustomerPhone(String customerPhone) {
        log.info("Getting bookings by customer phone: {}", customerPhone);
        List<Booking> bookings = bookingRepository.findByCustomerPhoneAndIsActiveTrueOrderByBookingDateDesc(customerPhone);
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
            throw new BadRequestException("Chỉ có thể xác nhận booking ở trạng thái 'Chờ xử lý'");
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
                .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với mã: " + paymentRequest.getBookingCode()));

        // Check if booking can be paid
        if (!booking.isPending() && !booking.isConfirmed()) {
            throw new BadRequestException("Chỉ có thể thanh toán booking ở trạng thái 'Chờ xử lý' hoặc 'Đã xác nhận'");
        }

        // Validate payment amount
        if (!paymentRequest.getPaidAmount().equals(booking.getFinalAmount())) {
            throw new BadRequestException("Số tiền thanh toán không khớp với số tiền cần thanh toán");
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
            throw new BadRequestException("Không thể hủy booking này");
        }

        // Cancel booking
        booking.cancel(cancellationReason);
        
        // Release seats
        List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingBookingIdAndIsActiveTrue(bookingId);
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
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với QR code"));
        } else {
            booking = bookingRepository.findByBookingCodeAndIsActiveTrue(qrCode)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với mã: " + qrCode));
        }

        if (!booking.canBeCheckedIn()) {
            throw new BadRequestException("Không thể check-in booking này");
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
            throw new BadRequestException("Chỉ có thể áp dụng khuyến mãi cho booking chưa thanh toán");
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
            throw new BadRequestException("Chỉ có thể xóa khuyến mãi cho booking chưa thanh toán");
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
        List<Seat> allSeats = seatRepository.findByCinemaRoomCinemaRoomIdAndIsActiveTrue(schedule.getCinemaRoom().getCinemaRoomId());
        
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
                .orElseThrow(() -> new NotFoundException("QR code không hợp lệ"));
        return bookingMapper.toResponse(booking);
    }

    @Override
    public void deleteBooking(Long bookingId) {
        log.info("Soft deleting booking with ID: {}", bookingId);
        Booking booking = findBookingById(bookingId);

        if (booking.isPaid() || booking.isCompleted()) {
            throw new BadRequestException("Không thể xóa booking đã thanh toán hoặc hoàn thành");
        }

        // Release seats if booking is confirmed
        if (booking.isConfirmed()) {
            List<BookingSeat> bookingSeats = bookingSeatRepository.findByBookingBookingIdAndIsActiveTrue(bookingId);
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
                .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với ID: " + bookingId));

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
            throw new BadRequestException("Chỉ có thể hoàn tiền cho booking đã hủy");
        }

        if (refundAmount > booking.getFinalAmount()) {
            throw new BadRequestException("Số tiền hoàn không được vượt quá số tiền đã thanh toán");
        }

        booking.setRefundAmount(refundAmount);
        Booking updatedBooking = bookingRepository.save(booking);
        
        log.info("Refund processed successfully for booking ID: {}", bookingId);
        return bookingMapper.toResponse(updatedBooking);
    }

    // Helper methods
    private Booking findBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .filter(Booking::getIsActive)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với ID: " + bookingId));
    }

    private Schedule findScheduleById(Long scheduleId) {
        return scheduleRepository.findById(scheduleId)
                .filter(Schedule::getIsActive)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lịch chiếu với ID: " + scheduleId));
    }

    private Account findAccountById(Long accountId) {
        return accountRepository.findById(accountId)
                .filter(Account::getIsActive)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tài khoản với ID: " + accountId));
    }

    private void validateScheduleForBooking(Schedule schedule) {
        if (!schedule.isBookable()) {
            throw new BadRequestException("Lịch chiếu này không thể đặt vé");
        }

        if (schedule.getAvailableSeats() <= 0) {
            throw new BadRequestException("Lịch chiếu đã hết ghế trống");
        }
    }

    private void validatePaymentRequest(PaymentRequest request) {
        if (request.isCardPayment() && !request.hasValidCardDetails()) {
            throw new BadRequestException("Thông tin thẻ tín dụng không đầy đủ");
        }
        
        if (request.isOnlinePayment() && !request.hasValidOnlineDetails()) {
            throw new BadRequestException("Thông tin thanh toán online không đầy đủ");
        }
        
        if (request.isWalletPayment() && !request.hasValidWalletDetails()) {
            throw new BadRequestException("Thông tin ví điện tử không đầy đủ");
        }
    }

    private void createBookingSeats(Booking booking, List<BookingCreateRequest.SeatSelectionRequest> selectedSeats) {
        List<BookingSeat> bookingSeats = new ArrayList<>();
        
        for (BookingCreateRequest.SeatSelectionRequest seatRequest : selectedSeats) {
            Seat seat = seatRepository.findById(seatRequest.getSeatId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy ghế với ID: " + seatRequest.getSeatId()));
            
            BookingSeat bookingSeat = new BookingSeat();
            bookingSeat.setBooking(booking);
            bookingSeat.setSeat(seat);
            bookingSeat.setSeatPrice(seatRequest.getSeatPrice());
            bookingSeat.setSeatType(seatRequest.getSeatType() != null ? seatRequest.getSeatType() : seat.getSeatType());
            bookingSeat.setSeatNumber(seat.getSeatNumber());
            bookingSeat.setIsActive(true);
            bookingSeat.setCreatedAt(LocalDateTime.now());
            bookingSeat.setUpdatedAt(LocalDateTime.now());
            
            bookingSeats.add(bookingSeat);
        }
        
        bookingSeatRepository.saveAll(bookingSeats);
    }

    private void updateScheduleSeatCounts(Schedule schedule, int bookedSeatsToAdd, int bookedSeatsToRemove) {
        schedule.setBookedSeats(schedule.getBookedSeats() + bookedSeatsToAdd - bookedSeatsToRemove);
        schedule.setAvailableSeats(schedule.getAvailableSeats() - bookedSeatsToAdd + bookedSeatsToRemove);
        scheduleRepository.save(schedule);
    }

    private String generateQRCodeInternal() {
        return "QR" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
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