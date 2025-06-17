import axiosClient from "../axiosClient";

export const getAllUsers = async () => {
  try {
    const response = await axiosClient.get("/api/admin/users?page=0&size=20&sortBy=createdAt&sortDirection=DESC");
    return response.data;
  } catch (error) {
    throw error;
  }
};