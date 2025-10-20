package com.swp.MovieTheaterService.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * User Promotion Code Entity
 * Tracks unique promotion codes purchased by users with points
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Entity
@Table(name = "user_promotion_codes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPromotionCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_promotion_code_id")
    private Long userPromotionCodeId;

    @Column(name = "unique_code", unique = true, nullable = false, length = 50)
    private String uniqueCode; // Unique code generated for user

    @Column(name = "points_spent", nullable = false)
    private Integer pointsSpent; // Points spent to purchase this promotion

    @Column(name = "is_used", nullable = false)
    @Builder.Default
    private Boolean isUsed = false; // Whether code has been used

    @Column(name = "used_at")
    private LocalDateTime usedAt; // When code was used

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt; // When code expires

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "purchased_at", nullable = false)
    private LocalDateTime purchasedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account; // User who purchased this code

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id", nullable = false)
    private Promotion promotion; // Original promotion template

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking; // Booking where this code was used

    // Business methods
    public boolean isValid() {
        return isActive &&
                !isUsed &&
                LocalDateTime.now().isBefore(expiresAt);
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public void markAsUsed(Booking booking) {
        this.isUsed = true;
        this.usedAt = LocalDateTime.now();
        this.booking = booking;
        this.updatedAt = LocalDateTime.now();
    }

    public void deactivate() {
        this.isActive = false;
        this.updatedAt = LocalDateTime.now();
    }

    public long getHoursUntilExpiry() {
        if (isExpired()) return 0;
        return java.time.Duration.between(LocalDateTime.now(), expiresAt).toHours();
    }

    public String getStatusDisplay() {
        if (!isActive) return "Không hoạt động";
        if (isUsed) return "Đã sử dụng";
        if (isExpired()) return "Đã hết hạn";
        return "Có thể sử dụng";
    }
} 
