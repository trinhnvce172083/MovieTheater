package com.swp.MovieTheaterService.exception;

/**
 * Application Exception - Enhanced Professional Version
 * Centralized exception handling with ErrorCode enum
 * 
 * @author Dũng_Solo
 * @version 2.0.0 (Enhanced)
 */
public class AppException extends RuntimeException {

    private ErrorCode errorCode;
    private Object[] messageParams;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public AppException(ErrorCode errorCode, Object... messageParams) {
        super(errorCode.formatMessage(messageParams));
        this.errorCode = errorCode;
        this.messageParams = messageParams;
    }

    public AppException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
    }

    public AppException(ErrorCode errorCode, Throwable cause, Object... messageParams) {
        super(errorCode.formatMessage(messageParams), cause);
        this.errorCode = errorCode;
        this.messageParams = messageParams;
    }

    // ==================== FACTORY METHODS ====================
    
    /**
     * Quick factory methods cho các lỗi phổ biến
     */
    public static AppException badRequest(String message) {
        return new AppException(ErrorCode.VALIDATION_ERROR);
    }
    
    public static AppException notFound(String resource) {
        return new AppException(ErrorCode.RESOURCE_NOT_FOUND);
    }
    
    public static AppException unauthorized() {
        return new AppException(ErrorCode.UNAUTHENTICATED);
    }
    
    public static AppException forbidden() {
        return new AppException(ErrorCode.UNAUTHORIZED);
    }
    
    public static AppException conflict(String message) {
        return new AppException(ErrorCode.USER_ALREADY_EXISTS);
    }
    
    public static AppException validationError() {
        return new AppException(ErrorCode.VALIDATION_ERROR);
    }
    
    public static AppException accountLocked() {
        return new AppException(ErrorCode.ACCOUNT_LOCKED);
    }
    
    public static AppException tokenExpired() {
        return new AppException(ErrorCode.TOKEN_EXPIRED);
    }
    
    public static AppException tokenInvalid() {
        return new AppException(ErrorCode.TOKEN_INVALID);
    }

    // ==================== GETTERS ====================
    
    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public Object[] getMessageParams() {
        return messageParams;
    }

    public void setErrorCode(ErrorCode errorCode) {
        this.errorCode = errorCode;
    }
} 