import { ApiUser, MemberData } from '../types';

/**
 * Transform API   const token = localStorage.getItem("accessToken") ||
               localStorage.getItem('access_token') ||
               localStorage.getItem('authToken') ||
               sessionStorage.getItem('accessToken');
  
  if (token) {
    return true;
  }e display format
 */
export const transformApiUserToMemberData = (user: unknown, index: number): MemberData => {
  try {
    const userObj = user as ApiUser;
    return {
      key: userObj.accountId ? userObj.accountId.toString() : index.toString(),
      id: userObj.accountId ? userObj.accountId.toString() : `MB${String(index + 1).padStart(3, '0')}`,
      name: userObj.fullName || userObj.username || 'N/A',
      email: userObj.email || 'N/A',
      phone: userObj.phoneNumber || 'N/A',
      joinDate: userObj.createdAt ? new Date(userObj.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: (userObj.isActive !== false ? 'active' : 'inactive') as 'active' | 'inactive',
      type: userObj.role || 'CUSTOMER',
      avatar: userObj.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userObj.fullName || userObj.username || 'User')}&background=random`,
      username: userObj.username || 'N/A',
      address: userObj.address || '',
      dob: userObj.dateOfBirth || '',
    };
  } catch (error) {
    const inactiveStatus = 'inactive' as const;
    return {
      key: index.toString(),
      id: `MB${String(index + 1).padStart(3, '0')}`,
      name: 'Error Loading User',
      email: 'N/A',
      phone: 'N/A',
      joinDate: new Date().toISOString().split('T')[0],
      status: inactiveStatus,
      type: 'CUSTOMER',
      avatar: 'https://ui-avatars.com/api/?name=Error&background=random',
      username: 'N/A',
    };
  }
};

/**
 * Get current user info from storage
 */
export const getCurrentUserFromStorage = () => {
  try {
    const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      return {
        id: parsedUser.accountId || parsedUser.id || '4',
        role: parsedUser.role || 'ADMIN',
        username: parsedUser.username || 'PhoenixZ'
      };
    }
    
    // Fallback to default admin user
    return {
      id: '4',
      role: 'ADMIN', 
      username: 'PhoenixZ'
    };
  } catch (error) {
    return {
      id: '4',
      role: 'ADMIN',
      username: 'PhoenixZ'
    };
  }
};

/**
 * Check if user has authentication token
 */
export const checkAuthToken = (): boolean => {
  const token = localStorage.getItem('accessToken') ||
               localStorage.getItem('access_token') ||
               localStorage.getItem('authToken') ||
               sessionStorage.getItem('accessToken');
  
  if (token) {
    return true;
  }
  
  return false;
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate username format
 */
export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
};
