package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.entity.Promotion;
import com.swp.MovieTheaterService.dto.promotion.PromotionCreateRequest;
import com.swp.MovieTheaterService.enums.DiscountType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

/**
 * Promotion Service Interface
 * Business logic for promotion management
 * Updated for simplified entity structure
 */
public interface PromotionService {

    // CRUD Operations
    Promotion createPromotion(PromotionCreateRequest request);

    Promotion updatePromotion(Long promotionId, PromotionCreateRequest request);

    void deletePromotion(Long promotionId);

    Promotion getPromotionById(Long promotionId);

    Promotion getPromotionByCode(String promotionCode);

    // Query Operations
    List<Promotion> getAllActivePromotions();

    List<Promotion> getActivePromotions(); // Alias for getAllActivePromotions

    Page<Promotion> getActivePromotions(Pageable pageable);

    List<Promotion> getUpcomingPromotions();

    List<Promotion> getExpiredPromotions();

    List<Promotion> getFeaturedPromotions();

    List<Promotion> getPointsPromotions();

    List<Promotion> getRedeemablePromotions(Integer availablePoints);

    Page<Promotion> searchPromotions(String keyword, Pageable pageable);

    List<Promotion> getPromotionsByDiscountType(DiscountType discountType);

    List<Promotion> getPromotionsByDateRange(LocalDate startDate, LocalDate endDate);

    // Validation Operations
    boolean validatePromotion(String promotionCode);

    boolean validatePromotionForBooking(String promotionCode, Double totalAmount);

    Double calculateDiscount(String promotionCode, Double totalAmount);

    // Usage Tracking
    void applyPromotion(String promotionCode);

    void incrementUserUsage(String promotionCode, Long userId);

    boolean isUserUsageLimitReached(String promotionCode, Long userId);

    // Statistics
    Long getActivePromotionsCount();

    Long getCurrentPromotionsCount();
} 
