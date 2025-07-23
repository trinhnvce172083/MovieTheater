"use client";

import React from 'react';
import { Card, Col, Row, Spin, Tooltip } from 'antd';
import {
  PlayCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StarOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { MovieStatistics } from '../types';

interface MovieStatisticsCardProps {
  statistics: MovieStatistics;
  loading: boolean;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number | string; loading: boolean; tooltip: string; color: string }> = ({
  icon,
  title,
  value,
  loading,
  tooltip,
  color,
}) => (
  <Tooltip title={tooltip}>
    <Card 
      variant="borderless" 
      className="relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border-0 rounded-lg"
      style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid #e2e8f0'
      }}
    >
      <Spin spinning={loading}>
        <div className="relative p-4">
          {/* Background decoration */}
          <div 
            className="absolute top-0 right-0 w-16 h-16 opacity-5 transform rotate-12 translate-x-4 -translate-y-2"
            style={{ color }}
          >
            {icon}
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-slate-600 text-sm font-medium mb-2 uppercase tracking-wide">
                {title}
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-1">
                {value}
              </div>
            </div>
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-xl shadow-sm"
              style={{ 
                backgroundColor: color + '15',
                color: color
              }}
            >
              <span className="text-xl">
                {icon}
              </span>
            </div>
          </div>
        </div>
      </Spin>
    </Card>
  </Tooltip>
);

export const MovieStatisticsCard: React.FC<MovieStatisticsCardProps> = ({ statistics, loading }) => {
  return (
    <div className="mb-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <StatCard
            icon={<VideoCameraOutlined />}
            title="Total Movies"
            value={statistics.totalMovies}
            loading={loading}
            tooltip="Total number of movies in the database."
            color="#3b82f6"
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <StatCard
            icon={<PlayCircleOutlined />}
            title="Now Showing"
            value={statistics.nowShowingCount}
            loading={loading}
            tooltip="Movies currently available for booking."
            color="#10b981"
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <StatCard
            icon={<ClockCircleOutlined />}
            title="Coming Soon"
            value={statistics.comingSoonCount}
            loading={loading}
            tooltip="Movies scheduled for future release."
            color="#f59e0b"
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <StatCard
            icon={<CheckCircleOutlined />}
            title="Ended"
            value={statistics.endedCount}
            loading={loading}
            tooltip="Movies that have finished their run."
            color="#6b7280"
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <StatCard
            icon={<StarOutlined />}
            title="Featured"
            value={statistics.featuredCount}
            loading={loading}
            tooltip="Movies specially promoted or highlighted."
            color="#8b5cf6"
          />
        </Col>
      </Row>
    </div>
  );
};
