"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Typography,
  Avatar,
  Spin,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import axiosClient from "@/api/axiosClient";

// Mock data for fallback display
const mockUserDetail: UserDetail = {
  accountId: 1,
  username: "demo_user",
  fullName: "Demo User",
  email: "demo@example.com",
  phoneNumber: "+1 (555) 123-4567",
  address: "123 Demo Street, Demo City, DC 12345",
  dateOfBirth: "1990-01-01",
  role: "USER",
  isActive: true,
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  avatar: undefined
};

// Transform API response to match UserDetail interface
const transformUserData = (userData: any): UserDetail => {
  return {
    accountId: userData.accountId || userData.id || 1,
    username: userData.username || "unknown",
    fullName: userData.fullName || userData.name || "Unknown User",
    email: userData.email || "unknown@example.com",
    phoneNumber: userData.phoneNumber || userData.phone,
    address: userData.address,
    dateOfBirth: userData.dateOfBirth || userData.birthDate,
    role: userData.role || "USER",
    isActive: userData.isActive !== undefined ? userData.isActive : true,
    createdAt: userData.createdAt || userData.created || new Date().toISOString(),
    updatedAt: userData.updatedAt || userData.updated,
    avatar: userData.avatar || userData.profilePicture
  };
};

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
      // Try to get user info from localStorage first (same as main page)
      const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        return {
          accountId: parsedUser.accountId || parsedUser.id || 4,
          role: parsedUser.role || 'ADMIN'
        };
      }
      
      // Fallback to API call
      const token = localStorage.getItem('accessToken');
      if (!token) {
        // Use fallback admin user (same as main page)
        return {
          accountId: 4,
          role: 'ADMIN'
        };
      }

      const response = await axiosClient.get('/auth/profile');
      return {
        accountId: response.data.accountId || 4,
        role: response.data.role || 'ADMIN'
      };
    } catch {
      // Return fallback admin user
      return {
        accountId: 4,
        role: 'ADMIN'
      };
    }
  };

  // Fetch user details
  const fetchUserDetail = async (id: string): Promise<UserDetail | null> => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('accessToken') || 
                   localStorage.getItem('access_token') || 
                   localStorage.getItem('authToken');

      if (!token) {
        return mockUserDetail;
      }

      const response = await axiosClient.get(`/admin/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.success) {
        const userData = response.data.data || response.data;
        const transformedUser = transformUserData(userData);
        return transformedUser;
      } else {
        return mockUserDetail;
      }
    } catch (error) {
      return mockUserDetail;
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUserAndDetail = async (targetUserId: string) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('accessToken') || 
                   localStorage.getItem('access_token') || 
                   localStorage.getItem('authToken');

      if (!token) {
        setUserDetail(mockUserDetail);
        return;
      }

      const [currentUserResponse, userDetailResponse] = await Promise.all([
        axiosClient.get('/admin/users/current', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axiosClient.get(`/admin/users/${targetUserId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (currentUserResponse.data?.success && userDetailResponse.data?.success) {
        const currentUserData = currentUserResponse.data.data || currentUserResponse.data;
        const userDetailData = userDetailResponse.data.data || userDetailResponse.data;
        
        const transformedUser = transformUserData(userDetailData);
        setUserDetail(transformedUser);
      } else {
        setUserDetail(mockUserDetail);
      }
    } catch (error) {
      setUserDetail(mockUserDetail);
    } finally {
      setLoading(false);
    }
  };

  // Load user details
  const loadUserDetail = async () => {
    const currentUserId = userId || "1"; // Fallback to ID 1 for testing
    
    if (!currentUserId) {
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
        fetchUserDetail(currentUserId)
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

      // Admins can view all users (including other admins)
      // No restriction on viewing - admins can see everyone's details
      setUserDetail(userDetailData);
      setIsUsingApiData(true);
    } catch (error) {
      console.error("❌ [MemberDetail] loadUserDetail error:", error);
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
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto px-8 py-12 max-w-6xl">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={handleBack}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-0 px-4 py-2"
                size="large"
              >
                Back
              </Button>
              <div className="pl-6 border-l border-gray-200">
                <Title level={1} className="!mb-2 text-gray-900 font-light tracking-tight text-3xl">
                  Member Profile
                </Title>
                <Text type="secondary" className="text-gray-500 text-base font-light">
                  Comprehensive member details and account information
                </Text>
              </div>
            </div>
            
            {!isUsingApiData && (
              <Alert
                message="Demo Mode"
                description="Viewing sample data"
                type="warning"
                showIcon
                className="!mb-0 border-amber-200 bg-amber-50/70"
              />
            )}
          </div>
        </div>

        {/* Main Profile Section */}
        <div className="grid grid-cols-12 gap-10 mb-12">
          {/* Profile Summary Card */}
          <div className="col-span-12 lg:col-span-4">
            <Card 
              className="text-center border-0 shadow-sm bg-white/80 backdrop-blur-sm" 
              styles={{ body: { padding: '40px 32px' } }}
            >
              <div className="mb-8">
                <div className="relative inline-block">
                  <Avatar
                    size={130}
                    src={userDetail.avatar}
                    icon={<UserOutlined />}
                    className="mx-auto border-4 border-white shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-500"
                  />
                  <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white ${
                    userDetail.isActive ? 'bg-emerald-400' : 'bg-red-400'
                  }`}></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Title level={2} className="!mb-2 text-gray-900 font-medium tracking-tight">
                    {userDetail.fullName}
                  </Title>
                  <Text type="secondary" className="text-gray-400 text-sm font-mono tracking-wide">
                    @{userDetail.username}
                  </Text>
                </div>
                
                <div className="py-4 space-y-3">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-50 text-gray-600 text-sm font-medium border border-gray-100">
                    {getRoleIcon(userDetail.role)}
                    <span className="ml-2 uppercase tracking-wider">{userDetail.role}</span>
                  </div>
                  
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${
                    userDetail.isActive 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {userDetail.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    <span className="ml-2 uppercase tracking-wider">{userDetail.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-100 text-sm text-gray-400 space-y-2">
                  <div className="font-mono">ID: #{userDetail.accountId}</div>
                  <div>Member since {formatDate(userDetail.createdAt)}</div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Detailed Information */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Contact Information */}
            <Card 
              title={
                <div className="flex items-center text-gray-700">
                  <MailOutlined className="mr-3 text-gray-400" />
                  <span className="font-medium tracking-wide">Contact Information</span>
                </div>
              } 
              className="border-0 shadow-sm bg-white/80 backdrop-blur-sm"
              styles={{ 
                header: { 
                  backgroundColor: 'transparent', 
                  borderBottom: '1px solid #f1f5f9',
                  padding: '24px 32px 16px 32px'
                },
                body: { padding: '32px' }
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Full Name
                    </label>
                    <div className="text-gray-900 font-medium text-lg">
                      {userDetail.fullName}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Email Address
                    </label>
                    <div className="text-gray-900 font-medium">
                      {userDetail.email}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Phone Number
                    </label>
                    <div className="text-gray-900 font-medium">
                      {userDetail.phoneNumber || <span className="text-gray-400 italic font-normal">Not provided</span>}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Username
                    </label>
                    <div className="text-gray-900 font-mono font-medium">
                      {userDetail.username}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Date of Birth
                    </label>
                    <div className="text-gray-900 font-medium">
                      {formatDate(userDetail.dateOfBirth)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Address
                    </label>
                    <div className="text-gray-900 font-medium">
                      {userDetail.address || <span className="text-gray-400 italic font-normal">Not provided</span>}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Account Details */}
            <Card 
              title={
                <div className="flex items-center text-gray-700">
                  <CrownOutlined className="mr-3 text-gray-400" />
                  <span className="font-medium tracking-wide">Account Details</span>
                </div>
              }
              className="border-0 shadow-sm bg-white/80 backdrop-blur-sm"
              styles={{ 
                header: { 
                  backgroundColor: 'transparent', 
                  borderBottom: '1px solid #f1f5f9',
                  padding: '24px 32px 16px 32px'
                },
                body: { padding: '32px' }
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Account Status
                    </label>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${
                      userDetail.isActive 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {userDetail.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                      <span className="ml-2 uppercase tracking-wider">{userDetail.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Member Since
                    </label>
                    <div className="text-gray-900 font-medium">
                      {formatDate(userDetail.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Role & Permissions
                    </label>
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-50 text-gray-600 text-sm font-medium border border-gray-100">
                      {getRoleIcon(userDetail.role)}
                      <span className="ml-2 uppercase tracking-wider">{userDetail.role}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Last Updated
                    </label>
                    <div className="text-gray-900 font-medium">
                      {formatDateTime(userDetail.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-xl p-8">
          <div className="flex justify-between items-center">
            <div className="text-gray-500 text-sm">
              Last viewed: {new Date().toLocaleString()}
            </div>
            
            <div className="flex space-x-4">
              <Button 
                size="large"
                onClick={handleBack}
                className="px-8 h-12 text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-700 font-medium"
              >
                Close
              </Button>
              
              <Button 
                type="primary" 
                size="large"
                onClick={() => router.push(`/admin/members?edit=${userDetail.accountId}`)}
                disabled={!isUsingApiData}
                className="px-8 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-sm font-medium"
              >
                Edit Member
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailPage;
