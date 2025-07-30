import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Định nghĩa interfaces
interface Seat {
  seatId: number;
  seatNumber: string;
  seatRow: string | number;
  seatColumn?: number;
  status: string; // AVAILABLE | OCCUPIED | TEMPORARILY_RESERVED
  seatType: string; // STANDARD | VIP | COUPLE
  reservedBySession?: string;
  reservationExpiry?: string;
  isActive?: boolean;
  priceMultiplier?: number;
  isRecliner?: boolean;
  hasTable?: boolean;
  cinemaRoomId?: number;
  cinemaRoomName?: string;
  rowLetter?: string;
  displayName?: string;
  isAvailable?: boolean;
  isOccupied?: boolean;
  isTemporarilyReserved?: boolean;
  isVIP?: boolean;
  isCouple?: boolean;
  isWheelchair?: boolean;
  isPremium?: boolean;
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

// Thêm interfaces cho concession và promotion
interface Concession {
  concessionId: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
}

interface ConcessionOrder {
  concessionId: number;
  quantity: number;
  concession: Concession;
}

interface Promotion {
  promotionId: number;
  code: string;
  name: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  isActive: boolean;
}

interface PaymentInfo {
  method: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  transactionId?: string;
  amount: number;
}

// Định nghĩa state
interface BookingState {
  scheduleId: string | null;
  roomId: string | null;
  selectedSeats: Seat[];
  movieInfo: MovieInfo | null;
  scheduleInfo: ScheduleInfo | null;
  
  // Concession management
  selectedConcessions: ConcessionOrder[];
  concessionsTotal: number;
  
  // Promotion management
  appliedPromotion: Promotion | null;
  promotionCode: string;
  discountAmount: number;
  
  // Payment management
  paymentInfo: PaymentInfo | null;
  
  // Booking totals
  seatTotal: number;
  totalAmount: number;
  finalAmount: number;
}

// State ban đầu
const initialState: BookingState = {
  scheduleId: null,
  roomId: null,
  selectedSeats: [],
  movieInfo: null,
  scheduleInfo: null,
  
  // Concession management
  selectedConcessions: [],
  concessionsTotal: 0,
  
  // Promotion management
  appliedPromotion: null,
  promotionCode: '',
  discountAmount: 0,
  
  // Payment management
  paymentInfo: null,
  
  // Booking totals
  seatTotal: 0,
  totalAmount: 0,
  finalAmount: 0,
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

    // ==================== CONCESSION MANAGEMENT ====================
    
    // Thêm concession vào booking
    addConcession: (state, action: PayloadAction<{ concession: Concession; quantity: number }>) => {
      const { concession, quantity } = action.payload;
      const existingIndex = state.selectedConcessions.findIndex(
        item => item.concessionId === concession.concessionId
      );
      
      if (existingIndex >= 0) {
        // Cập nhật số lượng nếu đã có
        state.selectedConcessions[existingIndex].quantity += quantity;
      } else {
        // Thêm mới
        state.selectedConcessions.push({
          concessionId: concession.concessionId,
          quantity,
          concession
        });
      }
      
      // Tính lại tổng tiền concessions
      state.concessionsTotal = state.selectedConcessions.reduce(
        (total, item) => total + (item.quantity * item.concession.price), 0
      );
      
      // Tính lại tổng tiền
      state.totalAmount = state.seatTotal + state.concessionsTotal;
      state.finalAmount = state.totalAmount - state.discountAmount;
    },

    // Cập nhật số lượng concession
    updateConcessionQuantity: (state, action: PayloadAction<{ concessionId: number; quantity: number }>) => {
      const { concessionId, quantity } = action.payload;
      const existingIndex = state.selectedConcessions.findIndex(
        item => item.concessionId === concessionId
      );
      
      if (existingIndex >= 0) {
        if (quantity <= 0) {
          // Xóa nếu số lượng = 0
          state.selectedConcessions.splice(existingIndex, 1);
        } else {
          // Cập nhật số lượng
          state.selectedConcessions[existingIndex].quantity = quantity;
        }
      }
      
      // Tính lại tổng tiền concessions
      state.concessionsTotal = state.selectedConcessions.reduce(
        (total, item) => total + (item.quantity * item.concession.price), 0
      );
      
      // Tính lại tổng tiền
      state.totalAmount = state.seatTotal + state.concessionsTotal;
      state.finalAmount = state.totalAmount - state.discountAmount;
    },

    // Xóa concession khỏi booking
    removeConcession: (state, action: PayloadAction<number>) => {
      const concessionId = action.payload;
      state.selectedConcessions = state.selectedConcessions.filter(
        item => item.concessionId !== concessionId
      );
      
      // Tính lại tổng tiền concessions
      state.concessionsTotal = state.selectedConcessions.reduce(
        (total, item) => total + (item.quantity * item.concession.price), 0
      );
      
      // Tính lại tổng tiền
      state.totalAmount = state.seatTotal + state.concessionsTotal;
      state.finalAmount = state.totalAmount - state.discountAmount;
    },

    // ==================== PROMOTION MANAGEMENT ====================
    
    // Áp dụng promotion
    applyPromotion: (state, action: PayloadAction<Promotion>) => {
      state.appliedPromotion = action.payload;
      state.promotionCode = action.payload.code;
      
      // Tính discount amount
      if (action.payload.discountType === 'PERCENTAGE') {
        state.discountAmount = Math.min(
          (state.totalAmount * action.payload.discountValue) / 100,
          action.payload.maxDiscountAmount || Infinity
        );
      } else {
        state.discountAmount = action.payload.discountValue;
      }
      
      // Tính lại final amount
      state.finalAmount = state.totalAmount - state.discountAmount;
    },

    // Xóa promotion
    removePromotion: (state) => {
      state.appliedPromotion = null;
      state.promotionCode = '';
      state.discountAmount = 0;
      state.finalAmount = state.totalAmount;
    },

    // Cập nhật promotion code
    setPromotionCode: (state, action: PayloadAction<string>) => {
      state.promotionCode = action.payload;
    },

    // ==================== PAYMENT MANAGEMENT ====================
    
    // Cập nhật thông tin payment
    setPaymentInfo: (state, action: PayloadAction<PaymentInfo>) => {
      state.paymentInfo = action.payload;
    },

    // Cập nhật tổng tiền ghế
    setSeatTotal: (state, action: PayloadAction<number>) => {
      state.seatTotal = action.payload;
      state.totalAmount = state.seatTotal + state.concessionsTotal;
      state.finalAmount = state.totalAmount - state.discountAmount;
    },

    // Reset state về ban đầu
    resetBooking: (state) => {
      Object.assign(state, initialState);
    },

    // Clear chỉ selectedSeats (giữ lại thông tin khác)
    clearSelectedSeats: (state) => {
      state.selectedSeats = [];
      state.seatTotal = 0;
      state.totalAmount = state.concessionsTotal;
      state.finalAmount = state.totalAmount - state.discountAmount;
    },

    // Clear concessions (giữ lại ghế đã chọn)
    clearConcessions: (state) => {
      state.selectedConcessions = [];
      state.concessionsTotal = 0;
      state.totalAmount = state.seatTotal;
      state.finalAmount = state.totalAmount - state.discountAmount;
    },

    // Clear promotion (giữ lại ghế và concessions)
    clearPromotion: (state) => {
      state.appliedPromotion = null;
      state.promotionCode = '';
      state.discountAmount = 0;
      state.finalAmount = state.totalAmount;
    },

    // Update seat total và tính lại tổng
    updateSeatTotal: (state, action: PayloadAction<number>) => {
      state.seatTotal = action.payload;
      state.totalAmount = state.seatTotal + state.concessionsTotal;
      state.finalAmount = state.totalAmount - state.discountAmount;
    },

    // Recalculate totals (dùng khi cần tính lại)
    recalculateTotals: (state) => {
      state.concessionsTotal = state.selectedConcessions.reduce(
        (total, item) => total + (item.quantity * item.concession.price), 0
      );
      state.totalAmount = state.seatTotal + state.concessionsTotal;
      state.finalAmount = state.totalAmount - state.discountAmount;
    },
  },
});

// Export actions và reducer
export const {
  initializeBooking,
  setMovieInfo,
  setScheduleInfo,
  updateSelectedSeats,
  
  // Concession actions
  addConcession,
  updateConcessionQuantity,
  removeConcession,
  
  // Promotion actions
  applyPromotion,
  removePromotion,
  setPromotionCode,
  
  // Payment actions
  setPaymentInfo,
  setSeatTotal,
  
  resetBooking,
  clearSelectedSeats,
  clearConcessions,
  clearPromotion,
  updateSeatTotal,
  recalculateTotals,
} = bookingSlice.actions;

export default bookingSlice.reducer; 