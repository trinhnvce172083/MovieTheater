package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.dto.user.*;
import com.swp.MovieTheaterService.entity.Account;
import com.swp.MovieTheaterService.enums.Role;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.repository.AccountRepository;
import com.swp.MovieTheaterService.repository.BookingRepository;
import com.swp.MovieTheaterService.service.LoyaltyService;
import com.swp.MovieTheaterService.service.UserManagementService;
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

        // Build account
        Account account = Account.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(request.getPassword() != null ? passwordEncoder.encode(request.getPassword())
                        : passwordEncoder.encode("defaultPassword123"))
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .dateOfBirth(request.getDateOfBirth())
                .address(request.getAddress())
                .avatarUrl(request.getAvatarUrl())
                .role(request.getRole())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isVerified(request.getEmailVerified() != null ? request.getEmailVerified() : false)
                .emailVerified(request.getEmailVerified() != null ? request.getEmailVerified() : false)
                .acceptMarketing(request.getAcceptMarketing() != null ? request.getAcceptMarketing() : false)
                .employeeCode(request.getEmployeeCode())
                .hireDate(request.getHireDate())
                .salary(request.getSalary())
                .department(request.getDepartment())
                .membershipPoints(request.getMembershipPoints() != null ? request.getMembershipPoints() : 0)
                .membershipLevel(request.getMembershipLevel() != null ? request.getMembershipLevel() : "BRONZE")
                .build();

        Account savedAccount = accountRepository.save(account);
        log.info("User created successfully with ID: {}", savedAccount.getAccountId());

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
    public UserManagementResponse lockUser(Long userId, String lockReason) {
        log.info("Locking user: {} - reason: {}", userId, lockReason);

        Account account = findAccountById(userId);
        account.setAccountLockedUntil(LocalDateTime.now().plusDays(7)); // Lock for 7 days
        account.setUpdatedAt(LocalDateTime.now());

        Account savedAccount = accountRepository.save(account);
        return convertToResponse(savedAccount);
    }

    @Override
    public UserManagementResponse unlockUser(Long userId) {
        log.info("Unlocking user: {}", userId);

        Account account = findAccountById(userId);
        account.unlockAccount();
        account.setUpdatedAt(LocalDateTime.now());

        Account savedAccount = accountRepository.save(account);
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

    // ==================== MEMBERSHIP MANAGEMENT ====================

    @Override
    public UserManagementResponse updateMembershipPoints(Long userId, Integer points, String reason) {
        log.info("Updating membership points for user: {} - points: {} - reason: {}", userId, points, reason);

        Account account = findAccountById(userId);

        // Use loyalty service to properly track points
        loyaltyService.adjustPoints(account, points, reason);

        // Refresh account
        account = findAccountById(userId);
        return convertToResponse(account);
    }

    @Override
    public UserManagementResponse updateMembershipLevel(Long userId, String level) {
        log.info("Updating membership level for user: {} - level: {}", userId, level);

        Account account = findAccountById(userId);
        account.setMembershipLevel(level);
        account.setUpdatedAt(LocalDateTime.now());

        Account savedAccount = accountRepository.save(account);
        return convertToResponse(savedAccount);
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

        return UserStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .verifiedUsers(verifiedUsers)
                .lockedAccounts(lockedAccounts)
                .usersByRole(usersByRole)
                .usersByMembershipLevel(usersByMembershipLevel)
                .usersByDepartment(new HashMap<>())
                .newUsersThisMonth(newUsersThisMonth)
                .newUsersThisWeek(newUsersThisWeek)
                .usersLoggedInToday(usersLoggedInToday)
                .usersLoggedInThisWeek(usersLoggedInThisWeek)
                .averageMembershipPoints(averageMembershipPoints)
                .totalMembershipPointsDistributed(totalMembershipPointsDistributed)
                .oauthUsers(oauthUsers)
                .marketingAcceptanceRate(marketingAcceptanceRate)
                .averageUserAge(0.0)
                .topCities(new HashMap<>())
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
                        account.getRole().name(),
                        account.getIsActive(),
                        account.getEmailVerified(),
                        account.getCreatedAt(),
                        account.getLastLogin());
            }

            writer.flush();
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Error exporting users to CSV", e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Export failed");
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
        if (!isUsernameAvailable(request.getUsername(), excludeUserId)) {
            throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }

        if (!isEmailAvailable(request.getEmail(), excludeUserId)) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        if (request.getEmployeeCode() != null &&
                !isEmployeeCodeAvailable(request.getEmployeeCode(), excludeUserId)) {
            throw new AppException(ErrorCode.USER_ALREADY_EXISTS, "Employee code already exists");
        }
    }

    private void updateAccountFields(Account account, UserManagementRequest request) {
        if (request.getUsername() != null)
            account.setUsername(request.getUsername());
        if (request.getEmail() != null)
            account.setEmail(request.getEmail());
        if (request.getPassword() != null)
            account.setPassword(passwordEncoder.encode(request.getPassword()));
        if (request.getFullName() != null)
            account.setFullName(request.getFullName());
        if (request.getPhoneNumber() != null)
            account.setPhoneNumber(request.getPhoneNumber());
        if (request.getDateOfBirth() != null)
            account.setDateOfBirth(request.getDateOfBirth());
        if (request.getAddress() != null)
            account.setAddress(request.getAddress());
        if (request.getAvatarUrl() != null)
            account.setAvatarUrl(request.getAvatarUrl());
        if (request.getRole() != null)
            account.setRole(request.getRole());
        if (request.getIsActive() != null)
            account.setIsActive(request.getIsActive());
        if (request.getEmailVerified() != null) {
            account.setEmailVerified(request.getEmailVerified());
            account.setIsVerified(request.getEmailVerified());
        }
        if (request.getAcceptMarketing() != null)
            account.setAcceptMarketing(request.getAcceptMarketing());
        if (request.getEmployeeCode() != null)
            account.setEmployeeCode(request.getEmployeeCode());
        if (request.getHireDate() != null)
            account.setHireDate(request.getHireDate());
        if (request.getSalary() != null)
            account.setSalary(request.getSalary());
        if (request.getDepartment() != null)
            account.setDepartment(request.getDepartment());
        if (request.getMembershipPoints() != null)
            account.setMembershipPoints(request.getMembershipPoints());
        if (request.getMembershipLevel() != null)
            account.setMembershipLevel(request.getMembershipLevel());

        account.setUpdatedAt(LocalDateTime.now());
    }

    private UserManagementResponse convertToResponse(Account account) {
        // Get additional statistics
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
                .avatarUrl(account.getAvatarUrl())
                .role(account.getRole())
                .isActive(account.getIsActive())
                .isVerified(account.getIsVerified())
                .emailVerified(account.getEmailVerified())
                .acceptMarketing(account.getAcceptMarketing())
                .lastLogin(account.getLastLogin())
                .failedLoginAttempts(account.getFailedLoginAttempts())
                .accountLockedUntil(account.getAccountLockedUntil())
                .employeeCode(account.getEmployeeCode())
                .hireDate(account.getHireDate())
                .salary(account.getSalary())
                .department(account.getDepartment())
                .membershipPoints(account.getMembershipPoints())
                .membershipLevel(account.getMembershipLevel())
                .provider(account.getProvider())
                .providerId(account.getProviderId())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .createdBy(account.getCreatedBy())
                .updatedBy(account.getUpdatedBy())
                .isAccountLocked(account.isAccountLocked())
                .totalBookings(totalBookings)
                .totalSpent(totalSpent != null ? totalSpent : 0.0)
                .build();
    }

    private Specification<Account> buildSearchSpecification(UserSearchRequest searchRequest) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Keyword search
            if (searchRequest.getKeyword() != null && !searchRequest.getKeyword().trim().isEmpty()) {
                String keyword = "%" + searchRequest.getKeyword().trim().toLowerCase() + "%";
                Predicate keywordPredicate = criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("username")), keyword),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), keyword),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("fullName")), keyword));
                predicates.add(keywordPredicate);
            }

            // Role filter
            if (searchRequest.getRole() != null) {
                predicates.add(criteriaBuilder.equal(root.get("role"), searchRequest.getRole()));
            }

            // Active status filter
            if (searchRequest.getIsActive() != null) {
                predicates.add(criteriaBuilder.equal(root.get("isActive"), searchRequest.getIsActive()));
            }

            // Verified status filter
            if (searchRequest.getIsVerified() != null) {
                predicates.add(criteriaBuilder.equal(root.get("isVerified"), searchRequest.getIsVerified()));
            }

            // Email verified filter
            if (searchRequest.getEmailVerified() != null) {
                predicates.add(criteriaBuilder.equal(root.get("emailVerified"), searchRequest.getEmailVerified()));
            }

            // Membership level filter
            if (searchRequest.getMembershipLevel() != null) {
                predicates.add(criteriaBuilder.equal(root.get("membershipLevel"), searchRequest.getMembershipLevel()));
            }

            // Department filter
            if (searchRequest.getDepartment() != null) {
                predicates.add(criteriaBuilder.equal(root.get("department"), searchRequest.getDepartment()));
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

            // Membership points range
            if (searchRequest.getMinMembershipPoints() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("membershipPoints"), searchRequest.getMinMembershipPoints()));
            }

            if (searchRequest.getMaxMembershipPoints() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("membershipPoints"), searchRequest.getMaxMembershipPoints()));
            }

            // Provider filter
            if (searchRequest.getProvider() != null) {
                predicates.add(criteriaBuilder.equal(root.get("provider"), searchRequest.getProvider()));
            }

            // Include locked filter
            if (searchRequest.getIncludeLocked() != null && !searchRequest.getIncludeLocked()) {
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.isNull(root.get("accountLockedUntil")),
                        criteriaBuilder.lessThanOrEqualTo(root.get("accountLockedUntil"), LocalDateTime.now())));
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