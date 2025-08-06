'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Film, Calendar, CreditCard, Settings } from 'lucide-react';
import { getDashboardSummary } from '@/api/admin/analytics';

interface RecentActivitiesProps {
  limit?: number;
}

interface RecentActivity {
  type: string;
  message: string;
  timestamp: string;
  user: string;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ limit = 10 }) => {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        console.log('🔄 Fetching recent activities...');
        
        const response = await getDashboardSummary();
        
        if (response?.recentActivities) {
          // Map API data to component structure
          const mappedActivities = response.recentActivities.slice(0, limit).map(activity => ({
            type: activity.type,
            message: activity.title || activity.description,
            timestamp: activity.activityDate,
            user: activity.customerName || 'System'
          }));
          setActivities(mappedActivities);
          console.log('✅ Recent activities loaded from API');
        } else {
          console.warn('⚠️ No recent activities from API, using mock data');
          // Fallback mock activities nếu không có data
          const mockActivities: RecentActivity[] = [
            {
              type: 'booking',
              message: 'Khách hàng đặt vé phim "Top Gun: Maverick"',
              timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
              user: 'Nguyễn Văn A'
            },
            {
              type: 'movie',
              message: 'Thêm phim mới "Spider-Man: No Way Home"',
              timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              user: 'Admin'
            },
            {
              type: 'user',
              message: 'Khách hàng mới đăng ký thành viên',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              user: 'Trần Thị B'
            }
          ];
          setActivities(mockActivities.slice(0, limit));
        }
      } catch (error) {
        console.error('Failed to fetch recent activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, [limit]);

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'booking':
      case 'book':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'movie':
      case 'film':
        return <Film className="w-4 h-4 text-purple-600" />;
      case 'payment':
      case 'pay':
        return <CreditCard className="w-4 h-4 text-green-600" />;
      case 'user':
      case 'customer':
        return <User className="w-4 h-4 text-orange-600" />;
      case 'system':
      case 'admin':
        return <Settings className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'booking':
      case 'book':
        return 'bg-blue-100 text-blue-800';
      case 'movie':
      case 'film':
        return 'bg-purple-100 text-purple-800';
      case 'payment':
      case 'pay':
        return 'bg-green-100 text-green-800';
      case 'user':
      case 'customer':
        return 'bg-orange-100 text-orange-800';
      case 'system':
      case 'admin':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Vừa xong';
      if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} giờ trước`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} ngày trước`;
      
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'Không xác định';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          Hoạt động gần đây
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                {/* Activity Icon */}
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getActivityBadgeColor(activity.type)}`}
                    >
                      {activity.type}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-900 mb-1">
                    {activity.message}
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <User className="w-3 h-3 mr-1" />
                    <span>{activity.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Không có hoạt động gần đây</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
