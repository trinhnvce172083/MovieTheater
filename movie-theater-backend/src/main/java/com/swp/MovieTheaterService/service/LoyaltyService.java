package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.entity.Account;
import com.swp.MovieTheaterService.entity.Booking;
import com.swp.MovieTheaterService.entity.LoyaltyTransaction;
import com.swp.MovieTheaterService.entity.Promotion;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.repository.AccountRepository;
import com.swp.MovieTheaterService.repository.LoyaltyTransactionRepository;
import com.swp.MovieTheaterService.utils.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Loyalty Service
 * Business logic for loyalty points management
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LoyaltyService {

    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final AccountRepository accountRepository;

    // Points earning rates
    private static final double POINTS_PER_VND = 0.01; // 1 point per 100 VND
    private static final int MIN_POINTS_EARN = 1;
    private static final int MAX_POINTS_EARN = 1000;

    // Earn points from booking
    public LoyaltyTransaction earnPointsFromBooking(Account account, Booking booking) {
        log.info("Processing points earning for booking: {} by account: {}", 
                booking.getBookingCode(), account.getEmail());

        // Validate required parameters (bổ sung)
        ValidationUtils.validateRequiredParameters(
                "account", account,
                "booking", booking
        );

        // Validate account is active (bổ sung)
        if (!account.getIsActive()) {
            throw new AppException(ErrorCode.ACCOUNT_LOCKED, "Tài khoản đã bị khóa");
        }

        // Validate booking amount (bổ sung)
        if (booking.getTotalAmount() == null || !ValidationUtils.isPositive(booking.getTotalAmount())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Số tiền booking không hợp lệ");
        }

        // Calculate points based on total amount
        int pointsToEarn = calculatePointsFromAmount(booking.getTotalAmount());
        
        if (pointsToEarn < MIN_POINTS_EARN) {
            log.info("Points too low to earn: {} for booking: {}", pointsToEarn, booking.getBookingCode());
            return null;
        }

        // Create loyalty transaction
        LoyaltyTransaction transaction = LoyaltyTransaction.earnFromBooking(account, booking, pointsToEarn);
        LoyaltyTransaction savedTransaction = loyaltyTransactionRepository.save(transaction);

        // Update account points
        updateAccountPoints(account);

        log.info("Earned {} points for account: {} from booking: {}", 
                pointsToEarn, account.getEmail(), booking.getBookingCode());

        return savedTransaction;
    }

    // Redeem points for promotion
    public LoyaltyTransaction redeemPointsForPromotion(Account account, Promotion promotion) {
        log.info("Processing points redemption for promotion: {} by account: {}", 
                promotion.getPromotionCode(), account.getEmail());

        // Validate account has enough points
        int availablePoints = getAvailablePoints(account.getAccountId());
        if (availablePoints < promotion.getPointsRequired()) {
            throw new AppException(ErrorCode.INSUFFICIENT_POINTS, "Không đủ điểm để đổi khuyến mãi. Cần: " +
                    promotion.getPointsRequired() + ", Có: " + availablePoints);
        }

        // Create redemption transaction
        LoyaltyTransaction transaction = LoyaltyTransaction.redeemForPromotion(account, promotion, promotion.getPointsRequired());
        LoyaltyTransaction savedTransaction = loyaltyTransactionRepository.save(transaction);

        // Update account points
        updateAccountPoints(account);

        log.info("Redeemed {} points for account: {} for promotion: {}", 
                promotion.getPointsRequired(), account.getEmail(), promotion.getPromotionCode());

        return savedTransaction;
    }

    // Get available points for account
    @Transactional(readOnly = true)
    public int getAvailablePoints(Long accountId) {
        Integer points = loyaltyTransactionRepository.calculateAvailablePoints(accountId);
        return points != null ? points : 0;
    }

    // Get total earned points
    @Transactional(readOnly = true)
    public int getTotalEarnedPoints(Long accountId) {
        Integer points = loyaltyTransactionRepository.calculateTotalEarnedPoints(accountId);
        return points != null ? points : 0;
    }

    // Get total redeemed points
    @Transactional(readOnly = true)
    public int getTotalRedeemedPoints(Long accountId) {
        Integer points = loyaltyTransactionRepository.calculateTotalRedeemedPoints(accountId);
        return points != null ? points : 0;
    }

    // Get transaction history
    @Transactional(readOnly = true)
    public Page<LoyaltyTransaction> getTransactionHistory(Long accountId, Pageable pageable) {
        return loyaltyTransactionRepository.findByAccountAccountIdAndIsActiveTrueOrderByTransactionDateDesc(accountId, pageable);
    }

    // Get recent transactions
    @Transactional(readOnly = true)
    public List<LoyaltyTransaction> getRecentTransactions(Long accountId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return loyaltyTransactionRepository.findRecentTransactions(accountId, pageable);
    }

    // Get expiring points
    @Transactional(readOnly = true)
    public List<LoyaltyTransaction> getExpiringPoints(Long accountId, int daysAhead) {
        LocalDateTime expiryThreshold = LocalDateTime.now().plusDays(daysAhead);
        return loyaltyTransactionRepository.findExpiringPoints(accountId, expiryThreshold);
    }

    // Process expired points
    @Transactional
    public void processExpiredPoints() {
        log.info("Processing expired points...");
        
        List<LoyaltyTransaction> expiredTransactions = loyaltyTransactionRepository.findExpiredPoints();
        
        for (LoyaltyTransaction transaction : expiredTransactions) {
            // Create expiry transaction
            LoyaltyTransaction expiryTransaction = new LoyaltyTransaction();
            expiryTransaction.setAccount(transaction.getAccount());
            expiryTransaction.setTransactionType("EXPIRE");
            expiryTransaction.setPoints(-transaction.getPoints()); // Negative to deduct
            expiryTransaction.setDescription("Điểm hết hạn từ giao dịch " + transaction.getTransactionId());
            expiryTransaction.setReferenceType("EXPIRY");
            expiryTransaction.setReferenceId(transaction.getTransactionId());
            expiryTransaction.setTransactionDate(LocalDateTime.now());
            expiryTransaction.setIsActive(true);
            expiryTransaction.setCreatedAt(LocalDateTime.now());
            expiryTransaction.setUpdatedAt(LocalDateTime.now());
            
            loyaltyTransactionRepository.save(expiryTransaction);
            
            // Deactivate original transaction
            transaction.setIsActive(false);
            transaction.setUpdatedAt(LocalDateTime.now());
            loyaltyTransactionRepository.save(transaction);
            
            // Update account points
            updateAccountPoints(transaction.getAccount());
            
            log.info("Expired {} points for account: {}", 
                    transaction.getPoints(), transaction.getAccount().getEmail());
        }
        
        log.info("Processed {} expired point transactions", expiredTransactions.size());
    }

    // Manual points adjustment (admin function)
    public LoyaltyTransaction adjustPoints(Account account, int points, String reason) {
        log.info("Manual points adjustment: {} points for account: {}, reason: {}", 
                points, account.getEmail(), reason);

        LoyaltyTransaction transaction = new LoyaltyTransaction();
        transaction.setAccount(account);
        transaction.setTransactionType("ADJUST");
        transaction.setPoints(points);
        transaction.setDescription("Điều chỉnh điểm: " + reason);
        transaction.setReferenceType("MANUAL");
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setIsActive(true);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setUpdatedAt(LocalDateTime.now());

        if (points > 0) {
            // For positive adjustments, set expiry date
            transaction.setExpiryDate(LocalDateTime.now().plusYears(1));
        }

        LoyaltyTransaction savedTransaction = loyaltyTransactionRepository.save(transaction);
        
        // Update account points
        updateAccountPoints(account);

        return savedTransaction;
    }

    // Get monthly statistics
    @Transactional(readOnly = true)
    public int getMonthlyEarnedPoints(Long accountId, int year, int month) {
        Integer points = loyaltyTransactionRepository.getMonthlyEarnedPoints(accountId, year, month);
        return points != null ? points : 0;
    }

    @Transactional(readOnly = true)
    public int getMonthlyRedeemedPoints(Long accountId, int year, int month) {
        Integer points = loyaltyTransactionRepository.getMonthlyRedeemedPoints(accountId, year, month);
        return points != null ? points : 0;
    }

    // Check if account can redeem promotion
    @Transactional(readOnly = true)
    public boolean canRedeemPromotion(Long accountId, Promotion promotion) {
        if (!promotion.canBeRedeemedWithPoints()) {
            return false;
        }
        
        int availablePoints = getAvailablePoints(accountId);
        return availablePoints >= promotion.getPointsRequired();
    }

    // Private helper methods
    private int calculatePointsFromAmount(Double amount) {
        if (amount == null || amount <= 0) {
            return 0;
        }
        
        int points = (int) Math.floor(amount * POINTS_PER_VND);
        return Math.min(points, MAX_POINTS_EARN);
    }

    private void updateAccountPoints(Account account) {
        int availablePoints = getAvailablePoints(account.getAccountId());
        account.setMembershipPoints(availablePoints);
        
        // Update membership level based on total earned points
        int totalEarned = getTotalEarnedPoints(account.getAccountId());
        String newLevel = calculateMembershipLevel(totalEarned);
        
        if (!newLevel.equals(account.getMembershipLevel())) {
            log.info("Membership level upgraded for account: {} from {} to {}", 
                    account.getEmail(), account.getMembershipLevel(), newLevel);
            account.setMembershipLevel(newLevel);
        }
        
        account.setUpdatedAt(LocalDateTime.now());
        accountRepository.save(account);
    }

    private String calculateMembershipLevel(int totalEarnedPoints) {
        if (totalEarnedPoints >= 10000) {
            return "PLATINUM";
        } else if (totalEarnedPoints >= 5000) {
            return "GOLD";
        } else if (totalEarnedPoints >= 2000) {
            return "SILVER";
        } else {
            return "BRONZE";
        }
    }
}