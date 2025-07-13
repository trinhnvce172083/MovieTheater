import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { VideoCameraOutlined, PlayCircleOutlined, ClockCircleOutlined, StarOutlined } from '@ant-design/icons';
import { MovieStatistics } from '../types';

interface MovieStatisticsCardProps {
  statistics: MovieStatistics;
  loading?: boolean;
}

export const MovieStatisticsCard: React.FC<MovieStatisticsCardProps> = ({ 
  statistics, 
  loading = false 
}) => {
  return (
    <Card style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={6}>
          <Statistic
            title="Total Movies"
            value={statistics.totalMovies}
            prefix={<VideoCameraOutlined />}
            loading={loading}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Now Showing"
            value={statistics.activeMovies}
            prefix={<PlayCircleOutlined />}
            valueStyle={{ color: '#3f8600' }}
            loading={loading}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Coming Soon"
            value={statistics.comingSoonMovies}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#1890ff' }}
            loading={loading}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Avg Rating"
            value={statistics.avgRating}
            prefix={<StarOutlined />}
            precision={1}
            suffix="★"
            valueStyle={{ color: '#faad14' }}
            loading={loading}
          />
        </Col>
      </Row>
    </Card>
  );
};
