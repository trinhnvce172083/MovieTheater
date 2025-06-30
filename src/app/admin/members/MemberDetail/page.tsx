"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Space,
  Typography,
  Avatar,
  Descriptions,
  Tag,
  Row,
  Col,
  Spin,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  HomeOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import axiosClient from "@/api/axiosClient";


const { Title, Text } = Typography;

// Interface for detailed user data
interface UserDetail {
  accountId: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  avatar?: string;
}

// Interface for current user info (to check if viewing admin)
interface CurrentUser {
  accountId: number;
  role: string;
}

const MemberDetailPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
    const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isUsingApiData, setIsUsingApiData] = useState(false);

  // Fetch current user info to check permissions
  const fetchCurrentUser = async (): Promise<CurrentUser | null> => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axiosClient.get('/auth/profile');
      return {
        accountId: response.data.accountId,
        role: response.data.role
      };
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      return null;
    }
  };

  // Fetch user details
  const fetchUserDetail = async (id: string): Promise<UserDetail | null> => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axiosClient.get(`/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        return {
          accountId: response.data.accountId,
          username: response.data.username || 'N/A',
          fullName: response.data.fullName || 'N/A',
          email: response.data.email || 'N/A',
          phoneNumber: response.data.phoneNumber,
          address: response.data.address,
          dateOfBirth: response.data.dateOfBirth,
          role: response.data.role || 'CUSTOMER',
          isActive: response.data.isActive !== false,
          createdAt: response.data.createdAt || new Date().toISOString(),
          updatedAt: response.data.updatedAt,
          avatar: response.data.avatar
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch user detail:', error);
      throw error;
    }
  };

  // Load user details
  const loadUserDetail = async () => {
    if (!userId) {
      setError("User ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      // Fetch both current user and target user details
      const [currentUserData, userDetailData] = await Promise.all([
        fetchCurrentUser(),
        fetchUserDetail(userId)
      ]);

      if (!currentUserData) {
        setError("Failed to authenticate. Please login again.");
        setLoading(false);
        return;
      }

      if (!userDetailData) {
        setError("User not found");
        setLoading(false);
        return;
      }

      // Check if trying to view admin details (admins cannot view other admins)
      if (userDetailData.role === 'ADMIN' && currentUserData.accountId !== userDetailData.accountId) {
        setError("You cannot view details of other administrators");
        setLoading(false);
        return;
      }      // Store current user and user detail data
      setUserDetail(userDetailData);
      setIsUsingApiData(true);
    } catch (error: unknown) {
      console.error('Error loading user detail:', error);
      setError("Failed to load user details. Please try again.");
      setIsUsingApiData(false);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadUserDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleBack = () => {
    router.push('/admin/members');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'red';
      case 'staff':
        return 'blue';
      case 'vip':
        return 'gold';
      case 'customer':
      default:
        return 'green';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <CrownOutlined />;
      default:
        return <UserOutlined />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Button 
            type="default" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            className="mb-4"
          >
            Back to Members
          </Button>
        </div>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={loadUserDetail}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!userDetail) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Button 
            type="default" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            className="mb-4"
          >
            Back to Members
          </Button>
        </div>
        <Alert
          message="User Not Found"
          description="The requested user could not be found."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            type="default" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
          >
            Back to Members
          </Button>
          <Title level={3} className="!mb-0">
            Member Details
          </Title>
        </div>
        
        {!isUsingApiData && (
          <Alert
            message="Demo Mode"
            description="Real-time data not available"
            type="info"
            showIcon
            className="!mb-0"
          />
        )}
      </div>

      {/* User Profile Card */}
      <Card className="shadow-sm">
        <Row gutter={24}>
          <Col xs={24} sm={6} className="text-center mb-4 sm:mb-0">
            <Avatar
              size={120}
              src={userDetail.avatar}
              icon={<UserOutlined />}
              className="mb-4"
            />
            <div>
              <Title level={4} className="!mb-1">
                {userDetail.fullName}
              </Title>
              <Text type="secondary">@{userDetail.username}</Text>
              <div className="mt-2">
                <Tag 
                  icon={getRoleIcon(userDetail.role)} 
                  color={getRoleColor(userDetail.role)}
                  className="text-sm"
                >
                  {userDetail.role}
                </Tag>
              </div>
              <div className="mt-2">
                <Tag 
                  icon={userDetail.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  color={userDetail.isActive ? 'success' : 'error'}
                >
                  {userDetail.isActive ? 'Active' : 'Inactive'}
                </Tag>
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={18}>
            <Descriptions 
              title="Personal Information" 
              bordered 
              column={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}
              size="middle"
            >
              <Descriptions.Item label={<><UserOutlined /> Full Name</>}>
                {userDetail.fullName}
              </Descriptions.Item>
              <Descriptions.Item label={<><UserOutlined /> Username</>}>
                {userDetail.username}
              </Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined /> Email</>}>
                {userDetail.email}
              </Descriptions.Item>
              <Descriptions.Item label={<><PhoneOutlined /> Phone</>}>
                {userDetail.phoneNumber || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label={<><HomeOutlined /> Address</>} span={2}>
                {userDetail.address || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label={<><CalendarOutlined /> Date of Birth</>}>
                {formatDate(userDetail.dateOfBirth)}
              </Descriptions.Item>
              <Descriptions.Item label="Account ID">
                #{userDetail.accountId}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* Account Information Card */}
      <Card title="Account Information" className="shadow-sm">
        <Descriptions 
          bordered 
          column={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}
          size="middle"
        >
          <Descriptions.Item label="Account Status">
            <Tag 
              icon={userDetail.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              color={userDetail.isActive ? 'success' : 'error'}
            >
              {userDetail.isActive ? 'Active' : 'Inactive'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Role">
            <Tag 
              icon={getRoleIcon(userDetail.role)} 
              color={getRoleColor(userDetail.role)}
            >
              {userDetail.role}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Member Since">
            {formatDate(userDetail.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {formatDateTime(userDetail.updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Space>
          <Button onClick={handleBack}>
            Close
          </Button>
          <Button 
            type="primary" 
            onClick={() => router.push(`/admin/members?edit=${userDetail.accountId}`)}
            disabled={!isUsingApiData}
          >
            Edit Member
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default MemberDetailPage;
