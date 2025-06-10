package com.swp.MovieTheaterService.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

/**
 * Payment Configuration
 * Configuration for payment services
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Configuration
@PropertySource("classpath:payment.properties")
public class PaymentConfig {
    
    /**
     * VNPay Configuration Properties
     */
    @Configuration
    @ConfigurationProperties(prefix = "vnpay")
    public static class VNPayProperties {
        private String url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        private Api api = new Api();
        private Tmn tmn = new Tmn();
        private Hash hash = new Hash();
        private String version = "2.1.0";
        private String command = "pay";
        private String currency = "VND";
        private String locale = "vn";
        
        // Getters and setters
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        
        public Api getApi() { return api; }
        public void setApi(Api api) { this.api = api; }
        
        public Tmn getTmn() { return tmn; }
        public void setTmn(Tmn tmn) { this.tmn = tmn; }
        
        public Hash getHash() { return hash; }
        public void setHash(Hash hash) { this.hash = hash; }
        
        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }
        
        public String getCommand() { return command; }
        public void setCommand(String command) { this.command = command; }
        
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        
        public String getLocale() { return locale; }
        public void setLocale(String locale) { this.locale = locale; }
        
        public static class Api {
            private String url = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";
            
            public String getUrl() { return url; }
            public void setUrl(String url) { this.url = url; }
        }
        
        public static class Tmn {
            private String code = "DEMOSHOP";
            
            public String getCode() { return code; }
            public void setCode(String code) { this.code = code; }
        }
        
        public static class Hash {
            private String secret = "RAOEXHYVSDDIIENYWSLDIIZTANUBSAWS";
            
            public String getSecret() { return secret; }
            public void setSecret(String secret) { this.secret = secret; }
        }
    }
    
    /**
     * MoMo Configuration Properties
     */
    @Configuration
    @ConfigurationProperties(prefix = "momo")
    public static class MoMoProperties {
        private String endpoint = "https://test-payment.momo.vn";
        private String accessKey = "TEST_ACCESS_KEY";
        private String secretKey = "TEST_SECRET_KEY";
        private String partnerCode = "TEST_PARTNER";
        
        // Getters and setters
        public String getEndpoint() { return endpoint; }
        public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
        
        public String getAccessKey() { return accessKey; }
        public void setAccessKey(String accessKey) { this.accessKey = accessKey; }
        
        public String getSecretKey() { return secretKey; }
        public void setSecretKey(String secretKey) { this.secretKey = secretKey; }
        
        public String getPartnerCode() { return partnerCode; }
        public void setPartnerCode(String partnerCode) { this.partnerCode = partnerCode; }
    }
    
    /**
     * ZaloPay Configuration Properties
     */
    @Configuration
    @ConfigurationProperties(prefix = "zalopay")
    public static class ZaloPayProperties {
        private String endpoint = "https://sb-openapi.zalopay.vn";
        private String appId = "2553";
        private String key1 = "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL";
        private String key2 = "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz";
        
        // Getters and setters
        public String getEndpoint() { return endpoint; }
        public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
        
        public String getAppId() { return appId; }
        public void setAppId(String appId) { this.appId = appId; }
        
        public String getKey1() { return key1; }
        public void setKey1(String key1) { this.key1 = key1; }
        
        public String getKey2() { return key2; }
        public void setKey2(String key2) { this.key2 = key2; }
    }
} 