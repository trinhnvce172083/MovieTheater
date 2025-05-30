package com.swp.MovieTheaterService.exception;

import java.util.Map;

/**
 * Validation Exception
 * Thrown when validation fails
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
public class ValidationException extends RuntimeException {

    private Map<String, String> errors;

    public ValidationException(String message) {
        super(message);
    }

    public ValidationException(String message, Map<String, String> errors) {
        super(message);
        this.errors = errors;
    }

    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }

    public Map<String, String> getErrors() {
        return errors;
    }
} 