import { useState, useCallback } from 'react';

interface BannedAccountInfo {
  isBanned: boolean;
  banReason?: string;
  banUntil?: string;
}

interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
      error?: string;
      errorCode?: string;
      code?: number;
    };
  };
}

declare global {
  interface Window {
    __handleAccountBanned?: (error: ApiError) => void;
  }
}

export const useAccountBannedDetection = () => {
  const [bannedInfo, setBannedInfo] = useState<BannedAccountInfo>({
    isBanned: false
  });

  // Check if user is banned from API response
  const checkAccountBanned = useCallback((error: ApiError) => {
    // Check if error is related to account being banned/locked
    if (error?.response) {
      const { status, data } = error.response;
      
      // Case 1: Check for 403 Forbidden with ACCOUNT_LOCKED error code  
      if (status === 403 && data?.errorCode === 'ACCOUNT_LOCKED') {
        setBannedInfo({
          isBanned: true,
          banReason: data?.message || "Tài khoản đã bị khóa",
        });
        return true;
      }

      // Case 2: Check for 403 with error code 1105 (ACCOUNT_LOCKED from backend)
      if (status === 403 && data?.code === 1105) {
        setBannedInfo({
          isBanned: true,
          banReason: data?.message || "Tài khoản đã bị khóa",
        });
        return true;
      }
      
      // Case 3: Check for specific messages containing lock/ban keywords
      if ((status === 401 || status === 403) && data?.message) {
        const message = data.message.toLowerCase();
        if (message.includes('khóa') || 
            message.includes('locked') || 
            message.includes('banned') ||
            message.includes('vô hiệu hóa')) {
          
          setBannedInfo({
            isBanned: true,
            banReason: data.message,
          });
          return true;
        }
      }
    }
    
    return false;
  }, []);

  // Reset banned state
  const resetBannedState = useCallback(() => {
    setBannedInfo({ isBanned: false });
  }, []);

  return {
    bannedInfo,
    checkAccountBanned,
    resetBannedState
  };
};
