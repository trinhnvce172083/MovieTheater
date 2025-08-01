import { scheduleAxiosClient } from "./scheduleAxiosClient";
import { ApiResponse } from "@/types/member";
import { 
  AdminSchedule, 
  ScheduleCreateRequest, 
  ScheduleUpdateRequest,
  BulkScheduleCreateRequest,
  ScheduleFilters,
  SchedulePagination,
  ScheduleStatistics,
  ScheduleConflict,
  MovieOption,
  RoomOption
} from "../../app/admin/schedules/types";

export interface ScheduleApiService {
  getAllSchedules(filters?: ScheduleFilters, pagination?: Partial<SchedulePagination>): Promise<{
    schedules: AdminSchedule[];
    pagination: SchedulePagination;
  }>;
  getScheduleById(scheduleId: number): Promise<AdminSchedule>;
  createSchedule(request: ScheduleCreateRequest): Promise<AdminSchedule>;
  updateSchedule(request: ScheduleUpdateRequest): Promise<AdminSchedule>;
  deleteSchedule(scheduleId: number): Promise<void>;
  bulkCreateSchedules(request: BulkScheduleCreateRequest): Promise<AdminSchedule[]>;
  bulkDeleteSchedules(scheduleIds: number[]): Promise<void>;
  checkConflicts(request: ScheduleCreateRequest): Promise<ScheduleConflict[]>;
  getScheduleStatistics(startDate?: string, endDate?: string): Promise<ScheduleStatistics>;
  getMovieOptions(): Promise<MovieOption[]>;
  getRoomOptions(): Promise<RoomOption[]>;
  getSchedulesForMovie(movieId: number): Promise<AdminSchedule[]>;
  getSchedulesForRoom(roomId: number, date: string): Promise<AdminSchedule[]>;
}

class ScheduleApiServiceImpl implements ScheduleApiService {
  private transformScheduleResponse(backendSchedule: any): AdminSchedule {
    if (!backendSchedule) {
      throw new Error('Invalid schedule data received from backend');
    }

    const availableSeats = backendSchedule.availableSeats || 0;
    const bookedSeats = backendSchedule.bookedSeats || 0;
    const totalSeats = availableSeats + bookedSeats;
    
    return {
      scheduleId: backendSchedule.scheduleId,
      movieId: backendSchedule.movieId,
      movieName: backendSchedule.movieName || 'Unknown Movie',
      movieDuration: backendSchedule.movieDuration || 0,
      moviePoster: backendSchedule.moviePoster || '',
      movieRating: backendSchedule.movieRating || 'Not Rated',
      cinemaRoomId: backendSchedule.cinemaRoomId,
      cinemaRoomName: backendSchedule.cinemaRoomName || 'Unknown Room',
      roomType: backendSchedule.roomType || 'STANDARD',
      showDate: backendSchedule.showDate,
      startTime: backendSchedule.startTime,
      endTime: backendSchedule.endTime,
      price: backendSchedule.price || 0,
      status: backendSchedule.status || 'SCHEDULED',
      is3D: backendSchedule.is3D || false,
      isIMAX: backendSchedule.isIMAX || false,
      is4DX: backendSchedule.is4DX || false,
      subtitleLanguage: backendSchedule.subtitleLanguage || 'Vietnamese',
      audioLanguage: backendSchedule.audioLanguage || 'Vietnamese',
      availableSeats,
      bookedSeats,
      totalSeats,
      occupancyRate: backendSchedule.occupancyRate || (totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0),
      displayTime: backendSchedule.displayTime || 
        (backendSchedule.startTime && backendSchedule.endTime 
          ? `${backendSchedule.startTime.substring(0, 5)} - ${backendSchedule.endTime.substring(0, 5)}`
          : 'TBD'),
      displayDate: backendSchedule.displayDate || 
        (backendSchedule.showDate ? new Date(backendSchedule.showDate).toLocaleDateString('vi-VN') : 'TBD'),
      isBookable: backendSchedule.isBookable !== undefined ? backendSchedule.isBookable : 
        (backendSchedule.status === 'SCHEDULED' && 
         backendSchedule.showDate && backendSchedule.startTime &&
         new Date(`${backendSchedule.showDate}T${backendSchedule.startTime}`) > new Date()),
      priceDisplay: backendSchedule.priceDisplay || 
        (backendSchedule.price ? `${backendSchedule.price.toLocaleString('vi-VN')}đ` : '0đ'),
      specialFeatures: backendSchedule.specialFeatures || [
        backendSchedule.is3D && '3D',
        backendSchedule.isIMAX && 'IMAX', 
        backendSchedule.is4DX && '4DX'
      ].filter(Boolean).join(', ') || 'Standard',
      createdAt: backendSchedule.createdAt,
      updatedAt: backendSchedule.updatedAt
    };
  }

  async getAllSchedules(filters?: ScheduleFilters, pagination?: Partial<SchedulePagination>) {
    try {
      const params = new URLSearchParams();
      
      if (filters?.movieId && !isNaN(filters.movieId)) {
        params.append('movieId', filters.movieId.toString());
      }
      if (filters?.cinemaRoomId && !isNaN(filters.cinemaRoomId)) {
        params.append('cinemaRoomId', filters.cinemaRoomId.toString());
      }
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.searchTerm) params.append('search', filters.searchTerm);
      
      const page = (pagination?.currentPage || 1) - 1;
      const size = pagination?.pageSize || 10;
      params.append('page', page.toString());
      params.append('size', size.toString());
      
      const response = await scheduleAxiosClient.get(`/schedules?${params.toString()}`);
      const apiResponse = response.data as ApiResponse<any>;

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || "Failed to fetch schedules");
      }

      const data = apiResponse.data;
      const content = data?.content || data?.schedules || [];
      const pageInfo = data?.page || data;
      
      if (!Array.isArray(content)) {
        console.warn('Unexpected data structure:', data);
        return {
          schedules: [],
          pagination: {
            currentPage: 1,
            pageSize: 10,
            totalElements: 0,
            totalPages: 0
          }
        };
      }

      return {
        schedules: content.map(schedule => this.transformScheduleResponse(schedule)),
        pagination: {
          currentPage: (pageInfo.number || 0) + 1,
          pageSize: pageInfo.size || 10,
          totalElements: pageInfo.totalElements || 0,
          totalPages: pageInfo.totalPages || 0
        }
      };
    } catch (error: any) {
      console.error('Error fetching schedules:', error);
      throw new Error(error.message || 'Không thể tải danh sách lịch chiếu');
    }
  }

  async getScheduleById(scheduleId: number): Promise<AdminSchedule> {
    try {
      if (!scheduleId || isNaN(scheduleId)) {
        throw new Error('Invalid schedule ID');
      }

      const response = await scheduleAxiosClient.get(`/schedules/${scheduleId}`);
      const apiResponse = response.data as ApiResponse<any>;

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.message || "Schedule not found");
      }

      return this.transformScheduleResponse(apiResponse.data);
    } catch (error: any) {
      console.error('Error fetching schedule:', error);
      throw new Error(error.message || 'Không thể tải thông tin lịch chiếu');
    }
  }

  async createSchedule(request: ScheduleCreateRequest): Promise<AdminSchedule> {
    try {
      if (!request.movieId || !request.cinemaRoomId || !request.showDate || !request.startTime) {
        throw new Error('Missing required fields for schedule creation');
      }

      const response = await scheduleAxiosClient.post("/schedules", request);
      const apiResponse = response.data as ApiResponse<any>;

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.message || "Failed to create schedule");
      }

      return this.transformScheduleResponse(apiResponse.data);
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      throw new Error(error.message || 'Không thể tạo lịch chiếu');
    }
  }

  async updateSchedule(request: ScheduleUpdateRequest): Promise<AdminSchedule> {
    try {
      const { scheduleId, ...updateData } = request;
      
      if (!scheduleId || isNaN(scheduleId)) {
        throw new Error('Invalid schedule ID for update');
      }

      const response = await scheduleAxiosClient.put(`/schedules/${scheduleId}`, updateData);
      const apiResponse = response.data as ApiResponse<any>;

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.message || "Failed to update schedule");
      }

      return this.transformScheduleResponse(apiResponse.data);
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      throw new Error(error.message || 'Không thể cập nhật lịch chiếu');
    }
  }

  async deleteSchedule(scheduleId: number): Promise<void> {
    try {
      if (!scheduleId || isNaN(scheduleId)) {
        throw new Error('Invalid schedule ID for deletion');
      }

      const response = await scheduleAxiosClient.delete(`/schedules/${scheduleId}`);
      const apiResponse = response.data as ApiResponse<void>;

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || "Failed to delete schedule");
      }
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      throw new Error(error.message || 'Không thể xóa lịch chiếu');
    }
  }

  async bulkCreateSchedules(request: BulkScheduleCreateRequest): Promise<AdminSchedule[]> {
    const results: AdminSchedule[] = [];
    const errors: string[] = [];
    
    for (const timeSlot of request.timeSlots) {
      try {
        const scheduleRequest: ScheduleCreateRequest = {
          movieId: request.movieId,
          cinemaRoomId: timeSlot.cinemaRoomId,
          showDate: timeSlot.showDate,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          price: timeSlot.price,
          ...request.commonSettings
        };
        
        const schedule = await this.createSchedule(scheduleRequest);
        results.push(schedule);
      } catch (error: any) {
        errors.push(`${timeSlot.showDate} ${timeSlot.startTime}: ${error.message}`);
      }
    }
    
    if (errors.length > 0) {
      console.warn('Bulk create partial failures:', errors);
    }
    
    return results;
  }

  async bulkDeleteSchedules(scheduleIds: number[]): Promise<void> {
    const errors: string[] = [];
    
    for (const scheduleId of scheduleIds) {
      try {
        await this.deleteSchedule(scheduleId);
      } catch (error: any) {
        errors.push(`Schedule ${scheduleId}: ${error.message}`);
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`Some deletions failed: ${errors.join(', ')}`);
    }
  }

  async checkConflicts(request: ScheduleCreateRequest): Promise<ScheduleConflict[]> {
    try {
      const roomSchedules = await this.getSchedulesForRoom(
        request.cinemaRoomId, 
        request.showDate
      );
      
      const conflicts: ScheduleConflict[] = [];
      const requestStart = new Date(`${request.showDate}T${request.startTime}`);
      const requestEnd = request.endTime 
        ? new Date(`${request.showDate}T${request.endTime}`)
        : new Date(requestStart.getTime() + 2 * 60 * 60 * 1000);
      
      for (const existingSchedule of roomSchedules) {
        const existingStart = new Date(`${existingSchedule.showDate}T${existingSchedule.startTime}`);
        const existingEnd = new Date(`${existingSchedule.showDate}T${existingSchedule.endTime}`);
        
        if (requestStart < existingEnd && requestEnd > existingStart) {
          conflicts.push({
            type: 'ROOM_OVERLAP',
            severity: 'HIGH',
            conflictingScheduleId: existingSchedule.scheduleId,
            description: `Trùng lịch với suất chiếu "${existingSchedule.movieName}" (${existingSchedule.startTime}-${existingSchedule.endTime})`,
            suggestions: [
              'Chọn thời gian khác',
              'Chọn phòng chiếu khác',
              'Điều chỉnh thời lượng phim'
            ]
          });
        }
      }
      
      return conflicts;
    } catch (error: any) {
      console.error('Error checking conflicts:', error);
      return [];
    }
  }

  async getScheduleStatistics(startDate?: string, endDate?: string): Promise<ScheduleStatistics> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await scheduleAxiosClient.get(`/schedules/statistics?${params.toString()}`);
      const apiResponse = response.data as ApiResponse<any>;

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.message || "Failed to fetch statistics");
      }

      const stats = apiResponse.data;
      return {
        totalSchedules: stats.totalSchedules || 0,
        scheduledCount: stats.scheduledCount || 0,
        ongoingCount: stats.ongoingCount || 0,
        completedCount: stats.completedCount || 0,
        cancelledCount: stats.cancelledCount || 0,
        totalBookedSeats: stats.totalBookedSeats || 0,
        totalAvailableSeats: stats.totalAvailableSeats || 0,
        averageOccupancyRate: stats.averageOccupancyRate || 0,
        totalRevenue: stats.totalRevenue || 0,
        schedules3D: stats.schedules3D || 0,
        schedulesIMAX: stats.schedulesIMAX || 0,
        schedules4DX: stats.schedules4DX || 0,
        averagePrice: stats.averagePrice || 0
      };
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      throw new Error(error.message || 'Không thể tải thống kê');
    }
  }

  async getMovieOptions(): Promise<MovieOption[]> {
    try {
      const response = await scheduleAxiosClient.get("/movies");
      const apiResponse = response.data as ApiResponse<any>;

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || "Failed to fetch movies");
      }

      const movies = apiResponse.data;
      
      if (!Array.isArray(movies)) {
        console.warn('Movies data is not an array:', movies);
        return [];
      }

      return movies.map((movie: any) => ({
        movieId: movie.movieId || movie.id,
        title: movie.title || movie.movieName || 'Unknown Movie',
        duration: movie.duration || movie.movieDuration || 0,
        status: movie.status || 'ACTIVE',
        posterUrl: movie.poster_url || movie.posterUrl || movie.moviePoster || ''
      }));
    } catch (error: any) {
      console.error('Error fetching movie options:', error);
      throw new Error(error.message || 'Không thể tải danh sách phim');
    }
  }

  async getRoomOptions(): Promise<RoomOption[]> {
    try {
      const response = await scheduleAxiosClient.get("/cinema-rooms");
      const apiResponse = response.data as ApiResponse<any>;

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || "Failed to fetch rooms");
      }

      const rooms = apiResponse.data;
      
      if (!Array.isArray(rooms)) {
        console.warn('Rooms data is not an array:', rooms);
        return [];
      }

      return rooms.map((room: any) => ({
        cinemaRoomId: room.cinemaRoomId || room.id,
        roomName: room.roomName || room.name || 'Unknown Room',
        roomType: room.roomType || 'STANDARD',
        totalSeats: room.totalSeats || 0,
        isActive: room.isActive !== false
      }));
    } catch (error: any) {
      console.error('Error fetching room options:', error);
      throw new Error(error.message || 'Không thể tải danh sách phòng chiếu');
    }
  }

  async getSchedulesForMovie(movieId: number): Promise<AdminSchedule[]> {
    try {
      if (!movieId || isNaN(movieId)) {
        throw new Error('Invalid movie ID');
      }

      const response = await scheduleAxiosClient.get(`/schedules/movie/${movieId}`);
      const apiResponse = response.data as ApiResponse<any>;

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || "Failed to fetch movie schedules");
      }

      const schedules = apiResponse.data;
      if (!Array.isArray(schedules)) {
        return [];
      }

      return schedules.map(schedule => this.transformScheduleResponse(schedule));
    } catch (error: any) {
      console.error('Error fetching movie schedules:', error);
      throw new Error(error.message || 'Không thể tải lịch chiếu của phim');
    }
  }

  async getSchedulesForRoom(roomId: number, date: string): Promise<AdminSchedule[]> {
    try {
      if (!roomId || isNaN(roomId) || !date) {
        throw new Error('Invalid room ID or date');
      }

      const response = await scheduleAxiosClient.get(`/schedules/room/${roomId}?date=${date}`);
      const apiResponse = response.data as ApiResponse<any>;

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || "Failed to fetch room schedules");
      }

      const schedules = apiResponse.data;
      if (!Array.isArray(schedules)) {
        return [];
      }

      return schedules.map(schedule => this.transformScheduleResponse(schedule));
    } catch (error: any) {
      console.error('Error fetching room schedules:', error);
      throw new Error(error.message || 'Không thể tải lịch chiếu của phòng');
    }
  }
}

export const scheduleApiService = new ScheduleApiServiceImpl();
