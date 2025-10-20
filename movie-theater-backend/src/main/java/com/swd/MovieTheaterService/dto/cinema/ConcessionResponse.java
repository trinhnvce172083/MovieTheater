package com.swp.MovieTheaterService.dto.cinema;

import com.swp.MovieTheaterService.enums.ConcessionCategory;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Concession Response DTO
 * Data Transfer Object for concession responses
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response thông tin đồ ăn/uống")
public class ConcessionResponse {

    @Schema(description = "ID concession", example = "1")
    private Long concessionId;

    @Schema(description = "Tên món", example = "Bắp rang bơ (Lớn)")
    private String name;

    @Schema(description = "Mô tả", example = "Bắp rang bơ thơm ngon, giòn tan")
    private String description;

    @Schema(description = "Danh mục", example = "POPCORN")
    private ConcessionCategory category;

    @Schema(description = "Giá", example = "45000")
    private BigDecimal price;

    @Schema(description = "URL hình ảnh", example = "https://example.com/popcorn.jpg")
    private String imageUrl;

    @Schema(description = "Vị", example = "Caramel")
    private String flavor;

    @Schema(description = "Kích thước", example = "L")
    private String size;

    @Schema(description = "Số lượng tồn kho", example = "100")
    private Integer stockQuantity;

    @Schema(description = "Trạng thái có sẵn", example = "true")
    private Boolean isAvailable;

    @Schema(description = "Trạng thái hoạt động", example = "true")
    private Boolean isActive;

    @Schema(description = "Thứ tự hiển thị", example = "1")
    private Integer displayOrder;

    @Schema(description = "Thời gian tạo")
    private LocalDateTime createdAt;

    @Schema(description = "Thời gian cập nhật")
    private LocalDateTime updatedAt;

    // Helper methods
    public String getFormattedPrice() {
        if (price != null) {
            return String.format("%,.0f VND", price);
        }
        return "";
    }

    public String getFullName() {
        StringBuilder fullName = new StringBuilder(name);
        if (size != null && !size.trim().isEmpty()) {
            fullName.append(" (").append(size).append(")");
        }
        if (flavor != null && !flavor.trim().isEmpty()) {
            fullName.append(" - ").append(flavor);
        }
        return fullName.toString();
    }

    public boolean isInStock() {
        return stockQuantity != null && stockQuantity > 0;
    }

    public boolean isAvailableForOrder() {
        return isAvailable != null && isAvailable && isInStock();
    }
} 
