package com.swp.MovieTheaterService.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * VNPay Configuration
 * Cấu hình thanh toán VNPay cho Movie Theater System
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Component
@Getter
public class VNPayConfig {
    
    // Constants
    public static final String VERSION = "2.1.0";
    public static final String COMMAND = "pay";
    public static final String CURR_CODE = "VND";
    public static final String COUNTRY_CODE = "VN";
    public static final String LOCALE = "vn";
    
    @Value("${vnpay.tmnCode:G6UJ6GM0}")
    private String tmnCode;
    
    @Value("${vnpay.hashSecret:KNWNX1BX0Z31T3MIX7E3KROK063KWANW}")
    private String hashSecret;
    
    @Value("${vnpay.payUrl:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String payUrl;

    @Value("${vnpay.returnUrl:http://localhost:8080/cinema/api/payment/vnpay/return}")
    private String returnUrl;
    
    @Value("${vnpay.ipnUrl:http://localhost:8080/api/payment/vnpay/ipn}")
    private String ipnUrl;
    
    @Value("${vnpay.apiUrl:https://sandbox.vnpayment.vn/merchant_webapi/api/transaction}")
    private String apiUrl;
}