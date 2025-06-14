import { createSlice } from "@reduxjs/toolkit";
import { decodeJwt } from "@/hooks/decodeJwt";

const initialState = {
  token: "",
  role: "GUEST",
  isLoggedIn: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state.token = action.payload.token;
      state.isLoggedIn = true;
      const payload = decodeJwt(action.payload.token);
      state.role = payload?.role || "guest";
      state.user = payload || null;
    },
    logout(state) {
      state.token = "";
      state.isLoggedIn = false;
      state.role = "guest";
      state.user = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;