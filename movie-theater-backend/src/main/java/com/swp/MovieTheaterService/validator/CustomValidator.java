package com.swp.MovieTheaterService.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Objects;

/**
 * Custom Validator Implementation
 * Validation logic cho CustomConstraint
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
public class CustomValidator implements ConstraintValidator<CustomConstraint, String> {

    private int min;
    private int max;

    @Override
    public void initialize(CustomConstraint constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
        min = constraintAnnotation.min();
        max = constraintAnnotation.max();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (Objects.isNull(value)) {
            return true; // null values should be handled by @NotNull
        }
        return value.length() >= min && value.length() <= max;
    }
} 
