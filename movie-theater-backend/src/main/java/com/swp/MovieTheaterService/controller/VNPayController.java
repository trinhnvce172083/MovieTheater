package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.config.documentation.OpenApiExamples;
import com.swp.MovieTheaterService.dto.payment.VNPayPaymentRequestDTO;
import com.swp.MovieTheaterService.dto.response.ApiResponse;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.service.VNPayService;
import com.swp.MovieTheaterService.utils.IpUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

/**
 * VNPay Payment Controller
 * Controller xử lý thanh toán VNPay
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/payment/vnpay")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "VNPay Payment", description = "VNPay payment processing APIs")
public class VNPayController {
    
    private final VNPayService vnPayService;

    @PostMapping(path = "/create", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Tạo URL thanh toán VNPay", 
               description = "Tạo URL thanh toán VNPay cho booking",
               requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @Content(examples = {
                   @ExampleObject(name = "Simple Payment", summary = "Thanh toán đơn giản", value = OpenApiExamples.VNPAY_SIMPLE_REQUEST_EXAMPLE),
                   @ExampleObject(name = "With Bank Code", summary = "Thanh toán với mã ngân hàng", value = OpenApiExamples.VNPAY_WITH_BANK_EXAMPLE),
                   @ExampleObject(name = "Full Request", summary = "Yêu cầu đầy đủ", value = OpenApiExamples.VNPAY_PAYMENT_REQUEST_EXAMPLE)
               })))
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('MEMBER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPayment(
            @Valid @RequestBody VNPayPaymentRequestDTO requestDTO,
            HttpServletRequest request) {
        try {
            String ipAddress = IpUtils.getClientIpAddress(request);
            if (!StringUtils.hasText(ipAddress)) {
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
            }

            String paymentUrl = vnPayService.createPaymentUrl(requestDTO, ipAddress);
            
            Map<String, Object> responseData = Map.of(
                "paymentUrl", paymentUrl,
                "bookingId", requestDTO.getBookingId(),
                "language", requestDTO.getLanguage()
            );
            
            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                    .success(true)
                    .message("Tạo URL thanh toán thành công")
                    .data(responseData)
                    .build());
                    
        } catch (AppException e) {
            log.error("Lỗi tạo thanh toán VNPay: {}", e.getMessage());
            return ResponseEntity.status(e.getErrorCode().getHttpStatusCode())
                    .body(ApiResponse.<Map<String, Object>>builder()
                            .success(false)
                            .message(e.getMessage())
                            .errorCode(e.getErrorCode().name())
                            .build());
        }
    }

    @GetMapping("/return")
    @Operation(summary = "Xử lý callback từ VNPay", description = "Xử lý phản hồi từ VNPay sau thanh toán")
    public RedirectView vnpayReturnStatus(@RequestParam Map<String, String> queryParams) {
        log.info("Nhận callback từ VNPay: {}", queryParams);
        
        RedirectView redirectView = new RedirectView();
        try {
            String redirectUrl = vnPayService.processPaymentResponseUpdate(queryParams);
            redirectView.setUrl(redirectUrl);
        } catch (Exception e) {
            log.error("Lỗi xử lý callback VNPay: {}", e.getMessage());
            redirectView.setUrl("http://localhost:3000/payment/error");
        }
        
        return redirectView;
    }

    @PostMapping("/ipn")
    @Operation(summary = "Xử lý IPN từ VNPay", description = "Xử lý thông báo tức thì từ VNPay")
    public ResponseEntity<Map<String, String>> vnpayIPN(@RequestParam Map<String, String> queryParams) {
        log.info("Nhận IPN từ VNPay: {}", queryParams);
        
        try {
            if (queryParams.isEmpty()) {
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
            }
            
            Map<String, String> response = vnPayService.processIPNResponse(queryParams);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Lỗi xử lý IPN VNPay: {}", e.getMessage());
            return ResponseEntity.status(500)
                    .body(Map.of(
                        "RspCode", "99",
                        "Message", e.getMessage()
                    ));
        }
    }
} 