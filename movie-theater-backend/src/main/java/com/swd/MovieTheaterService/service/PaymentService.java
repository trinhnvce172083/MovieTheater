package com.swp.MovieTheaterService.service;

import com.swp.MovieTheaterService.dto.payment.*;

import java.util.Map;

/**
 * Payment Service Interface
 * Handles payment processing with multiple providers
 *
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
public interface PaymentService {

    /**
     * Create payment URL for booking
     *
     * @param request payment request details
     * @return payment response with redirect URL
     */
    PaymentResponse createPayment(PaymentRequest request);

    /**
     * Process payment callback from provider
     *
     * @param callbackRequest callback data from payment provider
     * @return payment verification result
     */
    PaymentResponse processCallback(PaymentCallbackRequest callbackRequest);

    /**
     * Verify payment status
     *
     * @param transactionId transaction ID to verify
     * @param provider      payment provider (VNPAY, MOMO, ZALOPAY)
     * @return payment verification result
     */
    PaymentResponse verifyPayment(String transactionId, String provider);

    /**
     * Process refund for cancelled booking
     *
     * @param request refund request details
     * @return refund response
     */
    RefundResponse processRefund(RefundRequest request);

    /**
     * Get payment status by booking ID
     *
     * @param bookingId booking ID
     * @return payment status information
     */
    PaymentStatus getPaymentStatus(Long bookingId);

    /**
     * Get supported payment methods
     *
     * @return list of supported payment providers
     */
    Map<String, Object> getSupportedPaymentMethods();

    /**
     * Calculate payment fee
     *
     * @param amount        payment amount
     * @param paymentMethod payment method
     * @return calculated fee
     */
    Double calculatePaymentFee(Double amount, String paymentMethod);

    /**
     * Validate payment signature (for security)
     *
     * @param data      payment data
     * @param signature received signature
     * @param provider  payment provider
     * @return true if signature is valid
     */
    boolean validateSignature(Map<String, String> data, String signature, String provider);

    /**
     * Inner class for payment status information
     */
    class PaymentStatus {
        private Long bookingId;
        private String transactionId;
        private String paymentMethod;
        private String status; // PENDING, SUCCESS, FAILED, REFUNDED
        private Double amount;
        private String currency;
        private String providerResponse;
        private String errorMessage;
        private java.time.LocalDateTime createdAt;
        private java.time.LocalDateTime updatedAt;

        // Constructors
        public PaymentStatus() {
        }

        public PaymentStatus(Long bookingId, String transactionId, String paymentMethod,
                             String status, Double amount, String currency) {
            this.bookingId = bookingId;
            this.transactionId = transactionId;
            this.paymentMethod = paymentMethod;
            this.status = status;
            this.amount = amount;
            this.currency = currency;
        }

        // Getters and setters
        public Long getBookingId() {
            return bookingId;
        }

        public void setBookingId(Long bookingId) {
            this.bookingId = bookingId;
        }

        public String getTransactionId() {
            return transactionId;
        }

        public void setTransactionId(String transactionId) {
            this.transactionId = transactionId;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Double getAmount() {
            return amount;
        }

        public void setAmount(Double amount) {
            this.amount = amount;
        }

        public String getCurrency() {
            return currency;
        }

        public void setCurrency(String currency) {
            this.currency = currency;
        }

        public String getProviderResponse() {
            return providerResponse;
        }

        public void setProviderResponse(String providerResponse) {
            this.providerResponse = providerResponse;
        }

        public String getErrorMessage() {
            return errorMessage;
        }

        public void setErrorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
        }

        public java.time.LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(java.time.LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }

        public java.time.LocalDateTime getUpdatedAt() {
            return updatedAt;
        }

        public void setUpdatedAt(java.time.LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
        }
    }
} 
