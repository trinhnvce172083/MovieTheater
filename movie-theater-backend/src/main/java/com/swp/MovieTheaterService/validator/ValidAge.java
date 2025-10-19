package com.swp.MovieTheaterService.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Custom validation annotation for age validation
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Documented
@Constraint(validatedBy = ValidAgeValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidAge {
    
    String message() default "Tuổi phải từ {min} đến {max}";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    int min() default 13;
    
    int max() default 120;
} 
