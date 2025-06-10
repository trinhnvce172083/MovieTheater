package com.swp.MovieTheaterService.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Generic API Response
 * Standard response wrapper for all API endpoints
 * 
 * @author Dũng_Solo
 * @version 2.0.0 (Enhanced)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "API Response wrapper tiêu chuẩn cho tất cả endpoints")
public class ApiResponse<T> {

    @Schema(description = "Trạng thái thành công của request", example = "true")
    private boolean success;
    
    @Schema(description = "Mã trạng thái", example = "200")
    private int code;
    
    @Schema(description = "Thông báo mô tả kết quả", example = "Thao tác thành công")
    private String message;
    
    @Schema(description = "Dữ liệu trả về của API")
    private T data;
    
    @Schema(description = "Thông báo lỗi (nếu có)", example = "Dữ liệu không hợp lệ")
    private String error;
    
    @Schema(description = "Mã lỗi chi tiết (nếu có)", example = "VALIDATION_ERROR")
    private String errorCode;
    
    @Schema(description = "Danh sách lỗi chi tiết (nếu có)")
    private List<ErrorDetail> errors;
    
    @Schema(description = "Thời gian xử lý request", example = "2025-06-06T12:00:00")
    private LocalDateTime timestamp;
    
    @Schema(description = "Metadata bổ sung")
    private Object metadata;

    /**
     * Error Detail for validation errors
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Chi tiết lỗi validation")
    public static class ErrorDetail {
        @Schema(description = "Tên field bị lỗi", example = "email")
        private String field;
        
        @Schema(description = "Thông báo lỗi", example = "Email không đúng định dạng")
        private String message;
        
        @Schema(description = "Giá trị được reject", example = "invalid-email")
        private Object rejectedValue;
    }

    // ==================== SUCCESS METHODS ====================
    
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .code(200)
                .message("Thao tác thành công")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .code(200)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data, Object metadata) {
        return ApiResponse.<T>builder()
                .success(true)
                .code(200)
                .message(message)
                .data(data)
                .metadata(metadata)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // ==================== ERROR METHODS ====================
    
    public static <T> ApiResponse<T> error(String error) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(500)
                .message("Có lỗi xảy ra")
                .error(error)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String message, String error) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(500)
                .message(message)
                .error(error)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String message, String error, String errorCode) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(500)
                .message(message)
                .error(error)
                .errorCode(errorCode)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> validationError(String message, List<ErrorDetail> errors) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(400)
                .message(message)
                .error("Dữ liệu không hợp lệ")
                .errorCode("VALIDATION_ERROR")
                .errors(errors)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> badRequest(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(400)
                .message(message)
                .error("Yêu cầu không hợp lệ")
                .errorCode("BAD_REQUEST")
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> unauthorized(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(401)
                .message(message != null ? message : "Không có quyền truy cập")
                .error("Unauthorized")
                .errorCode("UNAUTHORIZED")
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> forbidden(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(403)
                .message(message != null ? message : "Không đủ quyền thực hiện thao tác")
                .error("Forbidden")
                .errorCode("FORBIDDEN")
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> notFound(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(404)
                .message(message != null ? message : "Không tìm thấy tài nguyên")
                .error("Not Found")
                .errorCode("NOT_FOUND")
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> conflict(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(409)
                .message(message != null ? message : "Xung đột dữ liệu")
                .error("Conflict")
                .errorCode("CONFLICT")
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> internalServerError(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(500)
                .message(message != null ? message : "Lỗi hệ thống")
                .error("Internal Server Error")
                .errorCode("INTERNAL_SERVER_ERROR")
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> rateLimitExceeded(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(429)
                .message(message != null ? message : "Quá nhiều yêu cầu")
                .error("Rate Limit Exceeded")
                .errorCode("RATE_LIMIT_EXCEEDED")
                .timestamp(LocalDateTime.now())
                .build();
    }
} 