package com.swp.MovieTheaterService.utils;

import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.exception.MultipleParameterValidationException;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Validation Utilities
 * Hỗ trợ validation và parameter checking
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
public class ValidationUtils {

    // Email pattern
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    );

    // Phone pattern (Vietnamese)
    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "^[0-9]{10,11}$"
    );

    /**
     * Validate required parameters
     */
    public static void validateRequiredParameters(Object... params) {
        List<String> missingParams = new ArrayList<>();

        for (int i = 0; i < params.length; i += 2) {
            if (i + 1 < params.length) {
                String paramName = (String) params[i];
                Object paramValue = params[i + 1];

                if (paramValue == null ||
                        (paramValue instanceof String && ((String) paramValue).trim().isEmpty())) {
                    missingParams.add(paramName);
                }
            }
        }

        if (!missingParams.isEmpty()) {
            throw new MultipleParameterValidationException(missingParams);
        }
    }

    /**
     * Validate email format
     */
    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    /**
     * Validate phone number format
     */
    public static boolean isValidPhone(String phone) {
        return phone != null && PHONE_PATTERN.matcher(phone).matches();
    }

    /**
     * Validate age range
     */
    public static boolean isValidAge(int age, int minAge, int maxAge) {
        return age >= minAge && age <= maxAge;
    }

    /**
     * Validate string length
     */
    public static boolean isValidLength(String value, int minLength, int maxLength) {
        return value != null && value.length() >= minLength && value.length() <= maxLength;
    }

    /**
     * Validate numeric range
     */
    public static boolean isValidRange(double value, double min, double max) {
        return value >= min && value <= max;
    }

    /**
     * Validate positive number
     */
    public static boolean isPositive(double value) {
        return value > 0;
    }

    /**
     * Validate non-negative number
     */
    public static boolean isNonNegative(double value) {
        return value >= 0;
    }
} 
