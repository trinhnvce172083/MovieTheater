package com.swp.MovieTheaterService.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Loyalty Transaction Entity - Points Management
 * Tracks all loyalty points transactions (earn/redeem)
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Entity
@Table(name = "movietheater_loyalty_transaction")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class LoyaltyTransaction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long transactionId;

    @Column(name = "transaction_type", nullable = false, length = 20)
    private String transactionType; // EARN, REDEEM, EXPIRE, ADJUST

    @Column(name = "points", nullable = false)
    private Integer points;

    @Column(name = "description", nullable = false, length = 200)
    private String description;

    @Column(name = "reference_type", length = 20)
    private String referenceType; // BOOKING, PROMOTION, MANUAL

    @Column(name = "reference_id")
    private Long referenceId; // booking_id, promotion_id, etc.

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate; // For earned points

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;

    // Business methods
    public boolean isEarnTransaction() {
        return "EARN".equals(transactionType);
    }

    public boolean isRedeemTransaction() {
        return "REDEEM".equals(transactionType);
    }

    public boolean isExpired() {
        return expiryDate != null && LocalDateTime.now().isAfter(expiryDate);
    }

    public boolean isExpiring() {
        if (expiryDate == null) return false;
        return LocalDateTime.now().plusDays(30).isAfter(expiryDate);
    }

    // Static factory methods
    public static LoyaltyTransaction earnFromBooking(Account account, Booking booking, Integer points) {
        LoyaltyTransaction transaction = new LoyaltyTransaction();
        transaction.setAccount(account);
        transaction.setBooking(booking);
        transaction.setTransactionType("EARN");
        transaction.setPoints(points);
        transaction.setDescription("Tích điểm từ booking " + booking.getBookingCode());
        transaction.setReferenceType("BOOKING");
        transaction.setReferenceId(booking.getBookingId());
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setExpiryDate(LocalDateTime.now().plusYears(1)); // Points expire after 1 year
        transaction.setIsActive(true);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setUpdatedAt(LocalDateTime.now());
        return transaction;
    }

    public static LoyaltyTransaction redeemForPromotion(Account account, Promotion promotion, Integer points) {
        LoyaltyTransaction transaction = new LoyaltyTransaction();
        transaction.setAccount(account);
        transaction.setPromotion(promotion);
        transaction.setTransactionType("REDEEM");
        transaction.setPoints(-points); // Negative for redemption
        transaction.setDescription("Đổi điểm lấy khuyến mãi: " + promotion.getPromotionName());
        transaction.setReferenceType("PROMOTION");
        transaction.setReferenceId(promotion.getPromotionId());
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setIsActive(true);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setUpdatedAt(LocalDateTime.now());
        return transaction;
    }
} 
