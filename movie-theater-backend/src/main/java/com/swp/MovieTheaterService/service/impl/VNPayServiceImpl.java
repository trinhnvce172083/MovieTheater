package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.config.VNPayConfig;
import com.swp.MovieTheaterService.dto.payment.VNPayPaymentRequestDTO;
import com.swp.MovieTheaterService.entity.Booking;
import com.swp.MovieTheaterService.entity.Account;
import com.swp.MovieTheaterService.entity.LoyaltyTransaction;
import com.swp.MovieTheaterService.enums.BookingStatus;
import com.swp.MovieTheaterService.exception.AppException;
import com.swp.MovieTheaterService.exception.ErrorCode;
import com.swp.MovieTheaterService.repository.BookingRepository;
import com.swp.MovieTheaterService.service.VNPayService;
import com.swp.MovieTheaterService.service.LoyaltyService;
import com.swp.MovieTheaterService.service.EmailService;
import com.swp.MovieTheaterService.utils.VNPayHashUtils;
import com.swp.MovieTheaterService.utils.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

/**
 * VNPay Service Implementation
 * Implementation cho dịch vụ thanh toán VNPay
 * 
 * @author Ngo Viet Trinh
 * @version 1.0.0
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class VNPayServiceImpl implements VNPayService {

    private final VNPayConfig vnPayConfig;
    private final BookingRepository bookingRepository;
    private final LoyaltyService loyaltyService;
    private final EmailService emailService;

    @Override
    public String createPaymentUrl(@NonNull VNPayPaymentRequestDTO requestDTO, @NonNull String ipAddress) {
        validateCreatePaymentRequest(requestDTO, ipAddress);

        try {
            Map<String, String> vnp_Params = buildPaymentParams(requestDTO, ipAddress);
            String queryUrl = VNPayHashUtils.createQueryUrl(vnp_Params, vnPayConfig.getHashSecret());
            String fullUrl = vnPayConfig.getPayUrl() + "?" + queryUrl;

            log.info("Tạo URL thanh toán cho TxnRef: {}", vnp_Params.get("vnp_TxnRef"));
            return fullUrl;
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi tạo URL thanh toán: {}", e.getMessage());
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    public String processPaymentResponseUpdate(@NonNull Map<String, String> response) {
        Assert.notEmpty(response, "Payment response không được rỗng");

        try {
            if (response.isEmpty()) {
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
            }

            validatePaymentResponse(response);
            return buildPaymentResultUpdate(response);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    public Map<String, String> processIPNResponse(@NonNull Map<String, String> response) {
        Assert.notEmpty(response, "IPN response không được rỗng");

        try {
            if (response.isEmpty()) {
                return createIPNResponse("99", "Invalid Request");
            }

            validatePaymentResponse(response);
            return processIPNResult(response);
        } catch (AppException e) {
            log.error("Lỗi xử lý IPN response: {}", e.getMessage());
            return createIPNResponse("99", e.getMessage());
        } catch (Exception e) {
            log.error("Lỗi xử lý IPN response: {}", e.getMessage());
            return createIPNResponse("99", "Unknown error");
        }
    }

    private void validateCreatePaymentRequest(VNPayPaymentRequestDTO requestDTO, String ipAddress) {
        Assert.notNull(requestDTO, "Payment request không được null");
        Assert.hasText(ipAddress, "IP address không được rỗng");

        if (!StringUtils.hasText(ipAddress)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        if (requestDTO.getBookingId() == null) {
            throw new AppException(ErrorCode.BOOKING_NOT_FOUND);
        }
    }

    private Map<String, String> buildPaymentParams(VNPayPaymentRequestDTO requestDTO, String ipAddress) {
        // Lấy thông tin booking
        Booking booking = bookingRepository.findById(requestDTO.getBookingId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        // Kiểm tra trạng thái booking
        if (booking.getBookingStatus() == BookingStatus.PAID) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", VNPayConfig.VERSION);
        vnp_Params.put("vnp_Command", VNPayConfig.COMMAND);
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(booking.getFinalAmount().longValue() * 100));
        vnp_Params.put("vnp_CurrCode", VNPayConfig.CURR_CODE);

        String vnp_TxnRef = generateTxnRef();
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);

        String orderInfo = requestDTO.getOrderInfo() != null ? 
                requestDTO.getOrderInfo() : 
                String.format("Thanh toan ve xem phim - Booking #%s", requestDTO.getBookingId());
        vnp_Params.put("vnp_OrderInfo", orderInfo);

        vnp_Params.put("vnp_OrderType", "billpayment");
        vnp_Params.put("vnp_Locale", requestDTO.getLanguage() != null ? requestDTO.getLanguage() : VNPayConfig.LOCALE);
        
        String returnUrl = requestDTO.getReturnUrl() != null ? 
                requestDTO.getReturnUrl() : vnPayConfig.getReturnUrl();
        vnp_Params.put("vnp_ReturnUrl", returnUrl);
        
        vnp_Params.put("vnp_IpAddr", ipAddress);

        // Sử dụng DateTimeUtils để xử lý thời gian một cách nhất quán
        LocalDateTime now = DateTimeUtils.now();
        LocalDateTime expireTime = DateTimeUtils.createExpirationTime(15);

        String vnp_CreateDate = DateTimeUtils.formatForVNPay(now);
        String vnp_ExpireDate = DateTimeUtils.formatForVNPay(expireTime);
        
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        log.info("VNPay payment time - Create: {} ({}), Expire: {} ({})",
                vnp_CreateDate, DateTimeUtils.formatForDisplay(now),
                vnp_ExpireDate, DateTimeUtils.formatForDisplay(expireTime));

        if (requestDTO.getBankCode() != null && !requestDTO.getBankCode().isEmpty()) {
            vnp_Params.put("vnp_BankCode", requestDTO.getBankCode());
        }

        return vnp_Params;
    }

    private void validatePaymentResponse(@NonNull Map<String, String> response) {
        if (!response.containsKey("vnp_SecureHash")) {
            log.warn("Thiếu secure hash trong response");
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        String vnp_SecureHash = response.get("vnp_SecureHash");
        if (vnp_SecureHash == null || vnp_SecureHash.isEmpty()) {
            log.warn("Secure hash rỗng trong response");
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        Map<String, String> fields = new HashMap<>(response);
        fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");

        String checkSum = VNPayHashUtils.hashAllFields(fields, vnPayConfig.getHashSecret());
        if (!checkSum.equals(vnp_SecureHash)) {
            log.warn("Invalid secure hash. Expected: {}, Got: {}", checkSum, vnp_SecureHash);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Transactional
    private String buildPaymentResultUpdate(Map<String, String> response) {
        String responseCode = response.getOrDefault("vnp_ResponseCode", "99");
        String transactionStatus = response.getOrDefault("vnp_TransactionStatus", "99");
        String transactionNo = response.get("vnp_TransactionNo");
        String transactionRef = response.get("vnp_TxnRef");

        if (!response.containsKey("vnp_Amount")) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        long amount = Long.parseLong(response.get("vnp_Amount")) / 100;
        boolean isSuccess = "00".equals(responseCode) && "00".equals(transactionStatus);

        String redirectUrl = "http://localhost:3000/payment/";

        if (isSuccess) {
            try {
                String orderInfo = response.get("vnp_OrderInfo");
                Long bookingId = extractBookingId(orderInfo);

                Booking booking = bookingRepository.findById(bookingId)
                        .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

                // Kiểm tra booking đã được thanh toán chưa (tránh duplicate processing)
                if (booking.getBookingStatus() == BookingStatus.PAID) {
                    log.warn("Booking {} đã được thanh toán trước đó", bookingId);
                    redirectUrl += "success?bookingId=" + bookingId;
                    return redirectUrl;
                }

                // Update booking status
                booking.setBookingStatus(BookingStatus.CONFIRMED);
                booking.setPaymentStatus(com.swp.MovieTheaterService.enums.PaymentStatus.SUCCESS);
                booking.setUpdatedAt(LocalDateTime.now());
                
                // Set payment info
                booking.setPaymentMethod("VNPAY");
                booking.setPaymentReference(transactionNo);
                
                Booking savedBooking = bookingRepository.save(booking);
                log.info("✅ Cập nhật booking status thành công: {} -> PAID", bookingId);

                // Process member points earning
                try {
                    Account account = savedBooking.getAccount();
                    if (account != null) {
                        LoyaltyTransaction loyaltyTransaction = loyaltyService.earnPointsFromBooking(account, savedBooking);
                        
                        if (loyaltyTransaction != null) {
                            log.info("✅ Tích điểm thành công: {} points cho account: {}", 
                                    loyaltyTransaction.getPoints(), account.getEmail());
                            
                            // Send notification email about points earned (async)
                            try {
                                emailService.sendPointsEarnedNotification(account, loyaltyTransaction);
                            } catch (Exception emailEx) {
                                log.warn("Không thể gửi email thông báo tích điểm: {}", emailEx.getMessage());
                            }
                        } else {
                            log.info("Không đủ điều kiện tích điểm cho booking: {}", bookingId);
                        }
                    } else {
                        log.warn("Không tìm thấy account cho booking: {}", bookingId);
                    }
                } catch (Exception loyaltyEx) {
                    log.error("Lỗi xử lý tích điểm cho booking {}: {}", bookingId, loyaltyEx.getMessage());
                    // Không throw exception để không ảnh hưởng đến payment processing
                }

                // Send payment success notification (async)
                try {
                    emailService.sendPaymentSuccessNotification(savedBooking);
                } catch (Exception emailEx) {
                    log.warn("Không thể gửi email xác nhận thanh toán: {}", emailEx.getMessage());
                }

                redirectUrl += "success?bookingId=" + bookingId;
                log.info("🎉 Thanh toán hoàn tất cho booking: {} - Amount: {} VND", bookingId, amount);
                
            } catch (Exception e) {
                log.error("❌ Lỗi xử lý thanh toán thành công cho booking: {}", e.getMessage(), e);
                redirectUrl += "error?message=" + e.getMessage();
            }
        } else {
            try {
                String orderInfo = response.get("vnp_OrderInfo");
                Long bookingId = extractBookingId(orderInfo);

                Booking booking = bookingRepository.findById(bookingId)
                        .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

                booking.setBookingStatus(BookingStatus.CANCELLED);
                booking.setUpdatedAt(LocalDateTime.now());
                bookingRepository.save(booking);

                // Send payment failed notification (async)
                try {
                    emailService.sendPaymentFailedNotification(booking, responseCode);
                } catch (Exception emailEx) {
                    log.warn("Không thể gửi email thông báo thanh toán thất bại: {}", emailEx.getMessage());
                }

                redirectUrl += "failed?bookingId=" + bookingId + "&reason=" + responseCode;
                log.info("❌ Thanh toán thất bại cho booking: {} - Code: {}", bookingId, responseCode);
                
            } catch (Exception e) {
                log.error("❌ Lỗi xử lý thanh toán thất bại: {}", e.getMessage(), e);
                redirectUrl += "error?message=" + e.getMessage();
            }
        }

        return redirectUrl;
    }

    private Long extractBookingId(String orderInfo) {
        try {
            // Format: "Thanh toan ve xem phim - Booking #123"
            String[] parts = orderInfo.split("#");
            return Long.parseLong(parts[1].trim());
        } catch (Exception e) {
            log.error("Lỗi extract booking ID từ orderInfo: {}", orderInfo);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    private Map<String, String> processIPNResult(Map<String, String> response) {
        String responseCode = response.get("vnp_ResponseCode");
        String transactionStatus = response.get("vnp_TransactionStatus");
        String transactionRef = response.get("vnp_TxnRef");

        if (!response.containsKey("vnp_Amount")) {
            return createIPNResponse("99", "Missing Amount");
        }

        long amount = Long.parseLong(response.get("vnp_Amount")) / 100;

        log.info("IPN Notification - TxnRef: {}, Amount: {}, Status: {}",
                transactionRef, amount, transactionStatus);

        if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
            return createIPNResponse("00", "Confirm Success");
        }

        log.warn("IPN notification failed - ResponseCode: {}, TransactionStatus: {}",
                responseCode, transactionStatus);
        return createIPNResponse("99", "Transaction Failed");
    }

    private String generateTxnRef() {
        return String.format("%s%d", vnPayConfig.getTmnCode(), System.currentTimeMillis());
    }

    private Map<String, String> createIPNResponse(@NonNull String rspCode, @NonNull String message) {
        Assert.hasText(rspCode, "Response code không được rỗng");
        Assert.hasText(message, "Message không được rỗng");

        return Map.of(
                "RspCode", rspCode,
                "Message", message
        );
    }
} 
