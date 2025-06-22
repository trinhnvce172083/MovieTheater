import axiosClient from "../axiosClient";

export const profile = async () => {
  try {
    const response = await axiosClient.get("/api/auth/profile");
    return response.data;
  } catch (error) {
    throw error;
  }
};