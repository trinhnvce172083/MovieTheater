"use client";

import React, { createContext, useState, useEffect } from 'react';
import { AppAbility, defineAbilityFor } from './ability';
import { useAuth } from '@/hooks/useAuth';
import { Role } from './roles';

// Create a context to hold the ability instance
export const AbilityContext = createContext<AppAbility | undefined>(undefined);

/**
 * Provider component to make CASL abilities available throughout the application
 */
export function AbilityProvider({ children }: { children: React.ReactNode }) {
  const authState = useAuth();
  const user = authState.user;
  const isLoggedIn = authState.isLoggedIn;
  
  // Initialize ability with default permissions (for guests)
  const [ability, setAbility] = useState<AppAbility>(() => defineAbilityFor(null));

  // Update abilities whenever the user authentication state changes
  useEffect(() => {
    if (!isLoggedIn || !user) {
      // Set guest/customer permissions when logged out
      setAbility(defineAbilityFor(null));
      console.log('Setting guest permissions');
    } else {
      // Set user-specific permissions based on their role
      const userData = {
        id: user.id,
        role: user.role as Role,
        isVerified: true, // Assuming verification is handled by your auth system
        memberId: user.id,
      };
      
      setAbility(defineAbilityFor(userData));
      console.log(`Setting permissions for role: ${user.role}`);
    }
  }, [user, isLoggedIn]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

/**
 * Custom hook to use the CASL ability in components
 */
export function useAbility() {
  const ability = React.useContext(AbilityContext);
  
  if (ability === undefined) {
    throw new Error('useAbility must be used within an AbilityProvider');
  }
  
  return ability;
}
