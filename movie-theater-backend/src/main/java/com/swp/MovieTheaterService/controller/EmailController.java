package com.swp.MovieTheaterService.controller;

import com.swp.MovieTheaterService.dto.booking.BookingResponse;
import com.swp.MovieTheaterService.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Email Controller
 * REST API endpoints for email management
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/emails")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Email Management", description = "APIs for email notifications and communications")
public class EmailController {

    private final EmailService emailService;

    // ==================== EMAIL TESTING ENDPOINTS ====================

    @PostMapping("/test/plain")
    @Operation(summary = "Send test plain email", description = "Send a test plain text email")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> sendTestPlainEmail(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        
        String to = request.get("to");
        String subject = request.get("subject");
        String content = request.get("content");
        
        log.info("Sending test plain email to: {}", to);
        
        boolean success = emailService.sendPlainEmail(to, subject, content);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success ? "Email gửi thành công" : "Gửi email thất bại");
        response.put("type", "plain");
        response.put("recipient", to);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/test/html")
    @Operation(summary = "Send test HTML email", description = "Send a test HTML email")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> sendTestHtmlEmail(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        
        String to = request.get("to");
        String subject = request.get("subject");
        String htmlContent = request.get("htmlContent");
        
        log.info("Sending test HTML email to: {}", to);
        
        boolean success = emailService.sendHtmlEmail(to, subject, htmlContent);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success ? "Email HTML gửi thành công" : "Gửi email HTML thất bại");
        response.put("type", "html");
        response.put("recipient", to);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/test/template")
    @Operation(summary = "Send test template email", description = "Send a test email using template")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> sendTestTemplateEmail(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        
        String to = (String) request.get("to");
        String subject = (String) request.get("subject");
        String templateName = (String) request.get("templateName");
        @SuppressWarnings("unchecked")
        Map<String, Object> variables = (Map<String, Object>) request.get("variables");
        
        log.info("Sending test template email to: {} with template: {}", to, templateName);
        
        boolean success = emailService.sendTemplateEmail(to, subject, templateName, variables);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success ? "Email template gửi thành công" : "Gửi email template thất bại");
        response.put("type", "template");
        response.put("templateName", templateName);
        response.put("recipient", to);
        
        return ResponseEntity.ok(response);
    }

    // ==================== PROMOTIONAL EMAIL ENDPOINTS ====================

    @PostMapping("/promotional/send")
    @Operation(summary = "Send promotional email", description = "Send promotional email to customer")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MARKETING')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> sendPromotionalEmail(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        
        String email = request.get("email");
        String customerName = request.get("customerName");
        String promotionTitle = request.get("promotionTitle");
        String promotionContent = request.get("promotionContent");
        
        log.info("Sending promotional email to: {} - {}", email, promotionTitle);
        
        boolean success = emailService.sendPromotionalEmail(email, customerName, promotionTitle, promotionContent);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success ? "Email khuyến mãi gửi thành công" : "Gửi email khuyến mãi thất bại");
        response.put("promotionTitle", promotionTitle);
        response.put("recipient", email);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/promotional/bulk")
    @Operation(summary = "Send bulk promotional emails", description = "Send promotional email to multiple customers")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MARKETING')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> sendBulkPromotionalEmail(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        
        @SuppressWarnings("unchecked")
        java.util.List<Map<String, String>> recipients = 
                (java.util.List<Map<String, String>>) request.get("recipients");
        String promotionTitle = (String) request.get("promotionTitle");
        String promotionContent = (String) request.get("promotionContent");
        
        log.info("Sending bulk promotional emails to {} recipients", recipients.size());
        
        int successCount = 0;
        int failCount = 0;
        
        for (Map<String, String> recipient : recipients) {
            String email = recipient.get("email");
            String customerName = recipient.get("customerName");
            
            boolean success = emailService.sendPromotionalEmail(email, customerName, promotionTitle, promotionContent);
            if (success) {
                successCount++;
            } else {
                failCount++;
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalSent", successCount);
        response.put("totalFailed", failCount);
        response.put("totalRecipients", recipients.size());
        response.put("promotionTitle", promotionTitle);
        
        return ResponseEntity.ok(response);
    }

    // ==================== PASSWORD RESET ENDPOINTS ====================

    @PostMapping("/password-reset/send")
    @Operation(summary = "Send password reset email", description = "Send password reset email to user")
    public ResponseEntity<Map<String, Object>> sendPasswordResetEmail(
            @RequestBody Map<String, String> request) {
        
        String email = request.get("email");
        String resetToken = request.get("resetToken");
        
        log.info("Sending password reset email to: {}", email);
        
        boolean success = emailService.sendPasswordResetEmail(email, resetToken);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success ? 
                "Email đặt lại mật khẩu đã được gửi" : 
                "Gửi email đặt lại mật khẩu thất bại");
        
        return ResponseEntity.ok(response);
    }

    // ==================== WELCOME EMAIL ENDPOINTS ====================

    @PostMapping("/welcome/send")
    @Operation(summary = "Send welcome email", description = "Send welcome email to new customer")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> sendWelcomeEmail(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        
        String customerName = request.get("customerName");
        String customerEmail = request.get("customerEmail");
        
        log.info("Sending welcome email to: {}", customerEmail);
        
        boolean success = emailService.sendWelcomeEmail(customerName, customerEmail);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success ? "Email chào mừng gửi thành công" : "Gửi email chào mừng thất bại");
        response.put("recipient", customerEmail);
        
        return ResponseEntity.ok(response);
    }

    // ==================== EMAIL TEMPLATES ENDPOINTS ====================

    @GetMapping("/templates")
    @Operation(summary = "Get email templates", description = "Get list of available email templates")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MARKETING')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> getEmailTemplates() {
        
        Map<String, Object> templates = new HashMap<>();
        
        for (EmailService.EmailTemplate template : EmailService.EmailTemplate.values()) {
            Map<String, String> templateInfo = new HashMap<>();
            templateInfo.put("name", template.getTemplateName());
            templateInfo.put("displayName", getTemplateDisplayName(template));
            templateInfo.put("description", getTemplateDescription(template));
            
            templates.put(template.name(), templateInfo);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("templates", templates);
        response.put("totalTemplates", templates.size());
        
        return ResponseEntity.ok(response);
    }

    // ==================== EMAIL STATISTICS ENDPOINTS ====================

    @GetMapping("/statistics")
    @Operation(summary = "Get email statistics", description = "Get email sending statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MARKETING')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> getEmailStatistics(
            @RequestParam(required = false) String period) {
        
        // TODO: Implement real email statistics from database
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalSent", 1250);
        statistics.put("totalDelivered", 1180);
        statistics.put("totalBounced", 45);
        statistics.put("totalFailed", 25);
        statistics.put("deliveryRate", 94.4);
        statistics.put("bounceRate", 3.6);
        statistics.put("period", period != null ? period : "last_30_days");
        
        // Email type breakdown
        Map<String, Integer> typeBreakdown = new HashMap<>();
        typeBreakdown.put("booking_confirmation", 650);
        typeBreakdown.put("payment_confirmation", 520);
        typeBreakdown.put("promotional", 280);
        typeBreakdown.put("reminder", 120);
        typeBreakdown.put("welcome", 80);
        
        statistics.put("typeBreakdown", typeBreakdown);
        
        return ResponseEntity.ok(statistics);
    }

    // ==================== HELPER METHODS ====================

    private String getTemplateDisplayName(EmailService.EmailTemplate template) {
        switch (template) {
            case BOOKING_CONFIRMATION: return "Xác nhận đặt vé";
            case BOOKING_CANCELLATION: return "Hủy đặt vé";
            case PAYMENT_CONFIRMATION: return "Xác nhận thanh toán";
            case REFUND_NOTIFICATION: return "Thông báo hoàn tiền";
            case SHOW_REMINDER: return "Nhắc nhở xem phim";
            case CHECK_IN_CONFIRMATION: return "Xác nhận check-in";
            case WELCOME: return "Chào mừng";
            case PASSWORD_RESET: return "Đặt lại mật khẩu";
            case PROMOTIONAL: return "Khuyến mãi";
            default: return template.name();
        }
    }

    private String getTemplateDescription(EmailService.EmailTemplate template) {
        switch (template) {
            case BOOKING_CONFIRMATION: return "Email xác nhận đặt vé thành công";
            case BOOKING_CANCELLATION: return "Email thông báo hủy vé";
            case PAYMENT_CONFIRMATION: return "Email xác nhận thanh toán thành công";
            case REFUND_NOTIFICATION: return "Email thông báo hoàn tiền";
            case SHOW_REMINDER: return "Email nhắc nhở trước giờ chiếu";
            case CHECK_IN_CONFIRMATION: return "Email xác nhận check-in";
            case WELCOME: return "Email chào mừng khách hàng mới";
            case PASSWORD_RESET: return "Email yêu cầu đặt lại mật khẩu";
            case PROMOTIONAL: return "Email khuyến mãi và ưu đãi";
            default: return "Email template";
        }
    }
} 