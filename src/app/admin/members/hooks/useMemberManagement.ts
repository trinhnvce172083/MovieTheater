import { useState, useEffect, useMemo } from 'react';
import { message } from 'antd';
import { getAllUsers, lockUser, unlockUser, activateUser, deactivateUser } from '@/api/admin/getAllUsers';
import axiosClient from '@/api/axiosClient';
import { 
  MemberData, 
  MemberCreateRequest, 
  ApiErrorResponse, 
  MemberStatistics,
  CurrentUser,
  MemberFilters,
  PaginationState
} from '../types';
import { 
  transformApiUserToMemberData, 
  getCurrentUserFromStorage, 
  checkAuthToken,
  validateEmail,
  validateUsername
} from '../utils/memberUtils';

export const useMemberManagement = () => {
  // State management
  const [memberData, setMemberData] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [isUsingApiData, setIsUsingApiData] = useState(true);

  // Filters and pagination
  const [filters, setFilters] = useState<MemberFilters>({
    searchTerm: "",
    filterStatus: "",
    filterType: ""
  });
  
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 10
  });

  // Initialize auth and user data
  useEffect(() => {
    const hasToken = checkAuthToken();
    setShowAuthWarning(!hasToken);
    
    if (hasToken) {
      setCurrentUser(getCurrentUserFromStorage());
    }
  }, []);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();

      if (!response || !response.content || !Array.isArray(response.content)) {
        setMemberData([]);
        return;
      }

      const transformedData: MemberData[] = response.content.map(transformApiUserToMemberData);
      setMemberData(transformedData || []);
      setIsUsingApiData(true);
    } catch (error) {
      message.warning("Using sample data - please check your connection or login status");
      setMemberData([]);
      setIsUsingApiData(false);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter and search logic
  const filteredData = useMemo(() => {
    try {
      if (!memberData || !Array.isArray(memberData)) {
        return [];
      }

      return memberData.filter((member) => {
        try {
          if (!member) return false;

          // Hide inactive (soft deleted) members unless explicitly filtering
          const isActiveOrExplicitlyFilteringInactive = 
            member.status === 'active' || filters.filterStatus === 'inactive';
          if (!isActiveOrExplicitlyFilteringInactive) return false;

          const matchesSearch = !filters.searchTerm ||
            (member.name && member.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
            (member.email && member.email.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
            (member.id && member.id.toLowerCase().includes(filters.searchTerm.toLowerCase()));

          const matchesStatus = !filters.filterStatus || member.status === filters.filterStatus;
          const matchesType = !filters.filterType || member.type === filters.filterType;

          return matchesSearch && matchesStatus && matchesType;
        } catch (error) {
          return false;
        }
      });
    } catch (error) {
      return [];
    }
  }, [filters.searchTerm, filters.filterStatus, filters.filterType, memberData]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, pagination.currentPage, pagination.pageSize]);

  // Reset current page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [filters.searchTerm, filters.filterStatus, filters.filterType]);

  // Statistics calculations
  const statistics: MemberStatistics = useMemo(() => {
    try {
      const activeMembers = memberData?.filter(m => m.status === "active")?.length || 0;
      const totalMembers = activeMembers;

      const newMembers = memberData?.filter((m) => {
        try {
          if (m.status !== 'active') return false;
          const join = new Date(m.joinDate);
          const now = new Date();
          return (
            join.getMonth() === now.getMonth() &&
            join.getFullYear() === now.getFullYear()
          );
        } catch (error) {
          return false;
        }
      })?.length || 0;

      const types = memberData?.reduce((acc: Record<string, number>, m) => {
        try {
          if (m.status === 'active') {
            acc[m.type] = (acc[m.type] || 0) + 1;
          }
          return acc;
        } catch (error) {
          return acc;
        }
      }, {}) || {};

      return { totalMembers, activeMembers, newMembers, types };
    } catch (error) {
      return { totalMembers: 0, activeMembers: 0, newMembers: 0, types: {} };
    }
  }, [memberData]);

  // CRUD Operations
  const createMember = async (memberData: MemberCreateRequest): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Validation
      if (!memberData.fullName || !memberData.email || !memberData.username) {
        message.error('Please fill in all required fields: Full Name, Email, and Username');
        return false;
      }
      
      if (!validateEmail(memberData.email)) {
        message.error('Please enter a valid email address');
        return false;
      }
      
      if (!validateUsername(memberData.username)) {
        message.error('Username can only contain letters, numbers, and underscores');
        return false;
      }
      
      const payload = {
        username: memberData.username.trim(),
        fullName: memberData.fullName.trim(),
        email: memberData.email.trim().toLowerCase(),
        password: memberData.password || undefined,
        phoneNumber: memberData.phoneNumber?.trim() || undefined,
        address: memberData.address?.trim() || undefined,
        dateOfBirth: memberData.dateOfBirth || undefined,
        role: (memberData.role?.toUpperCase() || 'MEMBER') as 'ADMIN' | 'EMPLOYEE' | 'MEMBER' | 'CUSTOMER',
        isActive: memberData.isActive !== false,
      };

      console.log('Sending payload:', payload);
      const response = await axiosClient.post('/admin/users', payload);
      console.log('Create response:', response.data);
      message.success('Member created successfully');
      await fetchUsers();
      return true;
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateMember = async (id: string, memberData: MemberCreateRequest): Promise<boolean> => {
    try {
      setLoading(true);
      await axiosClient.put(`/admin/users/${id}`, memberData);
      message.success("Member updated successfully");
      await fetchUsers();
      return true;
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (id: string, name: string): Promise<boolean> => {
    try {
      setLoading(true);
      await axiosClient.delete(`/admin/users/${id}`);
      message.success(`Deleted member "${name}" successfully`);
      await fetchUsers();
      return true;
    } catch (error) {
      handleApiError(error as ApiErrorResponse);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error: ApiErrorResponse) => {
    if (error && typeof error === "object" && "response" in error) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      
      switch (status) {
        case 400:
          message.error('Validation error. Please check all required fields are filled correctly.');
          break;
        case 401:
          message.error('Authentication failed. Please login again.');
          break;
        case 403:
          message.error('Access denied. You may not have admin permissions.');
          break;
        case 409:
          let conflictMessage = 'A member with this information already exists.';
          if (errorData && typeof errorData === 'object' && 'message' in errorData) {
            const message = (errorData as { message: string }).message;
            if (message.includes('email')) {
              conflictMessage = 'A member with this email address already exists.';
            } else if (message.includes('username')) {
              conflictMessage = 'A member with this username already exists.';
            } else {
              conflictMessage = message;
            }
          }
          message.error(conflictMessage);
          break;
        case 422:
          message.error('Invalid data format. Please check your input.');
          break;
        case 500:
          message.error('Server error. Please try again later.');
          break;
        default:
          message.error(`Failed to process request: ${status || 'Unknown error'}`);
      }
    } else {
      message.error('Failed to process request. Please check your network connection.');
    }
  };

  // Lock user function
  const lockUserAccount = async (userId: string, lockDurationHours: number, reason: string, sendNotificationEmail: boolean = true): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Locking user with data:', {
        userId: parseInt(userId),
        lockData: {
          reason,
          lockHours: lockDurationHours,
          sendNotificationEmail,
          notes: `Locked by admin: ${reason}`
        }
      });
      
      const lockData = {
        reason,
        lockHours: lockDurationHours,
        sendNotificationEmail,
        notes: `Locked by admin: ${reason}`
      };
      
      await lockUser(parseInt(userId), lockData);
      message.success('User locked successfully');
      await fetchUsers(); // Refresh data
      return true;
    } catch (error: unknown) {
      console.error('Lock user error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data?: { message?: string }; status: number } };
        console.error('Error response:', axiosError.response.data);
        console.error('Error status:', axiosError.response.status);
        message.error(`Failed to lock user: ${axiosError.response.data?.message || axiosError.response.status}`);
      } else {
        message.error('Failed to lock user: Network or server error');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Unlock user function
  const unlockUserAccount = async (userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await unlockUser(parseInt(userId));
      message.success('User unlocked successfully');
      await fetchUsers(); // Refresh data
      return true;
    } catch (error) {
      message.error('Failed to unlock user');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Activate user function
  const activateUserAccount = async (userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await activateUser(parseInt(userId));
      message.success('User activated successfully');
      await fetchUsers(); // Refresh data
      return true;
    } catch (error) {
      message.error('Failed to activate user');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Deactivate user function
  const deactivateUserAccount = async (userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await deactivateUser(parseInt(userId));
      message.success('User deactivated successfully');
      await fetchUsers(); // Refresh data
      return true;
    } catch (error) {
      message.error('Failed to deactivate user');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    // Data
    memberData,
    filteredData,
    paginatedData,
    statistics,
    currentUser,
    
    // State
    loading,
    showAuthWarning,
    isUsingApiData,
    filters,
    pagination,
    
    // Actions
    setFilters,
    setPagination,
    fetchUsers,
    createMember,
    updateMember,
    deleteMember,
    lockUserAccount,
    unlockUserAccount,
    activateUserAccount,
    deactivateUserAccount,
  };
};
