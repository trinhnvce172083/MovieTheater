package com.swp.MovieTheaterService.schedule;

import com.swp.MovieTheaterService.entity.Account;
import com.swp.MovieTheaterService.repository.AccountRepository;
import com.swp.MovieTheaterService.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Account Unlock Scheduler
 * Tự động mở khóa các tài khoản hết hạn khóa
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AccountUnlockScheduler {

    private final AccountRepository accountRepository;
    private final EmailService emailService;

    /**
     * Tự động mở khóa tài khoản hết hạn khóa
     * Chạy mỗi 5 phút
     */
    @Scheduled(fixedRate = 300000) // 5 minutes = 300,000 milliseconds
    @Transactional
    public void unlockExpiredAccounts() {
        try {
            log.debug("Checking for expired locked accounts...");

            LocalDateTime now = LocalDateTime.now();

            // Tìm các tài khoản bị khóa đã hết hạn
            List<Account> expiredLockedAccounts = accountRepository.findAll(
                    (root, query, cb) -> cb.and(
                            cb.isNotNull(root.get("accountLockedUntil")),
                            cb.lessThanOrEqualTo(root.get("accountLockedUntil"), now),
                            cb.equal(root.get("isActive"), true)));

            if (expiredLockedAccounts.isEmpty()) {
                log.debug("No expired locked accounts found");
                return;
            }

            log.info("Found {} expired locked accounts to unlock", expiredLockedAccounts.size());

            int unlockedCount = 0;
            for (Account account : expiredLockedAccounts) {
                try {
                    // Mở khóa tài khoản
                    account.unlockAccount();
                    account.setUpdatedAt(now);
                    accountRepository.save(account);

                    // Gửi email thông báo mở khóa
                    sendUnlockNotificationEmail(account);

                    unlockedCount++;
                    log.info("Automatically unlocked account: {} ({})", account.getUsername(), account.getEmail());

                } catch (Exception e) {
                    log.error("Failed to unlock account: {} - {}", account.getUsername(), e.getMessage());
                }
            }

            log.info("Successfully auto-unlocked {}/{} accounts", unlockedCount, expiredLockedAccounts.size());

        } catch (Exception e) {
            log.error("Error in auto-unlock scheduler", e);
        }
    }

    /**
     * Gửi email thông báo mở khóa tự động
     */
    private void sendUnlockNotificationEmail(Account account) {
        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("fullName", account.getFullName());
            variables.put("username", account.getUsername());
            variables.put("unlockedAt", LocalDateTime.now());
            variables.put("supportEmail", "support@lumiere.com");

            emailService.sendTemplateEmail(
                    account.getEmail(),
                    "Thông báo mở khóa tự động - Lumiere Cinema",
                    "email/account-unlocked",
                    variables);

            log.debug("Auto-unlock notification email sent to: {}", account.getEmail());

        } catch (Exception e) {
            log.warn("Failed to send auto-unlock notification email to: {} - {}",
                    account.getEmail(), e.getMessage());
        }
    }

    /**
     * Kiểm tra và thống kê tài khoản bị khóa
     * Chạy hàng ngày lúc 9:00 AM
     */
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional(readOnly = true)
    public void generateLockStatistics() {
        try {
            LocalDateTime now = LocalDateTime.now();

            // Đếm tài khoản đang bị khóa
            long currentlyLocked = accountRepository.count(
                    (root, query, cb) -> cb.and(
                            cb.isNotNull(root.get("accountLockedUntil")),
                            cb.greaterThan(root.get("accountLockedUntil"), now),
                            cb.equal(root.get("isActive"), true)));

            // Đếm tài khoản sẽ được mở khóa trong 24h tới
            LocalDateTime next24Hours = now.plusHours(24);
            long unlockingSoon = accountRepository.count(
                    (root, query, cb) -> cb.and(
                            cb.isNotNull(root.get("accountLockedUntil")),
                            cb.greaterThan(root.get("accountLockedUntil"), now),
                            cb.lessThanOrEqualTo(root.get("accountLockedUntil"), next24Hours),
                            cb.equal(root.get("isActive"), true)));

            log.info("Lock Statistics - Currently locked: {}, Unlocking in next 24h: {}",
                    currentlyLocked, unlockingSoon);

        } catch (Exception e) {
            log.error("Error generating lock statistics", e);
        }
    }
}