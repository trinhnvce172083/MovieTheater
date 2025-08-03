import React from 'react';
import { Card, Statistic } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  DollarOutlined,
} from '@ant-design/icons';

interface ScheduleStatistics {
  totalSchedules: number;
  scheduledCount: number;
  averageOccupancyRate: number;
  totalRevenue: number;
}

interface ScheduleStatisticsCardProps {
  statistics: ScheduleStatistics;
  loading?: boolean;
}

const ScheduleStatisticsCard: React.FC<ScheduleStatisticsCardProps> = ({ 
  statistics, 
  loading = false 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Total Schedules"
          value={statistics.totalSchedules}
          prefix={<CalendarOutlined className="text-blue-600" />}
          loading={loading}
          valueStyle={{ color: '#1f2937', fontSize: '24px', fontWeight: 'bold' }}
        />
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Active Today"
          value={statistics.scheduledCount}
          prefix={<ClockCircleOutlined className="text-green-600" />}
          valueStyle={{ color: '#059669', fontSize: '24px', fontWeight: 'bold' }}
          loading={loading}
        />
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Avg Occupancy"
          value={statistics.averageOccupancyRate}
          suffix="%"
          prefix={<TeamOutlined className="text-yellow-600" />}
          loading={loading}
          valueStyle={{ color: '#d97706', fontSize: '24px', fontWeight: 'bold' }}
        />
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Total Revenue"
          value={statistics.totalRevenue}
          suffix="₫"
          prefix={<DollarOutlined className="text-red-600" />}
          valueStyle={{ color: '#dc2626', fontSize: '24px', fontWeight: 'bold' }}
          loading={loading}
          formatter={(value) => `${Number(value).toLocaleString()}`}
        />
      </Card>
    </div>
  );
};

export default ScheduleStatisticsCard;
