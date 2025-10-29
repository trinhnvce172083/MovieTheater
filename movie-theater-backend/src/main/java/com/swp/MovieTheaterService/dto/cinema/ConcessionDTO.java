package com.swp.MovieTheaterService.dto.cinema;

import com.swp.MovieTheaterService.enums.ConcessionCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Concession DTO
 * Data Transfer Object for Concession entity
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConcessionDTO {
    private Long concessionId;
    private String name;
    private String description;
    private ConcessionCategory category;
    private BigDecimal price;
    private String imageUrl;
    private String size;
    private String flavor;
    private Integer stockQuantity;
    private Boolean isAvailable;
    private Boolean isActive;
    private Integer displayOrder;
    
    // Display methods
    public boolean isInStock() {
        return stockQuantity != null && stockQuantity > 0 && 
               Boolean.TRUE.equals(isAvailable) && Boolean.TRUE.equals(isActive);
    }
    
    public String getSizeDisplay() {
        if (size == null || size.isEmpty()) return "";
        return switch (size.toUpperCase()) {
            case "S" -> "Nhỏ";
            case "M" -> "Vừa";
            case "L" -> "Lớn";
            default -> size;
        };
    }
    
    public String getFlavorDisplay() {
        if (flavor == null || flavor.isEmpty()) return "";
        return switch (flavor.toLowerCase()) {
            case "caramel" -> "Caramel";
            case "butter", "original" -> "Bơ";
            case "cheese" -> "Phô mai";
            case "traditional" -> "Truyền thống";
            default -> flavor;
        };
    }
    
    public String getPriceDisplay() {
        return String.format("%,.0f VND", price);
    }
}
