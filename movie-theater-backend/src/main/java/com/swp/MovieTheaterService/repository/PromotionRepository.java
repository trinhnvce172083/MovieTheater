package com.swp.MovieTheaterService.repository;

import com.swp.MovieTheaterService.entity.Promotion;
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
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    // Basic queries
    Optional<Promotion> findByPromotionCodeAndIsActiveTrue(String promotionCode);
    
    List<Promotion> findByIsActiveTrueOrderByDisplayOrderAscCreatedAtDesc();
    
    Page<Promotion> findByIsActiveTrueOrderByDisplayOrderAscCreatedAtDesc(Pageable pageable);

    // Status-based queries
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
           "CURRENT_DATE >= p.startDate AND CURRENT_DATE <= p.endDate " +
           "ORDER BY p.displayOrder ASC, p.createdAt DESC")
    List<Promotion> findActivePromotions();

    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
           "CURRENT_DATE >= p.startDate AND CURRENT_DATE <= p.endDate " +
           "ORDER BY p.displayOrder ASC, p.createdAt DESC")
    Page<Promotion> findActivePromotions(Pageable pageable);

    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
           "CURRENT_DATE < p.startDate " +
           "ORDER BY p.startDate ASC")
    List<Promotion> findUpcomingPromotions();

    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
           "CURRENT_DATE > p.endDate " +
           "ORDER BY p.endDate DESC")
    List<Promotion> findExpiredPromotions();

    // Featured promotions
    List<Promotion> findByIsActiveTrueAndIsFeaturedTrueOrderByDisplayOrderAscCreatedAtDesc();

    // Points-based promotions
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
           "p.isPointsPromotion = true AND " +
           "CURRENT_DATE >= p.startDate AND CURRENT_DATE <= p.endDate " +
           "ORDER BY p.pointsRequired ASC")
    List<Promotion> findPointsPromotions();

    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
           "p.isPointsPromotion = true AND " +
           "p.pointsRequired <= :availablePoints AND " +
           "CURRENT_DATE >= p.startDate AND CURRENT_DATE <= p.endDate " +
           "ORDER BY p.pointsRequired ASC")
    List<Promotion> findRedeemablePromotions(@Param("availablePoints") Integer availablePoints);

    // Member-specific promotions
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
           "CURRENT_DATE >= p.startDate AND CURRENT_DATE <= p.endDate AND " +
           "(p.memberOnly = false OR " +
           "(p.memberOnly = true AND (p.membershipLevels IS NULL OR p.membershipLevels LIKE %:membershipLevel%))) " +
           "ORDER BY p.displayOrder ASC, p.createdAt DESC")
    List<Promotion> findPromotionsForMember(@Param("membershipLevel") String membershipLevel);

    // Search promotions
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
           "(LOWER(p.promotionName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.promotionCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY p.displayOrder ASC, p.createdAt DESC")
    Page<Promotion> searchPromotions(@Param("keyword") String keyword, Pageable pageable);

    // Discount type queries
    List<Promotion> findByIsActiveTrueAndDiscountTypeOrderByCreatedAtDesc(String discountType);

    // Date range queries
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
           "p.startDate >= :startDate AND p.endDate <= :endDate " +
           "ORDER BY p.startDate ASC")
    List<Promotion> findPromotionsByDateRange(@Param("startDate") LocalDate startDate, 
                                            @Param("endDate") LocalDate endDate);

    // Usage statistics
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
           "p.maxUsageCount IS NOT NULL AND " +
           "p.currentUsageCount >= p.maxUsageCount " +
           "ORDER BY p.endDate ASC")
    List<Promotion> findUsageLimitReachedPromotions();

    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND " +
           "p.maxUsageCount IS NOT NULL AND " +
           "p.currentUsageCount < p.maxUsageCount AND " +
           "CURRENT_DATE >= p.startDate AND CURRENT_DATE <= p.endDate " +
           "ORDER BY p.displayOrder ASC")
    List<Promotion> findAvailablePromotions();

    // Count queries
    @Query("SELECT COUNT(p) FROM Promotion p WHERE p.isActive = true")
    Long countActivePromotions();

    @Query("SELECT COUNT(p) FROM Promotion p WHERE p.isActive = true AND " +
           "CURRENT_DATE >= p.startDate AND CURRENT_DATE <= p.endDate")
    Long countCurrentPromotions();

    @Query("SELECT COUNT(p) FROM Promotion p WHERE p.isActive = true AND " +
           "p.isPointsPromotion = true")
    Long countPointsPromotions();

    // Validation queries
    boolean existsByPromotionCodeAndIsActiveTrue(String promotionCode);

    @Query("SELECT COUNT(p) FROM Promotion p WHERE p.promotionCode = :promotionCode AND " +
           "p.isActive = true AND p.promotionId != :promotionId")
    Long countByPromotionCodeAndNotId(@Param("promotionCode") String promotionCode, 
                                     @Param("promotionId") Long promotionId);
} 