package com.swp.MovieTheaterService.dto.cinema;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Seat Layout Request DTO
 * Data transfer object for creating seat layout
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatLayoutRequest {

    @NotNull(message = "ID phòng chiếu không được để trống")
    private Long cinemaRoomId;

    @NotEmpty(message = "Danh sách ghế không được để trống")
    @Valid
    private List<SeatCreateRequest> seats;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatCreateRequest {
        
        @NotNull(message = "Hàng ghế không được để trống")
        private Integer seatRow;
        
        @NotNull(message = "Cột ghế không được để trống")
        private Integer seatColumn;
        
        private String seatType = "STANDARD"; // STANDARD, VIP, COUPLE, WHEELCHAIR
        
        private Boolean isRecliner = false;
        
        private Boolean hasTable = false;
        
        private Double priceMultiplier = 1.0;
    }
}