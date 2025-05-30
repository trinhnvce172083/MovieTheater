package com.swp.MovieTheaterService.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Email Configuration Properties
 * Configuration properties for email settings
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Data
@Component
@ConfigurationProperties(prefix = "email")
public class EmailProperties {

    private String from;
    private String fromName;
    private Verification verification = new Verification();
    private Templates templates = new Templates();

    @Data
    public static class Verification {
        private int expirationHours = 24;
        private String baseUrl = "http://localhost:8080/cinema";
    }

    @Data
    public static class Templates {
        private String verification = "email/verification";
        private String welcome = "email/welcome";
        private String passwordReset = "email/password-reset";
    }
} 