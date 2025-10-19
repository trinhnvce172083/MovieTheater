"use client";

import React from "react";
import { Card, Radio, Typography, Space } from "antd";
import { PAYMENT_METHODS, PAYMENT_METHOD_CONFIG, PaymentMethod } from "@/constants/paymentTypes";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onMethodChange: (method: PaymentMethod) => void;
  className?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  className = ""
}) => {
  return (
    <Card title="Payment Method" className={`shadow-lg ${className}`}>
      <Radio.Group 
        value={selectedMethod} 
        onChange={(e) => onMethodChange(e.target.value)}
        className="w-full"
      >
        <Space direction="vertical" className="w-full" size="middle">
          {Object.values(PAYMENT_METHODS).map((method) => {
            const config = PAYMENT_METHOD_CONFIG[method];
            return (
              <Radio 
                key={method} 
                value={method}
                className="w-full"
              >
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <Typography.Text strong className="block">
                        {config.name}
                      </Typography.Text>
                      <Typography.Text type="secondary" className="text-sm">
                        {config.description}
                      </Typography.Text>
                    </div>
                  </div>
                  
                  {config.fees > 0 && (
                    <Typography.Text type="secondary" className="text-sm">
                      +{config.fees.toLocaleString()} VND
                    </Typography.Text>
                  )}
                </div>
              </Radio>
            );
          })}
        </Space>
      </Radio.Group>
      
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <Typography.Text type="secondary" className="text-sm">
          <strong>Security Notice:</strong> All payment information is encrypted and secure. 
          We use industry-standard security measures to protect your data.
        </Typography.Text>
      </div>
    </Card>
  );
};

export default PaymentMethodSelector; 