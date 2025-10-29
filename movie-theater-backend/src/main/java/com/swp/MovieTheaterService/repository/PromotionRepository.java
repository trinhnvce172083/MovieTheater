package com.swp.MovieTheaterService.repository;

import com.swp.MovieTheaterService.entity.Promotion;
import com.swp.MovieTheaterService.enums.DiscountType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Promotion Repository
 * Data access layer for Promotion entity
 * Updated for simplified entity structure
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    // Basic queries
    Optional<Promotion> findByPromotionCodeAndIsActiveTrue(String promotionCode);

    List<Promotion> findByIsActiveTrueOrderByCreatedAtDesc();

    Page<Promotion> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);

    // Active promotions
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
            "p.startDate <= CURRENT_DATE AND p.endDate >= CURRENT_DATE")
    List<Promotion> findActivePromotions();

    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
            "p.startDate <= CURRENT_DATE AND p.endDate >= CURRENT_DATE")
    Page<Promotion> findActivePromotions(Pageable pageable);

    // Upcoming promotions
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
            "p.startDate > CURRENT_DATE")
    List<Promotion> findUpcomingPromotions();

    // Expired promotions
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
            "p.endDate < CURRENT_DATE")
    List<Promotion> findExpiredPromotions();

    // Featured promotions
    List<Promotion> findByIsActiveTrueAndIsFeaturedTrueOrderByCreatedAtDesc();

    // Points-based promotions
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
            "p.pointsRequired > 0 AND " +
            "p.startDate <= CURRENT_DATE AND p.endDate >= CURRENT_DATE")
    List<Promotion> findPointsPromotions();

    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
            "p.pointsRequired > 0 AND p.pointsRequired <= :availablePoints AND " +
            "p.startDate <= CURRENT_DATE AND p.endDate >= CURRENT_DATE")
    List<Promotion> findRedeemablePromotions(@Param("availablePoints") Integer availablePoints);

    // Search promotions
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
           "(LOWER(p.promotionName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.promotionCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Promotion> searchPromotions(@Param("keyword") String keyword, Pageable pageable);

    // By discount type
    List<Promotion> findByIsActiveTrueAndDiscountTypeOrderByCreatedAtDesc(DiscountType discountType);

    // By date range
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
            "p.startDate >= :startDate AND p.endDate <= :endDate")
    List<Promotion> findPromotionsByDateRange(@Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);

    // Usage limit reached
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
            "p.currentUsageCount >= p.maxUsageCount")
    List<Promotion> findUsageLimitReachedPromotions();

    // Available promotions (not expired, not reached limit)
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
            "p.startDate <= CURRENT_DATE AND p.endDate >= CURRENT_DATE AND " +
            "p.currentUsageCount < p.maxUsageCount")
    List<Promotion> findAvailablePromotions();

    // Statistics
    @Query("SELECT COUNT(p) FROM Promotion p WHERE p.isActive = true")
    Long countActivePromotions();

    @Query("SELECT COUNT(p) FROM Promotion p WHERE p.isActive = true AND " +
            "p.startDate <= CURRENT_DATE AND p.endDate >= CURRENT_DATE")
    Long countCurrentPromotions();

    // Check if promotion code exists
    boolean existsByPromotionCode(String promotionCode);

    // Find by code (case insensitive)
    @Query("SELECT p FROM Promotion p WHERE LOWER(p.promotionCode) = LOWER(:code)")
    Optional<Promotion> findByPromotionCodeIgnoreCase(@Param("code") String code);
}