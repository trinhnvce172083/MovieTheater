package com.swp.MovieTheaterService.exception;

/**
 * Application Exception - Enhanced Professional Version
 * Centralized exception handling with ErrorCode enum
 *
 * @author Ngo Viet Trinh
 * @version 3.0.0 (Cleaned up)
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

    // ==================== GETTERS & SETTERS ====================

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
