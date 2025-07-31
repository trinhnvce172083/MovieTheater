"use client";

import React, { useEffect, useState } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Statistic, 
  Table, 
  Tag, 
  Space,
  Empty,
  Alert,
  Skeleton
} from "antd";
import {
  UserOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  GiftOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";

// Import real APIs only
import { getAllUsers } from "@/api/admin/getAllUsers";
import { getMovies } from "@/api/admin/getAllMovies";
import { getAllRooms } from "@/api/admin/getAllRooms";
import { getAllPromotions } from "@/api/admin/getAllPromotions";

// Import chart components
import AppBarChart from "@/components/AppBarChart";
import AppLineChart from "@/components/AppLineChart";
import AppPieChart from "@/components/AppPieChart";

const { Title, Text } = Typography;

// Interface definitions
interface Movie {
  movieId?: number;
  id?: number;
  title?: string;
  genre?: string;
  status?: string;
  duration?: number;
  director?: string;
  releaseDate?: string;
  rating?: number;
  price?: number;
}

interface CinemaRoom {
  cinemaRoomId?: number;
  id?: number;
  cinemaRoomName?: string;
  name?: string;
  capacity?: number;
  totalSeats?: number;
  isActive?: boolean;
  status?: string;
  location?: string;
}

interface Promotion {
  promotionId?: number;
  id?: number;
  promotionName?: string;
  name?: string;
  discountPercentage?: number;
  discount?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  isActive?: boolean;
}

interface DashboardStats {
  totalUsers: number;
  totalMovies: number;
  totalRooms: number;
  totalPromotions: number;
  activeMovies: number;
  activeRooms: number;
  activePromotions: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalMovies: 0,
    totalRooms: 0,
    totalPromotions: 0,
    activeMovies: 0,
    activeRooms: 0,
    activePromotions: 0,
  });
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<CinemaRoom[]>([]);

  const fetchRealData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching real data from APIs...');
      
      const results = await Promise.allSettled([
        getAllUsers(),
        getMovies({ page: 0, size: 100, sortBy: "title", sortDirection: "asc" }),
        getAllRooms(0, 100),
        getAllPromotions({ page: 0, size: 100, sortBy: "promotionName", sortDirection: "ASC" })
      ]);


      // Process Users
      if (results[0].status === 'fulfilled') {
        const userData = results[0].value;
        console.log('👥 Users data:', userData);
        
        if (userData?.content && Array.isArray(userData.content)) {
          setStats(prev => ({ ...prev, totalUsers: userData.content.length }));
        } else if (Array.isArray(userData)) {
          setStats(prev => ({ ...prev, totalUsers: userData.length }));
        } else {
          console.warn('Users data format not recognized:', userData);
        }
      } else {
        console.error('❌ Failed to fetch users:', results[0].reason);
      }

      // Process Movies
      if (results[1].status === 'fulfilled') {
        const movieData = results[1].value;
        console.log('🎬 Movies data:', movieData);
        
        if (movieData?.content && Array.isArray(movieData.content)) {
          setMovies(movieData.content);
          const activeCount = movieData.content.filter((movie: Movie) => 
            movie.status === 'NOW_SHOWING' || movie.status === 'ACTIVE'
          ).length;
          setStats(prev => {
            const newStats = { 
              ...prev, 
              totalMovies: movieData.content.length,
              activeMovies: activeCount
            };
            console.log('📊 Updated movie stats:', newStats);
            return newStats;
          });
        } else if (Array.isArray(movieData)) {
          setMovies(movieData);
          const activeCount = movieData.filter((movie: Movie) => 
            movie.status === 'NOW_SHOWING' || movie.status === 'ACTIVE'
          ).length;
          setStats(prev => ({ 
            ...prev, 
            totalMovies: movieData.length,
            activeMovies: activeCount
          }));
        } else {
          console.warn('Movies data format not recognized:', movieData);
        }
      } else {
        console.error('❌ Failed to fetch movies:', results[1].reason);
      }

      // Process Rooms
      if (results[2].status === 'fulfilled') {
        const roomData = results[2].value;
        console.log('🏠 Rooms data:', roomData);
        
        if (roomData?.content && Array.isArray(roomData.content)) {
          setRooms(roomData.content);
          const activeCount = roomData.content.filter((room: CinemaRoom) => 
            room.isActive === true || room.status === 'ACTIVE'
          ).length;
          setStats(prev => {
            const newStats = { 
              ...prev, 
              totalRooms: roomData.content.length,
              activeRooms: activeCount
            };
            console.log('🏠 Updated room stats:', newStats);
            return newStats;
          });
        } else if (Array.isArray(roomData)) {
          setRooms(roomData);
          const activeCount = roomData.filter((room: CinemaRoom) => 
            room.isActive === true || room.status === 'ACTIVE'
          ).length;
          setStats(prev => ({ 
            ...prev, 
            totalRooms: roomData.length,
            activeRooms: activeCount
          }));
        } else {
          console.warn('Rooms data format not recognized:', roomData);
        }
      } else {
        console.error('❌ Failed to fetch rooms:', results[2].reason);
      }

      // Process Promotions
      if (results[3].status === 'fulfilled') {
        const promotionData = results[3].value;
        console.log('🎁 Promotions data:', promotionData);
        
        if (promotionData?.content && Array.isArray(promotionData.content)) {
          const activeCount = promotionData.content.filter((promo: Promotion) => 
            promo.isActive === true || promo.status === 'ACTIVE'
          ).length;
          setStats(prev => {
            const newStats = { 
              ...prev, 
              totalPromotions: promotionData.content.length,
              activePromotions: activeCount
            };
            console.log('🎁 Updated promotion stats:', newStats);
            return newStats;
          });
        } else if (Array.isArray(promotionData)) {
          const activeCount = promotionData.filter((promo: Promotion) => 
            promo.isActive === true || promo.status === 'ACTIVE'
          ).length;
          setStats(prev => ({ 
            ...prev, 
            totalPromotions: promotionData.length,
            activePromotions: activeCount
          }));
        } else {
          console.warn('Promotions data format not recognized:', promotionData);
        }
      } else {
        console.error('❌ Failed to fetch promotions:', results[3].reason);
      }

      console.log('✅ Final stats:', stats);
      
    } catch (error) {
      console.error('❌ Critical error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchRealData();
  }, [fetchRealData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton active paragraph={{ rows: 4 }} />
          <div className="mt-8">
            <Row gutter={[16, 16]}>
              {[1, 2, 3, 4].map(i => (
                <Col xs={24} sm={12} lg={6} key={i}>
                  <Card>
                    <Skeleton active paragraph={{ rows: 2 }} />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Alert
            message="Dashboard Error"
            description={error}
            type="error"
            showIcon
            action={
              <Space>
                <button 
                  onClick={fetchRealData}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Retry
                </button>
              </Space>
            }
          />
        </div>
      </div>
    );
  }

  // Movie table columns
  const movieColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Genre',
      dataIndex: 'genre',
      key: 'genre',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => duration ? `${duration} min` : '-',
    },
  ];

  // Room table columns
  const roomColumns = [
    {
      title: 'Name',
      dataIndex: ['cinemaRoomName', 'name'],
      key: 'name',
      render: (_: string, record: CinemaRoom) => (
        record.cinemaRoomName || record.name || '-'
      ),
    },
    {
      title: 'Capacity',
      dataIndex: ['capacity', 'totalSeats'],
      key: 'capacity',
      render: (_: number, record: CinemaRoom) => (
        record.capacity || record.totalSeats || '-'
      ),
    },
    {
      title: 'Status',
      dataIndex: ['isActive', 'status'],
      key: 'status',
      render: (_: boolean | string, record: CinemaRoom) => {
        const isActive = record.isActive === true || record.status === 'ACTIVE';
        return isActive ? 'Active' : 'Inactive';
      },
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location: string) => location || '-',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Title level={2} className="!mb-1">Admin Dashboard</Title>
          <Text type="secondary">
            Cinema Management System
          </Text>
        </div>
        
        {/* Key Metrics */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center">
              <Statistic
                title="Total Members"
                value={stats.totalUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center">
              <Statistic
                title="Movies"
                value={stats.totalMovies}
                prefix={<VideoCameraOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <div className="text-sm text-gray-500 mt-2">
                {stats.activeMovies} showing
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center">
              <Statistic
                title="Cinema Halls"
                value={stats.totalRooms}
                prefix={<HomeOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
              <div className="text-sm text-gray-500 mt-2">
                {stats.activeRooms} active
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="text-center">
              <Statistic
                title="Promotions"
                value={stats.totalPromotions}
                prefix={<GiftOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
              <div className="text-sm text-gray-500 mt-2">
                {stats.activePromotions} active
              </div>
            </Card>
          </Col>
        </Row>

        {/* Analytics Charts */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} md={8}>
            <Card title="Revenue" size="small">
              <AppBarChart />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="Bookings" size="small">
              <AppLineChart />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="Movies" size="small">
              <AppPieChart />
            </Card>
          </Col>
        </Row>

        {/* Data Tables */}
        <Row gutter={16}>
          {/* Movies Table */}
          <Col xs={24} lg={12}>
            <Card title="Movies" size="small">
              {movies.length > 0 ? (
                <Table
                  dataSource={movies}
                  columns={movieColumns}
                  pagination={{ pageSize: 5, showSizeChanger: false, size: 'small' }}
                  rowKey={(record) => record.movieId || record.id || Math.random()}
                  size="small"
                />
              ) : (
                <Empty 
                  description="No movies found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </Col>

          {/* Rooms Table */}
          <Col xs={24} lg={12}>
            <Card title="Cinema Halls" size="small">
              {rooms.length > 0 ? (
                <Table
                  dataSource={rooms}
                  columns={roomColumns}
                  pagination={{ pageSize: 5, showSizeChanger: false, size: 'small' }}
                  rowKey={(record) => record.cinemaRoomId || record.id || Math.random()}
                  size="small"
                />
              ) : (
                <Empty 
                  description="No cinema halls found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </Col>
        </Row>

      </div>
    </div>
  );
}
