import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { decodeJwt } from "@/hooks/decodeJwt";

// Định nghĩa kiểu dữ liệu cho user
interface User {
  id?: string;
  username?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  [key: string]: unknown; // Cho phép mở rộng nếu backend trả thêm trường
}

// Định nghĩa kiểu dữ liệu cho state xác thực
interface AuthState {
  user: User | null;
  token: string | null;
  role: string; // Lưu role để kiểm tra nhanh
  isLoggedIn: boolean; // Trạng thái đăng nhập
}

// State mặc định ban đầu
const initialState: AuthState = {
  user: null,
  token: null,
  role: "CUSTOMER",
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Đăng nhập: truyền vào token, tự decode user và role từ token
    login(state, action: PayloadAction<{ token: string }>) {
      state.token = action.payload.token;
      state.isLoggedIn = true;
      const payload = decodeJwt(action.payload.token);
      console.log('🔍 authSlice login - Decoded payload:', payload);
      
      state.role = payload?.role || "CUSTOMER";
      state.user = payload ? {
        id: payload.accountId || payload.sub,
        username: payload.username,
        fullName: payload.fullName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        role: payload.role,
        ...payload // Spread để giữ các field khác
      } : null;
      
      console.log('✅ authSlice login - User state updated:', state.user);
    },
    // Đăng nhập: truyền vào user và token từ ngoài (nếu đã decode sẵn)
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.user.role || "CUSTOMER";
      state.isLoggedIn = true;
    },
    // Đăng xuất: reset toàn bộ state về mặc định
    logout(state) {
      state.token = null;
      state.isLoggedIn = false;
      state.role = "CUSTOMER";
      state.user = null;
    },
  },
});

export const { login, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;