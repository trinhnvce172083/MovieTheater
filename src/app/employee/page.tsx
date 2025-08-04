"use client";

import React from "react";
import { Card, Button, Typography } from "antd";
import {
  ShoppingCartOutlined,
  HistoryOutlined,
  ScanOutlined,
} from "@ant-design/icons";
import Link from "next/link";

const { Title, Paragraph } = Typography;

export default function EmployeePage() {
  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      <Title level={2} className="mb-6 text-center">
        🏢 Nhân viên Cinema
      </Title>
      
      <Paragraph className="text-center text-gray-600 mb-8">
        Chào mừng bạn đến với hệ thống nhân viên. Chọn chức năng bạn muốn sử dụng.
      </Paragraph>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/employee/ticket-selling">
          <Card 
            hoverable
            className="text-center cursor-pointer h-full"
          >
            <ShoppingCartOutlined className="text-5xl text-blue-500 mb-4" />
            <Title level={4}>Bán vé</Title>
            <Paragraph className="text-gray-600">
              Hỗ trợ khách hàng đặt vé tại quầy
            </Paragraph>
          </Card>
        </Link>
        
        <Link href="/employee/booking-management">
          <Card 
            hoverable
            className="text-center cursor-pointer h-full"
          >
            <HistoryOutlined className="text-5xl text-green-500 mb-4" />
            <Title level={4}>Quản lý booking</Title>
            <Paragraph className="text-gray-600">
              Xem và quản lý đơn đặt vé
            </Paragraph>
          </Card>
        </Link>
        
        <Link href="/employee/checkin">
          <Card 
            hoverable
            className="text-center cursor-pointer h-full"
          >
            <ScanOutlined className="text-5xl text-purple-500 mb-4" />
            <Title level={4}>Check-in</Title>
            <Paragraph className="text-gray-600">
              Check-in khách hàng bằng QR/mã booking
            </Paragraph>
          </Card>
        </Link>
      </div>
    </div>
  );
}