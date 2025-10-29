package com.swp.MovieTheaterService.dto.cinema;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Concession Create Request DTO
 * Data Transfer Object for creating new concession items
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Yêu cầu tạo món đồ ăn/uống mới")
public class ConcessionCreateRequest {

    @NotBlank(message = "Tên món không được để trống")
    @Size(max = 100, message = "Tên món không được vượt quá 100 ký tự")
    @Schema(description = "Tên món đồ ăn/uống", example = "Bắp rang bơ (Lớn)", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    @Schema(description = "Mô tả chi tiết", example = "Bắp rang bơ thơm ngon, giòn tan")
    private String description;

    @NotBlank(message = "Danh mục không được để trống")
    @Schema(description = "Danh mục món", example = "POPCORN", requiredMode = Schema.RequiredMode.REQUIRED)
    private String category;

    @NotNull(message = "Giá không được để trống")
    @DecimalMin(value = "0.0", message = "Giá phải lớn hơn hoặc bằng 0")
    @Schema(description = "Giá món", example = "45000", requiredMode = Schema.RequiredMode.REQUIRED)
    private BigDecimal price;

    @Schema(description = "URL hình ảnh", example = "https://example.com/popcorn.jpg")
    private String imageUrl;

    @Size(max = 100, message = "Vị không được vượt quá 100 ký tự")
    @Schema(description = "Vị của món", example = "Caramel")
    private String flavor;

    @Size(max = 20, message = "Kích thước không được vượt quá 20 ký tự")
    @Schema(description = "Kích thước", example = "L")
    private String size;

    @NotNull(message = "Số lượng tồn kho không được để trống")
    @Min(value = 0, message = "Số lượng tồn kho phải lớn hơn hoặc bằng 0")
    @Schema(description = "Số lượng tồn kho", example = "100", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer stockQuantity;

    @Schema(description = "Trạng thái có sẵn", example = "true")
    private Boolean isAvailable = true;

    @Schema(description = "Trạng thái hoạt động", example = "true")
    private Boolean isActive = true;

    @Min(value = 0, message = "Thứ tự hiển thị phải lớn hơn hoặc bằng 0")
    @Schema(description = "Thứ tự hiển thị", example = "1")
    private Integer displayOrder;
}