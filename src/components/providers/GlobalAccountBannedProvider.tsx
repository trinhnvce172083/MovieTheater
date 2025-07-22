"use client";

import React, { useEffect } from 'react';
import { useAccountBannedDetection } from '@/hooks/useAccountBannedDetection';
import { AccountBannedNotification } from '@/components/AccountBannedNotification';

interface GlobalAccountBannedProviderProps {
  children: React.ReactNode;
}

export const GlobalAccountBannedProvider: React.FC<GlobalAccountBannedProviderProps> = ({ 
  children 
}) => {
  const { bannedInfo, checkAccountBanned, resetBannedState } = useAccountBannedDetection();

  // Setup global error handler for axios
  useEffect(() => {
    const windowWithCallback = window as typeof window & { __triggerAccountBannedCheck?: (error: unknown) => void };
    
    windowWithCallback.__triggerAccountBannedCheck = (error) => {
      console.log('🔍 Checking if account is banned...', error);
      const isBanned = checkAccountBanned(error as { response?: { status: number; data?: { message?: string; errorCode?: string; code?: number } } });
      if (isBanned) {
        console.log('🚫 Account banned detected!');
      }
    };

    return () => {
      delete windowWithCallback.__triggerAccountBannedCheck;
    };
  }, [checkAccountBanned]);

  return (
    <>
      {children}
      
      {/* Global Account Banned Notification */}
      <AccountBannedNotification
        visible={bannedInfo.isBanned}
        banReason={bannedInfo.banReason}
        banUntil={bannedInfo.banUntil}
        onClose={resetBannedState}
      />
    </>
  );
};
