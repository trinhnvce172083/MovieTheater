package com.swp.MovieTheaterService.exception;

import lombok.Getter;

/**
 * Custom Exception for Auto Schedule Operations
 * Exception chuyên dụng cho các thao tác tạo lịch chiếu tự động
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Getter
public class AutoScheduleException extends AppException {

    private final String operation;
    private final Object additionalData;

    /**
     * Constructor với ErrorCode
     */
    public AutoScheduleException(ErrorCode errorCode) {
        super(errorCode);
        this.operation = null;
        this.additionalData = null;
    }

    /**
     * Constructor với ErrorCode và thông tin thêm
     */
    public AutoScheduleException(ErrorCode errorCode, String operation) {
        super(errorCode);
        this.operation = operation;
        this.additionalData = null;
    }

    /**
     * Constructor với ErrorCode, operation và dữ liệu thêm
     */
    public AutoScheduleException(ErrorCode errorCode, String operation, Object additionalData) {
        super(errorCode);
        this.operation = operation;
        this.additionalData = additionalData;
    }

    /**
     * Constructor với ErrorCode và cause
     */
    public AutoScheduleException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
        this.operation = null;
        this.additionalData = null;
    }

    /**
     * Constructor với ErrorCode, operation, cause và dữ liệu thêm
     */
    public AutoScheduleException(ErrorCode errorCode, String operation, Throwable cause, Object additionalData) {
        super(errorCode, cause);
        this.operation = operation;
        this.additionalData = additionalData;
    }

    /**
     * Tạo exception cho lỗi validation
     */
    public static AutoScheduleException validationFailed(String details) {
        return new AutoScheduleException(ErrorCode.AUTO_SCHEDULE_VALIDATION_FAILED, "validation", details);
    }

    /**
     * Tạo exception cho lỗi không tìm thấy phim
     */
    public static AutoScheduleException movieNotFound(Object movieIds) {
        return new AutoScheduleException(ErrorCode.AUTO_SCHEDULE_MOVIE_NOT_FOUND, "movie-lookup", movieIds);
    }

    /**
     * Tạo exception cho lỗi không có phòng chiếu
     */
    public static AutoScheduleException noRoomsAvailable() {
        return new AutoScheduleException(ErrorCode.AUTO_SCHEDULE_NO_ROOMS, "room-lookup");
    }

    /**
     * Tạo exception cho lỗi khoảng thời gian không hợp lệ
     */
    public static AutoScheduleException invalidDateRange(String dateRange) {
        return new AutoScheduleException(ErrorCode.AUTO_SCHEDULE_INVALID_DATE_RANGE, "date-validation", dateRange);
    }

    /**
     * Tạo exception cho lỗi transaction
     */
    public static AutoScheduleException transactionFailed(Throwable cause) {
        return new AutoScheduleException(ErrorCode.AUTO_SCHEDULE_TRANSACTION_FAILED, "transaction", cause, null);
    }

    /**
     * Tạo exception cho lỗi xung đột thời gian
     */
    public static AutoScheduleException timeConflict(String conflictDetails) {
        return new AutoScheduleException(ErrorCode.AUTO_SCHEDULE_TIME_CONFLICT, "time-conflict", conflictDetails);
    }

    /**
     * Tạo exception cho lỗi xung đột phòng chiếu
     */
    public static AutoScheduleException roomConflict(String roomDetails) {
        return new AutoScheduleException(ErrorCode.AUTO_SCHEDULE_ROOM_CONFLICT, "room-conflict", roomDetails);
    }

    /**
     * Tạo exception cho lỗi database
     */
    public static AutoScheduleException databaseError(Throwable cause) {
        return new AutoScheduleException(ErrorCode.AUTO_SCHEDULE_DATABASE_ERROR, "database", cause, null);
    }

    /**
     * Tạo exception cho lỗi không đủ khung giờ
     */
    public static AutoScheduleException insufficientTimeSlots(int required, int available) {
        String details = String.format("Cần %d khung giờ, chỉ có %d khả dụng", required, available);
        return new AutoScheduleException(ErrorCode.AUTO_SCHEDULE_INSUFFICIENT_TIME_SLOTS, "time-slots", details);
    }

    /**
     * Override getMessage để bao gồm thông tin operation
     */
    @Override
    public String getMessage() {
        String baseMessage = super.getMessage();
        if (operation != null) {
            return String.format("[%s] %s", operation.toUpperCase(), baseMessage);
        }
        return baseMessage;
    }

    /**
     * Lấy thông tin chi tiết cho logging
     */
    public String getDetailedMessage() {
        StringBuilder sb = new StringBuilder();
        sb.append("AutoScheduleException: ").append(getErrorCode().getMessage());

        if (operation != null) {
            sb.append(" | Operation: ").append(operation);
        }

        if (additionalData != null) {
            sb.append(" | Data: ").append(additionalData.toString());
        }

        if (getCause() != null) {
            sb.append(" | Cause: ").append(getCause().getMessage());
        }

        return sb.toString();
    }
}