package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.dto.user.*;
import com.swp.MovieTheaterService.entity.Account;
import com.swp.MovieTheaterService.enums.Role;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.repository.AccountRepository;
import com.swp.MovieTheaterService.repository.BookingRepository;
import com.swp.MovieTheaterService.service.EmailService;
import com.swp.MovieTheaterService.service.LoyaltyService;
import com.swp.MovieTheaterService.service.UserManagementService;
import com.swp.MovieTheaterService.utils.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * User Management Service Implementation
 * Business logic implementation for admin user management
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserManagementServiceImpl implements UserManagementService {

    private final AccountRepository accountRepository;
    private final BookingRepository bookingRepository;
    private final LoyaltyService loyaltyService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // ==================== CRUD OPERATIONS ====================

    @Override
    @Transactional(readOnly = true)
    public Page<UserManagementResponse> getAllUsers(Pageable pageable) {
        log.info("Getting all users with pagination: page={}, size={}", pageable.getPageNumber(),
                pageable.getPageSize());

        Page<Account> accounts = accountRepository.findAll(pageable);
        return accounts.map(this::convertToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserManagementResponse getUserById(Long userId) {
        log.info("Getting user by ID: {}", userId);

        Account account = findAccountById(userId);
        return convertToResponse(account);
    }

    @Override
    public UserManagementResponse createUser(UserManagementRequest request) {
        log.info("Creating new user: {}", request.getUsername());

        // Validate uniqueness
        validateUniqueFields(request, null);

        // Build new account
        Account account = Account.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(request.getPassword() != null ? passwordEncoder.encode(request.getPassword()) : null)
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .dateOfBirth(request.getDateOfBirth())
                .address(request.getAddress())
                .role(request.getRole() != null ? request.getRole() : Role.MEMBER)
                .isActive(true)
                .isVerified(true)
                .emailVerified(true)
                .membershipPoints(0)
                .membershipLevel("BRONZE")
                .employeeCode(request.getEmployeeCode())
                .department(request.getDepartment())
                .salary(request.getSalary())
                .build();

        Account savedAccount = accountRepository.save(account);
        log.info("User created successfully: {}", savedAccount.getAccountId());

        return convertToResponse(savedAccount);
    }

    @Override
    public UserManagementResponse updateUser(Long userId, UserManagementRequest request) {
        log.info("Updating user: {}", userId);

        Account account = findAccountById(userId);

        // Validate uniqueness (excluding current user)
        validateUniqueFields(request, userId);

        // Update fields
        updateAccountFields(account, request);

        Account savedAccount = accountRepository.save(account);
        log.info("User updated successfully: {}", userId);

        return convertToResponse(savedAccount);
    }

    @Override
    public void deleteUser(Long userId) {
        log.info("Deleting user: {}", userId);

        Account account = findAccountById(userId);

        // Không cho phép xóa ADMIN
        if (account.getRole() == Role.ADMIN) {
            throw new AppException(ErrorCode.ACCESS_DENIED, "Không thể xóa tài khoản ADMIN");
        }

        // Soft delete
        account.setIsActive(false);
        account.setUpdatedAt(LocalDateTime.now());

        accountRepository.save(account);
        log.info("User deleted successfully: {}", userId);
    }

    // ==================== SEARCH & FILTER ====================

    @Override
    @Transactional(readOnly = true)
    public Page<UserManagementResponse> searchUsers(UserSearchRequest searchRequest, Pageable pageable) {
        log.info("Searching users with criteria: {}", searchRequest.getKeyword());

        Specification<Account> spec = buildSearchSpecification(searchRequest);
        Page<Account> accounts = accountRepository.findAll(spec, pageable);

        return accounts.map(this::convertToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserManagementResponse> getUsersByRole(String role, Pageable pageable) {
        log.info("Getting users by role: {}", role);

        Role roleEnum = Role.valueOf(role.toUpperCase());
        Page<Account> accounts = accountRepository.findAll(
                (root, query, cb) -> cb.equal(root.get("role"), roleEnum),
                pageable);

        return accounts.map(this::convertToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserManagementResponse> getActiveUsers(Pageable pageable) {
        log.info("Getting active users");

        Page<Account> accounts = accountRepository.findAll(
                (root, query, cb) -> cb.equal(root.get("isActive"), true),
                pageable);

        return accounts.map(this::convertToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserManagementResponse> getLockedAccounts(Pageable pageable) {
        log.info("Getting locked accounts");

        Page<Account> accounts = accountRepository.findAll(
                (root, query, cb) -> cb.and(
                        cb.isNotNull(root.get("accountLockedUntil")),
                        cb.greaterThan(root.get("accountLockedUntil"), LocalDateTime.now())),
                pageable);

        return accounts.map(this::convertToResponse);
    }

    // ==================== ACCOUNT MANAGEMENT ====================

    @Override
    public UserManagementResponse activateUser(Long userId) {
        log.info("Activating user: {}", userId);

        Account account = findAccountById(userId);
        account.setIsActive(true);
        account.setUpdatedAt(LocalDateTime.now());

        Account savedAccount = accountRepository.save(account);
        return convertToResponse(savedAccount);
    }

    @Override
    public UserManagementResponse deactivateUser(Long userId) {
        log.info("Deactivating user: {}", userId);

        Account account = findAccountById(userId);
        account.setIsActive(false);
        account.setUpdatedAt(LocalDateTime.now());

        Account savedAccount = accountRepository.save(account);
        return convertToResponse(savedAccount);
    }

    @Override
    public UserManagementResponse lockUser(Long userId, LockUserRequest lockRequest) {
        log.info("Locking user: {} - reason: {} - hours: {}", userId, lockRequest.getReason(),
                lockRequest.getLockHours());

        Account account = findAccountById(userId);

        // Không cho phép khóa ADMIN
        if (account.getRole() == Role.ADMIN) {
            throw new AppException(ErrorCode.ACCESS_DENIED, "Không thể khóa tài khoản ADMIN");
        }

        // Tính thời gian unlock
        LocalDateTime lockUntil = LocalDateTime.now().plusHours(lockRequest.getLockHours());
        account.setAccountLockedUntil(lockUntil);
        account.setUpdatedAt(LocalDateTime.now());

        Account savedAccount = accountRepository.save(account);

        // Gửi email thông báo nếu được yêu cầu
        if (lockRequest.getSendNotificationEmail() != null && lockRequest.getSendNotificationEmail()) {
            try {
                sendLockNotificationEmail(account, lockRequest);
            } catch (Exception e) {
                log.warn("Failed to send lock notification email to user: {}", account.getEmail(), e);
            }
        }

        log.info("User locked successfully until: {}", lockUntil);
        return convertToResponse(savedAccount);
    }

    @Override
    public UserManagementResponse unlockUser(Long userId) {
        log.info("Unlocking user: {}", userId);

        Account account = findAccountById(userId);
        account.unlockAccount();
        account.setUpdatedAt(LocalDateTime.now());

        Account savedAccount = accountRepository.save(account);

        // Gửi email thông báo unlock
        try {
            sendUnlockNotificationEmail(account);
        } catch (Exception e) {
            log.warn("Failed to send unlock notification email to user: {}", account.getEmail(), e);
        }

        return convertToResponse(savedAccount);
    }

    @Override
    public UserManagementResponse verifyUserEmail(Long userId) {
        log.info("Verifying user email: {}", userId);

        Account account = findAccountById(userId);
        account.setEmailVerified(true);
        account.setIsVerified(true);
        account.setUpdatedAt(LocalDateTime.now());

        Account savedAccount = accountRepository.save(account);
        return convertToResponse(savedAccount);
    }

    @Override
    public UserManagementResponse resetUserPassword(Long userId, String newPassword) {
        log.info("Resetting password for user: {}", userId);

        Account account = findAccountById(userId);
        account.setPassword(passwordEncoder.encode(newPassword));
        account.setUpdatedAt(LocalDateTime.now());

        Account savedAccount = accountRepository.save(account);
        return convertToResponse(savedAccount);
    }

    // ==================== EMAIL NOTIFICATION METHODS ====================

    private void sendLockNotificationEmail(Account account, LockUserRequest lockRequest) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("fullName", account.getFullName());
        variables.put("username", account.getUsername());
        variables.put("reason", lockRequest.getReason());
        variables.put("lockHours", lockRequest.getLockHours());
        variables.put("unlockTime", account.getAccountLockedUntil());
        variables.put("notes", lockRequest.getNotes());
        variables.put("supportEmail", "support@lumiere.com");

        emailService.sendTemplateEmail(
                account.getEmail(),
                "Thông báo khóa tài khoản - Lumiere Cinema",
                "email/account-locked",
                variables);

        log.info("Lock notification email sent to: {}", account.getEmail());
    }

    private void sendUnlockNotificationEmail(Account account) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("fullName", account.getFullName());
        variables.put("username", account.getUsername());
        variables.put("unlockedAt", LocalDateTime.now());
        variables.put("supportEmail", "support@lumiere.com");

        emailService.sendTemplateEmail(
                account.getEmail(),
                "Thông báo mở khóa tài khoản - Lumiere Cinema",
                "email/account-unlocked",
                variables);

        log.info("Unlock notification email sent to: {}", account.getEmail());
    }

    // ==================== MEMBERSHIP MANAGEMENT ====================

    @Override
    public UserManagementResponse updateMembershipPoints(Long userId, MembershipPointsRequest request) {
        log.info("Updating membership points for user: {} - points: {} - reason: {}",
                userId, request.getPoints(), request.getReason());

        Account account = findAccountById(userId);

        // Validate points operation
        if (request.getPoints() < 0 && account.getMembershipPoints() + request.getPoints() < 0) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "Không thể trừ nhiều điểm hơn số điểm hiện có");
        }

        // Use loyalty service to properly track points with detailed info
        try {
            loyaltyService.adjustPoints(account, request.getPoints(), request.getReason());

            // Log additional details for admin tracking
            log.info("Points adjustment details - User: {}, Points: {}, Reason: {}, Type: {}, Reference: {}, Notes: {}",
                    account.getUsername(), request.getPoints(), request.getReason(),
                    request.getTransactionType(), request.getReferenceId(), request.getNotes());

        } catch (Exception e) {
            log.error("Failed to adjust points using loyalty service: {}", e.getMessage());
            // Fallback to direct update
            account.setMembershipPoints(account.getMembershipPoints() + request.getPoints());
            account.setUpdatedAt(LocalDateTime.now());
            accountRepository.save(account);
        }

        // Refresh account and check for level upgrade
        account = findAccountById(userId);
        checkAndUpdateMembershipLevel(account);

        return convertToResponse(account);
    }

    @Override
    public UserManagementResponse updateMembershipLevel(Long userId, MembershipLevelRequest request) {
        log.info("Updating membership level for user: {} - level: {} - reason: {}",
                userId, request.getLevel(), request.getReason());

        Account account = findAccountById(userId);
        String previousLevel = account.getMembershipLevel();

        // Validate level
        if (!isValidMembershipLevel(request.getLevel())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR,
                    "Membership level phải là: BRONZE, SILVER, GOLD, hoặc PLATINUM");
        }

        // Update level
        account.setMembershipLevel(request.getLevel());
        account.setUpdatedAt(LocalDateTime.now());

        Account savedAccount = accountRepository.save(account);

        // Log level change
        log.info("Membership level changed for user {} from {} to {} - reason: {}",
                account.getUsername(), previousLevel, request.getLevel(), request.getReason());

        // Send notification email if level upgraded
        if (isLevelUpgrade(previousLevel, request.getLevel())) {
            try {
                sendLevelUpgradeNotificationEmail(account, previousLevel, request.getLevel());
            } catch (Exception e) {
                log.warn("Failed to send level upgrade notification: {}", e.getMessage());
            }
        }

        return convertToResponse(savedAccount);
    }

    @Override
    public Map<String, Object> getMembershipLevelInfo() {
        Map<String, Object> levelInfo = new HashMap<>();

        // BRONZE level
        Map<String, Object> bronze = new HashMap<>();
        bronze.put("name", "BRONZE");
        bronze.put("minPoints", 0);
        bronze.put("maxPoints", 499);
        bronze.put("benefits", Arrays.asList(
                "Tích điểm khi đặt vé",
                "Thông báo phim mới",
                "Hỗ trợ khách hàng cơ bản"));
        bronze.put("color", "#CD7F32");

        // SILVER level
        Map<String, Object> silver = new HashMap<>();
        silver.put("name", "SILVER");
        silver.put("minPoints", 500);
        silver.put("maxPoints", 1499);
        silver.put("benefits", Arrays.asList(
                "Tất cả quyền lợi BRONZE",
                "Giảm giá 5% tất cả vé",
                "Đặt trước vé 1 ngày",
                "Hỗ trợ khách hàng ưu tiên"));
        silver.put("color", "#C0C0C0");

        // GOLD level
        Map<String, Object> gold = new HashMap<>();
        gold.put("name", "GOLD");
        gold.put("minPoints", 1500);
        gold.put("maxPoints", 4999);
        gold.put("benefits", Arrays.asList(
                "Tất cả quyền lợi SILVER",
                "Giảm giá 10% tất cả vé",
                "Đặt trước vé 3 ngày",
                "Miễn phí nước uống",
                "Ghế VIP với giá thường"));
        gold.put("color", "#FFD700");

        // PLATINUM level
        Map<String, Object> platinum = new HashMap<>();
        platinum.put("name", "PLATINUM");
        platinum.put("minPoints", 5000);
        platinum.put("maxPoints", null);
        platinum.put("benefits", Arrays.asList(
                "Tất cả quyền lợi GOLD",
                "Giảm giá 15% tất cả vé",
                "Đặt trước vé 7 ngày",
                "Miễn phí combo bắp nước",
                "Phòng chờ VIP",
                "Vé miễn phí sinh nhật"));
        platinum.put("color", "#E5E4E2");

        levelInfo.put("BRONZE", bronze);
        levelInfo.put("SILVER", silver);
        levelInfo.put("GOLD", gold);
        levelInfo.put("PLATINUM", platinum);

        return levelInfo;
    }

    @Override
    public Map<String, Object> calculateRecommendedMembershipLevel(Long userId) {
        Account account = findAccountById(userId);
        Map<String, Object> recommendation = new HashMap<>();

        int currentPoints = account.getMembershipPoints() != null ? account.getMembershipPoints() : 0;
        String currentLevel = account.getMembershipLevel();
        String recommendedLevel = calculateLevelByPoints(currentPoints);

        recommendation.put("userId", userId);
        recommendation.put("currentLevel", currentLevel);
        recommendation.put("currentPoints", currentPoints);
        recommendation.put("recommendedLevel", recommendedLevel);
        recommendation.put("needsUpgrade", !currentLevel.equals(recommendedLevel));

        // Calculate points needed for next level
        Map<String, Integer> pointsForNextLevel = new HashMap<>();
        pointsForNextLevel.put("SILVER", Math.max(0, 500 - currentPoints));
        pointsForNextLevel.put("GOLD", Math.max(0, 1500 - currentPoints));
        pointsForNextLevel.put("PLATINUM", Math.max(0, 5000 - currentPoints));

        recommendation.put("pointsNeededForNextLevel", pointsForNextLevel);

        return recommendation;
    }

    @Override
    public Page<Map<String, Object>> getMembershipPointsHistory(Long userId, Pageable pageable) {
        // This would typically come from a points transaction table
        // For now, return empty page as placeholder
        log.info("Getting membership points history for user: {}", userId);

        // In a real implementation, you would query a points_transactions table
        return Page.empty(pageable);
    }

    // ==================== HELPER METHODS ====================

    private boolean isValidMembershipLevel(String level) {
        return Arrays.asList("BRONZE", "SILVER", "GOLD", "PLATINUM").contains(level);
    }

    private boolean isLevelUpgrade(String previousLevel, String newLevel) {
        Map<String, Integer> levelRank = Map.of(
                "BRONZE", 1,
                "SILVER", 2,
                "GOLD", 3,
                "PLATINUM", 4);

        return levelRank.get(newLevel) > levelRank.get(previousLevel);
    }

    private String calculateLevelByPoints(int points) {
        if (points >= 5000)
            return "PLATINUM";
        if (points >= 1500)
            return "GOLD";
        if (points >= 500)
            return "SILVER";
        return "BRONZE";
    }

    private void checkAndUpdateMembershipLevel(Account account) {
        int points = account.getMembershipPoints() != null ? account.getMembershipPoints() : 0;
        String recommendedLevel = calculateLevelByPoints(points);
        String currentLevel = account.getMembershipLevel();

        if (!currentLevel.equals(recommendedLevel) && isLevelUpgrade(currentLevel, recommendedLevel)) {
            String previousLevel = account.getMembershipLevel();
            account.setMembershipLevel(recommendedLevel);
            account.setUpdatedAt(LocalDateTime.now());
            accountRepository.save(account);

            log.info("Auto-upgraded user {} from {} to {} based on points",
                    account.getUsername(), previousLevel, recommendedLevel);

            try {
                sendLevelUpgradeNotificationEmail(account, previousLevel, recommendedLevel);
            } catch (Exception e) {
                log.warn("Failed to send auto-upgrade notification: {}", e.getMessage());
            }
        }
    }

    private void sendLevelUpgradeNotificationEmail(Account account, String previousLevel, String newLevel) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("fullName", account.getFullName());
        variables.put("username", account.getUsername());
        variables.put("previousLevel", previousLevel);
        variables.put("newLevel", newLevel);
        variables.put("currentPoints", account.getMembershipPoints());
        variables.put("supportEmail", "support@lumiere.com");

        emailService.sendTemplateEmail(
                account.getEmail(),
                "Chúc mừng nâng hạng thành viên - Lumiere Cinema",
                "email/membership-upgrade",
                variables);

        log.info("Level upgrade notification email sent to: {}", account.getEmail());
    }

    // ==================== STATISTICS & ANALYTICS ====================

    @Override
    @Transactional(readOnly = true)
    public UserStatisticsResponse getUserStatistics() {
        log.info("Generating user statistics");

        // Basic counts
        Long totalUsers = accountRepository.count();
        Long activeUsers = (long) accountRepository.findByIsActive(true).size();
        Long verifiedUsers = (long) accountRepository.findByIsVerified(true).size();

        // Locked accounts count
        Long lockedAccounts = (long) accountRepository.findAll(
                (root, query, cb) -> cb.and(
                        cb.isNotNull(root.get("accountLockedUntil")),
                        cb.greaterThan(root.get("accountLockedUntil"), LocalDateTime.now())))
                .size();

        // Users by role
        Map<String, Long> usersByRole = Arrays.stream(Role.values())
                .collect(Collectors.toMap(
                        Enum::name,
                        role -> accountRepository.countByRole(role)));

        // Users by membership level
        Map<String, Long> usersByMembershipLevel = Arrays.asList("BRONZE", "SILVER", "GOLD", "PLATINUM")
                .stream()
                .collect(Collectors.toMap(
                        level -> level,
                        level -> (long) accountRepository.findByMembershipLevel(level).size()));

        // Time-based statistics
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfWeek = LocalDateTime.now().minusDays(7);
        LocalDateTime startOfToday = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);

        Long newUsersThisMonth = (long) accountRepository.findAll(
                (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), startOfMonth)).size();

        Long newUsersThisWeek = (long) accountRepository.findAll(
                (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), startOfWeek)).size();

        Long usersLoggedInToday = (long) accountRepository.findAll(
                (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("lastLogin"), startOfToday)).size();

        Long usersLoggedInThisWeek = (long) accountRepository.findAll(
                (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("lastLogin"), startOfWeek)).size();

        // Membership statistics
        List<Account> allAccounts = accountRepository.findAll();
        Double averageMembershipPoints = allAccounts.stream()
                .mapToInt(account -> account.getMembershipPoints() != null ? account.getMembershipPoints() : 0)
                .average()
                .orElse(0.0);

        Long totalMembershipPointsDistributed = allAccounts.stream()
                .mapToLong(account -> account.getMembershipPoints() != null ? account.getMembershipPoints() : 0)
                .sum();

        // OAuth users
        Long oauthUsers = (long) accountRepository.findAll(
                (root, query, cb) -> cb.isNotNull(root.get("provider"))).size();

        // Marketing acceptance rate
        Long marketingAcceptUsers = (long) accountRepository.findAll(
                (root, query, cb) -> cb.equal(root.get("acceptMarketing"), true)).size();
        Double marketingAcceptanceRate = totalUsers > 0 ? (double) marketingAcceptUsers / totalUsers : 0.0;

        // Calculate average user age (if dateOfBirth is available)
        Double averageUserAge = allAccounts.stream()
                .filter(account -> account.getDateOfBirth() != null)
                .mapToDouble(account -> {
                    try {
                        return java.time.Period.between(account.getDateOfBirth(), java.time.LocalDate.now()).getYears();
                    } catch (Exception e) {
                        return 0.0;
                    }
                })
                .average()
                .orElse(0.0);

        // Calculate top cities (if address/city field is available)
        Map<String, Long> topCities = allAccounts.stream()
                .filter(account -> account.getAddress() != null && !account.getAddress().trim().isEmpty())
                .collect(Collectors.groupingBy(
                        account -> {
                            // Extract city from address (simple approach - last part after comma)
                            String[] parts = account.getAddress().split(",");
                            return parts.length > 0 ? parts[parts.length - 1].trim() : "Unknown";
                        },
                        Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10) // Top 10 cities
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new));

        return UserStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .verifiedUsers(verifiedUsers)
                .lockedAccounts(lockedAccounts)
                .usersByRole(usersByRole)
                .usersByMembershipLevel(usersByMembershipLevel)
                .usersByDepartment(new HashMap<>()) // Keep empty as department is for employees only
                .newUsersThisMonth(newUsersThisMonth)
                .newUsersThisWeek(newUsersThisWeek)
                .usersLoggedInToday(usersLoggedInToday)
                .usersLoggedInThisWeek(usersLoggedInThisWeek)
                .averageMembershipPoints(averageMembershipPoints)
                .totalMembershipPointsDistributed(totalMembershipPointsDistributed)
                .oauthUsers(oauthUsers)
                .marketingAcceptanceRate(marketingAcceptanceRate)
                .averageUserAge(averageUserAge)
                .topCities(topCities)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportUsersToCSV(UserSearchRequest searchRequest) {
        log.info("Exporting users to CSV");

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                PrintWriter writer = new PrintWriter(new OutputStreamWriter(outputStream, StandardCharsets.UTF_8))) {

            // Write CSV header
            writer.println("ID,Username,Email,Full Name,Role,Active,Verified,Created Date,Last Login");

            // Get users
            List<Account> accounts;
            if (searchRequest != null) {
                Specification<Account> spec = buildSearchSpecification(searchRequest);
                accounts = accountRepository.findAll(spec);
            } else {
                accounts = accountRepository.findAll();
            }

            // Write user data
            for (Account account : accounts) {
                writer.printf("%d,%s,%s,%s,%s,%s,%s,%s,%s%n",
                        account.getAccountId(),
                        escapeCSV(account.getUsername()),
                        escapeCSV(account.getEmail()),
                        escapeCSV(account.getFullName()),
                        account.getRole(),
                        account.getIsActive(),
                        account.getIsVerified(),
                        account.getCreatedAt(),
                        account.getLastLogin());
            }

            writer.flush();
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Error exporting users to CSV", e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Failed to export users to CSV");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportUsersToExcel(UserSearchRequest searchRequest) {
        log.warn("Excel export not implemented yet, returning CSV instead");
        return exportUsersToCSV(searchRequest);
    }

    // ==================== BULK OPERATIONS ====================

    @Override
    public int bulkActivateUsers(List<Long> userIds) {
        log.info("Bulk activating {} users", userIds.size());

        int count = 0;
        for (Long userId : userIds) {
            try {
                Account account = findAccountById(userId);
                account.setIsActive(true);
                account.setUpdatedAt(LocalDateTime.now());
                accountRepository.save(account);
                count++;
            } catch (Exception e) {
                log.warn("Failed to activate user: {}", userId, e);
            }
        }

        log.info("Successfully activated {} users", count);
        return count;
    }

    @Override
    public int bulkDeactivateUsers(List<Long> userIds) {
        log.info("Bulk deactivating {} users", userIds.size());

        int count = 0;
        for (Long userId : userIds) {
            try {
                Account account = findAccountById(userId);
                account.setIsActive(false);
                account.setUpdatedAt(LocalDateTime.now());
                accountRepository.save(account);
                count++;
            } catch (Exception e) {
                log.warn("Failed to deactivate user: {}", userId, e);
            }
        }

        log.info("Successfully deactivated {} users", count);
        return count;
    }

    @Override
    public int bulkDeleteUsers(List<Long> userIds) {
        log.info("Bulk deleting {} users", userIds.size());

        int count = 0;
        for (Long userId : userIds) {
            try {
                deleteUser(userId);
                count++;
            } catch (Exception e) {
                log.warn("Failed to delete user: {}", userId, e);
            }
        }

        log.info("Successfully deleted {} users", count);
        return count;
    }

    // ==================== VALIDATION ====================

    @Override
    @Transactional(readOnly = true)
    public boolean isUsernameAvailable(String username, Long excludeUserId) {
        return accountRepository.findByUsername(username)
                .map(account -> account.getAccountId().equals(excludeUserId))
                .orElse(true);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isEmailAvailable(String email, Long excludeUserId) {
        return accountRepository.findByEmail(email)
                .map(account -> account.getAccountId().equals(excludeUserId))
                .orElse(true);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isEmployeeCodeAvailable(String employeeCode, Long excludeUserId) {
        if (employeeCode == null)
            return true;

        return accountRepository.findByEmployeeCode(employeeCode)
                .map(account -> account.getAccountId().equals(excludeUserId))
                .orElse(true);
    }

    // ==================== PRIVATE HELPER METHODS ====================

    private Account findAccountById(Long userId) {
        return accountRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private void validateUniqueFields(UserManagementRequest request, Long excludeUserId) {
        // DTO đã validate rồi, chỉ cần business logic validation
        log.info("Validating unique fields for username: {}, email: {}",
                request.getUsername(), request.getEmail());

        // Check uniqueness (business logic validation)
        if (!isUsernameAvailable(request.getUsername(), excludeUserId)) {
            throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }

        if (!isEmailAvailable(request.getEmail(), excludeUserId)) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        if (request.getEmployeeCode() != null && !isEmployeeCodeAvailable(request.getEmployeeCode(), excludeUserId)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Employee code already exists");
        }
    }

    private void updateAccountFields(Account account, UserManagementRequest request) {
        if (request.getUsername() != null) {
            account.setUsername(request.getUsername());
        }
        if (request.getEmail() != null) {
            account.setEmail(request.getEmail());
        }
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            account.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getFullName() != null) {
            account.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null) {
            account.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getDateOfBirth() != null) {
            account.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getAddress() != null) {
            account.setAddress(request.getAddress());
        }
        if (request.getRole() != null) {
            account.setRole(request.getRole());
        }
        if (request.getIsActive() != null) {
            account.setIsActive(request.getIsActive());
        }
        if (request.getEmployeeCode() != null) {
            account.setEmployeeCode(request.getEmployeeCode());
        }
        if (request.getDepartment() != null) {
            account.setDepartment(request.getDepartment());
        }
        if (request.getSalary() != null) {
            account.setSalary(request.getSalary());
        }

        account.setUpdatedAt(LocalDateTime.now());
    }

    private UserManagementResponse convertToResponse(Account account) {
        // Get booking statistics
        Long totalBookings = bookingRepository.countBookingsByAccount(account.getAccountId());
        Double totalSpent = bookingRepository.getTotalAmountByAccount(account.getAccountId());

        return UserManagementResponse.builder()
                .accountId(account.getAccountId())
                .username(account.getUsername())
                .email(account.getEmail())
                .fullName(account.getFullName())
                .phoneNumber(account.getPhoneNumber())
                .dateOfBirth(account.getDateOfBirth())
                .address(account.getAddress())
                .role(account.getRole())
                .isActive(account.getIsActive())
                .isVerified(account.getIsVerified())
                .emailVerified(account.isEmailVerified())
                .membershipLevel(account.getMembershipLevel())
                .membershipPoints(account.getMembershipPoints())
                .employeeCode(account.getEmployeeCode())
                .department(account.getDepartment())
                .salary(account.getSalary())
                .avatarUrl(account.getAvatarUrl())
                .lastLogin(account.getLastLogin())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .totalBookings(totalBookings != null ? totalBookings : 0L)
                .totalSpent(totalSpent != null ? totalSpent : 0.0)
                .isAccountLocked(account.isAccountLocked())
                .accountLockedUntil(account.getAccountLockedUntil())
                .failedLoginAttempts(account.getFailedLoginAttempts())
                .build();
    }

    private Specification<Account> buildSearchSpecification(UserSearchRequest searchRequest) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Keyword search with enhanced fields
            if (searchRequest.getKeyword() != null && !searchRequest.getKeyword().trim().isEmpty()) {
                String keyword = searchRequest.getSearchMode() != null &&
                        searchRequest.getSearchMode().equals("EXACT")
                                ? searchRequest.getKeyword()
                                : "%" + searchRequest.getKeyword().toLowerCase() + "%";

                Predicate keywordPredicate = criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("username")), keyword),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), keyword),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("fullName")), keyword),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("phoneNumber")), keyword));
                predicates.add(keywordPredicate);
            }

            // Specific field searches
            if (searchRequest.getEmail() != null && !searchRequest.getEmail().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("email")),
                        "%" + searchRequest.getEmail().toLowerCase() + "%"));
            }

            if (searchRequest.getUsername() != null && !searchRequest.getUsername().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("username")),
                        "%" + searchRequest.getUsername().toLowerCase() + "%"));
            }

            if (searchRequest.getFullName() != null && !searchRequest.getFullName().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("fullName")),
                        "%" + searchRequest.getFullName().toLowerCase() + "%"));
            }

            if (searchRequest.getPhoneNumber() != null && !searchRequest.getPhoneNumber().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        root.get("phoneNumber"),
                        "%" + searchRequest.getPhoneNumber() + "%"));
            }

            // Role filter
            if (searchRequest.getRole() != null) {
                predicates.add(criteriaBuilder.equal(root.get("role"), searchRequest.getRole()));
            }

            // Status filters
            if (searchRequest.getIsActive() != null) {
                predicates.add(criteriaBuilder.equal(root.get("isActive"), searchRequest.getIsActive()));
            }

            if (searchRequest.getIsVerified() != null) {
                predicates.add(criteriaBuilder.equal(root.get("isVerified"), searchRequest.getIsVerified()));
            }

            if (searchRequest.getEmailVerified() != null) {
                predicates.add(criteriaBuilder.equal(root.get("emailVerified"), searchRequest.getEmailVerified()));
            }

            // Locked status filter
            if (searchRequest.getIsLocked() != null) {
                if (searchRequest.getIsLocked()) {
                    predicates.add(criteriaBuilder.and(
                            criteriaBuilder.isNotNull(root.get("accountLockedUntil")),
                            criteriaBuilder.greaterThan(root.get("accountLockedUntil"), LocalDateTime.now())));
                } else {
                    predicates.add(criteriaBuilder.or(
                            criteriaBuilder.isNull(root.get("accountLockedUntil")),
                            criteriaBuilder.lessThanOrEqualTo(root.get("accountLockedUntil"), LocalDateTime.now())));
                }
            }

            // Membership filters
            if (searchRequest.getMembershipLevel() != null && !searchRequest.getMembershipLevel().trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("membershipLevel"), searchRequest.getMembershipLevel()));
            }

            if (searchRequest.getMinMembershipPoints() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("membershipPoints"), searchRequest.getMinMembershipPoints()));
            }

            if (searchRequest.getMaxMembershipPoints() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("membershipPoints"), searchRequest.getMaxMembershipPoints()));
            }

            // Employee filters
            if (searchRequest.getDepartment() != null && !searchRequest.getDepartment().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("department")),
                        "%" + searchRequest.getDepartment().toLowerCase() + "%"));
            }

            if (searchRequest.getEmployeeCode() != null && !searchRequest.getEmployeeCode().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        root.get("employeeCode"),
                        "%" + searchRequest.getEmployeeCode() + "%"));
            }

            if (searchRequest.getMinSalary() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("salary"), searchRequest.getMinSalary()));
            }

            if (searchRequest.getMaxSalary() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("salary"), searchRequest.getMaxSalary()));
            }

            // Date range filters
            if (searchRequest.getRegistrationDateFrom() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("createdAt"), searchRequest.getRegistrationDateFrom().atStartOfDay()));
            }

            if (searchRequest.getRegistrationDateTo() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("createdAt"), searchRequest.getRegistrationDateTo().atTime(23, 59, 59)));
            }

            if (searchRequest.getLastLoginDateFrom() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("lastLogin"), searchRequest.getLastLoginDateFrom().atStartOfDay()));
            }

            if (searchRequest.getLastLoginDateTo() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("lastLogin"), searchRequest.getLastLoginDateTo().atTime(23, 59, 59)));
            }

            if (searchRequest.getBirthDateFrom() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("dateOfBirth"), searchRequest.getBirthDateFrom()));
            }

            if (searchRequest.getBirthDateTo() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("dateOfBirth"), searchRequest.getBirthDateTo()));
            }

            // Location filters
            if (searchRequest.getAddress() != null && !searchRequest.getAddress().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("address")),
                        "%" + searchRequest.getAddress().toLowerCase() + "%"));
            }

            // Activity filters
            if (searchRequest.getMinFailedLoginAttempts() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("failedLoginAttempts"), searchRequest.getMinFailedLoginAttempts()));
            }

            if (searchRequest.getMaxFailedLoginAttempts() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("failedLoginAttempts"), searchRequest.getMaxFailedLoginAttempts()));
            }

            // Advanced options
            if (searchRequest.getIncludeLocked() != null && !searchRequest.getIncludeLocked()) {
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.isNull(root.get("accountLockedUntil")),
                        criteriaBuilder.lessThanOrEqualTo(root.get("accountLockedUntil"), LocalDateTime.now())));
            }

            if (searchRequest.getIncludeInactive() != null && !searchRequest.getIncludeInactive()) {
                predicates.add(criteriaBuilder.equal(root.get("isActive"), true));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private String escapeCSV(String value) {
        if (value == null)
            return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}