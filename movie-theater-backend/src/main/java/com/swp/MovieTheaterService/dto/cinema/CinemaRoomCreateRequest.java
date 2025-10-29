package com.swp.MovieTheaterService.dto.cinema;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Cinema Room Create Request DTO
 * Data transfer object for creating new cinema rooms
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CinemaRoomCreateRequest {

    @NotBlank(message = "Tên phòng chiếu không được để trống")
    @Size(min = 2, max = 50, message = "Tên phòng chiếu phải từ 2-50 ký tự")
    @Pattern(regexp = "^[A-Za-z0-9\\s-_]+$", message = "Tên phòng chiếu chỉ được chứa chữ cái, số, dấu cách, dấu gạch ngang và gạch dưới")
    private String cinemaRoomName;

    @NotNull(message = "Số lượng ghế không được để trống")
    @Min(value = 1, message = "Số lượng ghế phải lớn hơn 0")
    @Max(value = 500, message = "Số lượng ghế không được vượt quá 500")
    private Integer seatQuantity;

    @Pattern(regexp = "^(STANDARD|VIP|IMAX|4DX)$", message = "Loại phòng không hợp lệ (STANDARD, VIP, IMAX, 4DX)")
    private String roomType = "STANDARD";

    @Size(max = 1000, message = "Mô tả không được vượt quá 1000 ký tự")
    private String description;

    @NotNull(message = "Số hàng ghế không được để trống")
    @Min(value = 1, message = "Số hàng ghế phải lớn hơn 0")
    @Max(value = 30, message = "Số hàng ghế không được vượt quá 30")
    private Integer rows;

    @NotNull(message = "Số cột ghế không được để trống")
    @Min(value = 1, message = "Số cột ghế phải lớn hơn 0")
    @Max(value = 50, message = "Số cột ghế không được vượt quá 50")
    private Integer columns;

    private Boolean has3D = false;

    private Boolean hasDolbyAtmos = false;

    private Boolean hasReclinerSeats = false;

    @NotNull(message = "Hệ số giá không được để trống")
    @DecimalMin(value = "0.1", message = "Hệ số giá phải lớn hơn hoặc bằng 0.1")
    @DecimalMax(value = "10.0", message = "Hệ số giá không được vượt quá 10.0")
    private Double priceMultiplier = 1.0;

    // Validation method to check if seat quantity matches rows * columns
    public boolean isSeatQuantityValid() {
        if (rows != null && columns != null && seatQuantity != null) {
            return seatQuantity <= (rows * columns);
        }
        return true; // Let other validations handle null cases
    }
}