'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Users, 
  Film, 
  Calendar, 
  MapPin, 
  FileText, 
  Settings, 
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QuickActionsProps {
  onRefresh?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onRefresh }) => {
  const router = useRouter();

  const quickActions = [
    {
      title: 'Thêm phim mới',
      description: 'Thêm phim mới vào hệ thống',
      icon: <Plus className="w-5 h-5" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => router.push('/admin/movies/new')
    },
    {
      title: 'Quản lý người dùng',
      description: 'Xem và quản lý tài khoản người dùng',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => router.push('/admin/users')
    },
    {
      title: 'Tạo lịch chiếu',
      description: 'Tạo lịch chiếu mới cho phim',
      icon: <Calendar className="w-5 h-5" />,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => router.push('/admin/schedules/new')
    },
    {
      title: 'Quản lý phòng chiếu',
      description: 'Cấu hình phòng chiếu và ghế ngồi',
      icon: <MapPin className="w-5 h-5" />,
      color: 'bg-orange-600 hover:bg-orange-700',
      action: () => router.push('/admin/cinema-rooms')
    },
    {
      title: 'Báo cáo chi tiết',
      description: 'Xem báo cáo doanh thu và thống kê',
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      action: () => router.push('/admin/reports')
    },
    {
      title: 'Cài đặt hệ thống',
      description: 'Cấu hình và thiết lập hệ thống',
      icon: <Settings className="w-5 h-5" />,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: () => router.push('/admin/settings')
    }
  ];

  const utilityActions = [
    {
      title: 'Xuất dữ liệu',
      icon: <Download className="w-4 h-4" />,
      action: () => {
        // TODO: Implement export functionality
        console.log('Export data');
      }
    },
    {
      title: 'Nhập dữ liệu',
      icon: <Upload className="w-4 h-4" />,
      action: () => {
        // TODO: Implement import functionality
        console.log('Import data');
      }
    },
    {
      title: 'Làm mới',
      icon: <RefreshCw className="w-4 h-4" />,
      action: onRefresh || (() => window.location.reload())
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <Settings className="w-5 h-5 mr-2 text-blue-600" />
          Thao tác nhanh
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="group cursor-pointer"
              onClick={action.action}
            >
              <div className="p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-lg text-white ${action.color} group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 ml-11">
                  {action.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Utility Actions */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Tiện ích</h4>
          <div className="flex flex-wrap gap-2">
            {utilityActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={action.action}
                className="flex items-center space-x-2"
              >
                {action.icon}
                <span>{action.title}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium text-gray-900 mb-3">Truy cập nhanh</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Button
              variant="ghost"
              className="h-auto p-3 flex flex-col items-center space-y-1"
              onClick={() => router.push('/admin/movies')}
            >
              <Film className="w-5 h-5 text-purple-600" />
              <span className="text-xs">Phim</span>
            </Button>
            
            <Button
              variant="ghost"
              className="h-auto p-3 flex flex-col items-center space-y-1"
              onClick={() => router.push('/admin/bookings')}
            >
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-xs">Vé đặt</span>
            </Button>
            
            <Button
              variant="ghost"
              className="h-auto p-3 flex flex-col items-center space-y-1"
              onClick={() => router.push('/admin/users')}
            >
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-xs">Khách hàng</span>
            </Button>
            
            <Button
              variant="ghost"
              className="h-auto p-3 flex flex-col items-center space-y-1"
              onClick={() => router.push('/admin/analytics')}
            >
              <FileText className="w-5 h-5 text-orange-600" />
              <span className="text-xs">Báo cáo</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
