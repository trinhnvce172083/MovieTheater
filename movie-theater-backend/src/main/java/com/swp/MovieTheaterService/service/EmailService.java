package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.entity.Account;

/**
 * Email Service Interface
 * Service for sending emails
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */
public interface EmailService {

    /**
     * Send verification email to user
     * 
     * @param account user account
     * @param verificationToken verification token
     */
    void sendVerificationEmail(Account account, String verificationToken);

    /**
     * Send welcome email after successful verification
     * 
     * @param account user account
     */
    void sendWelcomeEmail(Account account);

    /**
     * Send password reset email
     * 
     * @param account user account
     * @param resetToken password reset token
     */
    void sendPasswordResetEmail(Account account, String resetToken);

    /**
     * Send simple text email
     * 
     * @param to recipient email
     * @param subject email subject
     * @param text email content
     */
    void sendSimpleEmail(String to, String subject, String text);

    /**
     * Send HTML email with template
     * 
     * @param to recipient email
     * @param subject email subject
     * @param templateName template name
     * @param variables template variables
     */
    void sendHtmlEmail(String to, String subject, String templateName, Object variables);
} 