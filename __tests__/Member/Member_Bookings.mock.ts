// Mock data for Member Bookings tests

export const MockBookings = [
  {
    bookingId: "BK001",
    bookingCode: "BK001",
    bookingDate: "2024-01-15T10:30:00Z",
    totalAmount: 150000,
    status: "CONFIRMED",
    showDate: "2024-01-20",
    startTime: "19:00",
    endTime: "21:30",
    movieTitle: "Avengers: Endgame",
    moviePoster: "https://example.com/avengers.jpg",
    movieId: 1,
    cinemaRoom: "Room A1",
    schedule: {
      showDateTime: "2024-01-20T19:00:00Z",
      formattedShowDateTime: "Jan 20, 2024 - 19:00",
      showDate: "2024-01-20",
      startTime: "19:00",
      endTime: "21:30",
    },
    seats: [
      { seatNumber: "A1", seatType: "STANDARD" },
      { seatNumber: "A2", seatType: "STANDARD" },
    ],
  },
  {
    bookingId: "BK002",
    bookingCode: "BK002",
    bookingDate: "2024-01-10T14:20:00Z",
    totalAmount: 200000,
    status: "PAID",
    showDate: "2024-01-25",
    startTime: "20:30",
    endTime: "22:45",
    movieTitle: "Spider-Man: No Way Home",
    moviePoster: "https://example.com/spiderman.jpg",
    movieId: 2,
    cinemaRoom: "Room B2",
    schedule: {
      showDateTime: "2024-01-25T20:30:00Z",
      formattedShowDateTime: "Jan 25, 2024 - 20:30",
      showDate: "2024-01-25",
      startTime: "20:30",
      endTime: "22:45",
    },
    seats: [
      { seatNumber: "C5", seatType: "VIP" },
    ],
  },
  {
    bookingId: "BK003",
    bookingCode: "BK003",
    bookingDate: "2024-01-05T09:15:00Z",
    totalAmount: 120000,
    status: "CANCELLED",
    showDate: "2024-01-18",
    startTime: "15:00",
    endTime: "17:15",
    movieTitle: "Black Widow",
    moviePoster: "https://example.com/blackwidow.jpg",
    movieId: 3,
    cinemaRoom: "Room C3",
    schedule: {
      showDateTime: "2024-01-18T15:00:00Z",
      formattedShowDateTime: "Jan 18, 2024 - 15:00",
      showDate: "2024-01-18",
      startTime: "15:00",
      endTime: "17:15",
    },
    seats: [
      { seatNumber: "D8", seatType: "STANDARD" },
    ],
  },
];

export const SuccessCancelResponse = {
  success: true,
  message: "Booking cancelled successfully",
  data: {
    bookingId: "BK001",
    status: "CANCELLED",
  },
};

export const CancelErrorResponse = {
  response: {
    data: {
      success: false,
      message: "Cannot cancel booking. Show time has passed.",
    },
  },
};

export const CheckInSuccessResponse = {
  success: true,
  message: "Check-in successful",
  data: {
    bookingId: "BK001",
    status: "CHECKED_IN",
  },
};

export const CheckInErrorResponse = {
  response: {
    data: {
      success: false,
      message: "Cannot check in. Show time has not started yet.",
    },
  },
};

export const NetworkErrorResponse = {
  message: "Network Error",
  code: "NETWORK_ERROR",
}; 