"use client";

import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import {
  // UserOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  GiftOutlined,
  DollarOutlined,
  TagOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { getAllUsers } from "@/api/admin/getAllUsers";
import { getMovies } from "@/api/admin/getAllMovies";
import { getAllPromotions } from "@/api/admin/getAllPromotions";
import { getAllRooms } from "@/api/admin/getAllRooms";

import AppBarChart from "@/components/AppBarChart";
import AppLineChart from "@/components/AppLineChart";
import AppPieChart from "@/components/AppPieChart";
import { useIsMobile } from "@/hooks/use-mobile";

interface MovieData {
  status: string;
  title: string;
  revenue?: number;
  price?: number;
}

export default function AdminDashboard() {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalMovies, setTotalMovies] = useState<number | null>(null);
  const [totalRooms, setTotalRooms] = useState<number | null>(null);
  const [totalPromotions, setTotalPromotions] = useState<number | null>(null);
  const [activeMovies, setActiveMovies] = useState<number | null>(null);
  const [activeRooms, setActiveRooms] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [averagePrice, setAveragePrice] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array to run only once

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      try {
        const userData = await getAllUsers();
        if (userData && Array.isArray(userData.content)) {
          setTotalUsers(userData.content.length);
        } else if (userData && userData.page && userData.page.totalElements) {
          setTotalUsers(userData.page.totalElements);
        }
      } catch {
      }

      // Fetch movies
      try {
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
      } catch {
      }

      // Fetch rooms
      try {
        const roomData = await getAllRooms(0, 100);
        if (roomData?.content && Array.isArray(roomData.content)) {
          setTotalRooms(roomData.content.length);
          const activeRoomCount = roomData.content.filter((room: { isActive: boolean }) => 
            room.isActive === true
          ).length;
          setActiveRooms(activeRoomCount);
        }
      } catch {
      }

      // Fetch promotions
      try {
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
      }
    } catch {
      // You may keep this error log for debugging if needed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-slate-700 text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className={`${isMobile ? 'p-4' : 'p-8'} bg-gray-50 min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'p-4' : 'p-8'} bg-gray-50 min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold text-gray-900`}>Admin Dashboard</h1>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 mt-1`}>Cinema Management System Overview</p>
            </div>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className={`grid grid-cols-1 ${isMobile ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'} gap-3 sm:gap-5 mb-6 sm:mb-8`}>
          {/* Members Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-100">
            <div className={`${isMobile ? 'p-3' : 'p-5'}`}>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500`}>Total Members</h3>
                <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-full bg-blue-50`}>
                  <TeamOutlined className={`${isMobile ? 'text-sm' : 'text-base'} text-blue-500`} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold text-gray-900`}>{totalUsers !== null ? totalUsers.toLocaleString() : '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Movies Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-100">
            <div className={`${isMobile ? 'p-3' : 'p-5'}`}>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500`}>Movies</h3>
                <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-full bg-green-50`}>
                  <VideoCameraOutlined className={`${isMobile ? 'text-sm' : 'text-base'} text-green-500`} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold text-gray-900`}>{totalMovies !== null ? totalMovies.toLocaleString() : '—'}</p>
                  <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 mt-1`}>
                    {activeMovies !== null ? <span><span className="font-medium text-green-600">{activeMovies}</span> now showing</span> : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cinema Halls Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-100">
            <div className={`${isMobile ? 'p-3' : 'p-5'}`}>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500`}>Cinema Halls</h3>
                <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-full bg-indigo-50`}>
                  <HomeOutlined className={`${isMobile ? 'text-sm' : 'text-base'} text-indigo-500`} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold text-gray-900`}>{totalRooms !== null ? totalRooms.toLocaleString() : '—'}</p>
                  <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 mt-1`}>
                    {activeRooms !== null ? <span><span className="font-medium text-indigo-600">{activeRooms}</span> operational</span> : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Promotions Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-100">
            <div className={`${isMobile ? 'p-3' : 'p-5'}`}>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500`}>Promotions</h3>
                <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-full bg-orange-50`}>
                  <GiftOutlined className={`${isMobile ? 'text-sm' : 'text-base'} text-orange-500`} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold text-gray-900`}>{totalPromotions !== null ? totalPromotions.toLocaleString() : '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="mb-6 sm:mb-8">
          <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-gray-900 mb-3 sm:mb-4`}>Financial Overview</h2>
          <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-2 gap-5'}`}>
            {/* Total Revenue */}
            <div className="bg-white rounded-md shadow-sm border border-gray-100">
              <div className={`${isMobile ? 'p-3' : 'p-5'}`}>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500`}>Total Revenue</h3>
                  <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-full bg-emerald-50`}>
                    <DollarOutlined className={`${isMobile ? 'text-sm' : 'text-base'} text-emerald-500`} />
                  </div>
                </div>
                <div className="mt-1">
                  <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold text-gray-900`}>{formatCurrency(totalRevenue)}</p>
                  <div className="flex items-center mt-1">
                    <span className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium text-emerald-500`}>↑ +8.2%</span>
                    <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 ml-1`}>from last month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Average Ticket Price */}
            <div className="bg-white rounded-md shadow-sm border border-gray-100">
              <div className={`${isMobile ? 'p-3' : 'p-5'}`}>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500`}>Average Ticket Price</h3>
                  <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-full bg-cyan-50`}>
                    <TagOutlined className={`${isMobile ? 'text-sm' : 'text-base'} text-cyan-500`} />
                  </div>
                </div>
                <div className="mt-1">
                  <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold text-gray-900`}>{formatCurrency(averagePrice)}</p>
                  <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 mt-1`}>Premium experience</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className={`grid grid-cols-1 ${isMobile ? 'gap-3 mt-6' : 'md:grid-cols-3 gap-5 mt-8'}`}>
            <AppBarChart />
            <AppLineChart />
            <AppPieChart />
          </div>
        </div>
      </div>
    </div>
  );
}