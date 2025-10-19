package com.swp.MovieTheaterService.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;

/**
 * Payment Request DTO
 * Data transfer object for payment processing
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // CASH, CARD, ONLINE, WALLET

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", message = "Amount must be positive")
    private Double amount;

    // Card payment details
    private String cardNumber;
    private String cardHolderName;
    private String expiryDate;
    private String cvv;
    
    // Online payment details
    private String bankCode;
    private String transactionId;
    private String paymentGateway;
    
    // Wallet payment details
    private String walletType;
    private String walletAccount;
    
    // Additional payment info
    private String paymentReference;
    private String notes;

    // Validation methods
    public boolean isCardPayment() {
        return "CARD".equalsIgnoreCase(paymentMethod);
    }

    public boolean isOnlinePayment() {
        return "ONLINE".equalsIgnoreCase(paymentMethod);
    }

    public boolean isWalletPayment() {
        return "WALLET".equalsIgnoreCase(paymentMethod);
    }

    public boolean isCashPayment() {
        return "CASH".equalsIgnoreCase(paymentMethod);
    }

    public boolean hasValidCardDetails() {
        return cardNumber != null && !cardNumber.trim().isEmpty() &&
               cardHolderName != null && !cardHolderName.trim().isEmpty() &&
               expiryDate != null && !expiryDate.trim().isEmpty() &&
               cvv != null && !cvv.trim().isEmpty();
    }

    public boolean hasValidOnlineDetails() {
        return bankCode != null && !bankCode.trim().isEmpty() ||
               paymentGateway != null && !paymentGateway.trim().isEmpty();
    }

    public boolean hasValidWalletDetails() {
        return walletType != null && !walletType.trim().isEmpty() &&
               walletAccount != null && !walletAccount.trim().isEmpty();
    }
    
    // Compatibility methods for BookingServiceImpl
    public String getBookingCode() {
        // Return payment reference as booking code for compatibility
        return paymentReference;
    }
    
    public Double getPaidAmount() {
        return amount;
    }
} 
