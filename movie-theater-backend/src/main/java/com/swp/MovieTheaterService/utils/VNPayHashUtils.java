package com.swp.MovieTheaterService.utils;

import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.binary.Hex;
import org.springframework.lang.NonNull;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * VNPay Hash Utilities
 * Tiện ích mã hóa và xác thực cho VNPay
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class VNPayHashUtils {

    /**
     * Tạo HMAC SHA512 hash
     * 
     * @param key secret key
     * @param data dữ liệu cần hash
     * @return hash string
     */
    public static String hmacSHA512(String key, String data) {
        try {
            Mac sha512_HMAC = Mac.getInstance("HmacSHA512");
            SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            sha512_HMAC.init(secret_key);
            byte[] hash = sha512_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Hex.encodeHexString(hash);
        } catch (Exception e) {
            log.error("Lỗi tạo HMAC SHA512: {}", e.getMessage());
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    /**
     * Hash tất cả fields theo thứ tự alphabet
     * 
     * @param fields map các field cần hash
     * @param secretKey secret key
     * @return hash string
     */
    public static String hashAllFields(@NonNull Map<String, String> fields, String secretKey) {
        try {
            List<String> fieldNames = new ArrayList<>(fields.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = fields.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                    if (itr.hasNext()) {
                        hashData.append('&');
                    }
                }
            }
            return hmacSHA512(secretKey, hashData.toString());
        } catch (Exception e) {
            log.error("Lỗi hash fields: {}", e.getMessage());
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    /**
     * Tạo query URL với secure hash
     * 
     * @param params parameters
     * @param secretKey secret key
     * @return query URL string
     */
    public static String createQueryUrl(@NonNull Map<String, String> params, String secretKey) {
        try {
            List<String> fieldNames = new ArrayList<>(params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = params.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    // Cho hash data
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                    
                    // Cho query string
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                    
                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }

            String vnp_SecureHash = hmacSHA512(secretKey, hashData.toString());
            if (vnp_SecureHash.isEmpty()) {
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
            }
            
            return query.toString() + "&vnp_SecureHash=" + vnp_SecureHash;
        } catch (Exception e) {
            log.error("Lỗi tạo query URL: {}", e.getMessage());
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }
}