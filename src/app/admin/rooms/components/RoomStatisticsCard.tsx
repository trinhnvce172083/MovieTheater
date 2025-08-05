import { Card, Statistic } from 'antd';
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Total Rooms"
          value={statistics.totalRooms}
          prefix={<HomeOutlined className="text-blue-600" />}
          loading={loading}
          valueStyle={{ color: '#1f2937', fontSize: '24px', fontWeight: 'bold' }}
        />
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Active Rooms"
          value={statistics.activeRooms}
          prefix={<CheckCircleOutlined className="text-green-600" />}
          valueStyle={{ color: '#059669', fontSize: '24px', fontWeight: 'bold' }}
          loading={loading}
        />
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Total Seats"
          value={statistics.totalSeats}
          prefix={<UserOutlined className="text-purple-600" />}
          loading={loading}
          valueStyle={{ color: '#7c3aed', fontSize: '24px', fontWeight: 'bold' }}
        />
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <Statistic
          title="Average Seats"
          value={statistics.avgSeats}
          prefix={<CalculatorOutlined className="text-orange-500" />}
          loading={loading}
          valueStyle={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}
        />
      </Card>
    </div>
  );
};
