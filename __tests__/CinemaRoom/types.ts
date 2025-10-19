export interface ApiError {
  response: {
    data: {
      success: boolean;
      code: number;
      message: string;
      errorCode: string;
      timestamp: string;
    };
  };
}

export interface ApiResponse<T> {
  data: {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
  };
}

export interface CinemaRoomData {
  cinemaRoomId: number;
  cinemaRoomName: string;
  roomType: string;
  rows: number;
  columns: number;
  seatQuantity: number;
  has3D: boolean;
  hasDolbyAtmos: boolean;
  hasReclinerSeats: boolean;
  priceMultiplier: number;
  isActive: boolean;
  availableSeats: number;
  occupiedSeats: number;
  temporarilyReservedSeats: number;
}

export interface CreateRoomRequest {
  cinemaRoomName: string;
  roomType: string;
  rows: number;
  columns: number;
  has3D: boolean;
  hasDolbyAtmos: boolean;
  hasReclinerSeats: boolean;
  priceMultiplier: number;
}

export interface UpdateRoomRequest extends CreateRoomRequest {}
