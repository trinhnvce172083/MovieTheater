"use client";

import React from "react";
import { Card, Row, Col, Button, Typography, Statistic } from "antd";
import { 
  ShoppingCartOutlined, 
  UserAddOutlined, 
  HistoryOutlined,
  SearchOutlined
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

      {/* Quick Actions */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} md={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Vé bán hôm nay"
              value={23}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Khách vãng lai"
              value={15}
              prefix={<UserAddOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Thành viên"
              value={8}
              prefix={<SearchOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Tổng doanh thu"
              value={5420000}
              suffix="VNĐ"
              prefix={<HistoryOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Actions */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            title="🎬 Bán vé mới" 
            hoverable
            actions={[
              <Link href="/movies" key="start-booking">
                <Button type="primary" size="large" block>
                  Bắt đầu đặt vé
                </Button>
              </Link>
            ]}
          >
            <div className="text-center py-8">
              <ShoppingCartOutlined className="text-6xl text-blue-500 mb-4" />
              <Title level={4}>Đặt vé cho khách hàng</Title>
              <Paragraph className="text-gray-600">
                Chọn phim, suất chiếu và ghế ngồi cho khách hàng. 
                Hệ thống sẽ hướng dẫn bạn nhập thông tin khách hàng ở bước cuối.
              </Paragraph>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title="👥 Tìm kiếm thành viên" 
            hoverable
            actions={[
              <Link href="/employee/members" key="search-member">
                <Button size="large" block>
                  Tìm kiếm thành viên
                </Button>
              </Link>
            ]}
          >
            <div className="text-center py-8">
              <SearchOutlined className="text-6xl text-green-500 mb-4" />
              <Title level={4}>Tra cứu thành viên</Title>
              <Paragraph className="text-gray-600">
                Tìm kiếm thông tin thành viên bằng số điện thoại, email 
                hoặc mã thành viên để hỗ trợ đặt vé.
              </Paragraph>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Instructions */}
      <Card title="📋 Hướng dẫn bán vé" className="mt-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <Title level={5}>Chọn phim & suất chiếu</Title>
              <Paragraph className="text-sm text-gray-600">
                Khách hàng chọn phim và thời gian chiếu phù hợp
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <Title level={5}>Chọn ghế ngồi</Title>
              <Paragraph className="text-sm text-gray-600">
                Hỗ trợ khách hàng chọn vị trí ghế ngồi ưng ý
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <Title level={5}>Nhập thông tin & thanh toán</Title>
              <Paragraph className="text-sm text-gray-600">
                Nhập thông tin khách hàng và xử lý thanh toán
              </Paragraph>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}