import React from 'react';
import { Card, Statistic } from 'antd';
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
  loading?: boolean;
}

const MovieStatisticsCard: React.FC<MovieStatisticsCardProps> = ({ 
  statistics, 
  loading = false 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Total Movies"
          value={statistics.totalMovies}
          prefix={<VideoCameraOutlined className="text-blue-600" />}
          loading={loading}
          valueStyle={{ color: '#1f2937', fontSize: '24px', fontWeight: 'bold' }}
        />
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Now Showing"
          value={statistics.nowShowingCount}
          prefix={<PlayCircleOutlined className="text-green-600" />}
          valueStyle={{ color: '#059669', fontSize: '24px', fontWeight: 'bold' }}
          loading={loading}
        />
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Coming Soon"
          value={statistics.comingSoonCount}
          prefix={<ClockCircleOutlined className="text-yellow-600" />}
          loading={loading}
          valueStyle={{ color: '#d97706', fontSize: '24px', fontWeight: 'bold' }}
        />
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Ended"
          value={statistics.endedCount}
          prefix={<CheckCircleOutlined className="text-gray-600" />}
          valueStyle={{ color: '#6b7280', fontSize: '24px', fontWeight: 'bold' }}
          loading={loading}
        />
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Featured"
          value={statistics.featuredCount}
          prefix={<StarOutlined className="text-purple-600" />}
          valueStyle={{ color: '#7c3aed', fontSize: '24px', fontWeight: 'bold' }}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default MovieStatisticsCard;
