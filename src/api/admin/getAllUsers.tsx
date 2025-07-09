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
    console.log("Making API call to /cinema/api/admin/users");
    console.log("Base URL:", axiosClient.defaults.baseURL);
    
    const token = localStorage.getItem("accessToken") || 
                 localStorage.getItem("access_token") || 
                 localStorage.getItem("authToken") ||
                 sessionStorage.getItem("accessToken");
    
    console.log("Access token:", token ? "Present" : "Missing");
    if (token) {
      console.log("Token source:",
        localStorage.getItem("accessToken") ? "localStorage(accessToken)" :
        localStorage.getItem("access_token") ? "localStorage(access_token)" :
        localStorage.getItem("authToken") ? "localStorage(authToken)" :
        sessionStorage.getItem("accessToken") ? "sessionStorage(accessToken)" :
        "Unknown"
      );
      console.log("Token preview:", token.substring(0, 20) + "...");
    }
    
    // Always try the API call first, regardless of token presence
    const response = await axiosClient.get("/admin/users", {
      params: {
        page: 0,
        size: 20,
        sortBy: "createdAt",
        sortDirection: "DESC"
      }
    });
    
    console.log("✅ API call successful!");
    console.log("getAllUsers API Response:", response.data);
    console.log("Response status:", response.status);
    return response.data;
  } catch (error) {
    console.error("❌ API call failed:");
    console.error("Error in getAllUsers:", error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: unknown } };
      console.error("Response status:", axiosError.response?.status);
      console.error("Response data:", axiosError.response?.data);
      
      // Handle specific error cases
      if (axiosError.response?.status === 401) {
        console.error("Authentication failed - user needs to log in");
      } else if (axiosError.response?.status === 403) {
        console.error("Authorization failed - user doesn't have admin permissions");
      }
    }
    
    // Return mock data as fallback for any error
    console.log("🔄 API failed, returning mock data as fallback");
    return mockUsersData;
  }
};

// Lock user account
export const lockUser = async (userId: number, lockData: LockUserRequest): Promise<ApiUser> => {
  try {
    const response = await axiosClient.post(`/api/admin/users/${userId}/lock`, lockData);
    return response.data;
  } catch (error) {
    console.error('Lock user error:', error);
    throw error;
  }
};

// Unlock user account
export const unlockUser = async (userId: number): Promise<ApiUser> => {
  try {
    const response = await axiosClient.post(`/api/admin/users/${userId}/unlock`);
    return response.data;
  } catch (error) {
    console.error('Unlock user error:', error);
    throw error;
  }
};

// Activate user account
export const activateUser = async (userId: number): Promise<ApiUser> => {
  try {
    const response = await axiosClient.post(`/api/admin/users/${userId}/activate`);
    return response.data;
  } catch (error) {
    console.error('Activate user error:', error);
    throw error;
  }
};

// Deactivate user account
export const deactivateUser = async (userId: number): Promise<ApiUser> => {
  try {
    const response = await axiosClient.post(`/api/admin/users/${userId}/deactivate`);
    return response.data;
  } catch (error) {
    console.error('Deactivate user error:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId: number): Promise<ApiUser> => {
  try {
    const response = await axiosClient.get(`/api/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Get user by ID error:', error);
    throw error;
  }
};