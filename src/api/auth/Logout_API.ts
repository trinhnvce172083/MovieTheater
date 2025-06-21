import axiosClient from "../axiosClient";

export const Logout_API = async () => {
  try {
    const response = await axiosClient.post("/auth/logout");
    return response.data;
  } catch (error) {
    throw error;
  }
};
