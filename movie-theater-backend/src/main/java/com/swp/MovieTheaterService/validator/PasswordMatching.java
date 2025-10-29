package com.swp.MovieTheaterService.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Custom validation annotation for password confirmation
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Documented
@Constraint(validatedBy = PasswordMatchingValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface PasswordMatching {
    
    String message() default "Mật khẩu xác nhận không khớp với mật khẩu";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
    
    String password();
    
    String confirmPassword();
}