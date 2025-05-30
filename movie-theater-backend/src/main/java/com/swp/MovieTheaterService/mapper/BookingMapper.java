package com.swp.MovieTheaterService.mapper;

import com.swp.MovieTheaterService.dto.booking.BookingCreateRequest;
import com.swp.MovieTheaterService.dto.booking.BookingResponse;

import com.swp.MovieTheaterService.dto.booking.BookingUpdateRequest;
import com.swp.MovieTheaterService.entity.Booking;
import com.swp.MovieTheaterService.entity.BookingSeat;
import com.swp.MovieTheaterService.enums.BookingStatus;
import org.springframework.stereotype.Component;

import java.text.NumberFormat;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Booking Mapper
 * Maps between Booking entity and DTOs
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Component
public class BookingMapper {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final NumberFormat CURRENCY_FORMATTER = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

    /**
     * Convert BookingCreateRequest to Booking entity
     */
    public Booking toEntity(BookingCreateRequest request) {
        if (request == null) {
            return null;
        }

        Booking booking = new Booking();
        booking.setBookingCode(generateBookingCode());
        booking.setBookingDate(LocalDateTime.now());
        booking.setBookingStatus(BookingStatus.PENDING);
        booking.setSeatCount(request.getSelectedSeats().size());
        booking.setNotes(request.getNotes());
        booking.setIsCheckedIn(false);
        booking.setIsActive(true);
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        // Set customer information for guest bookings
        if (request.isGuestBooking()) {
            booking.setCustomerName(request.getCustomerName());
            booking.setCustomerEmail(request.getCustomerEmail());
            booking.setCustomerPhone(request.getCustomerPhone());
        }

        // Calculate total amount
        double totalAmount = request.getSelectedSeats().stream()
                .mapToDouble(BookingCreateRequest.SeatSelectionRequest::getSeatPrice)
                .sum();
        booking.setTotalAmount(totalAmount);
        booking.setDiscountAmount(0.0);
        booking.setFinalAmount(totalAmount);

        return booking;
    }

    /**
     * Update Booking entity from BookingUpdateRequest
     */
    public void updateEntity(Booking booking, BookingUpdateRequest request) {
        if (booking == null || request == null) {
            return;
        }

        if (request.getCustomerName() != null) {
            booking.setCustomerName(request.getCustomerName());
        }
        if (request.getCustomerEmail() != null) {
            booking.setCustomerEmail(request.getCustomerEmail());
        }
        if (request.getCustomerPhone() != null) {
            booking.setCustomerPhone(request.getCustomerPhone());
        }
        if (request.getBookingStatus() != null) {
            booking.setBookingStatus(request.getBookingStatus());
        }
        if (request.getPaymentMethod() != null) {
            booking.setPaymentMethod(request.getPaymentMethod());
        }
        if (request.getPaymentReference() != null) {
            booking.setPaymentReference(request.getPaymentReference());
        }
        if (request.getDiscountAmount() != null) {
            booking.applyDiscount(request.getDiscountAmount());
        }
        if (request.getNotes() != null) {
            booking.setNotes(request.getNotes());
        }
        if (request.getCancellationReason() != null) {
            booking.setCancellationReason(request.getCancellationReason());
        }
        if (request.getIsActive() != null) {
            booking.setIsActive(request.getIsActive());
        }

        booking.setUpdatedAt(LocalDateTime.now());
    }

    /**
     * Convert Booking entity to BookingResponse
     */
    public BookingResponse toResponse(Booking booking) {
        if (booking == null) {
            return null;
        }

        BookingResponse response = new BookingResponse();
        response.setBookingId(booking.getBookingId());
        response.setBookingCode(booking.getBookingCode());
        response.setBookingDate(booking.getBookingDate());
        response.setTotalAmount(booking.getTotalAmount());
        response.setDiscountAmount(booking.getDiscountAmount());
        response.setFinalAmount(booking.getFinalAmount());
        response.setBookingStatus(booking.getBookingStatus());
        response.setPaymentMethod(booking.getPaymentMethod());
        response.setPaymentDate(booking.getPaymentDate());
        response.setPaymentReference(booking.getPaymentReference());
        response.setSeatCount(booking.getSeatCount());
        response.setNotes(booking.getNotes());
        response.setCancellationDate(booking.getCancellationDate());
        response.setCancellationReason(booking.getCancellationReason());
        response.setRefundAmount(booking.getRefundAmount());
        response.setQrCode(booking.getQrCode());
        response.setIsCheckedIn(booking.getIsCheckedIn());
        response.setCheckInTime(booking.getCheckInTime());
        response.setIsActive(booking.getIsActive());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());

        // Customer information
        response.setCustomerName(booking.getCustomerDisplayName());
        response.setCustomerEmail(booking.getCustomerDisplayEmail());
        response.setCustomerPhone(booking.getCustomerDisplayPhone());
        response.setIsGuestBooking(booking.isGuestBooking());

        // Account information
        if (booking.getAccount() != null) {
            response.setAccountId(booking.getAccount().getAccountId());
            response.setAccountFullName(booking.getAccount().getFullName());
            response.setAccountEmail(booking.getAccount().getEmail());
            response.setAccountPhone(booking.getAccount().getPhoneNumber());
        }

        // Schedule information
        if (booking.getSchedule() != null) {
            response.setScheduleId(booking.getSchedule().getScheduleId());
            response.setShowDate(booking.getSchedule().getShowDate());
            response.setStartTime(booking.getSchedule().getStartTime());
            response.setEndTime(booking.getSchedule().getEndTime());
            response.setSchedulePrice(booking.getSchedule().getPrice());
            response.setScheduleStatus(booking.getSchedule().getStatus());
            response.setIs3D(booking.getSchedule().getIs3D());
            response.setIsIMAX(booking.getSchedule().getIsIMAX());
            response.setIs4DX(booking.getSchedule().getIs4DX());

            // Movie information
            if (booking.getSchedule().getMovie() != null) {
                response.setMovieId(booking.getSchedule().getMovie().getMovieId());
                response.setMovieName(booking.getSchedule().getMovie().getMovieName());
                response.setMoviePoster(booking.getSchedule().getMovie().getPoster());
                response.setMovieDuration(booking.getSchedule().getMovie().getDuration());
                response.setMovieRating(booking.getSchedule().getMovie().getRating());
                response.setMovieGenre(booking.getSchedule().getMovie().getGenre());
            }

            // Cinema room information
            if (booking.getSchedule().getCinemaRoom() != null) {
                response.setCinemaRoomId(booking.getSchedule().getCinemaRoom().getCinemaRoomId());
                response.setCinemaRoomName(booking.getSchedule().getCinemaRoom().getCinemaRoomName());
                response.setRoomType(booking.getSchedule().getCinemaRoom().getRoomType());
                response.setTotalSeats(booking.getSchedule().getCinemaRoom().getSeatQuantity());
            }
        }

        // Promotion information
        if (booking.getPromotion() != null) {
            response.setPromotionId(booking.getPromotion().getPromotionId());
            response.setPromotionName(booking.getPromotion().getPromotionName());
            response.setPromotionCode(booking.getPromotion().getPromotionCode());
            response.setPromotionDiscount(booking.getPromotion().getDiscountAmount());
        }

        // Booked seats information
        if (booking.getBookingSeats() != null) {
            List<BookingResponse.BookedSeatInfo> bookedSeats = booking.getBookingSeats().stream()
                    .map(this::toBookedSeatInfo)
                    .collect(Collectors.toList());
            response.setBookedSeats(bookedSeats);
        }

        // Set computed fields
        setComputedFields(response, booking);

        return response;
    }



    /**
     * Convert BookingSeat to BookedSeatInfo
     */
    private BookingResponse.BookedSeatInfo toBookedSeatInfo(BookingSeat bookingSeat) {
        if (bookingSeat == null || bookingSeat.getSeat() == null) {
            return null;
        }

        BookingResponse.BookedSeatInfo seatInfo = new BookingResponse.BookedSeatInfo();
        seatInfo.setSeatId(bookingSeat.getSeat().getSeatId());
        seatInfo.setSeatNumber(bookingSeat.getSeatNumber());
        seatInfo.setSeatType(bookingSeat.getSeatType());
        seatInfo.setSeatPrice(bookingSeat.getSeatPrice());
        seatInfo.setSeatPriceDisplay(CURRENCY_FORMATTER.format(bookingSeat.getSeatPrice()));
        seatInfo.setRowName(bookingSeat.getSeat().getRowName());
        seatInfo.setColumnNumber(bookingSeat.getSeat().getColumnNumber());
        seatInfo.setIsVIP(bookingSeat.isVIPSeat());
        seatInfo.setIsCouple(bookingSeat.isCoupleSeat());

        return seatInfo;
    }

    /**
     * Set computed fields for BookingResponse
     */
    private void setComputedFields(BookingResponse response, Booking booking) {
        // Show date time
        if (booking.getSchedule() != null) {
            response.setShowDateTime(booking.getSchedule().getShowDateTime());
        }

        // Display formats
        response.setDisplayBookingDate(booking.getBookingDate().format(DATE_TIME_FORMATTER));
        if (booking.getSchedule() != null) {
            response.setDisplayShowDate(booking.getSchedule().getShowDate().format(DATE_FORMATTER));
            response.setDisplayShowTime(booking.getSchedule().getStartTime().format(TIME_FORMATTER));
        }

        // Status displays
        response.setStatusDisplay(getStatusDisplay(booking.getBookingStatus()));
        response.setPaymentMethodDisplay(getPaymentMethodDisplay(booking.getPaymentMethod()));

        // Business logic fields
        response.setCanBeCancelled(booking.canBeCancelled());
        response.setCanBeCheckedIn(booking.canBeCheckedIn());
        response.setIsPaid(booking.isPaid());
        response.setIsCompleted(booking.isCompleted());
        response.setIsCancelled(booking.isCancelled());

        // Amount displays
        response.setTotalAmountDisplay(CURRENCY_FORMATTER.format(booking.getTotalAmount()));
        response.setFinalAmountDisplay(CURRENCY_FORMATTER.format(booking.getFinalAmount()));
        response.setDiscountPercentage(String.format("%.1f%%", booking.getDiscountPercentage()));

        // Movie duration
        if (booking.getSchedule() != null && booking.getSchedule().getMovie() != null) {
            response.setMovieDurationDisplay(formatDuration(booking.getSchedule().getMovie().getDuration()));
        }

        // Special features
        if (booking.getSchedule() != null) {
            response.setSpecialFeatures(booking.getSchedule().getSpecialFeaturesText());
        }

        // Time calculations
        if (booking.getSchedule() != null) {
            LocalDateTime showDateTime = booking.getSchedule().getShowDateTime();
            LocalDateTime now = LocalDateTime.now();
            
            response.setHoursUntilShow((int) Duration.between(now, showDateTime).toHours());
            response.setIsUpcoming(showDateTime.isAfter(now));
            response.setIsPast(showDateTime.isBefore(now));
        }
    }



    /**
     * Get status display text in Vietnamese
     */
    private String getStatusDisplay(BookingStatus status) {
        if (status == null) return "";
        
        switch (status) {
            case PENDING:
                return "Chờ xử lý";
            case CONFIRMED:
                return "Đã xác nhận";
            case PAID:
                return "Đã thanh toán";
            case COMPLETED:
                return "Đã hoàn thành";
            case CANCELLED:
                return "Đã hủy";
            default:
                return status.toString();
        }
    }

    /**
     * Get payment method display text in Vietnamese
     */
    private String getPaymentMethodDisplay(String paymentMethod) {
        if (paymentMethod == null) return "";
        
        switch (paymentMethod) {
            case "CASH":
                return "Tiền mặt";
            case "CARD":
                return "Thẻ tín dụng";
            case "ONLINE":
                return "Thanh toán online";
            case "WALLET":
                return "Ví điện tử";
            default:
                return paymentMethod;
        }
    }

    /**
     * Format duration in minutes to hours and minutes
     */
    private String formatDuration(Integer durationMinutes) {
        if (durationMinutes == null) return "";
        
        int hours = durationMinutes / 60;
        int minutes = durationMinutes % 60;
        
        if (hours > 0) {
            return String.format("%d giờ %d phút", hours, minutes);
        } else {
            return String.format("%d phút", minutes);
        }
    }

    /**
     * Generate unique booking code
     */
    private String generateBookingCode() {
        return "BK" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }
} 