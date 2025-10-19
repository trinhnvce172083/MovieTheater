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
  userInfo: {
    accountId: string;
    userName: string;
    Role: string;
    [key: string]: unknown;
  } | null;
}

// State mặc định ban đầu
const initialState: AuthState = {
  user: null,
  token: null,
  role: "CUSTOMER",
  isLoggedIn: false,
  userInfo: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Đăng nhập: truyền vào token và userInfo object
    login: (state, action: PayloadAction<{ 
      token: string; 
      userInfo?: {
        accountId: string;
        userName: string;
        Role: string;
        [key: string]: unknown;
      }
    }>) => {
      const { token, userInfo } = action.payload;
      
      state.token = token;
      state.isLoggedIn = true;
      
      if (userInfo) {
        state.userInfo = userInfo;
        state.role = userInfo.Role || "CUSTOMER";
        state.user = {
          id: userInfo.accountId,
          username: userInfo.userName,
          role: userInfo.Role,
        };
      } else {
        // Fallback: decode từ token nếu không có userInfo
        try {
          const payload = decodeJwt(token);
          
          if (payload) {
            const userInfoObj = {
              accountId: String(payload.sub || payload.userId || payload.id || ""),
              userName: String(payload.username || payload.userName || payload.name || ""),
              Role: String(payload.role || payload.authorities?.[0] || 'CUSTOMER'),
            };
            
            state.userInfo = userInfoObj;
            state.role = userInfoObj.Role;
            state.user = {
              id: userInfoObj.accountId,
              username: userInfoObj.userName,
              role: userInfoObj.Role,
            };
          }
        } catch {
          // Silent fail - token decode error
        }
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
      state.userInfo = null;
    },
  },
});

export const { login, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;