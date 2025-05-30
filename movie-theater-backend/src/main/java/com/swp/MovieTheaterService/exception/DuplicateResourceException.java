package com.swp.MovieTheaterService.exception;

/**
 * Duplicate Resource Exception
 * Thrown when trying to create a resource that already exists
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }

    public DuplicateResourceException(String message, Throwable cause) {
        super(message, cause);
    }
} 