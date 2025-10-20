package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.entity.Account;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.repository.AccountRepository;
import com.swp.MovieTheaterService.utils.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Example Service - Minh họa cách sử dụng hệ thống Error Handling
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ExampleService {

    private final AccountRepository accountRepository;

    /**
     * Ví dụ 1: Sử dụng AppException với ErrorCode
     */
    public Account getUserById(Long userId) {
        log.info("Getting user by ID: {}", userId);

        // Validate input parameter
        if (userId == null) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "User ID không được để trống");
        }

        // Business logic với AppException
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return account;
    }

    /**
     * Ví dụ 2: Sử dụng MultipleParameterValidationException
     */
    public void validateUserData(String username, String email, String phone) {
        log.info("Validating user data: username={}, email={}, phone={}", username, email, phone);

        // Sử dụng ValidationUtils để validate nhiều tham số
        ValidationUtils.validateRequiredParameters(
                "username", username,
                "email", email,
                "phone", phone
        );

        // Validate email format
        if (!ValidationUtils.isValidEmail(email)) {
            throw new AppException(ErrorCode.EMAIL_INVALID);
        }

        // Validate phone format
        if (!ValidationUtils.isValidPhone(phone)) {
            throw new AppException(ErrorCode.PHONE_INVALID);
        }

        // Validate username length
        if (!ValidationUtils.isValidLength(username, 3, 50)) {
            throw new AppException(ErrorCode.USERNAME_INVALID, 3);
        }
    }

    /**
     * Ví dụ 3: Sử dụng AppException với message parameters
     */
    public void updateUserAge(Long userId, int age) {
        log.info("Updating user age: userId={}, age={}", userId, age);

        // Validate age range
        if (!ValidationUtils.isValidAge(age, 1, 120)) {
            throw new AppException(ErrorCode.AGE_INVALID, 1, 120);
        }

        Account account = getUserById(userId);

        // Business logic validation
        if (age < 18) {
            throw new AppException(ErrorCode.ACCESS_DENIED, "Người dùng phải từ 18 tuổi trở lên");
        }

        // Update logic here...
        log.info("User age updated successfully");
    }

    /**
     * Ví dụ 4: Sử dụng AppException với cause
     */
    public void processUserData(Long userId) {
        log.info("Processing user data: userId={}", userId);

        try {
            Account account = getUserById(userId);

            // Simulate some processing that might fail
            if (account.getUsername().equals("admin")) {
                throw new RuntimeException("Admin account processing failed");
            }

            log.info("User data processed successfully");

        } catch (RuntimeException e) {
            log.error("Error processing user data: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, e);
        }
    }

    /**
     * Ví dụ 5: Sử dụng ValidationUtils với custom validation
     */
    public void createUserWithValidation(String username, String email, String password, int age) {
        log.info("Creating user with validation: username={}, email={}, age={}", username, email, age);

        // Validate required parameters
        ValidationUtils.validateRequiredParameters(
                "username", username,
                "email", email,
                "password", password
        );

        // Validate email format
        if (!ValidationUtils.isValidEmail(email)) {
            throw new AppException(ErrorCode.EMAIL_INVALID);
        }

        // Validate password length
        if (!ValidationUtils.isValidLength(password, 6, 100)) {
            throw new AppException(ErrorCode.PASSWORD_INVALID, 6);
        }

        // Validate age
        if (!ValidationUtils.isValidAge(age, 1, 120)) {
            throw new AppException(ErrorCode.AGE_INVALID, 1, 120);
        }

        // Check if user already exists
        if (accountRepository.existsByUsername(username)) {
            throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }

        if (accountRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // Create user logic here...
        log.info("User validation passed, ready to create user");
    }

    /**
     * Ví dụ 6: Sử dụng AppException với business logic
     */
    public void transferPoints(Long fromUserId, Long toUserId, int points) {
        log.info("Transferring points: from={}, to={}, points={}", fromUserId, toUserId, points);

        // Validate input
        if (points <= 0) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Số điểm phải lớn hơn 0");
        }

        if (fromUserId.equals(toUserId)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Không thể chuyển điểm cho chính mình");
        }

        // Get accounts
        Account fromAccount = getUserById(fromUserId);
        Account toAccount = getUserById(toUserId);

        // Business logic validation
        if (fromAccount.getMembershipPoints() < points) {
            throw new AppException(ErrorCode.PAYMENT_INSUFFICIENT_BALANCE,
                    "Số điểm không đủ để chuyển");
        }

        // Transfer logic here...
        log.info("Points transfer completed successfully");
    }
} 
