"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Typography, Steps } from "antd";
import { ShoppingOutlined, CreditCardOutlined, CheckCircleOutlined } from "@ant-design/icons";

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/Logo.png"
                alt="Logo"
                width={60}
                height={60}
                className="w-12 h-12"
              />
              <Typography.Title level={4} className="ml-3 mb-0">
                Lumiere Cinema
              </Typography.Title>
            </Link>

            {/* Navigation Steps */}
            <div className="hidden md:block">
              <Steps
                current={1}
                size="small"
                items={[
                  {
                    title: 'Select Seats',
                    icon: <ShoppingOutlined />,
                  },
                  {
                    title: 'Payment',
                    icon: <CreditCardOutlined />,
                  },
                  {
                    title: 'Confirmation',
                    icon: <CheckCircleOutlined />,
                  },
                ]}
              />
            </div>

            {/* Help Link */}
            <div className="flex items-center gap-4">
              <Link href="/help" className="text-blue-600 hover:text-blue-800 text-sm">
                Need Help?
              </Link>
              <Typography.Text type="secondary" className="text-sm">
                🔒 Secure Payment
              </Typography.Text>
            </div>
          </div>

          {/* Mobile Steps */}
          <div className="md:hidden mt-4">
            <Steps
              current={1}
              size="small"
              direction="horizontal"
              items={[
                {
                  title: 'Seats',
                  icon: <ShoppingOutlined />,
                },
                {
                  title: 'Payment',
                  icon: <CreditCardOutlined />,
                },
                {
                  title: 'Done',
                  icon: <CheckCircleOutlined />,
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Typography.Title level={2} className="text-center mb-8">
            Complete Your Payment
          </Typography.Title>
          {children}
        </div>
      </div>

      {/* Security Footer */}
      <div className="bg-gray-800 text-white py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <Typography.Text className="text-gray-300">
                Your payment is protected by 256-bit SSL encryption
              </Typography.Text>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-gray-300 text-sm">Accepted Payment Methods:</span>
              <div className="flex gap-2">
                <span className="bg-white text-gray-800 px-3 py-1 rounded text-sm">VISA</span>
                <span className="bg-white text-gray-800 px-3 py-1 rounded text-sm">Mastercard</span>
                <span className="bg-white text-gray-800 px-3 py-1 rounded text-sm">MoMo</span>
                <span className="bg-white text-gray-800 px-3 py-1 rounded text-sm">ZaloPay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 