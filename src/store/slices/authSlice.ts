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
    login: (state, action: PayloadAction<{ token: string }>) => {
      const { token } = action.payload;
      
      try {
        const payload = decodeJwt(token);
        
        if (payload) {
          state.user = {
            id: payload.sub || payload.userId || payload.id,
            username: payload.username || payload.userName || payload.name,
            email: payload.email,
            role: payload.role || payload.authorities?.[0] || 'USER',
            isLoggedIn: true
          };
        }
      } catch (error) {
        // Silent fail - don't show error for token decode
      }
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