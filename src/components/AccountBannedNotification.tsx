"use client";

import React from 'react';
import { Modal, Result, Button, Typography } from 'antd';
import { ExclamationCircleOutlined, HomeOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';

const { Text } = Typography;

interface AccountBannedNotificationProps {
  visible: boolean;
  banReason?: string;
  banUntil?: string;
  userName?: string;
  onClose?: () => void;
}

export const AccountBannedNotification: React.FC<AccountBannedNotificationProps> = ({
  visible,
  banReason = "Vi phạm điều khoản sử dụng",
  banUntil,
  userName,
  onClose
}) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Clear all auth data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('isLoggedIn');
      
      // Clear Redux state
      dispatch(logout());
      
      // Redirect to login
      router.push('/auth/login');
    } catch (error) {
      // Even if logout fails, clear local data and redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('isLoggedIn');
      dispatch(logout());
      router.push('/auth/login');
    }
  };

  const formatBanUntil = (dateString?: string) => {
    if (!dateString) return "Vô thời hạn";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Vô thời hạn";
    }
  };

  return (
    <Modal
      open={visible}
      closable={false}
      footer={null}
      width={500}
      maskClosable={false}
      keyboard={false}
      centered
      className="account-banned-modal"
    >
      <Result
        icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
        title={
          <div className="text-center">
            <div style={{ color: '#ff4d4f', fontSize: '24px', fontWeight: 600 }}>
              Tài khoản đã bị khóa
            </div>
            {userName && (
              <div style={{ color: '#666', fontSize: '16px', fontWeight: 400, marginTop: '8px' }}>
                Người dùng: <strong>{userName}</strong>
              </div>
            )}
          </div>
        }
        subTitle={
          <div className="space-y-3">
            <Text className="block text-gray-600 text-base">
              Tài khoản của bạn đã bị khóa và không thể tiếp tục sử dụng dịch vụ.
            </Text>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Text strong className="text-red-800 min-w-[80px]">Lý do:</Text>
                <Text className="text-red-700">{banReason}</Text>
              </div>
              
              <div className="flex items-start gap-2">
                <Text strong className="text-red-800 min-w-[80px]">Thời hạn:</Text>
                <Text className="text-red-700">{formatBanUntil(banUntil)}</Text>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Text className="text-blue-800 text-sm">
                <strong>Lưu ý:</strong> Nếu bạn cho rằng đây là sự nhầm lẫn, vui lòng liên hệ 
                với bộ phận hỗ trợ khách hàng để được giải quyết.
              </Text>
            </div>
          </div>
        }
        extra={
          <div className="flex flex-col gap-3 mt-6">
            <Button
              type="primary"
              size="large"
              icon={<HomeOutlined />}
              onClick={handleLogout}
              className="bg-blue-600 hover:bg-blue-700 border-0"
            >
              Về trang chủ
            </Button>
            
            <Text type="secondary" className="text-sm">
              Bạn sẽ được chuyển về trang chủ và đăng xuất khỏi hệ thống
            </Text>
          </div>
        }
      />
    </Modal>
  );
};

export default AccountBannedNotification;
