import axiosClient from "../axiosClient";

export const refreshToken = async (refreshToken: string) => {
  try {
    const response = await axiosClient.post("/auth/refresh-token", {
      refreshToken,
    });
    console.log("Token refreshed successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};
