"use client";

import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import {
  UserOutlined,
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
      console.log("🔍 Fetching users data...");
      const userData = await getAllUsers();
      console.log("👥 Users data received:", userData);
      if (userData && Array.isArray(userData.content)) {
        console.log("✅ Users count:", userData.content.length);
        setTotalUsers(userData.content.length);
      } else if (userData && userData.page && userData.page.totalElements) {
        console.log("✅ Users total elements:", userData.page.totalElements);
        setTotalUsers(userData.page.totalElements);
      } else {
        console.log("⚠️ Users data structure unexpected:", userData);
      }

      // Fetch movies  
      console.log("🔍 Fetching movies data...");
      const movieData = await getMovies({
        page: 0,
        size: 100,
        sortBy: "title",
        sortDirection: "asc",
      });
      console.log("🎬 Movies data received:", movieData);
      if (movieData?.content && Array.isArray(movieData.content)) {
        console.log("✅ Movies count:", movieData.content.length);
        setTotalMovies(movieData.content.length);
        const activeMovieCount = movieData.content.filter((movie: { status: string }) => 
          movie.status === 'NOW_SHOWING'
        ).length;
        console.log("✅ Active movies count:", activeMovieCount);
        setActiveMovies(activeMovieCount);

        // Calculate revenue and pricing data
        const moviesWithRevenue = movieData.content.filter((movie: MovieData) => movie.revenue || movie.price);
        const totalRev = moviesWithRevenue.reduce((sum: number, movie: MovieData) => 
          sum + (movie.revenue || movie.price || 0), 0
        );
        console.log("💰 Total revenue calculated:", totalRev);
        setTotalRevenue(totalRev);

        const moviesWithPrice = movieData.content.filter((movie: MovieData) => movie.price);
        const avgPrice = moviesWithPrice.length > 0 
          ? moviesWithPrice.reduce((sum: number, movie: MovieData) => sum + (movie.price || 0), 0) / moviesWithPrice.length
          : 0;
        console.log("💵 Average price calculated:", avgPrice);
        setAveragePrice(avgPrice);
      } else {
        console.log("⚠️ Movies data structure unexpected:", movieData);
      }

      // Fetch rooms
      console.log("🔍 Fetching rooms data...");
      const roomData = await getAllRooms(0, 100);
      console.log("🏢 Rooms data received:", roomData);
      if (roomData?.content && Array.isArray(roomData.content)) {
        console.log("✅ Rooms count:", roomData.content.length);
        setTotalRooms(roomData.content.length);
        const activeRoomCount = roomData.content.filter((room: { isActive: boolean }) => 
          room.isActive === true
        ).length;
        console.log("✅ Active rooms count:", activeRoomCount);
        setActiveRooms(activeRoomCount);
      } else {
        console.log("⚠️ Rooms data structure unexpected:", roomData);
      }

      // Fetch promotions
      console.log("🔍 Fetching promotions data...");
      const promotionData = await getAllPromotions({
        page: 0,
        size: 100,
        sortBy: "promotionName",
        sortDirection: "ASC",
      });
      console.log("🎁 Promotions data received:", promotionData);
      if (promotionData?.content && Array.isArray(promotionData.content)) {
        console.log("✅ Promotions count:", promotionData.content.length);
        setTotalPromotions(promotionData.content.length);
      } else {
        console.log("⚠️ Promotions data structure unexpected:", promotionData);
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-slate-700 text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount * 25000);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Cinema Management System Overview</p>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Members Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-100">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">Total Members</h3>
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50">
                  <TeamOutlined className="text-blue-500" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-semibold text-gray-900">{totalUsers !== null ? totalUsers.toLocaleString() : '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Movies Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-100">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">Movies</h3>
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50">
                  <VideoCameraOutlined className="text-green-500" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-semibold text-gray-900">{totalMovies !== null ? totalMovies.toLocaleString() : '—'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activeMovies !== null ? <span><span className="font-medium text-green-600">{activeMovies}</span> now showing</span> : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cinema Halls Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-100">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">Cinema Halls</h3>
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-50">
                  <HomeOutlined className="text-indigo-500" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-semibold text-gray-900">{totalRooms !== null ? totalRooms.toLocaleString() : '—'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activeRooms !== null ? <span><span className="font-medium text-indigo-600">{activeRooms}</span> operational</span> : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Promotions Card */}
          <div className="bg-white rounded-md shadow-sm border border-gray-100">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500">Promotions</h3>
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-50">
                  <GiftOutlined className="text-orange-500" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-semibold text-gray-900">{totalPromotions !== null ? totalPromotions.toLocaleString() : '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Financial Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Total Revenue */}
            <div className="bg-white rounded-md shadow-sm border border-gray-100">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50">
                    <DollarOutlined className="text-emerald-500" />
                  </div>
                </div>
                <div className="mt-1">
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalRevenue)}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs font-medium text-emerald-500">↑ +8.2%</span>
                    <span className="text-xs text-gray-500 ml-1">from last month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Average Ticket Price */}
            <div className="bg-white rounded-md shadow-sm border border-gray-100">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-500">Average Ticket Price</h3>
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-50">
                    <TagOutlined className="text-cyan-500" />
                  </div>
                </div>
                <div className="mt-1">
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(averagePrice)}</p>
                  <p className="text-xs text-gray-500 mt-1">Premium experience</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 