package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.dto.booking.BookingResponse;

import java.util.Map;

/**
 * Email Service Interface
 * Handles email notifications and communications
 * 
 * @author Ngo Viet Trinh
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
     * @param booking            booking details
     * @param cancellationReason reason for cancellation
     * @return true if email sent successfully
     */
    boolean sendBookingCancellation(BookingResponse booking, String cancellationReason);

    /**
     * Send payment confirmation email
     * 
     * @param booking        booking details
     * @param paymentDetails payment information
     * @return true if email sent successfully
     */
    boolean sendPaymentConfirmation(BookingResponse booking, Map<String, Object> paymentDetails);

    /**
     * Send refund notification email
     * 
     * @param booking       booking details
     * @param refundAmount  refund amount
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
     * @param customerName  customer name
     * @param customerEmail customer email
     * @return true if email sent successfully
     */
    boolean sendWelcomeEmail(String customerName, String customerEmail);

    /**
     * Send email verification email
     * 
     * @param customerName      customer name
     * @param customerEmail     customer email
     * @param verificationToken verification token
     * @return true if email sent successfully
     */
    boolean sendVerificationEmail(String customerName, String customerEmail, String verificationToken);

    /**
     * Send password reset email
     * 
     * @param email      customer email
     * @param resetToken reset token
     * @return true if email sent successfully
     */
    boolean sendPasswordResetEmail(String email, String resetToken);

    /**
     * Send promotional email
     * 
     * @param email            customer email
     * @param customerName     customer name
     * @param promotionTitle   promotion title
     * @param promotionContent promotion content
     * @return true if email sent successfully
     */
    boolean sendPromotionalEmail(String email, String customerName, String promotionTitle, String promotionContent);

    /**
     * Send custom template email
     * 
     * @param to           recipient email
     * @param subject      email subject
     * @param templateName template name
     * @param variables    template variables
     * @return true if email sent successfully
     */
    boolean sendTemplateEmail(String to, String subject, String templateName, Map<String, Object> variables);

    /**
     * Send plain text email
     * 
     * @param to      recipient email
     * @param subject email subject
     * @param content email content
     * @return true if email sent successfully
     */
    boolean sendPlainEmail(String to, String subject, String content);

    /**
     * Send HTML email
     * 
     * @param to          recipient email
     * @param subject     email subject
     * @param htmlContent HTML content
     * @return true if email sent successfully
     */
    boolean sendHtmlEmail(String to, String subject, String htmlContent);

    /**
     * Send payment success notification email
     * 
     * @param booking booking details with payment info
     * @return true if email sent successfully
     */
    boolean sendPaymentSuccessNotification(com.swp.MovieTheaterService.entity.Booking booking);

    /**
     * Send payment failed notification email
     * 
     * @param booking booking details
     * @param errorCode error code from payment provider
     * @return true if email sent successfully
     */
    boolean sendPaymentFailedNotification(com.swp.MovieTheaterService.entity.Booking booking, String errorCode);

    /**
     * Send points earned notification email
     * 
     * @param account account that earned points
     * @param loyaltyTransaction loyalty transaction details
     * @return true if email sent successfully
     */
    boolean sendPointsEarnedNotification(com.swp.MovieTheaterService.entity.Account account, 
                                       com.swp.MovieTheaterService.entity.LoyaltyTransaction loyaltyTransaction);

    /**
     * Email Template Types
     */
    enum EmailTemplate {
        BOOKING_CONFIRMATION("email/booking-confirmation"),
        BOOKING_CANCELLATION("email/booking-cancellation"),
        PAYMENT_CONFIRMATION("email/payment-confirmation"),
        REFUND_NOTIFICATION("email/refund-notification"),
        SHOW_REMINDER("email/show-reminder"),
        CHECK_IN_CONFIRMATION("email/checkin-confirmation"),
        VERIFICATION("email/verification"),
        WELCOME("email/welcome"),
        PASSWORD_RESET("email/password-reset"),
        PROMOTIONAL("email/promotional");

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
