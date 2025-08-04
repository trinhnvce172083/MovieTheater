"use client";

import React from "react";
import { Card, Button, Typography } from "antd";
import { 
  ShoppingCartOutlined
} from "@ant-design/icons";
import Link from "next/link";

const { Title, Paragraph } = Typography;

export default function TicketSellingPage() {
  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6">
      <Title level={2} className="mb-6">
        🎫 Bán vé cho khách hàng
      </Title>
      
      <Paragraph className="text-gray-600 mb-8">
        Hỗ trợ khách hàng đặt vé xem phim tại quầy. Bạn có thể bán vé cho khách vãng lai hoặc thành viên.
      </Paragraph>

      {/* Main Action */}
      <div className="flex justify-center mb-8">
        <Card 
          className="w-full max-w-md"
          title="🎬 Bán vé cho khách hàng" 
          hoverable
          actions={[
            <Link href="/NowShowing" key="start-booking">
              <Button type="primary" size="large" block>
                Bắt đầu đặt vé
              </Button>
            </Link>
          ]}
        >
          <div className="text-center py-8">
            <ShoppingCartOutlined className="text-6xl text-blue-500 mb-4" />
            <Title level={4}>Chọn phim để bắt đầu</Title>
            <Paragraph className="text-gray-600">
              Chọn phim đang chiếu và bắt đầu quy trình đặt vé cho khách hàng
            </Paragraph>
          </div>
        </Card>
      </div>

      {/* Instructions */}
      <Card title="📋 Hướng dẫn bán vé">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <Title level={5}>Chọn phim & suất chiếu</Title>
              <Paragraph className="text-sm text-gray-600">
                Khách hàng chọn phim và thời gian chiếu phù hợp
              </Paragraph>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-green-600">2</span>
            </div>
            <Title level={5}>Chọn ghế ngồi</Title>
            <Paragraph className="text-sm text-gray-600">
              Hỗ trợ khách hàng chọn vị trí ghế ngồi ưng ý
            </Paragraph>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <Title level={5}>Nhập thông tin & thanh toán</Title>
            <Paragraph className="text-sm text-gray-600">
              Nhập thông tin khách hàng và xử lý thanh toán
            </Paragraph>
          </div>
        </div>
      </Card>
    </div>
  );
}