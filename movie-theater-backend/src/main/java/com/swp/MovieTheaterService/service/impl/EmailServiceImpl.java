package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.config.EmailProperties;
import com.swp.MovieTheaterService.entity.Account;
import com.swp.MovieTheaterService.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.HashMap;
import java.util.Map;

/**
 * Email Service Implementation
 * Service for sending emails using Spring Mail and Thymeleaf
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final EmailProperties emailProperties;

    @Override
    @Async
    public void sendVerificationEmail(Account account, String verificationToken) {
        log.info("Sending verification email to: {}", account.getEmail());

        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("fullName", account.getFullName());
            variables.put("username", account.getUsername());
            variables.put("verificationLink", buildVerificationLink(verificationToken));
            variables.put("expirationHours", emailProperties.getVerification().getExpirationHours());
            variables.put("supportEmail", emailProperties.getFrom());
            variables.put("appName", "Movie Theater System");

            sendHtmlEmail(
                account.getEmail(),
                "Verify Your Movie Theater Account",
                emailProperties.getTemplates().getVerification(),
                variables
            );

            log.info("Verification email sent successfully to: {}", account.getEmail());
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", account.getEmail(), e);
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    @Override
    @Async
    public void sendWelcomeEmail(Account account) {
        log.info("Sending welcome email to: {}", account.getEmail());

        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("fullName", account.getFullName());
            variables.put("username", account.getUsername());
            variables.put("membershipLevel", account.getMembershipLevel());
            variables.put("membershipPoints", account.getMembershipPoints());
            variables.put("loginUrl", emailProperties.getVerification().getBaseUrl() + "/login");
            variables.put("appName", "Movie Theater System");

            sendHtmlEmail(
                account.getEmail(),
                "Welcome to Movie Theater System!",
                emailProperties.getTemplates().getWelcome(),
                variables
            );

            log.info("Welcome email sent successfully to: {}", account.getEmail());
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", account.getEmail(), e);
            // Don't throw exception for welcome email as it's not critical
        }
    }

    @Override
    @Async
    public void sendPasswordResetEmail(Account account, String resetToken) {
        log.info("Sending password reset email to: {}", account.getEmail());

        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("fullName", account.getFullName());
            variables.put("username", account.getUsername());
            variables.put("resetLink", buildPasswordResetLink(resetToken));
            variables.put("expirationHours", 1); // Password reset expires in 1 hour
            variables.put("supportEmail", emailProperties.getFrom());
            variables.put("appName", "Movie Theater System");

            sendHtmlEmail(
                account.getEmail(),
                "Reset Your Movie Theater Password",
                emailProperties.getTemplates().getPasswordReset(),
                variables
            );

            log.info("Password reset email sent successfully to: {}", account.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", account.getEmail(), e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    @Override
    @Async
    public void sendSimpleEmail(String to, String subject, String text) {
        log.info("Sending simple email to: {}", to);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(emailProperties.getFrom());
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            mailSender.send(message);
            log.info("Simple email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send simple email to: {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    @Async
    public void sendHtmlEmail(String to, String subject, String templateName, Object variables) {
        log.info("Sending HTML email to: {} with template: {}", to, templateName);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            // Set email properties
            try {
                helper.setFrom(emailProperties.getFrom(), emailProperties.getFromName());
            } catch (Exception e) {
                // Fallback to simple from address if encoding fails
                helper.setFrom(emailProperties.getFrom());
            }
            helper.setTo(to);
            helper.setSubject(subject);

            // Process template
            Context context = new Context();
            if (variables instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> variableMap = (Map<String, Object>) variables;
                context.setVariables(variableMap);
            }

            String htmlContent = templateEngine.process(templateName, context);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            log.info("HTML email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send HTML email to: {}", to, e);
            throw new RuntimeException("Failed to send HTML email", e);
        }
    }

    // Private helper methods

    private String buildVerificationLink(String verificationToken) {
        return emailProperties.getVerification().getBaseUrl() + 
               "/api/auth/verify-email?token=" + verificationToken;
    }

    private String buildPasswordResetLink(String resetToken) {
        return emailProperties.getVerification().getBaseUrl() + 
               "/reset-password?token=" + resetToken;
    }
} 