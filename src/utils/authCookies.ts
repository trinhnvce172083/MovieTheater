"use client";

import { Role } from "@/casl/roles";

/**
 * Sets authentication cookies needed for middleware-based route protection
 * 
 * @param token The authentication token
 * @param role The user's role
 * @param expiryDays Number of days until the cookies expire
 */
export function setAuthCookies(token: string, role: string, expiryDays = 7) {
  // Calculate expiry date
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  
  // Set secure, httpOnly cookies for middleware
  document.cookie = `authToken=${token}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  document.cookie = `userRole=${role}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Clears authentication cookies when user logs out
 */
export function clearAuthCookies() {
  document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

/**
 * Gets the user role from cookies
 * 
 * @returns The user role or undefined if not set
 */
export function getRoleFromCookies(): Role | undefined {
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    
    if (cookie.startsWith('userRole=')) {
      const value = cookie.substring('userRole='.length);
      return value as Role;
    }
  }
  
  return undefined;
}

/**
 * Gets the auth token from cookies
 * 
 * @returns The auth token or undefined if not set
 */
export function getAuthTokenFromCookies(): string | undefined {
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    
    if (cookie.startsWith('authToken=')) {
      return cookie.substring('authToken='.length);
    }
  }
  
  return undefined;
}
