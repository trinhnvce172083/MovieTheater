import { BookingApiService } from "@/api/booking-api";

export const debugSeatAPI = async (scheduleId: string | number, roomId?: string | number) => {
  console.log("🔍 Debug Seat API for scheduleId:", scheduleId, "roomId:", roomId);
  
  try {
    // 1. Test lấy trạng thái ghế
    console.log("📡 Calling API: GET /bookings/schedules/{scheduleId}/seats");
    const seatStatusResponse = await BookingApiService.getSeatStatus(scheduleId);
    
    console.log("✅ Seat Status Response:", seatStatusResponse);
    console.log("📊 Total seats with status:", seatStatusResponse.data.seats?.length || 0);
    
    if (seatStatusResponse.data.seats && seatStatusResponse.data.seats.length > 0) {
      console.log("🎯 First seat sample:", seatStatusResponse.data.seats[0]);
      console.log("📋 Seat status breakdown:");
      
      const statusCount = seatStatusResponse.data.seats.reduce((acc: any, seat) => {
        acc[seat.status] = (acc[seat.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log("📈 Status counts:", statusCount);
    }

    // 2. Test lấy layout ghế nếu có roomId
    if (roomId) {
      console.log("📡 Calling API: GET /cinema-rooms/{roomId}/seats");
      const layoutResponse = await BookingApiService.getSeatLayout(roomId);
      
      console.log("✅ Seat Layout Response:", layoutResponse);
      console.log("📊 Total seats in layout:", layoutResponse.data?.length || 0);
      
      if (layoutResponse.data && layoutResponse.data.length > 0) {
        console.log("🎯 First layout seat sample:", layoutResponse.data[0]);
        
        // Kiểm tra xem có ghế nào có thông tin layout đầy đủ không
        const seatsWithLayout = layoutResponse.data.filter((seat: any) => 
          seat.seatRow && seat.seatColumn && seat.seatNumber
        );
        console.log("🏗️ Seats with complete layout info:", seatsWithLayout.length);
      }
    }

    return {
      seatStatus: seatStatusResponse,
      seatLayout: roomId ? await BookingApiService.getSeatLayout(roomId) : null
    };
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

export const debugCombinedSeats = async (scheduleId: string | number, roomId?: string | number) => {
  console.log("🔍 Debug Combined Seats for scheduleId:", scheduleId, "roomId:", roomId);
  
  try {
    // Lấy trạng thái ghế
    const seatStatusResponse = await BookingApiService.getSeatStatus(scheduleId);
    const seatStatuses = seatStatusResponse.data.seats || [];
    
    console.log("📊 Seat statuses found:", seatStatuses.length);
    
    if (roomId) {
      // Lấy layout ghế
      const layoutResponse = await BookingApiService.getSeatLayout(roomId);
      const seatLayout = layoutResponse.data || [];
      
      console.log("🏗️ Seat layout found:", seatLayout.length);
      
      // Kết hợp layout và trạng thái
      const combinedSeats = seatLayout.map(layoutSeat => {
        const statusSeat = seatStatuses.find(s => s.seatId === layoutSeat.seatId);
        
        return {
          ...layoutSeat,
          status: statusSeat?.status || 'AVAILABLE',
          reservedBySession: statusSeat?.reservedBySession,
          reservationExpiry: statusSeat?.reservationExpiry,
          isAvailable: statusSeat?.status === 'AVAILABLE',
          isOccupied: statusSeat?.status === 'OCCUPIED',
          isTemporarilyReserved: statusSeat?.status === 'TEMPORARILY_RESERVED',
        };
      });
      
      console.log("✅ Combined seats:", combinedSeats.length);
      console.log("🎯 Sample combined seat:", combinedSeats[0]);
      
      // Thống kê trạng thái
      const statusCount = combinedSeats.reduce((acc: any, seat) => {
        acc[seat.status] = (acc[seat.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log("📈 Combined status counts:", statusCount);
      
      return combinedSeats;
    } else {
      console.log("⚠️ No roomId provided, returning status data only");
      return seatStatuses;
    }
  } catch (error: any) {
    console.error("❌ Error in debugCombinedSeats:", error);
    throw error;
  }
}; 