package com.swp.MovieTheaterService.dto.cinema;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Concession Update Request DTO
 * Data Transfer Object for updating concession items
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Yêu cầu cập nhật món đồ ăn/uống")
public class ConcessionUpdateRequest {

    @Size(max = 100, message = "Tên món không được vượt quá 100 ký tự")
    @Schema(description = "Tên món đồ ăn/uống", example = "Bắp rang bơ (Lớn)")
    private String name;

    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    @Schema(description = "Mô tả chi tiết", example = "Bắp rang bơ thơm ngon, giòn tan")
    private String description;

    @Schema(description = "Danh mục món", example = "POPCORN")
    private String category;

    @DecimalMin(value = "0.0", message = "Giá phải lớn hơn hoặc bằng 0")
    @Schema(description = "Giá món", example = "45000")
    private BigDecimal price;

    @Schema(description = "URL hình ảnh", example = "https://example.com/popcorn.jpg")
    private String imageUrl;

    @Size(max = 100, message = "Vị không được vượt quá 100 ký tự")
    @Schema(description = "Vị của món", example = "Caramel")
    private String flavor;

    @Size(max = 20, message = "Kích thước không được vượt quá 20 ký tự")
    @Schema(description = "Kích thước", example = "L")
    private String size;

    @Min(value = 0, message = "Số lượng tồn kho phải lớn hơn hoặc bằng 0")
    @Schema(description = "Số lượng tồn kho", example = "100")
    private Integer stockQuantity;

    @Schema(description = "Trạng thái có sẵn", example = "true")
    private Boolean isAvailable;

    @Schema(description = "Trạng thái hoạt động", example = "true")
    private Boolean isActive;

    @Min(value = 0, message = "Thứ tự hiển thị phải lớn hơn hoặc bằng 0")
    @Schema(description = "Thứ tự hiển thị", example = "1")
    private Integer displayOrder;
}