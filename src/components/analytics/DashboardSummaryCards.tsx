"use client";

import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Badge } from 'antd';
import { 
  DollarCircleOutlined, 
  UserOutlined, 
  PlayCircleOutlined, 
  ShoppingCartOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface OverviewMetrics {
  totalRevenue: number;
  totalBookings: number;
  totalCustomers: number;
  totalMovies: number;
  revenueGrowth: number;
  bookingGrowth: number;
  customerGrowth: number;
}

interface RevenueMetrics {
  todayRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  averageOrderValue: number;
}

interface BookingMetrics {
  todayBookings: number;
  monthBookings: number;
  totalSeatsBooked: number;
  averageOccupancyRate: number;
}

interface DashboardSummaryCardsProps {
  overview: OverviewMetrics;
  revenue: RevenueMetrics;
  bookings: BookingMetrics;
  loading?: boolean;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

const formatPercentage = (percent: number): string => {
  return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;
};

const GrowthIndicator: React.FC<{ value: number }> = ({ value }) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  if (isNeutral) {
    return <Text type="secondary">0%</Text>;
  }
  
  return (
    <Space size={4}>
      {isPositive ? (
        <TrendingUpOutlined style={{ color: '#52c41a' }} />
      ) : (
        <TrendingDownOutlined style={{ color: '#ff4d4f' }} />
      )}
      <Text type={isPositive ? 'success' : 'danger'}>
        {formatPercentage(value)}
      </Text>
    </Space>
  );
};

export const DashboardSummaryCards: React.FC<DashboardSummaryCardsProps> = ({
  overview,
  revenue,
  bookings,
  loading = false
}) => {
  return (
    <div className="dashboard-summary-cards">
      {/* Overview Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng Doanh Thu"
              value={overview.totalRevenue}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarCircleOutlined style={{ color: '#1890ff' }} />}
              suffix={<GrowthIndicator value={overview.revenueGrowth} />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng Đặt Vé"
              value={overview.totalBookings}
              formatter={(value) => formatNumber(Number(value))}
              prefix={<ShoppingCartOutlined style={{ color: '#52c41a' }} />}
              suffix={<GrowthIndicator value={overview.bookingGrowth} />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng Khách Hàng"
              value={overview.totalCustomers}
              formatter={(value) => formatNumber(Number(value))}
              prefix={<UserOutlined style={{ color: '#722ed1' }} />}
              suffix={<GrowthIndicator value={overview.customerGrowth} />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng Phim"
              value={overview.totalMovies}
              formatter={(value) => formatNumber(Number(value))}
              prefix={<PlayCircleOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue Details */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Doanh Thu Chi Tiết" loading={loading}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Hôm Nay"
                  value={revenue.todayRevenue}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ fontSize: '18px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Tháng Này"
                  value={revenue.monthRevenue}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ fontSize: '18px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Năm Này"
                  value={revenue.yearRevenue}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ fontSize: '18px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Giá Trị TB/Đơn"
                  value={revenue.averageOrderValue}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ fontSize: '18px' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Booking Details */}
        <Col xs={24} lg={12}>
          <Card title="Thống Kê Đặt Vé" loading={loading}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Đặt Vé Hôm Nay"
                  value={bookings.todayBookings}
                  formatter={(value) => formatNumber(Number(value))}
                  valueStyle={{ fontSize: '18px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Đặt Vé Tháng Này"
                  value={bookings.monthBookings}
                  formatter={(value) => formatNumber(Number(value))}
                  valueStyle={{ fontSize: '18px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Tổng Ghế Đã Đặt"
                  value={bookings.totalSeatsBooked}
                  formatter={(value) => formatNumber(Number(value))}
                  valueStyle={{ fontSize: '18px' }}
                />
              </Col>
              <Col span={12}>
                <div>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    Tỷ Lệ Lấp Đầy TB
                  </Text>
                  <div style={{ marginTop: '4px' }}>
                    <Badge
                      count={`${bookings.averageOccupancyRate.toFixed(1)}%`}
                      color={bookings.averageOccupancyRate >= 70 ? '#52c41a' : 
                             bookings.averageOccupancyRate >= 50 ? '#fa8c16' : '#ff4d4f'}
                      style={{ fontSize: '16px', padding: '4px 8px' }}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardSummaryCards;
