export const CreateRoomInputData = {
  cinemaRoomName: "IMAX Theater 1",
  roomType: "IMAX",
  rows: 10,
  columns: 15,
  has3D: true,
  hasDolbyAtmos: true,
  hasReclinerSeats: true,
  priceMultiplier: 1.5
};

export const UpdateRoomInputData = {
  cinemaRoomName: "IMAX Theater 1 Updated",
  roomType: "IMAX",
  rows: 12,
  columns: 18,
  has3D: true,
  hasDolbyAtmos: true,
  hasReclinerSeats: true,
  priceMultiplier: 2.0
};

export const CreateRoomSuccessResponse = {
  data: {
    success: true,
    message: "Tạo phòng chiếu thành công",
    data: {
      cinemaRoomId: 1,
      cinemaRoomName: "IMAX Theater 1",
      roomType: "IMAX",
      rows: 10,
      columns: 15,
      seatQuantity: 150,
      has3D: true,
      hasDolbyAtmos: true,
      hasReclinerSeats: true,
      priceMultiplier: 1.5,
      isActive: true,
      availableSeats: 150,
      occupiedSeats: 0,
      temporarilyReservedSeats: 0
    },
    timestamp: "2025-07-29T10:00:00.000000"
  }
};

export const UpdateRoomSuccessResponse = {
  data: {
    success: true,
    message: "Cập nhật phòng chiếu thành công",
    data: {
      cinemaRoomId: 1,
      cinemaRoomName: "IMAX Theater 1 Updated",
      roomType: "IMAX",
      rows: 12,
      columns: 18,
      seatQuantity: 216,
      has3D: true,
      hasDolbyAtmos: true,
      hasReclinerSeats: true,
      priceMultiplier: 2.0,
      isActive: true,
      availableSeats: 216,
      occupiedSeats: 0,
      temporarilyReservedSeats: 0
    },
    timestamp: "2025-07-29T10:01:00.000000"
  }
};

export const GetRoomSuccessResponse = {
  data: {
    success: true,
    message: "Lấy thông tin phòng chiếu thành công",
    data: {
      cinemaRoomId: 1,
      cinemaRoomName: "IMAX Theater 1",
      roomType: "IMAX",
      rows: 10,
      columns: 15,
      seatQuantity: 150,
      has3D: true,
      hasDolbyAtmos: true,
      hasReclinerSeats: true,
      priceMultiplier: 1.5,
      isActive: true,
      availableSeats: 150,
      occupiedSeats: 0,
      temporarilyReservedSeats: 0
    },
    timestamp: "2025-07-29T10:02:00.000000"
  }
};

export const DeleteRoomSuccessResponse = {
  data: {
    success: true,
    message: "Xóa phòng chiếu thành công",
    timestamp: "2025-07-29T10:03:00.000000"
  }
};

export const RoomNotFoundResponse = {
  response: {
    data: {
      success: false,
      code: 1404,
      message: "Không tìm thấy phòng chiếu",
      errorCode: "CINEMA_ROOM_NOT_FOUND",
      timestamp: "2025-07-29T10:04:00.000000"
    }
  }
};

export const RoomNameExistsResponse = {
  response: {
    data: {
      success: false,
      code: 1400,
      message: "Tên phòng chiếu đã tồn tại",
      errorCode: "CINEMA_ROOM_ALREADY_EXISTS",
      timestamp: "2025-07-29T10:05:00.000000"
    }
  }
};

export const InvalidCapacityResponse = {
  response: {
    data: {
      success: false,
      code: 1400,
      message: "Số lượng ghế không hợp lệ",
      errorCode: "CINEMA_ROOM_CAPACITY_INVALID",
      timestamp: "2025-07-29T10:06:00.000000"
    }
  }
};
