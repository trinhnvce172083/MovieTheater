"use client";

import React from "react";
import { Card, Form, Input, Row, Col, Typography } from "antd";
import { CreditCardOutlined, UserOutlined, CalendarOutlined, LockOutlined } from "@ant-design/icons";
import { PaymentMethod, PAYMENT_METHODS, CreditCardInfo } from "@/constants/paymentTypes";

interface PaymentFormProps {
  paymentMethod: PaymentMethod | null;
  onFormChange: (values: CreditCardInfo) => void;
  className?: string;
  form?: any; // Add optional form prop
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentMethod,
  onFormChange,
  className = "",
  form: externalForm // Accept form prop
}) => {
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm; // Use external form if provided

  const handleFormChange = () => {
    const values = form.getFieldsValue();
    onFormChange(values);
  };

  if (!paymentMethod) {
    return null;
  }

  // Only show form for card payments
  if (paymentMethod !== PAYMENT_METHODS.CREDIT_CARD && paymentMethod !== PAYMENT_METHODS.DEBIT_CARD) {
    return (
      <Card title="Payment Details" className={`shadow-lg ${className}`}>
        <div className="text-center py-8">
          <Typography.Title level={4} className="mb-4">
            {paymentMethod === PAYMENT_METHODS.MOMO && "MoMo Payment"}
            {paymentMethod === PAYMENT_METHODS.ZALOPAY && "ZaloPay Payment"}
            {paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && "Bank Transfer"}
            {paymentMethod === PAYMENT_METHODS.CASH && "Cash Payment"}
          </Typography.Title>
          
          <Typography.Text type="secondary">
            {paymentMethod === PAYMENT_METHODS.MOMO && "You will be redirected to MoMo app to complete the payment."}
            {paymentMethod === PAYMENT_METHODS.ZALOPAY && "You will be redirected to ZaloPay app to complete the payment."}
            {paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && "Bank transfer details will be provided after booking confirmation."}
            {paymentMethod === PAYMENT_METHODS.CASH && "Please pay at the cinema counter before showtime."}
          </Typography.Text>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Payment Details" className={`shadow-lg ${className}`}>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormChange}
        autoComplete="off"
      >
        <Form.Item
          label="Card Number"
          name="cardNumber"
          rules={[
            { required: true, message: "Please enter your card number!" },
            { pattern: /^[0-9\s]{13,19}$/, message: "Please enter a valid card number!" }
          ]}
        >
          <Input
            prefix={<CreditCardOutlined />}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            onChange={(e) => {
              // Format card number with spaces
              const value = e.target.value.replace(/\s/g, '');
              const formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
              form.setFieldsValue({ cardNumber: formattedValue });
            }}
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label="Card Holder Name"
          name="cardHolder"
          rules={[
            { required: true, message: "Please enter the card holder name!" },
            { min: 2, message: "Name must be at least 2 characters!" }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="JOHN DOE"
            size="large"
            className="rounded-lg"
            style={{ textTransform: 'uppercase' }}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Expiry Date"
              name="expiryDate"
              rules={[
                { required: true, message: "Please enter expiry date!" },
                { pattern: /^(0[1-9]|1[0-2])\/\d{2}$/, message: "Please enter valid date (MM/YY)!" }
              ]}
            >
              <Input
                prefix={<CalendarOutlined />}
                placeholder="MM/YY"
                maxLength={5}
                onChange={(e) => {
                  // Format MM/YY
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                  }
                  form.setFieldsValue({ expiryDate: value });
                }}
                size="large"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label="CVV"
              name="cvv"
              rules={[
                { required: true, message: "Please enter CVV!" },
                { pattern: /^[0-9]{3,4}$/, message: "Please enter valid CVV!" }
              ]}
            >
              <Input
                prefix={<LockOutlined />}
                placeholder="123"
                maxLength={4}
                type="password"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <Typography.Text type="secondary" className="text-sm">
            <strong>Secure Payment:</strong> Your card information is encrypted using SSL technology. 
            We do not store your card details on our servers.
          </Typography.Text>
        </div>
      </Form>
    </Card>
  );
};

export default PaymentForm; 