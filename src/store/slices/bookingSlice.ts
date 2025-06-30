import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Định nghĩa interfaces
interface Seat {
  id: number;
  row: string;
  number: string;
  status: string;
  type: string;
  price?: number;
}

interface MovieInfo {
  movieId: number;
  title: string;
  duration: number;
  posterUrl: string;
}

interface ScheduleInfo {
  scheduleId: number;
  displayTime: string;
  displayDate: string;
  cinemaRoomName: string;
  movieTitle: string;
  movieId: number;
}

// Định nghĩa state
interface BookingState {
  scheduleId: string | null;
  roomId: string | null;
  selectedSeats: Seat[];
  movieInfo: MovieInfo | null;
  scheduleInfo: ScheduleInfo | null;
}

// State ban đầu
const initialState: BookingState = {
  scheduleId: null,
  roomId: null,
  selectedSeats: [],
  movieInfo: null,
  scheduleInfo: null,
};

// Tạo slice
const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    // Lưu scheduleId và roomId
    initializeBooking: (
      state,
      action: PayloadAction<{ scheduleId: string; roomId: string }>
    ) => {
      state.scheduleId = action.payload.scheduleId;
      state.roomId = action.payload.roomId;
    },

    // Cập nhật thông tin phim
    setMovieInfo: (state, action: PayloadAction<MovieInfo>) => {
      state.movieInfo = action.payload;
    },

    // Cập nhật thông tin lịch chiếu
    setScheduleInfo: (state, action: PayloadAction<ScheduleInfo>) => {
      state.scheduleInfo = action.payload;
    },

    // Cập nhật danh sách ghế đã chọn
    updateSelectedSeats: (state, action: PayloadAction<Seat[]>) => {
      state.selectedSeats = action.payload;
    },

    // Reset state về ban đầu
    resetBooking: (state) => {
      Object.assign(state, initialState);
    },
  },
});

// Export actions và reducer
export const {
  initializeBooking,
  setMovieInfo,
  setScheduleInfo,
  updateSelectedSeats,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer; 