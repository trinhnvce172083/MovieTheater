"use client";

import React, { useEffect, useState } from "react";
import { Card, Statistic, Spin, Button, Typography } from "antd";
import {
  UserOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  GiftOutlined,
  DatabaseOutlined,
  ReloadOutlined
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
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Title level={2} className="!mb-2">
                Cinema Management Dashboard
              </Title>
              <Text type="secondary">
                Overview of your cinema management system
              </Text>
            </div>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={fetchData}
              loading={loading}
            >
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Total Users"
              value={totalUsers || 0}
              prefix={<UserOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Total Movies"
              value={totalMovies || 0}
              prefix={<VideoCameraOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
              suffix={activeMovies !== null ? `(${activeMovies} active)` : ''}
            />
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Cinema Rooms"
              value={totalRooms || 0}
              prefix={<HomeOutlined className="text-purple-500" />}
              valueStyle={{ color: '#722ed1' }}
              suffix={activeRooms !== null ? `(${activeRooms} operational)` : ''}
            />
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Promotions"
              value={totalPromotions || 0}
              prefix={<GiftOutlined className="text-orange-500" />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </div>

        {/* System Information & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Information */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <DatabaseOutlined className="text-green-500" />
                <span>Revenue Overview</span>
              </div>
            }
            className="shadow-sm"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
                <div className="text-2xl font-bold text-blue-600">
                  ${totalRevenue.toLocaleString()}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-600 mb-1">Average Price</div>
                <div className="text-2xl font-bold text-green-600">
                  ${averagePrice.toFixed(2)}
                </div>
              </div>
            </div>
          </Card>

          {/* Database Status */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <DatabaseOutlined className="text-blue-500" />
                <span>Database Status</span>
              </div>
            }
            className="shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Text>Users Table</Text>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <Text type="success">Active ({totalUsers || 0} records)</Text>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Text>Movies Table</Text>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <Text type="success">Active ({totalMovies || 0} records)</Text>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Text>Rooms Table</Text>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <Text type="success">Active ({totalRooms || 0} records)</Text>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Text>Promotions Table</Text>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <Text type="success">Active ({totalPromotions || 0} records)</Text>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Card 
            title="Quick Actions"
            className="shadow-sm"
          >
            <div className="grid grid-cols-2 gap-4">
              <Button 
                type="default" 
                icon={<UserOutlined />}
                className="h-12"
                onClick={() => window.location.href = '/admin/users'}
              >
                Manage Users
              </Button>
              <Button 
                type="default" 
                icon={<VideoCameraOutlined />}
                className="h-12"
                onClick={() => window.location.href = '/admin/movies'}
              >
                Manage Movies
              </Button>
              <Button 
                type="default" 
                icon={<HomeOutlined />}
                className="h-12"
                onClick={() => window.location.href = '/admin/rooms'}
              >
                Manage Rooms
              </Button>
              <Button 
                type="default" 
                icon={<GiftOutlined />}
                className="h-12"
                onClick={() => window.location.href = '/admin/promotions'}
              >
                Manage Promotions
              </Button>
            </div>
          </Card>
        </div>

        {/* Summary Information */}
        <Card 
          title="Summary"
          className="shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500 mb-1">
                {totalUsers || 0}
              </div>
              <Text type="secondary">Registered Users</Text>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500 mb-1">
                {activeMovies || 0}
              </div>
              <Text type="secondary">Active Movies</Text>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500 mb-1">
                {activeRooms || 0}
              </div>
              <Text type="secondary">Operational Rooms</Text>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500 mb-1">
                {totalPromotions || 0}
              </div>
              <Text type="secondary">Active Promotions</Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 