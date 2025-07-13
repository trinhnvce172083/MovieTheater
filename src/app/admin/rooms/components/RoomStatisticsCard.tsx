import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { HomeOutlined, CheckCircleOutlined, UserOutlined, CalculatorOutlined } from '@ant-design/icons';
import { RoomStatistics } from '../types';

interface RoomStatisticsCardProps {
  statistics: RoomStatistics;
  loading?: boolean;
}

export const RoomStatisticsCard: React.FC<RoomStatisticsCardProps> = ({ 
  statistics, 
  loading = false 
}) => {
  return (
    <Card style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={6}>
          <Statistic
            title="Total Rooms"
            value={statistics.totalRooms}
            prefix={<HomeOutlined />}
            loading={loading}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Active Rooms"
            value={statistics.activeRooms}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#3f8600' }}
            loading={loading}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Total Seats"
            value={statistics.totalSeats}
            prefix={<UserOutlined />}
            loading={loading}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Average Seats"
            value={statistics.avgSeats}
            prefix={<CalculatorOutlined />}
            loading={loading}
          />
        </Col>
      </Row>
    </Card>
  );
};
