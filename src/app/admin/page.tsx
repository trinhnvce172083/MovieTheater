"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Filter
} from 'lucide-react';

// Real Analytics API
import { getDashboardSummary } from '@/api/admin/analytics';

// Analytics Components with Real Data
import RealDashboardCards from '@/components/analytics/RealDashboardCards';
import TopMovies from '@/components/analytics/TopMovies';
import RecentActivities from '@/components/analytics/RecentActivities';
import QuickActions from '@/components/analytics/QuickActions';
import QuickStats from '@/components/analytics/QuickStats';

// Existing Chart Components
import AppBarChart from '@/components/AppBarChart';
import AppLineChart from '@/components/AppLineChart';
import AppPieChart from '@/components/AppPieChart';

export default function AdminDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchDashboardData = useCallback(async () => {
    try {
      // API function already handles token internally via axios interceptor
      const result = await getDashboardSummary();
      if (result && result.overview) {
        console.log('✅ Dashboard data refreshed');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Cinema Management System - Overview and Analytics</p>
        </div>
      </div>

      {/* Dashboard Cards with Real Data */}
      <RealDashboardCards key={`cards-${refreshKey}`} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Data</span>
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Activities</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {/* Revenue Chart */}
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Revenue Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AppLineChart key={`revenue-${refreshKey}`} />
              </CardContent>
            </Card>

            {/* Top Movies */}
            <Card className="col-span-1">
              <TopMovies key={`movies-${refreshKey}`} />
            </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Booking Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Booking Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AppBarChart key={`booking-${refreshKey}`} />
              </CardContent>
            </Card>

            {/* Movie Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Movie Performance Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AppPieChart key={`performance-${refreshKey}`} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Detailed Revenue Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AppLineChart key={`analytics-revenue-${refreshKey}`} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Booking Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AppBarChart key={`analytics-booking-${refreshKey}`} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AppPieChart key={`analytics-performance-${refreshKey}`} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Tab - Simplified Tables */}
        <TabsContent value="data" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Top Movies with detailed data */}
            <Card>
              <TopMovies key={`movies-detail-${refreshKey}`} limit={10} />
            </Card>
            
            {/* Summary Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <QuickStats key={`quick-stats-${refreshKey}`} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <RecentActivities key={`activities-${refreshKey}`} limit={15} />
            </Card>
            
            <Card>
              <QuickActions onRefresh={handleRefresh} />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
