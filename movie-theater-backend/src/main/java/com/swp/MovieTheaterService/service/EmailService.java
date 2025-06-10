package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.dto.booking.BookingResponse;

import java.util.Map;

/**
 * Email Service Interface
 * Handles email notifications and communications
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
public interface EmailService {
    
    /**
     * Send booking confirmation email
     * 
     * @param booking booking details
     * @return true if email sent successfully
     */
    boolean sendBookingConfirmation(BookingResponse booking);
    
    /**
     * Send booking cancellation email
     * 
     * @param booking booking details
     * @param cancellationReason reason for cancellation
     * @return true if email sent successfully
     */
    boolean sendBookingCancellation(BookingResponse booking, String cancellationReason);
    
    /**
     * Send payment confirmation email
     * 
     * @param booking booking details
     * @param paymentDetails payment information
     * @return true if email sent successfully
     */
    boolean sendPaymentConfirmation(BookingResponse booking, Map<String, Object> paymentDetails);
    
    /**
     * Send refund notification email
     * 
     * @param booking booking details
     * @param refundAmount refund amount
     * @param estimatedDays estimated processing days
     * @return true if email sent successfully
     */
    boolean sendRefundNotification(BookingResponse booking, Double refundAmount, Integer estimatedDays);
    
    /**
     * Send show reminder email (1 hour before show)
     * 
     * @param booking booking details
     * @return true if email sent successfully
     */
    boolean sendShowReminder(BookingResponse booking);
    
    /**
     * Send check-in confirmation email
     * 
     * @param booking booking details
     * @return true if email sent successfully
     */
    boolean sendCheckInConfirmation(BookingResponse booking);
    
    /**
     * Send welcome email for new customers
     * 
     * @param customerName customer name
     * @param customerEmail customer email
     * @return true if email sent successfully
     */
    boolean sendWelcomeEmail(String customerName, String customerEmail);
    
    /**
     * Send email verification email
     * 
     * @param customerName customer name
     * @param customerEmail customer email
     * @param verificationToken verification token
     * @return true if email sent successfully
     */
    boolean sendVerificationEmail(String customerName, String customerEmail, String verificationToken);
    
    /**
     * Send password reset email
     * 
     * @param email customer email
     * @param resetToken reset token
     * @return true if email sent successfully
     */
    boolean sendPasswordResetEmail(String email, String resetToken);
    
    /**
     * Send promotional email
     * 
     * @param email customer email
     * @param customerName customer name
     * @param promotionTitle promotion title
     * @param promotionContent promotion content
     * @return true if email sent successfully
     */
    boolean sendPromotionalEmail(String email, String customerName, String promotionTitle, String promotionContent);
    
    /**
     * Send custom template email
     * 
     * @param to recipient email
     * @param subject email subject
     * @param templateName template name
     * @param variables template variables
     * @return true if email sent successfully
     */
    boolean sendTemplateEmail(String to, String subject, String templateName, Map<String, Object> variables);
    
    /**
     * Send plain text email
     * 
     * @param to recipient email
     * @param subject email subject
     * @param content email content
     * @return true if email sent successfully
     */
    boolean sendPlainEmail(String to, String subject, String content);
    
    /**
     * Send HTML email
     * 
     * @param to recipient email
     * @param subject email subject
     * @param htmlContent HTML content
     * @return true if email sent successfully
     */
    boolean sendHtmlEmail(String to, String subject, String htmlContent);
    
    /**
     * Email Template Types
     */
    enum EmailTemplate {
        BOOKING_CONFIRMATION("booking-confirmation"),
        BOOKING_CANCELLATION("booking-cancellation"),
        PAYMENT_CONFIRMATION("payment-confirmation"),
        REFUND_NOTIFICATION("refund-notification"),
        SHOW_REMINDER("show-reminder"),
        CHECK_IN_CONFIRMATION("checkin-confirmation"),
        VERIFICATION("verification"),
        WELCOME("welcome"),
        PASSWORD_RESET("password-reset"),
        PROMOTIONAL("promotional");
        
        private final String templateName;
        
        EmailTemplate(String templateName) {
            this.templateName = templateName;
        }
        
        public String getTemplateName() {
            return templateName;
        }
    }
    
    /**
     * Email Priority Levels
     */
    enum EmailPriority {
        HIGH,
        NORMAL,
        LOW
    }
    
    /**
     * Email Status
     */
    enum EmailStatus {
        PENDING,
        SENT,
        FAILED,
        DELIVERED,
        BOUNCED
    }
} 