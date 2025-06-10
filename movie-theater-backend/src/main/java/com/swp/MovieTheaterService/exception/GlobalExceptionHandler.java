package com.swp.MovieTheaterService.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.swp.MovieTheaterService.dto.response.ApiResponse;
import jakarta.validation.ConstraintViolationException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Global Exception Handler - Optimized & Clean
 * Professional centralized exception handling with AppException integration
 * 
 * @author Dũng_Solo
 * @version 3.0.0 (Optimized)
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ==================== CORE EXCEPTION HANDLERS ====================

    /**
     * Handle main AppException - The core of our exception system
     */
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Object>> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();

        log.warn("AppException [{}]: {}", errorCode.getCode(), ex.getMessage());

        ApiResponse<Object> response = ApiResponse.<Object>builder()
                .success(false)
                .code(errorCode.getCode())
                .message(ex.getMessage())
                .errorCode(errorCode.name())
                .timestamp(java.time.LocalDateTime.now())
                .build();

        return ResponseEntity.status(errorCode.getHttpStatusCode()).body(response);
    }

    /**
     * Handle JSON parsing errors - ROOT CAUSE of validation failures
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Object>> handleJsonParsingError(HttpMessageNotReadableException ex) {
        ErrorCode errorCode = ErrorCode.VALIDATION_ERROR;

        log.error("JSON Parsing Error: {}", ex.getMessage());

        String message = "Invalid JSON format or unreadable request body";
        if (ex.getMessage().contains("Required request body")) {
            message = "Request body is missing";
        }

        ApiResponse<Object> response = ApiResponse.<Object>builder()
                .success(false)
                .code(errorCode.getCode())
                .message(message)
                .errorCode("JSON_PARSING_ERROR")
                .timestamp(java.time.LocalDateTime.now())
                .build();

        return ResponseEntity.status(errorCode.getHttpStatusCode()).body(response);
    }

    /**
     * Handle validation errors from @Valid annotations
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        ErrorCode errorCode = ErrorCode.VALIDATION_ERROR;

        // Collect field errors
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        // Debug logging only in DEBUG level (not in production)
        if (log.isDebugEnabled()) {
            Object target = ex.getBindingResult().getTarget();
            log.debug("===== VALIDATION DEBUG =====");
            log.debug("Target object class: {}", target != null ? target.getClass().getSimpleName() : "NULL");
            log.debug("Target object: {}", target);
            log.debug("Field error count: {}", ex.getBindingResult().getFieldErrorCount());

            for (FieldError error : ex.getBindingResult().getFieldErrors()) {
                log.debug("Field: {} = '{}' (rejected value: {})",
                        error.getField(),
                        error.getRejectedValue(),
                        error.getRejectedValue() != null ? error.getRejectedValue().getClass().getSimpleName()
                                : "NULL");
            }
            log.debug("=============================");
        }

        // Use first field error as main message
        String mainMessage = fieldErrors.isEmpty() ? "Validation failed" : fieldErrors.values().iterator().next();

        log.warn("Validation errors: {} fields failed", fieldErrors.size());

        ApiResponse<Object> response = ApiResponse.<Object>builder()
                .success(false)
                .code(errorCode.getCode())
                .message(mainMessage)
                .errorCode(errorCode.name())
                .data(fieldErrors)
                .timestamp(java.time.LocalDateTime.now())
                .build();

        return ResponseEntity.status(errorCode.getHttpStatusCode()).body(response);
    }

    /**
     * Handle Spring Security access denied
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDenied(AccessDeniedException ex) {
        ErrorCode errorCode = ErrorCode.ACCESS_DENIED;

        log.warn("Access denied: {}", ex.getMessage());

        ApiResponse<Object> response = ApiResponse.<Object>builder()
                .success(false)
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .errorCode(errorCode.name())
                .timestamp(java.time.LocalDateTime.now())
                .build();

        return ResponseEntity.status(errorCode.getHttpStatusCode()).body(response);
    }

    /**
     * Handle rate limit exceptions
     */
    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ApiResponse<Object>> handleRateLimitExceeded(RateLimitExceededException ex) {
        ErrorCode errorCode = ErrorCode.RATE_LIMIT_EXCEEDED;

        log.warn("Rate limit exceeded: {}", ex.getMessage());

        ApiResponse<Object> response = ApiResponse.<Object>builder()
                .success(false)
                .code(errorCode.getCode())
                .message(ex.getMessage())
                .errorCode(errorCode.name())
                .timestamp(java.time.LocalDateTime.now())
                .build();

        return ResponseEntity.status(errorCode.getHttpStatusCode()).body(response);
    }

    /**
     * Handle authentication failures from Spring Security
     */
    @ExceptionHandler({ BadCredentialsException.class, UsernameNotFoundException.class })
    public ResponseEntity<ApiResponse<Object>> handleAuthenticationException(Exception ex) {
        ErrorCode errorCode = ErrorCode.INVALID_CREDENTIALS;

        log.warn("Authentication failed: {}", ex.getMessage());

        ApiResponse<Object> response = ApiResponse.<Object>builder()
                .success(false)
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .errorCode(errorCode.name())
                .timestamp(java.time.LocalDateTime.now())
                .build();

        return ResponseEntity.status(errorCode.getHttpStatusCode()).body(response);
    }

    /**
     * Handle missing request parameters
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Object>> handleMissingParameter(MissingServletRequestParameterException ex) {
        ErrorCode errorCode = ErrorCode.VALIDATION_ERROR;

        String message = String.format("Missing required parameter: %s", ex.getParameterName());
        log.warn("Missing request parameter: {}", ex.getParameterName());

        ApiResponse<Object> response = ApiResponse.<Object>builder()
                .success(false)
                .code(errorCode.getCode())
                .message(message)
                .errorCode("MISSING_PARAMETER")
                .timestamp(java.time.LocalDateTime.now())
                .build();

        return ResponseEntity.status(errorCode.getHttpStatusCode()).body(response);
    }

    /**
     * Handle method argument type mismatch
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        ErrorCode errorCode = ErrorCode.VALIDATION_ERROR;

        String message = String.format("Invalid value for parameter '%s': %s", ex.getName(), ex.getValue());
        log.warn("Type mismatch for parameter: {} with value: {}", ex.getName(), ex.getValue());

        ApiResponse<Object> response = ApiResponse.<Object>builder()
                .success(false)
                .code(errorCode.getCode())
                .message(message)
                .errorCode("TYPE_MISMATCH")
                .timestamp(java.time.LocalDateTime.now())
                .build();

        return ResponseEntity.status(errorCode.getHttpStatusCode()).body(response);
    }

    /**
     * Handle binding exceptions (similar to validation but for form data)
     */
    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiResponse<Object>> handleBindException(BindException ex) {
        ErrorCode errorCode = ErrorCode.VALIDATION_ERROR;

        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError error : ex.getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        String mainMessage = fieldErrors.isEmpty() ? "Binding failed" : fieldErrors.values().iterator().next();
        log.warn("Binding errors: {} fields failed", fieldErrors.size());

        ApiResponse<Object> response = ApiResponse.<Object>builder()
                .success(false)
                .code(errorCode.getCode())
                .message(mainMessage)
                .errorCode(errorCode.name())
                .data(fieldErrors)
                .timestamp(java.time.LocalDateTime.now())
                .build();

        return ResponseEntity.status(errorCode.getHttpStatusCode()).body(response);
    }

    /**
     * Handle constraint violations (Bean Validation)
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolation(ConstraintViolationException ex) {
        ErrorCode errorCode = ErrorCode.VALIDATION_ERROR;

        Map<String, String> violations = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(violation -> {
            String fieldName = violation.getPropertyPath().toString();
            violations.put(fieldName, violation.getMessage());
        });

        String mainMessage = violations.isEmpty() ? "Constraint violation" : violations.values().iterator().next();
        log.warn("Constraint violations: {} fields failed", violations.size());

        ApiResponse<Object> response = ApiResponse.<Object>builder()
                .success(false)
                .code(errorCode.getCode())
                .message(mainMessage)
                .errorCode("CONSTRAINT_VIOLATION")
                .data(violations)
                .timestamp(java.time.LocalDateTime.now())
                .build();

        return ResponseEntity.status(errorCode.getHttpStatusCode()).body(response);
    }

    /**
     * Handle database constraint violations
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        ErrorCode errorCode = ErrorCode.VALIDATION_ERROR;

        String message = "Data integrity constraint violation";

        // Common database constraint violations
        String rootMessage = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        if (rootMessage != null) {
            if (rootMessage.contains("Duplicate entry")) {
                message = "Record already exists";
                errorCode = ErrorCode.USER_ALREADY_EXISTS;
            } else if (rootMessage.contains("foreign key constraint")) {
                message = "Referenced record does not exist";
            } else if (rootMessage.contains("cannot be null")) {
                message = "Required field cannot be empty";
            }
        }

        log.warn("Data integrity violation: {}", ex.getMessage());

        ApiResponse<Object> response = ApiResponse.<Object>builder()
                .success(false)
                .code(errorCode.getCode())
                .message(message)
                .errorCode("DATA_INTEGRITY_VIOLATION")
                .timestamp(java.time.LocalDateTime.now())
                .build();

        return ResponseEntity.status(errorCode.getHttpStatusCode()).body(response);
    }

    /**
     * Handle all uncategorized exceptions - Fallback handler
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleUncategorizedException(Exception ex) {
        ErrorCode errorCode = ErrorCode.UNCATEGORIZED_EXCEPTION;

        log.error("Uncategorized exception: ", ex);

        ApiResponse<Object> response = ApiResponse.<Object>builder()
                .success(false)
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .errorCode(errorCode.name())
                .timestamp(java.time.LocalDateTime.now())
                .build();

        return ResponseEntity.status(errorCode.getHttpStatusCode()).body(response);
    }
}