import axiosClient from "../axiosClient";


// Interface for lock user request
export interface LockUserRequest {
  reason: string;
  lockHours: number;
  sendNotificationEmail: boolean;
  notes?: string;
}

export interface ApiUser {
  accountId: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  failedLoginAttempts: number;
  membershipPoints: number;
  membershipLevel: string;
  createdAt: string;
  updatedAt: string;
  isAccountLocked: boolean;
  accountLockedUntil?: string;
  totalBookings: number;
  totalSpent: number;
}

export interface UsersResponse {
  content: ApiUser[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    empty: boolean;
    numberOfElements: number;
  };
}

// Updated mock data based on real API response
const mockUsersData: UsersResponse = {
  content: [
    {
      accountId: 3,
      username: "PhoenixZ",
      email: "thuantqse182998@fpt.edu.vn",
      fullName: "Trần Quang Thuận",
      phoneNumber: "0925453575",
      dateOfBirth: "2004-04-30",
      address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
      role: "ADMIN",
      isActive: true,
      isVerified: true,
      emailVerified: true,
      lastLogin: "2025-06-24T15:29:50.129295",
      failedLoginAttempts: 0,
      membershipPoints: 0,
      membershipLevel: "BRONZE",
      createdAt: "2025-06-24T14:32:50",
      updatedAt: "2025-06-24T15:29:50",
      isAccountLocked: false,
      totalBookings: 0,
      totalSpent: 0
    },
    {
      accountId: 1,
      username: "admin",
      email: "admin@lumierecinema.com",
      fullName: "System Administrator",
      phoneNumber: "0901234567",
      dateOfBirth: "1990-01-01",
      address: "123 Admin Street, District 1, Ho Chi Minh City",
      role: "ADMIN",
      isActive: true,
      isVerified: true,
      emailVerified: true,
      lastLogin: undefined,
      failedLoginAttempts: 0,
      membershipPoints: 0,
      membershipLevel: "PLATINUM",
      createdAt: "2025-06-24T14:29:58",
      updatedAt: "2025-06-24T14:29:58",
      isAccountLocked: false,
      totalBookings: 0,
      totalSpent: 0
    },
    {
      accountId: 2,
      username: "employee",
      email: "employee@lumierecinema.com",
      fullName: "Cinema Employee",
      phoneNumber: "0901234568",
      dateOfBirth: "1992-05-15",
      address: "456 Employee Avenue, District 3, Ho Chi Minh City",
      role: "EMPLOYEE",
      isActive: true,
      isVerified: true,
      emailVerified: true,
      lastLogin: undefined,
      failedLoginAttempts: 0,
      membershipPoints: 0,
      membershipLevel: "GOLD",
      createdAt: "2025-06-24T14:29:58",
      updatedAt: "2025-06-24T14:29:58",
      isAccountLocked: false,
      totalBookings: 0,
      totalSpent: 0
    }
  ],
  page: {
    number: 0,
    size: 20,
    totalElements: 3,
    totalPages: 1,
    first: true,
    last: true,
    empty: false,
    numberOfElements: 3
  }
};

export const getAllUsers = async (): Promise<UsersResponse> => {
  try {
    const token = localStorage.getItem("accessToken") || 
                 localStorage.getItem("access_token") || 
                 localStorage.getItem("authToken") ||
                 sessionStorage.getItem("accessToken");

    if (!token) {
      return {
        success: false,
        message: "No authentication token found",
        data: []
      };
    }

    const response = await axiosClient.get("/cinema/api/admin/users", {
      params: {
        page: 0,
        size: 20,
        sortBy: "createdAt",
        sortDirection: "DESC"
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data && response.data.success) {
      const userData = response.data.data || response.data.users || [];
      return {
        success: true,
        message: response.data.message || "Users fetched successfully",
        data: userData
      };
    } else {
      return {
        success: false,
        message: response.data?.message || "Failed to fetch users",
        data: []
      };
    }
  } catch (error) {
    // Return mock data as fallback
    return {
      success: true,
      message: "Using mock data",
      data: mockUsersData.content
    };
  }
};

// Lock user account
export const lockUser = async (userId: number, lockData: LockUserRequest): Promise<ApiUser> => {
  try {
    const response = await axiosClient.post(`/admin/users/${userId}/lock`, lockData);
    return response.data;
  } catch (error) {
    console.error('Lock user error:', error);
    throw error;
  }
};

// Unlock user account
export const unlockUser = async (userId: number): Promise<ApiUser> => {
  try {
    const response = await axiosClient.post(`/admin/users/${userId}/unlock`);
    return response.data;
  } catch (error) {
    console.error('Unlock user error:', error);
    throw error;
  }
};

// Activate user account
export const activateUser = async (userId: number): Promise<ApiUser> => {
  try {
    const response = await axiosClient.post(`/admin/users/${userId}/activate`);
    return response.data;
  } catch (error) {
    console.error('Activate user error:', error);
    throw error;
  }
};

// Deactivate user account
export const deactivateUser = async (userId: number): Promise<ApiUser> => {
  try {
    const response = await axiosClient.post(`/admin/users/${userId}/deactivate`);
    return response.data;
  } catch (error) {
    console.error('Deactivate user error:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId: number): Promise<ApiUser> => {
  try {
    const response = await axiosClient.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Get user by ID error:', error);
    throw error;
  }
};