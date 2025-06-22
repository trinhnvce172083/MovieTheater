// import axiosClient from "../axiosClient";

// export const getAllMovies = async () => {
//   try {
//     const response = await axiosClient.get("/cinema/movies?page=0&size=10&sortBy=title&sortDirection=asc");
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

import axiosClient from "../axiosClient";

export interface GetMoviesParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export const getMovies = async (params: GetMoviesParams) => {
  const response = await axiosClient.get("/api/movies", { params });
  return response.data;
};