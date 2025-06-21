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

    @Value("${app.email.website-url:http://localhost:8080   }")
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
                    variables);

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
                    variables);

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
                    variables);

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
                    variables);

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
                    variables);

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
            variables.put("checkInTime",
                    formatDateTime(booking.getCheckInTime() != null
                            ? booking.getCheckInTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                            : ""));

            String subject = String.format("[%s] Xác nhận check-in thành công - %s",
                    companyName, booking.getBookingCode());

            return sendTemplateEmail(
                    booking.getCustomerEmail(),
                    subject,
                    EmailTemplate.CHECK_IN_CONFIRMATION.getTemplateName(),
                    variables);

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
                    variables);

        } catch (Exception e) {
            log.error("Error sending welcome email: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendVerificationEmail(String customerName, String customerEmail, String verificationToken) {
        try {
            log.info("🔄 Starting sendVerificationEmail process...");
            log.info("📧 Customer Email: {}", customerEmail);
            log.info("👤 Customer Name: {}", customerName);
            log.info("🔑 Verification Token: {}", verificationToken);
            log.info("🌐 Website URL: {}", websiteUrl);
            log.info("📨 From Email: {}", fromEmail);
            log.info("🏢 Company Name: {}", companyName);

            // Validate inputs
            if (customerEmail == null || customerEmail.trim().isEmpty()) {
                log.error("❌ Customer email is null or empty");
                return false;
            }

            if (verificationToken == null || verificationToken.trim().isEmpty()) {
                log.error("❌ Verification token is null or empty");
                return false;
            }

            Map<String, Object> variables = new HashMap<>();
            variables.put("fullName", customerName);
            variables.put("verificationLink", websiteUrl + "/cinema/api/auth/verify-email?token=" + verificationToken);
            variables.put("expirationHours", 24);
            variables.put("supportEmail", supportEmail);
            variables.put("appName", companyName);
            variables.put("companyName", companyName);

            log.info("🌐 Current websiteUrl: {}", websiteUrl);
            log.info("🔗 Verification Link: {}", variables.get("verificationLink"));

            String subject = String.format("[%s] Xác thực tài khoản của bạn", companyName);
            log.info("📝 Email Subject: {}", subject);

            boolean result = sendTemplateEmail(
                    customerEmail,
                    subject,
                    EmailTemplate.VERIFICATION.getTemplateName(),
                    variables);

            log.info("📬 Template email send result: {}", result);
            return result;

        } catch (Exception e) {
            log.error("❌ Exception in sendVerificationEmail: {}", e.getMessage(), e);
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
                    variables);

        } catch (Exception e) {
            log.error("Error sending password reset email: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendPromotionalEmail(String email, String customerName, String promotionTitle,
            String promotionContent) {
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
                    variables);

        } catch (Exception e) {
            log.error("Error sending promotional email: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendPaymentSuccessNotification(com.swp.MovieTheaterService.entity.Booking booking) {
        try {
            log.info("Sending payment success notification for booking: {}", booking.getBookingCode());

            Map<String, Object> variables = new HashMap<>();
            variables.put("customerName", booking.getAccount().getFullName());
            variables.put("bookingCode", booking.getBookingCode());
            variables.put("movieTitle", booking.getSchedule().getMovie().getTitle());
            variables.put("showTime", booking.getSchedule().getShowDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            variables.put("totalAmount", String.format("%,.0f VND", booking.getFinalAmount()));
            variables.put("paymentMethod", booking.getPaymentMethod());
            variables.put("paymentReference", booking.getPaymentReference());
            variables.put("companyName", companyName);
            variables.put("supportEmail", supportEmail);

            String subject = String.format("[%s] Thanh toán thành công - %s", companyName, booking.getBookingCode());

            return sendTemplateEmail(
                    booking.getAccount().getEmail(),
                    subject,
                    "email/payment-success",
                    variables);

        } catch (Exception e) {
            log.error("Error sending payment success notification: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendPaymentFailedNotification(com.swp.MovieTheaterService.entity.Booking booking, String errorCode) {
        try {
            log.info("Sending payment failed notification for booking: {}", booking.getBookingCode());

            Map<String, Object> variables = new HashMap<>();
            variables.put("customerName", booking.getAccount().getFullName());
            variables.put("bookingCode", booking.getBookingCode());
            variables.put("movieTitle", booking.getSchedule().getMovie().getTitle());
            variables.put("showTime", booking.getSchedule().getShowDateTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            variables.put("totalAmount", String.format("%,.0f VND", booking.getFinalAmount()));
            variables.put("errorCode", errorCode);
            variables.put("companyName", companyName);
            variables.put("supportEmail", supportEmail);

            String subject = String.format("[%s] Thanh toán thất bại - %s", companyName, booking.getBookingCode());

            return sendTemplateEmail(
                    booking.getAccount().getEmail(),
                    subject,
                    "email/payment-failed",
                    variables);

        } catch (Exception e) {
            log.error("Error sending payment failed notification: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendPointsEarnedNotification(com.swp.MovieTheaterService.entity.Account account, 
                                              com.swp.MovieTheaterService.entity.LoyaltyTransaction loyaltyTransaction) {
        try {
            log.info("Sending points earned notification to: {}", account.getEmail());

            Map<String, Object> variables = new HashMap<>();
            variables.put("customerName", account.getFullName());
            variables.put("pointsEarned", loyaltyTransaction.getPoints());
            variables.put("totalPoints", account.getMembershipPoints());
            variables.put("bookingCode", loyaltyTransaction.getBooking().getBookingCode());
            variables.put("movieTitle", loyaltyTransaction.getBooking().getSchedule().getMovie().getTitle());
            variables.put("companyName", companyName);
            variables.put("websiteUrl", websiteUrl);

            String subject = String.format("[%s] Bạn vừa nhận được %d điểm thưởng!", companyName, loyaltyTransaction.getPoints());

            return sendTemplateEmail(
                    account.getEmail(),
                    subject,
                    "email/points-earned",
                    variables);

        } catch (Exception e) {
            log.error("Error sending points earned notification: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendTemplateEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            log.info("🔄 Starting sendTemplateEmail process...");
            log.info("📧 To: {}", to);
            log.info("📝 Subject: {}", subject);
            log.info("📄 Template Name: {}", templateName);
            log.info("🔧 Variables: {}", variables);

            Context context = new Context();
            context.setVariables(variables);

            log.info("🎨 Processing template with Thymeleaf...");
            String htmlContent = templateEngine.process(templateName, context);

            if (htmlContent == null || htmlContent.trim().isEmpty()) {
                log.error("❌ Template processing returned null or empty content");
                return false;
            }

            log.info("✅ Template processed successfully, content length: {}", htmlContent.length());
            log.debug("📄 Generated HTML content preview: {}",
                    htmlContent.substring(0, Math.min(200, htmlContent.length())));

            boolean result = sendHtmlEmail(to, subject, htmlContent);
            log.info("📬 sendHtmlEmail result: {}", result);
            return result;

        } catch (Exception e) {
            log.error("❌ Exception in sendTemplateEmail: {}", e.getMessage(), e);
            e.printStackTrace();
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
            log.info("🔄 Starting sendHtmlEmail process...");
            log.info("📧 To: {}", to);
            log.info("📝 Subject: {}", subject);
            log.info("📨 From Email: {}", fromEmail);
            log.info("📄 HTML Content Length: {}", htmlContent != null ? htmlContent.length() : "NULL");

            // Validate JavaMailSender
            if (mailSender == null) {
                log.error("❌ JavaMailSender is null! Check email configuration!");
                return false;
            }

            log.info("📬 Creating MimeMessage...");
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            log.info("⚙️ Setting email properties...");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            log.info("📤 Attempting to send email...");
            mailSender.send(mimeMessage);

            log.info("✅ HTML email sent successfully to: {}", to);
            return true;

        } catch (org.springframework.mail.MailAuthenticationException e) {
            log.error("❌ Email Authentication Error: {}", e.getMessage());
            log.error("💡 Check SMTP username/password and app password settings");
            return false;
        } catch (org.springframework.mail.MailSendException e) {
            log.error("❌ Email Send Error: {}", e.getMessage());
            log.error("💡 Check SMTP server settings and recipient email");
            return false;
        } catch (Exception e) {
            log.error("❌ Unexpected error sending HTML email to {}: {}", to, e.getMessage(), e);
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