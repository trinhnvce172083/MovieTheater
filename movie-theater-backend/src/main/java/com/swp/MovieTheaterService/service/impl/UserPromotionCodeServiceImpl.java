package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.entity.Account;
import com.swp.MovieTheaterService.entity.Promotion;
import com.swp.MovieTheaterService.entity.UserPromotionCode;
import com.swp.MovieTheaterService.repository.UserPromotionCodeRepository;
import com.swp.MovieTheaterService.service.UserPromotionCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * User Promotion Code Service Implementation
 * Business logic for managing user-specific promotion codes
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserPromotionCodeServiceImpl implements UserPromotionCodeService {

    private final UserPromotionCodeRepository userPromotionCodeRepository;

    @Override
    public UserPromotionCode createUserPromotionCode(Account account, Promotion promotion, int pointsSpent) {
        log.info("Creating user promotion code for account: {} and promotion: {}", 
                account.getEmail(), promotion.getPromotionCode());

        String uniqueCode = generateUniqueCode(promotion.getPromotionCode(), account.getAccountId());
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(promotion.getCodeValidityHours());

        UserPromotionCode userPromotionCode = UserPromotionCode.builder()
                .uniqueCode(uniqueCode)
                .pointsSpent(pointsSpent)
                .isUsed(false)
                .isActive(true)
                .expiresAt(expiresAt)
                .account(account)
                .promotion(promotion)
                .build();

        UserPromotionCode savedCode = userPromotionCodeRepository.save(userPromotionCode);
        
        log.info("Created user promotion code: {} for account: {}", uniqueCode, account.getEmail());
        return savedCode;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserPromotionCode> findByUniqueCode(String uniqueCode) {
        return userPromotionCodeRepository.findByUniqueCode(uniqueCode);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserPromotionCode> findValidCodesByAccount(Account account) {
        return userPromotionCodeRepository.findValidCodesByAccount(account, LocalDateTime.now());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserPromotionCode> findByAccountAndPromotion(Account account, Promotion promotion) {
        return userPromotionCodeRepository.findByAccountAndPromotion(account, promotion);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countValidCodesByAccountAndPromotion(Account account, Promotion promotion) {
        return userPromotionCodeRepository.countValidCodesByAccountAndPromotion(account, promotion);
    }

    @Override
    public UserPromotionCode markAsUsed(String uniqueCode, Long bookingId) {
        log.info("Marking user promotion code as used: {}", uniqueCode);

        UserPromotionCode userPromotionCode = userPromotionCodeRepository.findByUniqueCode(uniqueCode)
                .orElseThrow(() -> new RuntimeException("User promotion code not found: " + uniqueCode));

        if (userPromotionCode.getIsUsed()) {
            throw new RuntimeException("User promotion code already used: " + uniqueCode);
        }

        if (userPromotionCode.isExpired()) {
            throw new RuntimeException("User promotion code expired: " + uniqueCode);
        }

        userPromotionCode.markAsUsed(null); // We'll set booking later if needed
        return userPromotionCodeRepository.save(userPromotionCode);
    }

    @Override
    public void deactivateCode(String uniqueCode) {
        log.info("Deactivating user promotion code: {}", uniqueCode);

        UserPromotionCode userPromotionCode = userPromotionCodeRepository.findByUniqueCode(uniqueCode)
                .orElseThrow(() -> new RuntimeException("User promotion code not found: " + uniqueCode));

        userPromotionCode.deactivate();
        userPromotionCodeRepository.save(userPromotionCode);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserPromotionCode> findExpiredCodes() {
        return userPromotionCodeRepository.findExpiredCodes(LocalDateTime.now());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserPromotionCode> findByAccountOrderByPurchasedAtDesc(Account account, Pageable pageable) {
        return userPromotionCodeRepository.findByAccountOrderByPurchasedAtDesc(account, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserPromotionCode> findUsedCodesByAccount(Account account) {
        return userPromotionCodeRepository.findUsedCodesByAccount(account);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByUniqueCode(String uniqueCode) {
        return userPromotionCodeRepository.existsByUniqueCode(uniqueCode);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserPromotionCode> findCodesExpiringSoon(int hoursAhead) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime soonTime = now.plusHours(hoursAhead);
        return userPromotionCodeRepository.findCodesExpiringSoon(now, soonTime);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countTotalCodesByAccount(Account account) {
        return userPromotionCodeRepository.countTotalCodesByAccount(account);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countUsedCodesByAccount(Account account) {
        return userPromotionCodeRepository.countUsedCodesByAccount(account);
    }

    @Override
    @Transactional(readOnly = true)
    public Long sumPointsSpentByAccount(Account account) {
        return userPromotionCodeRepository.sumPointsSpentByAccount(account);
    }

    @Override
    public String generateUniqueCode(String promotionCode, Long accountId) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8);
        return "USER_" + promotionCode + "_" + accountId + "_" + timestamp + "_" + randomSuffix;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isValidUserPromotionCode(String uniqueCode, Account account) {
        Optional<UserPromotionCode> userPromotionCodeOpt = findByUniqueCode(uniqueCode);
        
        if (userPromotionCodeOpt.isEmpty()) {
            return false;
        }

        UserPromotionCode userPromotionCode = userPromotionCodeOpt.get();
        
        // Check if code belongs to the account
        if (!userPromotionCode.getAccount().getAccountId().equals(account.getAccountId())) {
            return false;
        }

        // Check if code is valid
        return userPromotionCode.isValid();
    }
} 