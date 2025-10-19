package com.swp.MovieTheaterService.utils;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

/**
 * IP Address Utility
 * Utility methods for extracting client IP address
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Slf4j
public class IpUtils {
    
    private static final String[] IP_HEADER_CANDIDATES = {
        "X-Forwarded-For",
        "Proxy-Client-IP",
        "WL-Proxy-Client-IP",
        "HTTP_X_FORWARDED_FOR",
        "HTTP_X_FORWARDED",
        "HTTP_X_CLUSTER_CLIENT_IP",
        "HTTP_CLIENT_IP",
        "HTTP_FORWARDED_FOR",
        "HTTP_FORWARDED",
        "HTTP_VIA",
        "REMOTE_ADDR"
    };
    
    /**
     * Get client IP address from HTTP request
     * 
     * @param request HTTP servlet request
     * @return client IP address
     */
    public static String getClientIpAddress(HttpServletRequest request) {
        for (String header : IP_HEADER_CANDIDATES) {
            String ipList = request.getHeader(header);
            if (ipList != null && !ipList.isEmpty() && !"unknown".equalsIgnoreCase(ipList)) {
                // Get first IP if multiple IPs are present
                String ip = ipList.split(",")[0].trim();
                if (isValidIpAddress(ip)) {
                    log.debug("Found client IP {} from header {}", ip, header);
                    return ip;
                }
            }
        }
        
        String remoteAddr = request.getRemoteAddr();
        log.debug("Using remote address as client IP: {}", remoteAddr);
        return remoteAddr;
    }
    
    /**
     * Validate IP address format
     * 
     * @param ip IP address string
     * @return true if valid IP address
     */
    private static boolean isValidIpAddress(String ip) {
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            return false;
        }
        
        // Basic IPv4 validation
        String[] parts = ip.split("\\.");
        if (parts.length != 4) {
            return false;
        }
        
        try {
            for (String part : parts) {
                int num = Integer.parseInt(part);
                if (num < 0 || num > 255) {
                    return false;
                }
            }
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }
} 
