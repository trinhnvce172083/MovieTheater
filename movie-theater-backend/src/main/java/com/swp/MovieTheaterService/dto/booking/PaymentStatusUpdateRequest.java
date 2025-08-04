package com.swp.MovieTheaterService.dto.booking;

import com.swp.MovieTheaterService.enums.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payment Status Update Request DTO
 * Request để cập nhật trạng thái thanh toán của booking
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request cập nhật trạng thái thanh toán")
public class PaymentStatusUpdateRequest {

    @NotNull(message = "Payment status không được để trống")
    @Schema(description = "Trạng thái thanh toán mới", 
            example = "SUCCESS",
            allowableValues = {"PENDING", "PROCESSING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED", "PARTIAL_REFUNDED", "EXPIRED"})
    private PaymentStatus paymentStatus;

    @Schema(description = "Mã tham chiếu thanh toán", example = "VNP_20240115_123456")
    private String paymentReference;

    @Schema(description = "Phương thức thanh toán", example = "VNPAY")
    private String paymentMethod;

    @Schema(description = "Ghi chú về việc cập nhật", example = "Khách hàng thanh toán thành công qua VNPay")
    private String notes;

    @Schema(description = "Số tiền hoàn lại (cho trường hợp REFUNDED)", example = "150000")
    private Double refundAmount;
}