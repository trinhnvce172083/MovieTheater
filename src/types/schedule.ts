export interface Schedule {
  scheduleId: number;
  showDate: string;
  startTime: TimeObject;
  endTime: TimeObject;
  price: number;
  status: string;
  is3D: boolean;
  isIMAX: boolean;
  is4DX: boolean;
  availableSeats: number;
  bookedSeats: number;
  movieId: number;
  movieName: string;
  moviePoster: string;
  movieDuration: number;
  movieRating: string;
  cinemaRoomId: number;
  cinemaRoomName: string;
  roomType: string;
  displayTime: string;
  displayDate: string;
  isBookable: boolean;
  occupancyRate: number;
  specialFeatures: string;
  priceDisplay: string;
}

export interface TimeObject {
  hour: number;
  minute: number;
  second: number;
  nano: number;
} 