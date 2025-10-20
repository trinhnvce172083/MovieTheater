package com.swp.MovieTheaterService.repository;

import com.swp.MovieTheaterService.entity.LoyaltyTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Loyalty Transaction Repository
 * Data access layer for LoyaltyTransaction entity
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Repository
public interface LoyaltyTransactionRepository extends JpaRepository<LoyaltyTransaction, Long> {

    // Account-based queries
    List<LoyaltyTransaction> findByAccountAccountIdAndIsActiveTrueOrderByTransactionDateDesc(Long accountId);

    Page<LoyaltyTransaction> findByAccountAccountIdAndIsActiveTrueOrderByTransactionDateDesc(Long accountId, Pageable pageable);

    // Transaction type queries
    List<LoyaltyTransaction> findByAccountAccountIdAndTransactionTypeAndIsActiveTrueOrderByTransactionDateDesc(
            Long accountId, String transactionType);

    // Points calculation queries
    @Query("SELECT COALESCE(SUM(lt.points), 0) FROM LoyaltyTransaction lt WHERE " +
            "lt.account.accountId = :accountId AND lt.isActive = true AND " +
            "(lt.expiryDate IS NULL OR lt.expiryDate > CURRENT_TIMESTAMP)")
    Integer calculateAvailablePoints(@Param("accountId") Long accountId);

    @Query("SELECT COALESCE(SUM(lt.points), 0) FROM LoyaltyTransaction lt WHERE " +
            "lt.account.accountId = :accountId AND lt.transactionType = 'EARN' AND " +
            "lt.isActive = true")
    Integer calculateTotalEarnedPoints(@Param("accountId") Long accountId);

    @Query("SELECT COALESCE(SUM(ABS(lt.points)), 0) FROM LoyaltyTransaction lt WHERE " +
            "lt.account.accountId = :accountId AND lt.transactionType = 'REDEEM' AND " +
            "lt.isActive = true")
    Integer calculateTotalRedeemedPoints(@Param("accountId") Long accountId);

    // Expiring points
    @Query("SELECT lt FROM LoyaltyTransaction lt WHERE " +
            "lt.account.accountId = :accountId AND lt.transactionType = 'EARN' AND " +
            "lt.isActive = true AND lt.expiryDate IS NOT NULL AND " +
            "lt.expiryDate BETWEEN CURRENT_TIMESTAMP AND :expiryThreshold " +
            "ORDER BY lt.expiryDate ASC")
    List<LoyaltyTransaction> findExpiringPoints(@Param("accountId") Long accountId,
                                                @Param("expiryThreshold") LocalDateTime expiryThreshold);

    // Expired points
    @Query("SELECT lt FROM LoyaltyTransaction lt WHERE " +
            "lt.transactionType = 'EARN' AND lt.isActive = true AND " +
            "lt.expiryDate IS NOT NULL AND lt.expiryDate < CURRENT_TIMESTAMP")
    List<LoyaltyTransaction> findExpiredPoints();

    // Date range queries
    @Query("SELECT lt FROM LoyaltyTransaction lt WHERE " +
            "lt.account.accountId = :accountId AND lt.isActive = true AND " +
            "lt.transactionDate BETWEEN :startDate AND :endDate " +
            "ORDER BY lt.transactionDate DESC")
    List<LoyaltyTransaction> findTransactionsByDateRange(@Param("accountId") Long accountId,
                                                         @Param("startDate") LocalDateTime startDate,
                                                         @Param("endDate") LocalDateTime endDate);

    // Reference-based queries
    List<LoyaltyTransaction> findByReferenceTypeAndReferenceIdAndIsActiveTrue(String referenceType, Long referenceId);

    List<LoyaltyTransaction> findByBookingBookingIdAndIsActiveTrue(Long bookingId);

    List<LoyaltyTransaction> findByPromotionPromotionIdAndIsActiveTrue(Long promotionId);

    // Statistics queries
    @Query("SELECT COUNT(lt) FROM LoyaltyTransaction lt WHERE " +
            "lt.account.accountId = :accountId AND lt.transactionType = 'EARN' AND " +
            "lt.isActive = true")
    Long countEarnTransactions(@Param("accountId") Long accountId);

    @Query("SELECT COUNT(lt) FROM LoyaltyTransaction lt WHERE " +
            "lt.account.accountId = :accountId AND lt.transactionType = 'REDEEM' AND " +
            "lt.isActive = true")
    Long countRedeemTransactions(@Param("accountId") Long accountId);

    // Recent transactions
    @Query("SELECT lt FROM LoyaltyTransaction lt WHERE " +
            "lt.account.accountId = :accountId AND lt.isActive = true " +
            "ORDER BY lt.transactionDate DESC")
    List<LoyaltyTransaction> findRecentTransactions(@Param("accountId") Long accountId, Pageable pageable);

    // Monthly statistics
    @Query("SELECT COALESCE(SUM(lt.points), 0) FROM LoyaltyTransaction lt WHERE " +
            "lt.account.accountId = :accountId AND lt.transactionType = 'EARN' AND " +
            "lt.isActive = true AND " +
            "YEAR(lt.transactionDate) = :year AND MONTH(lt.transactionDate) = :month")
    Integer getMonthlyEarnedPoints(@Param("accountId") Long accountId,
                                   @Param("year") int year,
                                   @Param("month") int month);

    @Query("SELECT COALESCE(SUM(ABS(lt.points)), 0) FROM LoyaltyTransaction lt WHERE " +
            "lt.account.accountId = :accountId AND lt.transactionType = 'REDEEM' AND " +
            "lt.isActive = true AND " +
            "YEAR(lt.transactionDate) = :year AND MONTH(lt.transactionDate) = :month")
    Integer getMonthlyRedeemedPoints(@Param("accountId") Long accountId,
                                     @Param("year") int year,
                                     @Param("month") int month);

    // Admin queries
    @Query("SELECT lt FROM LoyaltyTransaction lt WHERE lt.isActive = true " +
            "ORDER BY lt.transactionDate DESC")
    Page<LoyaltyTransaction> findAllTransactions(Pageable pageable);

    @Query("SELECT COALESCE(SUM(lt.points), 0) FROM LoyaltyTransaction lt WHERE " +
            "lt.transactionType = 'EARN' AND lt.isActive = true AND " +
            "lt.transactionDate BETWEEN :startDate AND :endDate")
    Integer getTotalEarnedPointsByDateRange(@Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM(ABS(lt.points)), 0) FROM LoyaltyTransaction lt WHERE " +
            "lt.transactionType = 'REDEEM' AND lt.isActive = true AND " +
            "lt.transactionDate BETWEEN :startDate AND :endDate")
    Integer getTotalRedeemedPointsByDateRange(@Param("startDate") LocalDateTime startDate,
                                              @Param("endDate") LocalDateTime endDate);
} 
