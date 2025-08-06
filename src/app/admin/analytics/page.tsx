'use client';

import React, { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  RefreshCw,
  Download,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';

// Analytics Components
import DashboardCards from '@/components/analytics/DashboardCards';
import TopMovies from '@/components/analytics/TopMovies';
import RecentActivities from '@/components/analytics/RecentActivities';
import QuickActions from '@/components/analytics/QuickActions';

// Existing Chart Components
import AppBarChart from '@/components/AppBarChart';
import AppLineChart from '@/components/AppLineChart';
import AppPieChart from '@/components/AppPieChart';

const AnalyticsDashboard: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCompactView, setIsCompactView] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleExportData = () => {
    // TODO: Implement export functionality
    console.log('Exporting analytics data...');
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Tổng quan doanh thu và hiệu suất rạp chiếu phim</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCompactView(!isCompactView)}
            className="flex items-center space-x-2"
          >
            {isCompactView ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{isCompactView ? 'Mở rộng' : 'Thu gọn'}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Xuất dữ liệu</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <DashboardCards key={`cards-${refreshKey}`} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Tổng quan</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Doanh thu</span>
          </TabsTrigger>
          <TabsTrigger value="movies" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Phim</span>
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Hoạt động</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className={`grid gap-6 ${isCompactView ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}`}>
            {/* Revenue Chart */}
            <Card className={isCompactView ? 'col-span-1' : 'col-span-1 lg:col-span-2'}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Biểu đồ doanh thu
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

          <div className={`grid gap-6 ${isCompactView ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
            {/* Booking Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Thống kê đặt vé
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
                  Phân phối hiệu suất phim
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AppPieChart key={`performance-${refreshKey}`} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Chi tiết doanh thu theo thời gian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AppLineChart key={`revenue-detail-${refreshKey}`} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Doanh thu theo đặt vé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AppBarChart key={`revenue-booking-${refreshKey}`} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Phân bố doanh thu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AppPieChart key={`revenue-distribution-${refreshKey}`} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Movies Tab */}
        <TabsContent value="movies" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <TopMovies key={`movies-detail-${refreshKey}`} limit={10} />
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Hiệu suất phim
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AppPieChart key={`movie-performance-${refreshKey}`} />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                So sánh doanh thu phim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AppBarChart key={`movie-comparison-${refreshKey}`} />
            </CardContent>
          </Card>
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
};

export default AnalyticsDashboard;
