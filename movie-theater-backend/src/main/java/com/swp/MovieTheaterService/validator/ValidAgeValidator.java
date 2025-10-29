package com.swp.MovieTheaterService.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDate;
import java.time.Period;

/**
 * Age Validator Implementation
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
public class ValidAgeValidator implements ConstraintValidator<ValidAge, LocalDate> {
    
    private int minAge;
    private int maxAge;
    
    @Override
    public void initialize(ValidAge constraintAnnotation) {
        this.minAge = constraintAnnotation.min();
        this.maxAge = constraintAnnotation.max();
    }
    
    @Override
    public boolean isValid(LocalDate dateOfBirth, ConstraintValidatorContext context) {
        if (dateOfBirth == null) {
            return true; // Let @NotNull handle null validation if required
        }
        
        LocalDate now = LocalDate.now();
        if (dateOfBirth.isAfter(now)) {
            return false; // Future date
        }
        
        int age = Period.between(dateOfBirth, now).getYears();
        return age >= minAge && age <= maxAge;
    }
}