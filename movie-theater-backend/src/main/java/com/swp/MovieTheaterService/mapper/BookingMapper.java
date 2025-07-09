package com.swp.MovieTheaterService.mapper;

import com.swp.MovieTheaterService.dto.booking.*;
import com.swp.MovieTheaterService.entity.*;
import com.swp.MovieTheaterService.enums.BookingStatus;
import com.swp.MovieTheaterService.enums.SeatStatus;
import org.mapstruct.*;
import org.springframework.stereotype.Component;

import java.text.NumberFormat;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * Booking Mapper v2.0.0 (Builder Pattern Compatible)
 * Object mapping between Booking entities and DTOs
 * 
 * @author Dũng_Solo
 * @version 2.0.0
 */
@Component
public class BookingMapper {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = 
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter DATE_FORMATTER = 
            DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = 
            DateTimeFormatter.ofPattern("HH:mm");
    private static final NumberFormat CURRENCY_FORMATTER = 
            NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

    /**
     * Convert BookingCreateRequest to Booking Entity
     */
    public Booking toEntity(BookingCreateRequest request) {
        if (request == null) {
            return null;
        }

        Booking booking = new Booking();
        booking.setCustomerName(request.getCustomerName());
        booking.setCustomerEmail(request.getCustomerEmail());
        booking.setCustomerPhone(request.getCustomerPhone());
        booking.setNotes(request.getNotes());
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
        if (request.getNotes() != null) {
            booking.setNotes(request.getNotes());
        }
        
        booking.setUpdatedAt(LocalDateTime.now());
    }

    /**
     * Convert Booking Entity to BookingResponse DTO
     */
    public BookingResponse toResponse(Booking booking) {
        if (booking == null) {
            return null;
        }

        BookingResponse.BookingResponseBuilder builder = BookingResponse.builder()
                .bookingId(booking.getBookingId())
                .bookingCode(booking.getBookingCode())
                .bookingDate(booking.getBookingDate())
                .bookingStatus(booking.getBookingStatus())
                .totalAmount(booking.getTotalAmount())
                .discountAmount(booking.getDiscountAmount())
                .finalAmount(booking.getFinalAmount())
                .refundAmount(booking.getRefundAmount())
                .customerName(booking.getCustomerDisplayName())
                .customerEmail(booking.getCustomerDisplayEmail())
                .customerPhone(booking.getCustomerDisplayPhone())
                .isGuestBooking(booking.isGuestBooking())
                .paymentMethod(booking.getPaymentMethod())
                .paymentDate(booking.getPaymentDate())
                .paymentReference(booking.getPaymentReference())
                .notes(booking.getNotes())
                .qrCode(booking.getQrCode())
                .isCheckedIn(booking.getIsCheckedIn())
                .checkInTime(booking.getCheckInTime())
                .cancellationDate(booking.getCancellationDate())
                .cancellationReason(booking.getCancellationReason())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt());

        // Schedule information
        if (booking.getSchedule() != null) {
            Schedule schedule = booking.getSchedule();
            builder.schedule(BookingResponse.ScheduleInfo.builder()
                    .scheduleId(schedule.getScheduleId())
                    .showDateTime(schedule.getShowDateTime())
                    .formattedShowDateTime(schedule.getShowDateTime().format(DATE_TIME_FORMATTER))
                                         .language("Vietnamese") // Default language
                     .isSubtitled(false) // Default subtitle
                    .build());

            // Movie information
            if (schedule.getMovie() != null) {
                Movie movie = schedule.getMovie();
                builder.movie(BookingResponse.MovieInfo.builder()
                        .movieId(movie.getMovieId())
                        .title(movie.getTitle())
                        .originalTitle(movie.getOriginalTitle())
                        .duration(movie.getDuration())
                        .rating(movie.getRating())
                        .genres(movie.getGenres())
                        .director(movie.getDirector())
                        .posterUrl(movie.getPosterUrl())
                        .formattedDuration(formatDuration(movie.getDuration()))
                        .build());
            }

            // Cinema information
            if (schedule.getCinemaRoom() != null) {
                CinemaRoom room = schedule.getCinemaRoom();
                builder.cinema(BookingResponse.CinemaInfo.builder()
                        .cinemaRoomId(room.getCinemaRoomId())
                        .cinemaRoomName(room.getCinemaRoomName())
                                                 .cinemaLocation("CGV Cinemas") // Default location
                         .address("Địa chỉ rạp phim") // Default address
                        .build());
            }
        }

        // Promotion information
        if (booking.getPromotion() != null) {
            Promotion promotion = booking.getPromotion();
            builder.promotion(BookingResponse.PromotionInfo.builder()
                    .promotionId(promotion.getPromotionId())
                    .promotionCode(promotion.getPromotionCode())
                    .promotionName(promotion.getPromotionName())
                    .discountType(promotion.getDiscountType())
                    .discountValue(promotion.getDiscountValue())
                    .appliedDiscount(booking.getDiscountAmount())
                    .build());
        }

        // Booked seats information
        if (booking.getBookingSeats() != null && !booking.getBookingSeats().isEmpty()) {
            List<BookingResponse.SeatInfo> seats = booking.getBookingSeats().stream()
                    .map(this::toSeatInfo)
                    .collect(Collectors.toList());
            builder.seats(seats)
                    .seatCount(seats.size());
        }

        // Computed fields
        BookingResponse response = builder.build();
        setComputedFields(response, booking);
        
        return response;
    }

    /**
     * Convert BookingSeat to SeatInfo
     */
    private BookingResponse.SeatInfo toSeatInfo(BookingSeat bookingSeat) {
        if (bookingSeat == null || bookingSeat.getSeat() == null) {
            return null;
        }

        Seat seat = bookingSeat.getSeat();
        return BookingResponse.SeatInfo.builder()
                .seatId(seat.getSeatId())
                .seatNumber(seat.getSeatNumber())
                .seatRow(seat.getRowName())
                .seatColumn(seat.getColumnNumber())
                .seatType(seat.getSeatType())
                .seatPrice(bookingSeat.getSeatPrice())
                .isVIP(seat.isVIP())
                .isCouple(seat.isCouple())
                .build();
    }

    /**
     * Create BookingSeat entity
     */
    public BookingSeat createBookingSeat(Booking booking, Seat seat) {
        BookingSeat bookingSeat = new BookingSeat();
        bookingSeat.setBooking(booking);
        bookingSeat.setSeat(seat);
        bookingSeat.setSeatId(seat.getSeatId()); // Reference for direct access
        bookingSeat.setSeatNumber(seat.getSeatNumber());
        bookingSeat.setSeatType(seat.getSeatType());
        bookingSeat.setSeatPrice(seat.getSeatPrice() != null ? seat.getSeatPrice() : 0.0);
        bookingSeat.setStatus(SeatStatus.TEMPORARILY_RESERVED);
        bookingSeat.setActive(true);
        bookingSeat.setCreatedAt(LocalDateTime.now());
        bookingSeat.setUpdatedAt(LocalDateTime.now());
        
        return bookingSeat;
    }

    /**
     * Set computed fields for BookingResponse
     */
    private void setComputedFields(BookingResponse response, Booking booking) {
        // Format dates
        if (response.getBookingDate() != null) {
            response.setFormattedBookingDate(response.getBookingDate().format(DATE_TIME_FORMATTER));
        }

        if (response.getSchedule() != null && response.getSchedule().getShowDateTime() != null) {
            response.setFormattedShowDateTime(response.getSchedule().getFormattedShowDateTime());
        }

        // Status display
        response.setStatusDisplayName(getStatusDisplay(response.getBookingStatus()));

        // Business logic flags
        response.setCanBeCancelled(booking.canBeCancelled());
        response.setCanBeCheckedIn(booking.canBeCheckedIn());
                 // Check if booking is expired (show time passed)
         if (booking.getSchedule() != null && booking.getSchedule().getShowDateTime() != null) {
             response.setIsExpired(booking.getSchedule().getShowDateTime().isBefore(LocalDateTime.now()));
         } else {
             response.setIsExpired(false);
         }

        // Refund policy
        response.setRefundPolicy(getRefundPolicy(booking));
    }

    /**
     * Get status display text in Vietnamese
     */
    private String getStatusDisplay(BookingStatus status) {
        if (status == null) return "";
        
        switch (status) {
            case PENDING:
                return "Chờ thanh toán";
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
     * Format duration in minutes to hours and minutes
     */
    private String formatDuration(Integer durationMinutes) {
        if (durationMinutes == null) return "";
        
        int hours = durationMinutes / 60;
        int minutes = durationMinutes % 60;
        
        if (hours > 0 && minutes > 0) {
            return String.format("%d giờ %d phút", hours, minutes);
        } else if (hours > 0) {
            return String.format("%d giờ", hours);
        } else {
            return String.format("%d phút", minutes);
        }
    }

    /**
     * Get refund policy text
     */
    private String getRefundPolicy(Booking booking) {
        if (booking.getSchedule() == null) return "";
        
        LocalDateTime showTime = booking.getSchedule().getShowDateTime();
        LocalDateTime now = LocalDateTime.now();
        
        long hoursUntilShow = Duration.between(now, showTime).toHours();
        
        if (hoursUntilShow >= 24) {
            return "Có thể hủy vé và được hoàn tiền 100%";
        } else if (hoursUntilShow >= 2) {
            return "Có thể hủy vé và được hoàn tiền 50%";
        } else {
            return "Không thể hủy vé";
        }
    }
} 