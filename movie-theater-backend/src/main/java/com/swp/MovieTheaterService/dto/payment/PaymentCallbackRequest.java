package com.swp.MovieTheaterService.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Payment Callback Request DTO
 * Data Transfer Object for payment provider callbacks
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCallbackRequest {
    
    private String provider; // VNPAY, MOMO, ZALOPAY
    private String transactionId;
    private String providerTransactionId;
    private String status;
    private String responseCode;
    private String message;
    private Double amount;
    private String currency;
    private String signature;
    private String orderInfo;
    private String paymentType;
    private String bankCode;
    private String cardType;
    private String payDate;
    
    // Raw callback data from provider
    private Map<String, String> rawData;
    
    // Security validation
    private String secureHash;
    private String hashType;
    
    // Additional provider-specific fields
    private String vnpayData; // For VNPay
    private String momoData;  // For MoMo
    private String zalopayData; // For ZaloPay
} 
