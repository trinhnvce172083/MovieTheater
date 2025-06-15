"use client";

import React, { useState } from "react";
import { Row, Col, message } from "antd";
import { useRouter } from "next/navigation";
import { 
  OrderSummary, 
  PaymentMethodSelector, 
  PaymentForm, 
  PaymentActions 
} from "@/components/payment";
import { 
  PaymentMethod, 
  PAYMENT_METHODS, 
  BookingDetails, 
  CreditCardInfo 
} from "@/constants/paymentTypes";

const PaymentPage: React.FC = () => {
  const router = useRouter();
  
  // State management
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [creditCardInfo, setCreditCardInfo] = useState<CreditCardInfo>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock booking data - thực tế sẽ lấy từ props hoặc context
  const bookingDetails: BookingDetails = {
    movieTitle: "Avatar: The Way of Water",
    moviePoster: "/movie-poster.jpg",
    cinema: "Lumiere Cinema District 1",
    showtime: "2024-12-25 19:30",
    seats: ["A5", "A6"],
    ticketPrice: 150000,
    quantity: 2,
    subtotal: 300000,
    tax: 30000,
    discount: 20000,
    total: 310000
  };

  // Validate form based on payment method
  const isFormValid = () => {
    if (!selectedMethod) return false;
    
    // For card payments, validate card info
    if (selectedMethod === PAYMENT_METHODS.CREDIT_CARD || selectedMethod === PAYMENT_METHODS.DEBIT_CARD) {
      return !!(
        creditCardInfo.cardNumber?.length >= 13 &&
        creditCardInfo.cardHolder?.length >= 2 &&
        creditCardInfo.expiryDate?.match(/^(0[1-9]|1[0-2])\/\d{2}$/) &&
        creditCardInfo.cvv?.match(/^[0-9]{3,4}$/)
      );
    }
    
    // For other methods, just need method selection
    return true;
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  const handleFormChange = (values: CreditCardInfo) => {
    setCreditCardInfo(values);
  };

  const handleBack = () => {
    router.push('/booking'); // Navigate back to booking page
  };

  const handlePayment = async () => {
    if (!selectedMethod || !isFormValid()) {
      message.error("Please complete all required information!");
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock different payment flows
      if (selectedMethod === PAYMENT_METHODS.MOMO || selectedMethod === PAYMENT_METHODS.ZALOPAY) {
        message.info("Redirecting to payment app...");
        // In real app, redirect to payment gateway
      } else if (selectedMethod === PAYMENT_METHODS.BANK_TRANSFER) {
        message.success("Booking confirmed! Bank transfer details sent to your email.");
      } else if (selectedMethod === PAYMENT_METHODS.CASH) {
        message.success("Booking confirmed! Please pay at the cinema counter.");
      } else {
        message.success("Payment successful! Booking confirmed.");
      }
      
      // Navigate to success page
      setTimeout(() => {
        router.push('/payment/success');
      }, 1500);
      
    } catch (error) {
      message.error("Payment failed. Please try again.");
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Row gutter={[24, 24]}>
        {/* Left Column - Payment Form */}
        <Col xs={24} lg={14}>
          <div className="space-y-6">
            <PaymentMethodSelector
              selectedMethod={selectedMethod}
              onMethodChange={handlePaymentMethodChange}
            />
            
            <PaymentForm
              paymentMethod={selectedMethod}
              onFormChange={handleFormChange}
            />
          </div>
        </Col>

        {/* Right Column - Order Summary */}
        <Col xs={24} lg={10}>
          <div className="sticky top-6">
            <OrderSummary booking={bookingDetails} />
          </div>
        </Col>
      </Row>

      {/* Payment Actions */}
      <div className="mt-8">
        <PaymentActions
          paymentMethod={selectedMethod}
          isFormValid={isFormValid()}
          isProcessing={isProcessing}
          onBack={handleBack}
          onPayment={handlePayment}
        />
      </div>
    </div>
  );
};

export default PaymentPage; 