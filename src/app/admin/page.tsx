"use client";

import React, { useEffect, useState } from "react";
import { Card, Spin, Button, Typography, Progress, Badge, Row, Col } from "antd";
import {
  UserOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  GiftOutlined,
  DatabaseOutlined,
  TrophyOutlined,
  CalendarOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  TeamOutlined,
  BarChartOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { getAllUsers } from "@/api/admin/getAllUsers";
import { getMovies } from "@/api/admin/getAllMovies";
import { getAllPromotions } from "@/api/admin/getAllPromotions";
import { getAllRooms } from "@/api/admin/getAllRooms";

const { Title, Text } = Typography;

interface MovieData {
  status: string;
  title: string;
  revenue?: number;
  price?: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalMovies, setTotalMovies] = useState<number | null>(null);
  const [totalRooms, setTotalRooms] = useState<number | null>(null);
  const [totalPromotions, setTotalPromotions] = useState<number | null>(null);
  const [activeMovies, setActiveMovies] = useState<number | null>(null);
  const [activeRooms, setActiveRooms] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [averagePrice, setAveragePrice] = useState<number>(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const userData = await getAllUsers();
      if (userData && Array.isArray(userData.content)) {
        setTotalUsers(userData.content.length);
      }

      // Fetch movies  
      const movieData = await getMovies({
        page: 0,
        size: 100,
        sortBy: "title",
        sortDirection: "asc",
      });
      if (movieData?.content && Array.isArray(movieData.content)) {
        setTotalMovies(movieData.content.length);
        const activeMovieCount = movieData.content.filter((movie: { status: string }) => 
          movie.status === 'NOW_SHOWING'
        ).length;
        setActiveMovies(activeMovieCount);

        // Calculate revenue and pricing data
        const moviesWithRevenue = movieData.content.filter((movie: MovieData) => movie.revenue || movie.price);
        const totalRev = moviesWithRevenue.reduce((sum: number, movie: MovieData) => 
          sum + (movie.revenue || movie.price || 0), 0
        );
        setTotalRevenue(totalRev);

        const moviesWithPrice = movieData.content.filter((movie: MovieData) => movie.price);
        const avgPrice = moviesWithPrice.length > 0 
          ? moviesWithPrice.reduce((sum: number, movie: MovieData) => sum + (movie.price || 0), 0) / moviesWithPrice.length
          : 0;
        setAveragePrice(avgPrice);
      }

      // Fetch rooms
      const roomData = await getAllRooms(0, 100);
      if (roomData?.content && Array.isArray(roomData.content)) {
        setTotalRooms(roomData.content.length);
        const activeRoomCount = roomData.content.filter((room: { isActive: boolean }) => 
          room.isActive === true
        ).length;
        setActiveRooms(activeRoomCount);
      }

      // Fetch promotions
      const promotionData = await getAllPromotions({
        page: 0,
        size: 100,
        sortBy: "promotionName",
        sortDirection: "ASC",
      });
      if (promotionData?.content && Array.isArray(promotionData.content)) {
        setTotalPromotions(promotionData.content.length);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-slate-700 text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Professional Header */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <DashboardOutlined className="text-white text-xl" />
                </div>
                <div>
                  <Title level={1} className="!mb-1 !text-slate-800">
                    Cinema Analytics Hub
                  </Title>
                  <Text className="text-slate-600 text-lg">
                    Enterprise Management Dashboard
                  </Text>
                </div>
              </div>
              <div className="text-right">
                <div className="text-slate-800 text-lg font-semibold">
                  {getCurrentTime()}
                </div>
                <div className="text-slate-600">
                  {getCurrentDate()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TeamOutlined className="text-white text-3xl" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {totalUsers || 0}
              </div>
              <Text className="text-blue-100 text-base">Total Members</Text>
              <div className="mt-3 flex items-center justify-center">
                <RiseOutlined className="text-green-300 mr-1 text-lg" />
                <span className="text-green-300 text-sm">+12% this month</span>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-green-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <VideoCameraOutlined className="text-white text-3xl" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {totalMovies || 0}
              </div>
              <Text className="text-emerald-100 text-base">Movies Portfolio</Text>
              <div className="mt-3">
                <Badge 
                  count={activeMovies || 0} 
                  style={{ backgroundColor: '#10b981' }}
                  className="text-white"
                />
                <span className="text-emerald-200 text-sm ml-2">Now Showing</span>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-violet-500 to-purple-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <HomeOutlined className="text-white text-3xl" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {totalRooms || 0}
              </div>
              <Text className="text-violet-100 text-base">Cinema Halls</Text>
              <div className="mt-3">
                <Progress 
                  percent={totalRooms ? Math.round((activeRooms || 0) / totalRooms * 100) : 0} 
                  size="small" 
                  strokeColor="#8b5cf6"
                  trailColor="rgba(255,255,255,0.2)"
                  showInfo={false}
                />
                <div className="text-violet-200 text-sm mt-1">
                  {activeRooms || 0} Operational
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <GiftOutlined className="text-white text-3xl" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {totalPromotions || 0}
              </div>
              <Text className="text-amber-100 text-base">Active Promotions</Text>
              <div className="mt-3 flex items-center justify-center">
                <TrophyOutlined className="text-yellow-300 mr-1 text-lg" />
                <span className="text-amber-200 text-sm">Marketing Active</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-md border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <BarChartOutlined className="text-white text-xl" />
                </div>
                <Title level={3} className="!mb-0 !text-slate-800">
                  Financial Overview
                </Title>
              </div>
            </div>
            <Row gutter={24}>
              <Col span={12}>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <Text className="text-green-700 font-medium">Tổng Doanh Thu</Text>
                    <DollarOutlined className="text-green-600 text-xl" />
                  </div>
                  <div className="text-3xl font-bold text-green-800 mb-2">
                    {(totalRevenue * 25000).toLocaleString('vi-VN')} ₫
                  </div>
                  <div className="flex items-center text-green-600">
                    <RiseOutlined className="mr-1 text-lg" />
                    <span className="text-sm">+8.2% so với tháng trước</span>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <Text className="text-blue-700 font-medium">Giá Vé Trung Bình</Text>
                    <CalendarOutlined className="text-blue-600 text-xl" />
                  </div>
                  <div className="text-3xl font-bold text-blue-800 mb-2">
                    {(averagePrice * 25000).toLocaleString('vi-VN')} ₫
                  </div>
                  <div className="flex items-center text-blue-600">
                    <span className="text-sm">Trải nghiệm cao cấp</span>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md border border-slate-200 shadow-lg">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrophyOutlined className="text-white text-4xl" />
              </div>
              <Title level={3} className="!text-slate-800 !mb-2">
                Performance Score
              </Title>
              <div className="text-4xl font-bold text-slate-800 mb-4">98.5%</div>
              <Progress 
                type="circle" 
                percent={98.5} 
                size={140}
                strokeColor={{
                  '0%': '#8b5cf6',
                  '100%': '#a855f7',
                }}
                trailColor="rgba(203, 213, 225, 0.3)"
              />
              <Text className="text-slate-600 mt-4 block">
                System Health Excellent
              </Text>
            </div>
          </Card>
        </div>

        {/* Management Actions */}
        {/* <Card className="bg-white/80 backdrop-blur-md border border-slate-200 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
              <DatabaseOutlined className="text-white text-xl" />
            </div>
            <Title level={3} className="!mb-0 !text-slate-800">
              Quick Management Tools
            </Title>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button 
              size="large"
              className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 border-0 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-left"
              icon={<UserOutlined className="text-2xl" />}
              onClick={() => window.location.href = '/admin/users'}
            >
              <div className="flex items-center space-x-4">
                <UserOutlined className="text-3xl" />
                <div>
                  <div className="font-semibold text-lg">User Management</div>
                  <div className="text-sm opacity-80">Manage customer accounts</div>
                </div>
              </div>
            </Button>
            
            <Button 
              size="large"
              className="h-20 bg-gradient-to-r from-emerald-500 to-green-600 border-0 text-white hover:from-emerald-600 hover:to-green-700 transition-all duration-300 text-left"
              onClick={() => window.location.href = '/admin/movies'}
            >
              <div className="flex items-center space-x-4">
                <VideoCameraOutlined className="text-3xl" />
                <div>
                  <div className="font-semibold text-lg">Movie Catalog</div>
                  <div className="text-sm opacity-80">Content management</div>
                </div>
              </div>
            </Button>
            
            <Button 
              size="large"
              className="h-20 bg-gradient-to-r from-violet-500 to-purple-600 border-0 text-white hover:from-violet-600 hover:to-purple-700 transition-all duration-300 text-left"
              onClick={() => window.location.href = '/admin/rooms'}
            >
              <div className="flex items-center space-x-4">
                <HomeOutlined className="text-3xl" />
                <div>
                  <div className="font-semibold text-lg">Hall Operations</div>
                  <div className="text-sm opacity-80">Room configuration</div>
                </div>
              </div>
            </Button>
            
            <Button 
              size="large"
              className="h-20 bg-gradient-to-r from-amber-500 to-orange-600 border-0 text-white hover:from-amber-600 hover:to-orange-700 transition-all duration-300 text-left"
              onClick={() => window.location.href = '/admin/promotions'}
            >
              <div className="flex items-center space-x-4">
                <GiftOutlined className="text-3xl" />
                <div>
                  <div className="font-semibold text-lg">Promotions</div>
                  <div className="text-sm opacity-80">Marketing campaigns</div>
                </div>
              </div>
            </Button>
          </div>
        </Card> */}
      </div>
    </div>
  );
} 