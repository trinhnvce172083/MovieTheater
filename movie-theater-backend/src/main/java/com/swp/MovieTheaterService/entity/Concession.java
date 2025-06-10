package com.swp.MovieTheaterService.entity;

import com.swp.MovieTheaterService.enums.ConcessionCategory;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Concession Entity - Đồ ăn/uống đơn giản
 * Represents simple food and beverage items (popcorn and drinks)
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Entity
@Table(name = "concessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Concession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "concession_id")
    private Long concessionId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private ConcessionCategory category;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "size", length = 20)
    private String size; // S, M, L

    @Column(name = "flavor", length = 100)
    private String flavor; // Vị của bắp: caramel, bơ, phô mai, truyền thống

    @Column(name = "stock_quantity", nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;

    @Column(name = "is_available", nullable = false)
    @Builder.Default
    private Boolean isAvailable = true;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "concession", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BookingConcession> bookingConcessions;

    // Business methods
    public boolean isInStock() {
        return stockQuantity > 0 && isAvailable && isActive;
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
            case "butter" -> "Bơ";
            case "cheese" -> "Phô mai";
            case "traditional" -> "Truyền thống";
            default -> flavor;
        };
    }

    public String getPriceDisplay() {
        return String.format("%,.0f VND", price);
    }

    public String getFullName() {
        StringBuilder fullName = new StringBuilder(name);
        
        if (category == ConcessionCategory.POPCORN && flavor != null && !flavor.isEmpty()) {
            fullName.append(" - Vị ").append(getFlavorDisplay());
        }
        
        if (size != null && !size.isEmpty()) {
            fullName.append(" (").append(getSizeDisplay()).append(")");
        }
        
        return fullName.toString();
    }

    public void decreaseStock(int quantity) {
        if (stockQuantity >= quantity) {
            stockQuantity -= quantity;
        } else {
            throw new IllegalStateException("Không đủ hàng trong kho");
        }
    }

    public void increaseStock(int quantity) {
        stockQuantity += quantity;
    }
} 