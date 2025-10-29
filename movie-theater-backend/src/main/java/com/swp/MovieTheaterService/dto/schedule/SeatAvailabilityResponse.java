package com.swp.MovieTheaterService.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Seat Availability Response DTO
 * Data transfer object for seat availability information
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatAvailabilityResponse {

    private Long scheduleId;
    private Integer totalSeats;
    private Integer bookedSeats;
    private Integer availableSeats;
    private List<String> availableSeatNumbers;
    private List<String> bookedSeatNumbers;
    private List<SeatInfo> seatLayout;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatInfo {
        private String seatNumber;
        private String seatType;
        private String status; // AVAILABLE, BOOKED, SELECTED, DISABLED
        private Double price;
        private String rowLetter;
        private Integer columnNumber;
    }
}