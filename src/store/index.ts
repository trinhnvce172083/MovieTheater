import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import bookingReducer from "./slices/bookingSlice";

// Cấu hình persist cho booking slice
const bookingPersistConfig = {
  key: "booking",
  storage,
  whitelist: [
    "scheduleId",
    "roomId", 
    "selectedSeats",
    "movieInfo",
    "scheduleInfo",
    "selectedConcessions",
    "concessionsTotal",
    "appliedPromotion",
    "promotionCode",
    "discountAmount",
    "seatTotal",
    "totalAmount",
    "finalAmount"
  ],
  // Không persist paymentInfo vì nó có thể chứa thông tin nhạy cảm
  blacklist: ["paymentInfo"]
};

// Cấu hình persist cho auth slice (tùy chọn)
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["isLoggedIn", "userInfo", "user", "role"], // Persist thông tin cần thiết
  blacklist: ["token"] // Không persist tokens nhạy cảm
};

// Combine reducers với persist
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  booking: persistReducer(bookingPersistConfig, bookingReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
