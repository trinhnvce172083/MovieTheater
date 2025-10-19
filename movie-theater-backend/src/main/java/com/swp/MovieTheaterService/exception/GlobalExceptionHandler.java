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

import java.util.*;
import java.util.stream.Collectors;

/**
 * Global Exception Handler - Optimized & Clean
 * Professional centralized exception handling with AppException integration
 * 
 * @author Ngo Viet Trinh
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

        // Collect field errors with enhanced error details
        List<ApiResponse.ErrorDetail> errorDetails = ex.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> {
                    String enumKey = fieldError.getDefaultMessage();
                    String fieldName = fieldError.getField();
                    ErrorCode specificErrorCode = ErrorCode.INVALID_KEY;
                    Map<String, Object> attributes = null;

                    try {
                        // Try to find specific error code from message
                        specificErrorCode = Arrays.stream(ErrorCode.values())
                                .filter(code -> code.name().equals(enumKey))
                                .findFirst()
                                .orElse(ErrorCode.INVALID_KEY);

                        // Get constraint attributes if available
                        var constraintViolation = fieldError.unwrap(jakarta.validation.ConstraintViolation.class);
                        attributes = constraintViolation.getConstraintDescriptor().getAttributes();
                    } catch (Exception e) {
                        log.debug("Could not extract constraint attributes for field: {}", fieldName);
                    }

                    String errorMessage = Objects.nonNull(attributes) ?
                            formatMessage(specificErrorCode.getMessage(), attributes) : specificErrorCode.getMessage();
                    errorMessage = fieldName + ": " + errorMessage;

                    return ApiResponse.ErrorDetail.builder()
                            .field(fieldName)
                            .message(errorMessage)
                            .rejectedValue(fieldError.getRejectedValue())
                            .build();
                })
                .collect(Collectors.toList());

        // Debug logging only in DEBUG level
        if (log.isDebugEnabled()) {
            Object target = ex.getBindingResult().getTarget();
            log.debug("===== VALIDATION DEBUG =====");
            log.debug("Target object class: {}", target != null ? target.getClass().getSimpleName() : "NULL");
            log.debug("Field error count: {}", ex.getBindingResult().getFieldErrorCount());
            log.debug("=============================");
        }

        String mainMessage = errorDetails.isEmpty() ? "Validation failed" :
                errorDetails.get(0).getMessage();

        log.warn("Validation errors: {} fields failed", errorDetails.size());

        ApiResponse<Object> response = ApiResponse.<Object>builder()
                .success(false)
                .code(errorCode.getCode())
                .message(mainMessage)
                .errorCode(errorCode.name())
                .errors(errorDetails)
                .timestamp(java.time.LocalDateTime.now())
                .build();

        return ResponseEntity.status(errorCode.getHttpStatusCode()).body(response);
    }

    /**
     * Handle Multiple Parameter Validation
     */
    @ExceptionHandler(MultipleParameterValidationException.class)
    public ResponseEntity<ApiResponse<Object>> handleMultipleParameterValidation(
            MultipleParameterValidationException exception) {

        List<ApiResponse.ErrorDetail> errors = exception.getMissingParameters().stream()
                .map(paramName -> {
                    ErrorCode errorCode = ErrorCode.NOT_EMPTY;
                    String errorMessage = paramName + ": " + errorCode.getMessage();

                    return ApiResponse.ErrorDetail.builder()
                            .field(paramName)
                            .message(errorMessage)
                            .build();
                })
                .collect(Collectors.toList());

        ApiResponse<Object> response = ApiResponse.<Object>builder()
                .success(false)
                .code(ErrorCode.VALIDATION_ERROR.getCode())
                .message("Missing required parameters")
                .errorCode(ErrorCode.VALIDATION_ERROR.name())
                .errors(errors)
                .timestamp(java.time.LocalDateTime.now())
                .build();

        return ResponseEntity.status(ErrorCode.VALIDATION_ERROR.getHttpStatusCode()).body(response);
    }

    /**
     * Helper method để format message với placeholder
     */
    private String formatMessage(String message, Map<String, Object> attributes) {
        for (Map.Entry<String, Object> entry : attributes.entrySet()) {
            message = message.replace("{" + entry.getKey() + "}", entry.getValue().toString());
        }
        return message;
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

        List<ApiResponse.ErrorDetail> errorDetails = ex.getFieldErrors().stream()
                .map(fieldError -> ApiResponse.ErrorDetail.builder()
                        .field(fieldError.getField())
                        .message(fieldError.getDefaultMessage())
                        .rejectedValue(fieldError.getRejectedValue())
                        .build())
                .collect(Collectors.toList());

        String mainMessage = errorDetails.isEmpty() ? "Binding failed" :
                errorDetails.get(0).getMessage();
        log.warn("Binding errors: {} fields failed", errorDetails.size());

        ApiResponse<Object> response = ApiResponse.<Object>builder()
                .success(false)
                .code(errorCode.getCode())
                .message(mainMessage)
                .errorCode(errorCode.name())
                .errors(errorDetails)
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
