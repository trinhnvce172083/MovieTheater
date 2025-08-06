import React, { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col, Progress, Tooltip, Spin } from 'antd';
import { 
  HomeOutlined, 
  CheckCircleOutlined, 
  UserOutlined, 
  CalculatorOutlined,
  CrownOutlined,
  VideoCameraOutlined,
  SoundOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import { getRoomStatistics, getPremiumRooms, getRoomsWithFeature } from '@/api/admin/getAllRooms';
import { RoomStatistics } from '../types';

interface EnhancedStatistics extends RoomStatistics {
  premiumRoomsCount: number;
  rooms3D: number;
  roomsDolbyAtmos: number;
  roomsRecliner: number;
  utilizationRate: number;
  premiumRatio: number;
}

interface EnhancedRoomStatisticsProps {
  loading?: boolean;
  onStatisticsLoad?: (stats: EnhancedStatistics) => void;
}

export const EnhancedRoomStatistics: React.FC<EnhancedRoomStatisticsProps> = ({ 
  loading = false,
  onStatisticsLoad 
}) => {
  const [statistics, setStatistics] = useState<RoomStatistics>({
    totalRooms: 0,
    activeRooms: 0,
    totalSeats: 0,
    avgSeats: 0
  });
  const [enhancedStats, setEnhancedStats] = useState({
    premiumRoomsCount: 0,
    rooms3D: 0,
    roomsDolbyAtmos: 0,
    roomsRecliner: 0,
    utilizationRate: 0,
    premiumRatio: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      setIsLoading(true);
      try {
        // Fetch basic statistics
        const basicStats = await getRoomStatistics();
        setStatistics(basicStats);

        // Fetch enhanced statistics
        const [premiumRooms, rooms3D, roomsDolby, roomsRecliner] = await Promise.all([
          getPremiumRooms(),
          getRoomsWithFeature('has3D'),
          getRoomsWithFeature('hasDolbyAtmos'),
          getRoomsWithFeature('hasReclinerSeats')
        ]);

        const enhanced = {
          premiumRoomsCount: premiumRooms.length,
          rooms3D: rooms3D.length,
          roomsDolbyAtmos: roomsDolby.length,
          roomsRecliner: roomsRecliner.length,
          utilizationRate: basicStats.totalRooms > 0 ? (basicStats.activeRooms / basicStats.totalRooms) * 100 : 0,
          premiumRatio: basicStats.totalRooms > 0 ? (premiumRooms.length / basicStats.totalRooms) * 100 : 0
        };

        setEnhancedStats(enhanced);

        // Call callback with all stats
        if (onStatisticsLoad) {
          onStatisticsLoad({ ...basicStats, ...enhanced });
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [onStatisticsLoad]);

  const isLoadingState = loading || isLoading;

  return (
    <div className="mb-6">
      {/* Primary Statistics */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={12} sm={6} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
            <Statistic
              title="Total Rooms"
              value={statistics.totalRooms}
              prefix={<HomeOutlined className="text-blue-600" />}
              loading={isLoadingState}
              valueStyle={{ color: '#1f2937', fontSize: '24px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
            <Statistic
              title="Active Rooms"
              value={statistics.activeRooms}
              prefix={<CheckCircleOutlined className="text-green-600" />}
              valueStyle={{ color: '#059669', fontSize: '24px', fontWeight: 'bold' }}
              loading={isLoadingState}
              suffix={
                <div className="text-xs text-gray-500 mt-1">
                  <Progress 
                    percent={enhancedStats.utilizationRate} 
                    size="small" 
                    showInfo={false}
                    strokeColor="#059669"
                  />
                  {enhancedStats.utilizationRate.toFixed(1)}% utilization
                </div>
              }
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
            <Statistic
              title="Total Seats"
              value={statistics.totalSeats}
              prefix={<UserOutlined className="text-purple-600" />}
              loading={isLoadingState}
              valueStyle={{ color: '#7c3aed', fontSize: '24px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
            <Statistic
              title="Average Capacity"
              value={statistics.avgSeats}
              prefix={<CalculatorOutlined className="text-orange-500" />}
              loading={isLoadingState}
              valueStyle={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}
              suffix="seats"
              precision={1}
            />
          </Card>
        </Col>
      </Row>

      {/* Premium & Feature Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
            <Tooltip title="VIP, IMAX, and 4DX rooms">
              <Statistic
                title="Premium Rooms"
                value={enhancedStats.premiumRoomsCount}
                prefix={<CrownOutlined className="text-yellow-600" />}
                loading={isLoadingState}
                valueStyle={{ color: '#d97706', fontSize: '20px', fontWeight: 'bold' }}
                suffix={
                  <div className="text-xs text-gray-500 mt-1">
                    <Progress 
                      percent={enhancedStats.premiumRatio} 
                      size="small" 
                      showInfo={false}
                      strokeColor="#d97706"
                    />
                    {enhancedStats.premiumRatio.toFixed(1)}% of total
                  </div>
                }
              />
            </Tooltip>
          </Card>
        </Col>
        
        <Col xs={12} sm={6} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
            <Tooltip title="Rooms with 3D projection capability">
              <Statistic
                title="3D Capable"
                value={enhancedStats.rooms3D}
                prefix={<VideoCameraOutlined className="text-cyan-600" />}
                loading={isLoadingState}
                valueStyle={{ color: '#0891b2', fontSize: '20px', fontWeight: 'bold' }}
              />
            </Tooltip>
          </Card>
        </Col>
        
        <Col xs={12} sm={6} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
            <Tooltip title="Rooms with Dolby Atmos sound system">
              <Statistic
                title="Dolby Atmos"
                value={enhancedStats.roomsDolbyAtmos}
                prefix={<SoundOutlined className="text-red-600" />}
                loading={isLoadingState}
                valueStyle={{ color: '#dc2626', fontSize: '20px', fontWeight: 'bold' }}
              />
            </Tooltip>
          </Card>
        </Col>
        
        <Col xs={12} sm={6} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
            <Tooltip title="Rooms with luxury reclining seats">
              <Statistic
                title="Recliner Seats"
                value={enhancedStats.roomsRecliner}
                prefix={<ApartmentOutlined className="text-indigo-600" />}
                loading={isLoadingState}
                valueStyle={{ color: '#4f46e5', fontSize: '20px', fontWeight: 'bold' }}
              />
            </Tooltip>
          </Card>
        </Col>
      </Row>

      {isLoadingState && (
        <Spin size="large" spinning={true}>
          <div className="flex justify-center items-center py-8">
            <div className="text-center text-gray-500">Loading statistics...</div>
          </div>
        </Spin>
      )}
    </div>
  );
};
