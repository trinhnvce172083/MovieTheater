"use client";

import { Logout_API } from "@/api/auth/Logout_API";
import { clearAuthCookies } from "./authCookies";
import nookies from "nookies";

/**
 * Comprehensive logout function that clears all authentication data
 * from localStorage, sessionStorage, cookies, and calls the logout API
 */
export const performLogout = async (): Promise<void> => {
  try {
    // Call the logout API
    await Logout_API();
  } catch (error) {
    console.error("Logout API failed:", error);
    // Continue with client-side cleanup even if API fails
  }

  // Comprehensive cleanup of all authentication data
  
  // Clear all localStorage auth data
  localStorage.removeItem("accessToken");
  localStorage.removeItem("access_token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("userInfo");
  
  // Clear sessionStorage auth data
  sessionStorage.removeItem("accessToken");
  
  // Clear all auth cookies using both methods for maximum compatibility
  clearAuthCookies(); // Uses our utility function
  
  // Additional cookie cleanup using nookies (for server-side compatibility)
  try {
    nookies.destroy(null, "accessToken");
    nookies.destroy(null, "authToken");
    nookies.destroy(null, "userRole");
  } catch (error) {
    console.warn("Failed to clear some cookies:", error);
  }
  
  // Clear any other potential auth data
  try {
    // Clear any application-specific storage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
  } catch (error) {
    console.warn("Failed to clear additional auth data:", error);
  }
};

/**
 * Emergency logout that forces a complete session reset
 * Use this when you need to ensure all data is cleared regardless of errors
 */
export const forceLogout = (): void => {
  // Clear all possible auth storage locations
  try {
    // Clear specific auth items instead of localStorage.clear() to preserve non-auth data
    const authKeys = [
      "accessToken", "access_token", "authToken", "userInfo", 
      "user", "token", "refreshToken", "expiresAt"
    ];
    
    authKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  } catch (error) {
    console.warn("Failed to clear storage:", error);
  }
  
  try {
    clearAuthCookies();
  } catch (error) {
    console.warn("Failed to clear auth cookies:", error);
  }
  
  // Clear cookies using document.cookie as fallback
  try {
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  } catch (error) {
    console.warn("Failed to clear cookies manually:", error);
  }
};

/**
 * Check if user has any remaining authentication data
 * Useful for debugging authentication issues
 */
export const checkRemainingAuthData = (): Record<string, boolean> => {
  const results: Record<string, boolean> = {};
  
  // Check localStorage
  const localStorageKeys = ["accessToken", "access_token", "authToken", "userInfo"];
  localStorageKeys.forEach(key => {
    results[`localStorage.${key}`] = !!localStorage.getItem(key);
  });
  
  // Check sessionStorage
  const sessionStorageKeys = ["accessToken"];
  sessionStorageKeys.forEach(key => {
    results[`sessionStorage.${key}`] = !!sessionStorage.getItem(key);
  });
  
  // Check cookies
  const cookies = document.cookie.split(';');
  const cookieKeys = ["authToken", "userRole", "accessToken"];
  cookieKeys.forEach(key => {
    const cookieExists = cookies.some(cookie => cookie.trim().startsWith(`${key}=`));
    results[`cookie.${key}`] = cookieExists;
  });
  
  return results;
};
