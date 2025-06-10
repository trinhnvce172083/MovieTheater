package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.dto.booking.BookingResponse;
import com.swp.MovieTheaterService.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Email Service Implementation
 * Handles email notifications using Gmail SMTP and Thymeleaf templates
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

    @Value("${spring.mail.username:lumierecinema25@gmail.com}")
    private String fromEmail;

    @Value("${app.email.company-name:Lumiere Cinema}")
    private String companyName;

    @Value("${app.email.support-email:lumierecinema25@gmail.com}")
    private String supportEmail;

    @Value("${app.email.website-url:https://lumierecinema.vn}")
    private String websiteUrl;

    @Override
    public boolean sendBookingConfirmation(BookingResponse booking) {
        try {
            log.info("Sending booking confirmation email for booking: {}", booking.getBookingCode());

            Map<String, Object> variables = new HashMap<>();
            variables.put("booking", booking);
            variables.put("companyName", companyName);
            variables.put("supportEmail", supportEmail);
            variables.put("websiteUrl", websiteUrl);
            variables.put("showDateTime", formatDateTime(booking.getFormattedShowDateTime()));
            variables.put("qrCodeUrl", generateQRCodeUrl(booking.getBookingCode()));

            String subject = String.format("[%s] Xác nhận đặt vé thành công - %s", 
                    companyName, booking.getBookingCode());

            return sendTemplateEmail(
                    booking.getCustomerEmail(),
                    subject,
                    EmailTemplate.BOOKING_CONFIRMATION.getTemplateName(),
                    variables
            );

        } catch (Exception e) {
            log.error("Error sending booking confirmation email: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendBookingCancellation(BookingResponse booking, String cancellationReason) {
        try {
            log.info("Sending booking cancellation email for booking: {}", booking.getBookingCode());

            Map<String, Object> variables = new HashMap<>();
            variables.put("booking", booking);
            variables.put("cancellationReason", cancellationReason);
            variables.put("companyName", companyName);
            variables.put("supportEmail", supportEmail);
            variables.put("refundPolicy", booking.getRefundPolicy());

            String subject = String.format("[%s] Thông báo hủy vé - %s", 
                    companyName, booking.getBookingCode());

            return sendTemplateEmail(
                    booking.getCustomerEmail(),
                    subject,
                    EmailTemplate.BOOKING_CANCELLATION.getTemplateName(),
                    variables
            );

        } catch (Exception e) {
            log.error("Error sending booking cancellation email: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendPaymentConfirmation(BookingResponse booking, Map<String, Object> paymentDetails) {
        try {
            log.info("Sending payment confirmation email for booking: {}", booking.getBookingCode());

            Map<String, Object> variables = new HashMap<>();
            variables.put("booking", booking);
            variables.put("paymentDetails", paymentDetails);
            variables.put("companyName", companyName);
            variables.put("supportEmail", supportEmail);
            variables.put("transactionId", paymentDetails.get("transactionId"));
            variables.put("paymentMethod", paymentDetails.get("paymentMethod"));

            String subject = String.format("[%s] Xác nhận thanh toán thành công - %s", 
                    companyName, booking.getBookingCode());

            return sendTemplateEmail(
                    booking.getCustomerEmail(),
                    subject,
                    EmailTemplate.PAYMENT_CONFIRMATION.getTemplateName(),
                    variables
            );

        } catch (Exception e) {
            log.error("Error sending payment confirmation email: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendRefundNotification(BookingResponse booking, Double refundAmount, Integer estimatedDays) {
        try {
            log.info("Sending refund notification email for booking: {}", booking.getBookingCode());

            Map<String, Object> variables = new HashMap<>();
            variables.put("booking", booking);
            variables.put("refundAmount", String.format("%,.0f VND", refundAmount));
            variables.put("estimatedDays", estimatedDays);
            variables.put("companyName", companyName);
            variables.put("supportEmail", supportEmail);

            String subject = String.format("[%s] Thông báo hoàn tiền - %s", 
                    companyName, booking.getBookingCode());

            return sendTemplateEmail(
                    booking.getCustomerEmail(),
                    subject,
                    EmailTemplate.REFUND_NOTIFICATION.getTemplateName(),
                    variables
            );

        } catch (Exception e) {
            log.error("Error sending refund notification email: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendShowReminder(BookingResponse booking) {
        try {
            log.info("Sending show reminder email for booking: {}", booking.getBookingCode());

            Map<String, Object> variables = new HashMap<>();
            variables.put("booking", booking);
            variables.put("companyName", companyName);
            variables.put("supportEmail", supportEmail);
            variables.put("qrCodeUrl", generateQRCodeUrl(booking.getBookingCode()));
            variables.put("checkinInstructions", "Vui lòng đến rạp trước 15 phút để check-in");

            String subject = String.format("[%s] Nhắc nhở: Phim sắp bắt đầu - %s", 
                    companyName, booking.getBookingCode());

            return sendTemplateEmail(
                    booking.getCustomerEmail(),
                    subject,
                    EmailTemplate.SHOW_REMINDER.getTemplateName(),
                    variables
            );

        } catch (Exception e) {
            log.error("Error sending show reminder email: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendCheckInConfirmation(BookingResponse booking) {
        try {
            log.info("Sending check-in confirmation email for booking: {}", booking.getBookingCode());

            Map<String, Object> variables = new HashMap<>();
            variables.put("booking", booking);
            variables.put("companyName", companyName);
            variables.put("checkInTime", formatDateTime(booking.getCheckInTime() != null ? 
                    booking.getCheckInTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : ""));

            String subject = String.format("[%s] Xác nhận check-in thành công - %s", 
                    companyName, booking.getBookingCode());

            return sendTemplateEmail(
                    booking.getCustomerEmail(),
                    subject,
                    EmailTemplate.CHECK_IN_CONFIRMATION.getTemplateName(),
                    variables
            );

        } catch (Exception e) {
            log.error("Error sending check-in confirmation email: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendWelcomeEmail(String customerName, String customerEmail) {
        try {
            log.info("Sending welcome email to: {}", customerEmail);

            Map<String, Object> variables = new HashMap<>();
            variables.put("customerName", customerName);
            variables.put("companyName", companyName);
            variables.put("supportEmail", supportEmail);
            variables.put("websiteUrl", websiteUrl);

            String subject = String.format("Chào mừng bạn đến với %s!", companyName);

            return sendTemplateEmail(
                    customerEmail,
                    subject,
                    EmailTemplate.WELCOME.getTemplateName(),
                    variables
            );

        } catch (Exception e) {
            log.error("Error sending welcome email: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendVerificationEmail(String customerName, String customerEmail, String verificationToken) {
        try {
            log.info("Sending verification email to: {}", customerEmail);

            Map<String, Object> variables = new HashMap<>();
            variables.put("fullName", customerName);
            variables.put("verificationLink", websiteUrl + "/cinema/auth/verify-email?token=" + verificationToken);
            variables.put("expirationHours", 24);
            variables.put("supportEmail", supportEmail);
            variables.put("appName", companyName);
            variables.put("companyName", companyName);

            String subject = String.format("[%s] Xác thực tài khoản của bạn", companyName);

            return sendTemplateEmail(
                    customerEmail,
                    subject,
                    EmailTemplate.VERIFICATION.getTemplateName(),
                    variables
            );

        } catch (Exception e) {
            log.error("Error sending verification email: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendPasswordResetEmail(String email, String resetToken) {
        try {
            log.info("Sending password reset email to: {}", email);

            Map<String, Object> variables = new HashMap<>();
            variables.put("resetToken", resetToken);
            variables.put("resetUrl", websiteUrl + "/reset-password?token=" + resetToken);
            variables.put("companyName", companyName);
            variables.put("supportEmail", supportEmail);

            String subject = String.format("[%s] Yêu cầu đặt lại mật khẩu", companyName);

            return sendTemplateEmail(
                    email,
                    subject,
                    EmailTemplate.PASSWORD_RESET.getTemplateName(),
                    variables
            );

        } catch (Exception e) {
            log.error("Error sending password reset email: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendPromotionalEmail(String email, String customerName, String promotionTitle, String promotionContent) {
        try {
            log.info("Sending promotional email to: {}", email);

            Map<String, Object> variables = new HashMap<>();
            variables.put("customerName", customerName);
            variables.put("promotionTitle", promotionTitle);
            variables.put("promotionContent", promotionContent);
            variables.put("companyName", companyName);
            variables.put("websiteUrl", websiteUrl);

            String subject = String.format("[%s] %s", companyName, promotionTitle);

            return sendTemplateEmail(
                    email,
                    subject,
                    EmailTemplate.PROMOTIONAL.getTemplateName(),
                    variables
            );

        } catch (Exception e) {
            log.error("Error sending promotional email: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendTemplateEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            Context context = new Context();
            context.setVariables(variables);

            String htmlContent = templateEngine.process(templateName, context);
            return sendHtmlEmail(to, subject, htmlContent);

        } catch (Exception e) {
            log.error("Error sending template email: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendPlainEmail(String to, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);

            mailSender.send(message);
            log.info("Plain email sent successfully to: {}", to);
            return true;

        } catch (Exception e) {
            log.error("Error sending plain email to {}: {}", to, e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            log.info("HTML email sent successfully to: {}", to);
            return true;

        } catch (Exception e) {
            log.error("Error sending HTML email to {}: {}", to, e.getMessage(), e);
            return false;
        }
    }

    // Helper methods

    private String formatDateTime(String dateTime) {
        if (dateTime == null || dateTime.isEmpty()) {
            return "";
        }
        return dateTime;
    }

    private String generateQRCodeUrl(String bookingCode) {
        // Generate QR code URL - in production, this would be a real QR code service
        return websiteUrl + "/qr/" + bookingCode;
    }
} 