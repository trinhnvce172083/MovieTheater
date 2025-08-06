export interface AdminSchedule {
  scheduleId: number;
  movieId: number;
  movieName: string;
  movieDuration: number;
  moviePoster?: string;
  movieRating?: string;
  cinemaRoomId: number;
  cinemaRoomName: string;
  roomType: string;
  showDate: string;
  startTime: string;
  endTime: string;
  price: number;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  
  // Special features for member experience
  is3D: boolean;
  isIMAX: boolean;
  is4DX: boolean;
  subtitleLanguage: string;
  audioLanguage: string;
  
  // Booking information
  availableSeats: number;
  bookedSeats: number;
  totalSeats?: number;
  occupancyRate: number;
  
  // Display helpers for member view (computed)
  displayTime: string;
  displayDate: string;
  isBookable: boolean;
  priceDisplay: string;
  specialFeatures: string;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduleCreateRequest {
  movieId: number;
  cinemaRoomId: number;
  showDate: string;
  startTime: string;
  endTime: string;
  price: number;
  timeSlotType?: string;
  status?: 'SCHEDULED';
  is3D?: boolean;
  isIMAX?: boolean;
  is4DX?: boolean;
  subtitleLanguage?: string;
  audioLanguage?: string;
}

export interface ScheduleUpdateRequest extends Partial<ScheduleCreateRequest> {
  scheduleId: number;
}

export interface BulkScheduleCreateRequest {
  movieId: number;
  timeSlots: Array<{
    cinemaRoomId: number;
    showDate: string;
    startTime: string;
    endTime?: string;
    price: number;
  }>;
  commonSettings: {
    is3D?: boolean;
    isIMAX?: boolean;
    is4DX?: boolean;
    subtitleLanguage?: string;
    audioLanguage?: string;
  };
}

export interface ScheduleFilters {
  movieId?: number;
  cinemaRoomId?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  searchTerm?: string;
}

export interface SchedulePagination {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface ScheduleConflict {
  type: 'ROOM_OVERLAP' | 'STAFF_CONFLICT' | 'MAINTENANCE';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  conflictingScheduleId?: number;
  description: string;
  suggestions: string[];
}

export interface ScheduleStatistics {
  totalSchedules: number;
  scheduledCount: number;
  ongoingCount: number;
  completedCount: number;
  cancelledCount: number;
  totalBookedSeats: number;
  totalAvailableSeats: number;
  averageOccupancyRate: number;
  totalRevenue: number;
  schedules3D: number;
  schedulesIMAX: number;
  schedules4DX: number;
  averagePrice: number;
}

export interface MovieOption {
  movieId: number;
  title: string;
  duration: number;
  status: string;
  poster?: string;
  rating?: string;
}

export interface RoomOption {
  cinemaRoomId: number;
  roomName: string;
  roomType: string;
  totalSeats: number;
  isActive: boolean;
}
