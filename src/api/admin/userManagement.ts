import axiosClient from "@/api/axiosClient";

export interface LockUserRequest {
  reason: string;
  lockHours: number;
  sendNotificationEmail: boolean;
  notes?: string;
}

export interface UserManagementResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  emailVerified: boolean;
  accountLockedUntil?: string;
  membershipLevel: string;
  membershipPoints: number;
  createdAt: string;
  updatedAt: string;
}

// Lock user account
export const lockUser = async (userId: number, lockData: LockUserRequest): Promise<UserManagementResponse> => {
  try {
    const response = await axiosClient.post(`/api/admin/users/${userId}/lock`, lockData);
    return response.data;
  } catch (error) {
    console.error('Lock user error:', error);
    throw error;
  }
};

// Unlock user account
export const unlockUser = async (userId: number): Promise<UserManagementResponse> => {
  try {
    const response = await axiosClient.post(`/api/admin/users/${userId}/unlock`);
    return response.data;
  } catch (error) {
    console.error('Unlock user error:', error);
    throw error;
  }
};

// Activate user account
export const activateUser = async (userId: number): Promise<UserManagementResponse> => {
  try {
    const response = await axiosClient.post(`/api/admin/users/${userId}/activate`);
    return response.data;
  } catch (error) {
    console.error('Activate user error:', error);
    throw error;
  }
};

// Deactivate user account
export const deactivateUser = async (userId: number): Promise<UserManagementResponse> => {
  try {
    const response = await axiosClient.post(`/api/admin/users/${userId}/deactivate`);
    return response.data;
  } catch (error) {
    console.error('Deactivate user error:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId: number): Promise<UserManagementResponse> => {
  try {
    const response = await axiosClient.get(`/api/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Get user by ID error:', error);
    throw error;
  }
};
