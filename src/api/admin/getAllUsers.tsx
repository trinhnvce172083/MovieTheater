import axiosClient from "../axiosClient";

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
  totalBookings: number;
  totalSpent: number;
  avatar?: string;
}

export interface UserSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  isActive?: boolean;
  role?: "ADMIN" | "EMPLOYEE" | "CUSTOMER";
  isVerified?: boolean;
  membershipLevel?: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  search?: string;
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

// Interface for creating/updating users - matches backend UserManagementRequest
export interface UserManagementRequest {
  username: string;
  password?: string; // Optional for updates
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  role: "ADMIN" | "EMPLOYEE" | "CUSTOMER";
  isActive?: boolean;
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

export const getAllUsers = async (params: UserSearchParams = {}): Promise<UsersResponse> => {
  try {
    console.log("Making API call to /admin/users");
    console.log("Base URL:", axiosClient.defaults.baseURL);
    
    const token = localStorage.getItem("accessToken") || 
                 localStorage.getItem("access_token") || 
                 localStorage.getItem("authToken") ||
                 sessionStorage.getItem("accessToken");
    
    console.log("Access token:", token ? "Present" : "Missing");
    if (token) {
      console.log("Token preview:", token.substring(0, 20) + "...");
    }
    
    // Build query parameters to match backend expectations
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.role) queryParams.append('role', params.role);
    if (params.isVerified !== undefined) queryParams.append('isVerified', params.isVerified.toString());
    if (params.membershipLevel) queryParams.append('membershipLevel', params.membershipLevel);
    if (params.search) queryParams.append('search', params.search);
    
    // Call the correct API endpoint
    const response = await axiosClient.get(`/admin/users?${queryParams.toString()}`);
    
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

// Create new user
export const createUser = async (userData: UserManagementRequest): Promise<ApiUser> => {
  try {
    console.log("Creating user with data:", userData);
    const response = await axiosClient.post("/admin/users", userData);
    console.log("Create user response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: any } };
      
      if (axiosError.response?.status === 409) {
        // Handle conflict error (duplicate username/email)
        const errorMessage = axiosError.response.data?.message || 
                           axiosError.response.data?.error || 
                           "Username or email already exists";
        throw new Error(errorMessage);
      } else if (axiosError.response?.status === 400) {
        // Handle validation error
        const errorMessage = axiosError.response.data?.message || 
                           axiosError.response.data?.error || 
                           "Invalid user data";
        throw new Error(errorMessage);
      }
    }
    
    throw error;
  }
};

// Update user
export const updateUser = async (userId: number, userData: UserManagementRequest): Promise<ApiUser> => {
  try {
    console.log("Updating user:", userId, userData);
    const response = await axiosClient.put(`/admin/users/${userId}`, userData);
    console.log("Update user response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (userId: number): Promise<void> => {
  try {
    console.log("🗑️ API: Deleting user with ID:", userId);
    const response = await axiosClient.delete(`/admin/users/${userId}`);
    console.log("✅ API: Delete response status:", response.status);
    console.log("✅ API: Delete response data:", response.data);
    
    // Check if the response indicates success
    if (response.status >= 200 && response.status < 300) {
      console.log("✅ API: User deleted successfully");
    } else {
      console.error("❌ API: Unexpected response status:", response.status);
      throw new Error(`Delete failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ API: Error deleting user:", error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { status: number; data: unknown } };
      console.error("❌ API: Delete error status:", axiosError.response.status);
      console.error("❌ API: Delete error data:", axiosError.response.data);
    }
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId: number): Promise<ApiUser> => {
  try {
    console.log("Getting user by ID:", userId);
    const response = await axiosClient.get(`/admin/users/${userId}`);
    console.log("Get user by ID response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
};

// Additional user management operations
export const activateUser = async (userId: number): Promise<ApiUser> => {
  try {
    const response = await axiosClient.post(`/admin/users/${userId}/activate`);
    return response.data;
  } catch (error) {
    console.error("Error activating user:", error);
    throw error;
  }
};

export const deactivateUser = async (userId: number): Promise<ApiUser> => {
  try {
    const response = await axiosClient.post(`/admin/users/${userId}/deactivate`);
    return response.data;
  } catch (error) {
    console.error("Error deactivating user:", error);
    throw error;
  }
};

export const resetUserPassword = async (userId: number, newPassword: string): Promise<ApiUser> => {
  try {
    const response = await axiosClient.post(`/admin/users/${userId}/reset-password`, {
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error("Error resetting user password:", error);
    throw error;
  }
};

export const getUserStatistics = async () => {
  try {
    const response = await axiosClient.get("/admin/users/statistics");
    return response.data;
  } catch (error) {
    console.log("Statistics API failed, using mock data", error);
    // Return mock statistics if API fails
    return {
      totalUsers: 3,
      activeUsers: 3,
      totalCustomers: 0,
      totalEmployees: 1,
      totalAdmins: 2,
      newUsersThisMonth: 0,
      lockedAccounts: 0,
      unverifiedAccounts: 0
    };
  }
};