import axios from "axios";
import nookies from "nookies";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/cinema/api",
  headers: {
    "Content-Type": "application/json",
  },
});
// Thêm interceptor để tự động gắn token vào header
axiosClient.interceptors.request.use((config) => {
  const token = nookies.get(null).accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosClient;