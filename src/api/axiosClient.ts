import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/cinema",
  headers: {
    "Content-Type": "application/json",
  },
});
// Thêm interceptor để tự động gắn token vào header
axiosClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosClient;