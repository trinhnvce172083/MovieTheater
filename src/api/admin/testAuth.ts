import axiosClient from "../axiosClient";

// Test function to check API connectivity and authentication
export const testAuthAndAPI = async () => {
  try {
    console.log("=== Testing API Connection ===");
    console.log("Base URL:", axiosClient.defaults.baseURL);
    
    // Check if token exists
    const token = localStorage.getItem("accessToken");
    console.log("Access token exists:", !!token);
    console.log("Token value:", token ? token.substring(0, 20) + "..." : "None");
    
    // Try a simple API call
    console.log("Making test API call...");
    const response = await axiosClient.get("/admin/users", {
      params: { page: 0, size: 1 }
    });
    
    console.log("✅ API call successful!");
    console.log("Response status:", response.status);
    console.log("Response data:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("❌ API call failed:");
    console.error("Error:", error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: unknown } };
      console.error("Status:", axiosError.response?.status);
      console.error("Data:", axiosError.response?.data);
      
      if (axiosError.response?.status === 401) {
        console.error("🔐 Authentication required - please log in first");
      } else if (axiosError.response?.status === 403) {
        console.error("🚫 Access forbidden - insufficient permissions");
      }
    }
    
    throw error;
  }
};

// Simple login test with hardcoded admin credentials
export const testLogin = async () => {
  try {
    console.log("=== Testing Login ===");
    
    // Try with the admin user
    const loginResponse = await axiosClient.post("/auth/login", {
      username: "admin",
      password: "123456", // Common default password - adjust as needed
      rememberMe: true
    });
    
    console.log("✅ Login successful!");
    console.log("Login response:", loginResponse.data);
    
    // Store token - check different possible token field names
    const token = loginResponse.data.accessToken || 
                  loginResponse.data.token || 
                  loginResponse.data.access_token;
    
    if (token) {
      localStorage.setItem("accessToken", token);
      console.log("Token stored in localStorage");
      console.log("Token preview:", token.substring(0, 20) + "...");
    } else {
      console.warn("No token found in response");
      console.log("Available fields:", Object.keys(loginResponse.data));
    }
    
    return loginResponse.data;
  } catch (error) {
    console.error("❌ Login failed:");
    console.error("Error:", error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: unknown } };
      console.error("Status:", axiosError.response?.status);
      console.error("Data:", axiosError.response?.data);
      
      if (axiosError.response?.status === 401) {
        console.error("Invalid credentials - try different username/password");
      }
    }
    
    throw error;
  }
};
