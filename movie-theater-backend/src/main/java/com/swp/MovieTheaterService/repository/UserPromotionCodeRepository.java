package com.swp.MovieTheaterService.repository;

import com.swp.MovieTheaterService.entity.Account;
import com.swp.MovieTheaterService.entity.Promotion;
import com.swp.MovieTheaterService.entity.UserPromotionCode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * User Promotion Code Repository
 * Handles database operations for user-specific promotion codes
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Repository
public interface UserPromotionCodeRepository extends JpaRepository<UserPromotionCode, Long> {

    /**
     * Find by unique code
     */
    Optional<UserPromotionCode> findByUniqueCode(String uniqueCode);

    /**
     * Find valid codes by user
     */
    @Query("SELECT upc FROM UserPromotionCode upc WHERE upc.account = :account " +
           "AND upc.isActive = true AND upc.isUsed = false " +
           "AND upc.expiresAt > :now")
    List<UserPromotionCode> findValidCodesByAccount(@Param("account") Account account, 
                                                   @Param("now") LocalDateTime now);

    /**
     * Find user codes for specific promotion
     */
    @Query("SELECT upc FROM UserPromotionCode upc WHERE upc.account = :account " +
           "AND upc.promotion = :promotion AND upc.isActive = true")
    List<UserPromotionCode> findByAccountAndPromotion(@Param("account") Account account,
                                                      @Param("promotion") Promotion promotion);

    /**
     * Count valid codes by user and promotion
     */
    @Query("SELECT COUNT(upc) FROM UserPromotionCode upc WHERE upc.account = :account " +
           "AND upc.promotion = :promotion AND upc.isActive = true AND upc.isUsed = false")
    Long countValidCodesByAccountAndPromotion(@Param("account") Account account,
                                            @Param("promotion") Promotion promotion);

    /**
     * Find expired codes for cleanup
     */
    @Query("SELECT upc FROM UserPromotionCode upc WHERE upc.expiresAt < :now " +
           "AND upc.isActive = true AND upc.isUsed = false")
    List<UserPromotionCode> findExpiredCodes(@Param("now") LocalDateTime now);

    /**
     * Find codes by user with pagination
     */
    @Query("SELECT upc FROM UserPromotionCode upc WHERE upc.account = :account " +
           "ORDER BY upc.purchasedAt DESC")
    Page<UserPromotionCode> findByAccountOrderByPurchasedAtDesc(@Param("account") Account account,
                                                               Pageable pageable);

    /**
     * Find used codes by user
     */
    @Query("SELECT upc FROM UserPromotionCode upc WHERE upc.account = :account " +
           "AND upc.isUsed = true ORDER BY upc.usedAt DESC")
    List<UserPromotionCode> findUsedCodesByAccount(@Param("account") Account account);

    /**
     * Check if unique code exists
     */
    boolean existsByUniqueCode(String uniqueCode);

    /**
     * Find codes expiring soon for notification
     */
    @Query("SELECT upc FROM UserPromotionCode upc WHERE upc.expiresAt BETWEEN :now AND :soonTime " +
           "AND upc.isActive = true AND upc.isUsed = false")
    List<UserPromotionCode> findCodesExpiringSoon(@Param("now") LocalDateTime now,
                                                 @Param("soonTime") LocalDateTime soonTime);

    /**
     * Get user promotion statistics
     */
    @Query("SELECT COUNT(upc) FROM UserPromotionCode upc WHERE upc.account = :account")
    Long countTotalCodesByAccount(@Param("account") Account account);

    @Query("SELECT COUNT(upc) FROM UserPromotionCode upc WHERE upc.account = :account AND upc.isUsed = true")
    Long countUsedCodesByAccount(@Param("account") Account account);

    @Query("SELECT SUM(upc.pointsSpent) FROM UserPromotionCode upc WHERE upc.account = :account")
    Long sumPointsSpentByAccount(@Param("account") Account account);
} 
