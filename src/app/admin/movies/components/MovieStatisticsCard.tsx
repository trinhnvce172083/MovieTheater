import React from 'react';
import { Card, Statistic } from 'antd';
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
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
          value={statistics.activeMovies}
          prefix={<PlayCircleOutlined className="text-green-600" />}
          valueStyle={{ color: '#059669', fontSize: '24px', fontWeight: 'bold' }}
          loading={loading}
        />
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Coming Soon"
          value={statistics.comingSoonMovies}
          prefix={<ClockCircleOutlined className="text-purple-600" />}
          valueStyle={{ color: '#7c3aed', fontSize: '24px', fontWeight: 'bold' }}
          loading={loading}
        />
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Avg Rating"
          value={statistics.avgRating}
          prefix={<StarOutlined className="text-orange-500" />}
          precision={1}
          suffix="★"
          valueStyle={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}
          loading={loading}
        />
      </Card>
    </div>
  );
};
