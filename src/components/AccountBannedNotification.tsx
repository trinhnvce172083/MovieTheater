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
  banReason = "Terms of service violation",
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
    if (!dateString) return "Permanent";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Permanent";
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
              Account Banned
            </div>
            {userName && (
              <div style={{ color: '#666', fontSize: '16px', fontWeight: 400, marginTop: '8px' }}>
                User: <strong>{userName}</strong>
              </div>
            )}
          </div>
        }
        subTitle={
          <div className="space-y-3">
            <Text className="block text-gray-600 text-base">
              Your account has been banned and you cannot continue using the service.
            </Text>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Text strong className="text-red-800 min-w-[80px]">Reason:</Text>
                <Text className="text-red-700">{banReason}</Text>
              </div>
              
              <div className="flex items-start gap-2">
                <Text strong className="text-red-800 min-w-[80px]">Duration:</Text>
                <Text className="text-red-700">{formatBanUntil(banUntil)}</Text>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Text className="text-blue-800 text-sm">
                <strong>Note:</strong> If you believe this is a mistake, please contact 
                customer support for resolution.
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
              Go to Homepage
            </Button>
            
            <Text type="secondary" className="text-sm">
              You will be redirected to the homepage and logged out of the system
            </Text>
          </div>
        }
      />
    </Modal>
  );
};

export default AccountBannedNotification;
