package com.swp.MovieTheaterService.exception;

/**
 * Rate Limit Exceeded Exception
 * Thrown when rate limit is exceeded for an operation
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
public class RateLimitExceededException extends RuntimeException {

    public RateLimitExceededException(String message) {
        super(message);
    }

    public RateLimitExceededException(String message, Throwable cause) {
        super(message, cause);
    }
} 
