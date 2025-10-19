import React from 'react';
import { Card, Row, Col, Spin } from 'antd';
import { 
  HomeOutlined, 
  CheckCircleOutlined, 
  TeamOutlined, 
  CalculatorOutlined 
} from '@ant-design/icons';

interface RoomStatistics {
  totalRooms: number;
  activeRooms: number;
  totalSeats: number;
  avgSeats: number;
}

interface RoomStatisticsCardProps {
  statistics: RoomStatistics;
  loading: boolean;
}

const RoomStatisticsCard: React.FC<RoomStatisticsCardProps> = ({ statistics, loading }) => {
  const statisticsData = [
    {
      title: 'Total Rooms',
      value: statistics.totalRooms,
      icon: <HomeOutlined className="text-blue-600" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Rooms',
      value: statistics.activeRooms,
      icon: <CheckCircleOutlined className="text-green-600" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Seats',
      value: statistics.totalSeats,
      icon: <TeamOutlined className="text-purple-600" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Average Seats',
      value: statistics.avgSeats,
      icon: <CalculatorOutlined className="text-orange-500" />,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <Row gutter={[16, 16]} className="mb-6">
      {statisticsData.map((stat, index) => (
        <Col xs={24} sm={12} lg={6} key={index}>
          <Card 
  className="h-full shadow-sm border-0 hover:shadow-md transition-shadow duration-300"
  style={{ borderRadius: 12 }}
  styles={{
    body: { padding: '20px' },
  }}
>

            <Spin spinning={loading}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-gray-600 text-sm font-medium mb-1">
                    {stat.title}
                  </div>
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value.toLocaleString()}
                  </div>
                </div>
                <div 
                  className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center text-xl`}
                >
                  {stat.icon}
                </div>
              </div>
            </Spin>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default RoomStatisticsCard;
