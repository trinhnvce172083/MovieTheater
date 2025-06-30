// Debugging utility for authentication issues
import { getAuthTokenFromCookies, getRoleFromCookies } from "./authCookies";

export const debugAuthStatus = () => {
  console.log("🔍 AUTH DEBUG REPORT:");
  console.log("======================");
  
  // Check localStorage
  const localStorageKeys = [
    "accessToken",
    "access_token", 
    "authToken",
    "token",
    "userInfo",
    "user"
  ];
  
  console.log("📱 localStorage tokens:");
  localStorageKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      console.log(`  ✅ ${key}:`, value.length > 50 ? value.substring(0, 50) + "..." : value);
    } else {
      console.log(`  ❌ ${key}: not found`);
    }
  });
  
  // Check sessionStorage
  console.log("🔒 sessionStorage tokens:");
  localStorageKeys.forEach(key => {
    const value = sessionStorage.getItem(key);
    if (value) {
      console.log(`  ✅ ${key}:`, value.length > 50 ? value.substring(0, 50) + "..." : value);
    } else {
      console.log(`  ❌ ${key}: not found`);
    }
  });
  
  // Check cookies with specific functions
  console.log("🍪 Authentication Cookies:");
  const cookieToken = getAuthTokenFromCookies();
  const cookieRole = getRoleFromCookies();
  console.log(`  ${cookieToken ? '✅' : '❌'} authToken:`, cookieToken ? cookieToken.substring(0, 50) + "..." : "not found");
  console.log(`  ${cookieRole ? '✅' : '❌'} userRole:`, cookieRole || "not found");
  
  console.log("🍪 All Cookies:");
  console.log(document.cookie || "No cookies found");
  
  // Show the final active token that will be used
  const activeToken = localStorage.getItem("accessToken") || 
                     localStorage.getItem("access_token") || 
                     localStorage.getItem("authToken") ||
                     sessionStorage.getItem("accessToken") ||
                     cookieToken;
  
  console.log("🎯 FINAL RESULT:");
  if (activeToken) {
    console.log("✅ Active token found:", activeToken.substring(0, 50) + "...");
    console.log("📍 Token source:", 
      localStorage.getItem("accessToken") ? "localStorage(accessToken)" :
      localStorage.getItem("access_token") ? "localStorage(access_token)" :
      localStorage.getItem("authToken") ? "localStorage(authToken)" :
      sessionStorage.getItem("accessToken") ? "sessionStorage(accessToken)" :
      cookieToken ? "cookies(authToken)" : "unknown");
  } else {
    console.log("❌ NO TOKEN FOUND - User appears unauthenticated");
  }
  
  console.log("======================");
};

// Add to window for easy browser console access
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).debugAuth = debugAuthStatus;
  console.log("💡 Type 'debugAuth()' in console to check auth status");
}
