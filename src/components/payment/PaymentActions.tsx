"use client";

import React from "react";
import { Button, Space, Typography } from "antd";
import { ArrowLeftOutlined, CreditCardOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { PaymentMethod } from "@/constants/paymentTypes";

interface PaymentActionsProps {
  paymentMethod: PaymentMethod | null;
  isFormValid: boolean;
  isProcessing: boolean;
  onBack: () => void;
  onPayment: () => void;
  className?: string;
}

const PaymentActions: React.FC<PaymentActionsProps> = ({
  paymentMethod,
  isFormValid,
  isProcessing,
  onBack,
  onPayment,
  className = ""
}) => {
  const canProceed = paymentMethod && isFormValid;

  return (
    <div className={`bg-white p-6 rounded-lg shadow-lg ${className}`}>
      <div className="flex justify-between items-center">
        <Button
          size="large"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          disabled={isProcessing}
          className="rounded-lg"
        >
          Back to Booking
        </Button>

        <Space>
          <Typography.Text type="secondary" className="text-sm">
            By continuing, you agree to our Terms & Conditions
          </Typography.Text>
          
          <Button
            type="primary"
            size="large"
            icon={<CreditCardOutlined />}
            onClick={onPayment}
            loading={isProcessing}
            disabled={!canProceed}
            className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 rounded-lg px-8"
          >
            {isProcessing ? "Processing..." : "Complete Payment"}
          </Button>
        </Space>
      </div>

      {!paymentMethod && (
        <div className="mt-4 text-center">
          <Typography.Text type="warning">
            Please select a payment method to continue
          </Typography.Text>
        </div>
      )}

      {paymentMethod && !isFormValid && (
        <div className="mt-4 text-center">
          <Typography.Text type="warning">
            Please fill in all required payment information
          </Typography.Text>
        </div>
      )}
    </div>
  );
};

export default PaymentActions; 