package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.entity.Account;
import com.swp.MovieTheaterService.entity.Promotion;
import com.swp.MovieTheaterService.entity.UserPromotionCode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * User Promotion Code Service Interface
 * Business logic for managing user-specific promotion codes
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
public interface UserPromotionCodeService {

    /**
     * Create a new user promotion code
     */
    UserPromotionCode createUserPromotionCode(Account account, Promotion promotion, int pointsSpent);

    /**
     * Find by unique code
     */
    Optional<UserPromotionCode> findByUniqueCode(String uniqueCode);

    /**
     * Find valid codes by account
     */
    List<UserPromotionCode> findValidCodesByAccount(Account account);

    /**
     * Find codes by account and promotion
     */
    List<UserPromotionCode> findByAccountAndPromotion(Account account, Promotion promotion);

    /**
     * Count valid codes by account and promotion
     */
    Long countValidCodesByAccountAndPromotion(Account account, Promotion promotion);

    /**
     * Mark code as used
     */
    UserPromotionCode markAsUsed(String uniqueCode, Long bookingId);

    /**
     * Deactivate code
     */
    void deactivateCode(String uniqueCode);

    /**
     * Find expired codes for cleanup
     */
    List<UserPromotionCode> findExpiredCodes();

    /**
     * Find codes by account with pagination
     */
    Page<UserPromotionCode> findByAccountOrderByPurchasedAtDesc(Account account, Pageable pageable);

    /**
     * Find used codes by account
     */
    List<UserPromotionCode> findUsedCodesByAccount(Account account);

    /**
     * Check if unique code exists
     */
    boolean existsByUniqueCode(String uniqueCode);

    /**
     * Find codes expiring soon for notification
     */
    List<UserPromotionCode> findCodesExpiringSoon(int hoursAhead);

    /**
     * Get user promotion statistics
     */
    Long countTotalCodesByAccount(Account account);

    Long countUsedCodesByAccount(Account account);

    Long sumPointsSpentByAccount(Account account);

    /**
     * Generate unique code
     */
    String generateUniqueCode(String promotionCode, Long accountId);

    /**
     * Validate user promotion code
     */
    boolean isValidUserPromotionCode(String uniqueCode, Account account);
} 