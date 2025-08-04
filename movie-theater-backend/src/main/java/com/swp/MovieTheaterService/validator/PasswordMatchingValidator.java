package com.swp.MovieTheaterService.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.lang.reflect.Field;
import java.lang.reflect.Method;

/**
 * Password Matching Validator Implementation
 * Enhanced to work better with Lombok-generated classes
 * 
 * @author Dũng_Solo
 * @version 1.1.0
 */
public class PasswordMatchingValidator implements ConstraintValidator<PasswordMatching, Object> {

    private String passwordFieldName;
    private String confirmPasswordFieldName;

    @Override
    public void initialize(PasswordMatching constraintAnnotation) {
        this.passwordFieldName = constraintAnnotation.password();
        this.confirmPasswordFieldName = constraintAnnotation.confirmPassword();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        try {
            Object password = getFieldValue(value, passwordFieldName);
            Object confirmPassword = getFieldValue(value, confirmPasswordFieldName);

            // Allow both null (will be handled by @NotBlank)
            if (password == null && confirmPassword == null) {
                return true;
            }

            // If one is null and other is not
            if (password == null || confirmPassword == null) {
                return false;
            }

            boolean isValid = password.equals(confirmPassword);

            if (!isValid) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(context.getDefaultConstraintMessageTemplate())
                        .addPropertyNode(confirmPasswordFieldName)
                        .addConstraintViolation();
            }

            return isValid;

        } catch (Exception e) {
            // Log the exception and return false
            System.err.println("PasswordMatchingValidator error: " + e.getMessage());
            return false;
        }
    }

    private Object getFieldValue(Object object, String fieldName) throws Exception {
        try {
            // First try to use getter method (works better with Lombok)
            String getterName = "get" + capitalize(fieldName);
            Method getter = object.getClass().getMethod(getterName);
            return getter.invoke(object);
        } catch (NoSuchMethodException e) {
            // Fallback to direct field access
            Field field = object.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return field.get(object);
        }
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
}