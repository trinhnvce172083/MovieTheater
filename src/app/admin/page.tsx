"use client";

import React, { useEffect, useState } from "react";
import { 
  Card, 
  Progress, 
  Button,
  Alert
} from "antd";
import {
  UserOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  GiftOutlined,
  EyeOutlined,
  CalendarOutlined,
  TrophyOutlined,
  DollarCircleOutlined,
  TeamOutlined,
  PlayCircleOutlined,
  WarningOutlined,
  StarOutlined
} from "@ant-design/icons";
import AppBarChart from "@/components/AppBarChart";
import { getAllUsers } from "@/api/admin/getAllUsers";
import { getMovies } from "@/api/admin/getAllMovies";
import { getAllPromotions } from "@/api/admin/getAllPromotions";
import { getAllRooms } from "@/api/admin/getAllRooms";

export default function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalMovies, setTotalMovies] = useState<number | null>(null);
  const [totalRooms, setTotalRooms] = useState<number | null>(null);
  const [totalPromotions, setTotalPromotions] = useState<number | null>(null);
  const [activeMovies, setActiveMovies] = useState<number | null>(null);
  const [activeRooms, setActiveRooms] = useState<number | null>(null);

  // Enhanced stats calculation
  const stats = {
    totalUsers: totalUsers ?? 0,
    totalMovies: totalMovies ?? 0,
    totalRooms: totalRooms ?? 0,
    totalPromotions: totalPromotions ?? 0,
    activeMovies: activeMovies ?? 0,
    activeRooms: activeRooms ?? 0,
    userGrowth: 12.5, // Mock data - should come from API
    revenue: 234500, // Mock data - should come from API
    revenueGrowth: 8.2 // Mock data - should come from API
  };

  // Recent activities mock data - should come from API
  const recentActivities = [
    {
      id: 1,
      type: 'movie_added',
      title: 'New movie "Avengers: Endgame" added',
      time: '2 hours ago',
      icon: <VideoCameraOutlined className="text-blue-600" />,
      status: 'success'
    },
    {
      id: 2,
      type: 'user_registered',
      title: '5 new users registered',
      time: '4 hours ago',
      icon: <UserOutlined className="text-green-600" />,
      status: 'success'
    },
    {
      id: 3,
      type: 'room_maintenance',
      title: 'Room A-3 scheduled for maintenance',
      time: '6 hours ago',
      icon: <WarningOutlined className="text-orange-600" />,
      status: 'warning'
    },
    {
      id: 4,
      type: 'promotion_created',
      title: 'Weekend special promotion created',
      time: '8 hours ago',
      icon: <GiftOutlined className="text-purple-600" />,
      status: 'success'
    }
  ];

  // Quick actions
  const quickActions = [
    { icon: <VideoCameraOutlined />, title: 'Add New Movie', color: 'blue', href: '/admin/movies' },
    { icon: <HomeOutlined />, title: 'Manage Rooms', color: 'green', href: '/admin/rooms' },
    { icon: <UserOutlined />, title: 'View Members', color: 'orange', href: '/admin/members' },
    { icon: <GiftOutlined />, title: 'Create Promotion', color: 'purple', href: '/admin/promotions' }
  ];

  useEffect(() => {
    async function fetchAllData() {
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
      } catch {
        // Silent error handling for better UX
      } finally {
        // setLoading(false); // commented out since loading is not used
      }
    }
    
    fetchAllData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here&apos;s your cinema overview.</p>
            </div>
            <div className="flex gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  type="primary"
                  icon={action.icon}
                  href={action.href}
                  className="shadow-sm"
                >
                  {action.title}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Users Card */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <UserOutlined className="text-xl text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalUsers.toLocaleString()}
                  </p>
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    +{stats.userGrowth}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Movies Card */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <VideoCameraOutlined className="text-xl text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Movies</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMovies}</p>
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {stats.activeMovies} active
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Rooms Card */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <HomeOutlined className="text-xl text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Cinema Rooms</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRooms}</p>
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {stats.activeRooms} operational
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Promotions Card */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <GiftOutlined className="text-xl text-white" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Promotions</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPromotions}</p>
                  <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <Card 
              className="border-0 shadow-sm h-full"
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarCircleOutlined className="text-green-600" />
                    <span className="font-semibold">Revenue Overview</span>
                  </div>
                  <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    +{stats.revenueGrowth}% this month
                  </span>
                </div>
              }
            >
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${stats.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Average per Movie</p>
                    <p className="text-xl font-semibold text-gray-900">
                      ${stats.totalMovies > 0 ? Math.round(stats.revenue / stats.totalMovies).toLocaleString() : 0}
                    </p>
                  </div>
                </div>
              </div>
              <AppBarChart />
            </Card>
          </div>

          {/* Recent Activity */}
          <Card 
            className="border-0 shadow-sm"
            title={
              <div className="flex items-center gap-2">
                <CalendarOutlined className="text-blue-600" />
                <span className="font-semibold">Recent Activity</span>
              </div>
            }
          >
            <div className="space-y-4">
              {recentActivities.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.status === 'success' ? 'bg-green-100' :
                    item.status === 'warning' ? 'bg-orange-100' : 'bg-blue-100'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance Metrics & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Metrics */}
          <Card 
            className="border-0 shadow-sm"
            title={
              <div className="flex items-center gap-2">
                <TrophyOutlined className="text-yellow-600" />
                <span className="font-semibold">Performance Metrics</span>
              </div>
            }
          >
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Room Utilization</span>
                  <span className="text-sm font-bold text-gray-900">85%</span>
                </div>
                <Progress 
                  percent={85} 
                  strokeColor="#10b981" 
                  trailColor="#f3f4f6"
                  size="small"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Customer Satisfaction</span>
                  <span className="text-sm font-bold text-gray-900">92%</span>
                </div>
                <Progress 
                  percent={92} 
                  strokeColor="#3b82f6" 
                  trailColor="#f3f4f6"
                  size="small"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Staff Efficiency</span>
                  <span className="text-sm font-bold text-gray-900">78%</span>
                </div>
                <Progress 
                  percent={78} 
                  strokeColor="#f59e0b" 
                  trailColor="#f3f4f6"
                  size="small"
                />
              </div>
            </div>
          </Card>

          {/* System Status */}
          <Card 
            className="border-0 shadow-sm"
            title={
              <div className="flex items-center gap-2">
                <StarOutlined className="text-purple-600" />
                <span className="font-semibold">System Status</span>
              </div>
            }
          >
            <div className="space-y-4">
              <Alert
                message="All Systems Operational"
                description="All cinema systems are running smoothly."
                type="success"
                showIcon
                className="border-0 bg-green-50"
              />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Booking System</p>
                    <p className="text-xs text-gray-500">Last updated 2 min ago</p>
                  </div>
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment Gateway</p>
                    <p className="text-xs text-gray-500">Processing normally</p>
                  </div>
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Database</p>
                    <p className="text-xs text-gray-500">99.9% uptime</p>
                  </div>
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer Stats */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <PlayCircleOutlined className="text-2xl text-blue-400" />
              </div>
              <p className="text-sm text-gray-300 mb-1">Today&apos;s Bookings</p>
              <p className="text-3xl font-bold text-white">156</p>
            </div>
            
            <div>
              <div className="flex items-center justify-center mb-2">
                <EyeOutlined className="text-2xl text-green-400" />
              </div>
              <p className="text-sm text-gray-300 mb-1">Active Sessions</p>
              <p className="text-3xl font-bold text-white">23</p>
            </div>
            
            <div>
              <div className="flex items-center justify-center mb-2">
                <DollarCircleOutlined className="text-2xl text-yellow-400" />
              </div>
              <p className="text-sm text-gray-300 mb-1">Revenue Today</p>
              <p className="text-3xl font-bold text-white">$12,450</p>
            </div>
            
            <div>
              <div className="flex items-center justify-center mb-2">
                <TeamOutlined className="text-2xl text-purple-400" />
              </div>
              <p className="text-sm text-gray-300 mb-1">Online Users</p>
              <p className="text-3xl font-bold text-white">89</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 