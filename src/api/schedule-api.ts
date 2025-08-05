import axiosClient from "./axiosClient";

export interface Schedule {
  id: number;
  movieId: number;
  cinemaRoomId: number;
  startTime: string;
  endTime: string;
  price: number;
  status: string;
  availableSeats: number;
  totalSeats: number;
}

export interface CreateScheduleRequest {
  movieId: number;
  cinemaRoomId: number;
  startTime: string;
  price: number;
}

export interface UpdateScheduleRequest {
  movieId?: number;
  cinemaRoomId?: number;
  startTime?: string;
  price?: number;
  status?: string;
}

class ScheduleAPI {
  // Get all schedules
  async getAllSchedules(): Promise<Schedule[]> {
    try {
      const response = await axiosClient.get('/api/schedules');
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  }

  // For compatibility with existing code
  async getSchedulesForMovie(movieId: number, date?: string): Promise<Schedule[]> {
    try {
      const response = await axiosClient.get(`/api/schedules/movie/${movieId}`, {
        params: date ? { date } : {}
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules for movie:', error);
      throw error;
    }
  }

  // Get schedule by ID
  async getScheduleById(id: number): Promise<Schedule> {
    try {
      const response = await axiosClient.get(`/api/schedules/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  }

  // Get schedules by movie ID
  async getSchedulesByMovieId(movieId: number): Promise<Schedule[]> {
    try {
      const response = await axiosClient.get(`/api/schedules/movie/${movieId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules by movie:', error);
      throw error;
    }
  }

  // Get schedules by cinema room ID
  async getSchedulesByRoomId(roomId: number): Promise<Schedule[]> {
    try {
      const response = await axiosClient.get(`/api/schedules/room/${roomId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules by room:', error);
      throw error;
    }
  }

  // Create new schedule
  async createSchedule(data: CreateScheduleRequest): Promise<Schedule> {
    try {
      const response = await axiosClient.post('/api/schedules', data);
      return response.data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  }

  // Update schedule
  async updateSchedule(id: number, data: UpdateScheduleRequest): Promise<Schedule> {
    try {
      const response = await axiosClient.put(`/api/schedules/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  }

  // Delete schedule
  async deleteSchedule(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/api/schedules/${id}`);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }

  // Get available time slots for a room on a specific date
  async getAvailableTimeSlots(roomId: number, date: string): Promise<string[]> {
    try {
      const response = await axiosClient.get(`/api/schedules/room/${roomId}/available-slots`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      throw error;
    }
  }
}

const scheduleAPI = new ScheduleAPI();

// Export both default and named for compatibility
export default scheduleAPI;
export const ScheduleApiService = scheduleAPI;
