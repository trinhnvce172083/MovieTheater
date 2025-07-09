import { BookingApiService } from "@/api/booking-api";

export const debugSeatAPI = async (scheduleId: string | number) => {
  console.log("🔍 Debug Seat API for scheduleId:", scheduleId);
  
  try {
    console.log("📡 Calling API: GET /bookings/schedules/{scheduleId}/seats");
    const response = await BookingApiService.getSeatStatus(scheduleId);
    
    console.log("✅ API Response:", response);
    console.log("📊 Total seats returned:", response.data.seats?.length || 0);
    
    if (response.data.seats && response.data.seats.length > 0) {
      console.log("🎯 First seat sample:", response.data.seats[0]);
      console.log("📋 Seat status breakdown:");
      
      const statusCount = response.data.seats.reduce((acc: any, seat) => {
        acc[seat.status] = (acc[seat.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log("📈 Status counts:", statusCount);
    }
    
    return response;
  } catch (error: any) {
    console.error("❌ API Error:", error);
    console.error("🔍 Error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    throw error;
  }
};

export const debugReduxState = (state: any) => {
  console.log("🔍 Redux State Debug:");
  console.log("📅 scheduleId:", state.booking?.scheduleId);
  console.log("🏢 roomId:", state.booking?.roomId);
  console.log("🎬 movieInfo:", state.booking?.movieInfo);
  console.log("📋 scheduleInfo:", state.booking?.scheduleInfo);
  console.log("💺 selectedSeats:", state.booking?.selectedSeats);
};

export const debugLocalStorage = () => {
  console.log("🔍 LocalStorage Debug:");
  console.log("🔑 accessToken:", localStorage.getItem("accessToken") ? "✅ Present" : "❌ Missing");
  console.log("🔄 refreshToken:", localStorage.getItem("refreshToken") ? "✅ Present" : "❌ Missing");
  console.log("👤 isLoggedIn:", localStorage.getItem("isLoggedIn"));
  console.log("👤 userInfo:", localStorage.getItem("userInfo"));
}; 