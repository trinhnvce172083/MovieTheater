import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { scheduleApiService } from '@/api/admin/scheduleService';
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
} from '../types';

export interface UseScheduleManagementReturn {
  // Data
  schedules: AdminSchedule[];
  loading: boolean;
  pagination: SchedulePagination;
  selectedSchedules: number[];
  statistics: ScheduleStatistics | null;
  movieOptions: MovieOption[];
  roomOptions: RoomOption[];
  
  // Actions
  loadSchedules: (filters?: ScheduleFilters, paginationParams?: Partial<SchedulePagination>) => Promise<void>;
  createSchedule: (request: ScheduleCreateRequest) => Promise<void>;
  updateSchedule: (request: ScheduleUpdateRequest) => Promise<void>;
  deleteSchedule: (scheduleId: number) => Promise<void>;
  bulkCreateSchedules: (request: BulkScheduleCreateRequest) => Promise<void>;
  bulkDeleteSchedules: (scheduleIds: number[]) => Promise<void>;
  checkConflicts: (request: ScheduleCreateRequest) => Promise<ScheduleConflict[]>;
  loadStatistics: (startDate?: string, endDate?: string) => Promise<void>;
  loadOptions: () => Promise<void>;
  
  // Selections
  setSelectedSchedules: (scheduleIds: number[]) => void;
  toggleScheduleSelection: (scheduleId: number) => void;
  selectAllSchedules: () => void;
  clearSelection: () => void;
  
  // Utilities
  refreshData: () => Promise<void>;
}

export const useScheduleManagement = (): UseScheduleManagementReturn => {
  const [schedules, setSchedules] = useState<AdminSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<SchedulePagination>({
    currentPage: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0
  });
  const [selectedSchedules, setSelectedSchedules] = useState<number[]>([]);
  const [statistics, setStatistics] = useState<ScheduleStatistics | null>(null);
  const [movieOptions, setMovieOptions] = useState<MovieOption[]>([]);
  const [roomOptions, setRoomOptions] = useState<RoomOption[]>([]);
  const [currentFilters, setCurrentFilters] = useState<ScheduleFilters>({});

  const loadSchedules = useCallback(async (
    filters?: ScheduleFilters,
    paginationParams?: Partial<SchedulePagination>
  ) => {
    try {
      setLoading(true);
      
      const newFilters = filters || currentFilters;
      const newPagination = { ...pagination, ...paginationParams };
      
      setCurrentFilters(newFilters);
      
      const response = await scheduleApiService.getAllSchedules(newFilters, newPagination);
      
      setSchedules(response.schedules);
      setPagination(response.pagination);
      
    } catch (error) {
      console.error('Error loading schedules:', error);
      message.error('Không thể tải danh sách lịch chiếu');
    } finally {
      setLoading(false);
    }
  }, [currentFilters, pagination]);

  const createSchedule = useCallback(async (request: ScheduleCreateRequest) => {
    try {
      setLoading(true);
      
      // Check conflicts first
      const conflicts = await scheduleApiService.checkConflicts(request);
      
      if (conflicts.some(c => c.severity === 'HIGH')) {
        const highConflicts = conflicts.filter(c => c.severity === 'HIGH');
        message.error(`Có xung đột nghiêm trọng: ${highConflicts[0].description}`);
        return;
      }
      
      if (conflicts.some(c => c.severity === 'MEDIUM')) {
        const mediumConflicts = conflicts.filter(c => c.severity === 'MEDIUM');
        message.warning(`Cảnh báo: ${mediumConflicts[0].description}`);
      }
      
      await scheduleApiService.createSchedule(request);
      message.success('Tạo lịch chiếu thành công');
      
      // Refresh data
      await loadSchedules();
      
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      message.error(error.message || 'Không thể tạo lịch chiếu');
    } finally {
      setLoading(false);
    }
  }, [loadSchedules]);

  const updateSchedule = useCallback(async (request: ScheduleUpdateRequest) => {
    try {
      setLoading(true);
      
      await scheduleApiService.updateSchedule(request);
      message.success('Cập nhật lịch chiếu thành công');
      
      // Refresh data
      await loadSchedules();
      
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      message.error(error.message || 'Không thể cập nhật lịch chiếu');
    } finally {
      setLoading(false);
    }
  }, [loadSchedules]);

  const deleteSchedule = useCallback(async (scheduleId: number) => {
    try {
      setLoading(true);
      
      await scheduleApiService.deleteSchedule(scheduleId);
      message.success('Xóa lịch chiếu thành công');
      
      // Remove from selection if selected
      setSelectedSchedules(prev => prev.filter(id => id !== scheduleId));
      
      // Refresh data
      await loadSchedules();
      
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      message.error(error.message || 'Không thể xóa lịch chiếu');
    } finally {
      setLoading(false);
    }
  }, [loadSchedules]);

  const bulkCreateSchedules = useCallback(async (request: BulkScheduleCreateRequest) => {
    try {
      setLoading(true);
      
      const createdSchedules = await scheduleApiService.bulkCreateSchedules(request);
      message.success(`Tạo thành công ${createdSchedules.length} lịch chiếu`);
      
      // Refresh data
      await loadSchedules();
      
    } catch (error: any) {
      console.error('Error bulk creating schedules:', error);
      message.error(error.message || 'Không thể tạo hàng loạt lịch chiếu');
    } finally {
      setLoading(false);
    }
  }, [loadSchedules]);

  const bulkDeleteSchedules = useCallback(async (scheduleIds: number[]) => {
    try {
      setLoading(true);
      
      await scheduleApiService.bulkDeleteSchedules(scheduleIds);
      message.success(`Xóa thành công ${scheduleIds.length} lịch chiếu`);
      
      // Clear selection
      setSelectedSchedules([]);
      
      // Refresh data
      await loadSchedules();
      
    } catch (error: any) {
      console.error('Error bulk deleting schedules:', error);
      message.error(error.message || 'Không thể xóa hàng loạt lịch chiếu');
    } finally {
      setLoading(false);
    }
  }, [loadSchedules]);

  const checkConflicts = useCallback(async (request: ScheduleCreateRequest): Promise<ScheduleConflict[]> => {
    try {
      return await scheduleApiService.checkConflicts(request);
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return [];
    }
  }, []);

  const loadStatistics = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      const stats = await scheduleApiService.getScheduleStatistics(startDate, endDate);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
      message.error('Không thể tải thống kê');
    }
  }, []);

  const loadOptions = useCallback(async () => {
    try {
      const [movies, rooms] = await Promise.all([
        scheduleApiService.getMovieOptions(),
        scheduleApiService.getRoomOptions()
      ]);
      
      setMovieOptions(movies);
      setRoomOptions(rooms);
      
    } catch (error) {
      console.error('Error loading options:', error);
      message.error('Không thể tải danh sách phim và phòng');
    }
  }, []);

  // Selection handlers
  const toggleScheduleSelection = useCallback((scheduleId: number) => {
    setSelectedSchedules(prev => {
      if (prev.includes(scheduleId)) {
        return prev.filter(id => id !== scheduleId);
      } else {
        return [...prev, scheduleId];
      }
    });
  }, []);

  const selectAllSchedules = useCallback(() => {
    setSelectedSchedules(schedules.map(schedule => schedule.scheduleId));
  }, [schedules]);

  const clearSelection = useCallback(() => {
    setSelectedSchedules([]);
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      loadSchedules(),
      loadOptions(),
      loadStatistics()
    ]);
  }, [loadSchedules, loadOptions, loadStatistics]);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, []);

  return {
    // Data
    schedules,
    loading,
    pagination,
    selectedSchedules,
    statistics,
    movieOptions,
    roomOptions,
    
    // Actions
    loadSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    bulkCreateSchedules,
    bulkDeleteSchedules,
    checkConflicts,
    loadStatistics,
    loadOptions,
    
    // Selections
    setSelectedSchedules,
    toggleScheduleSelection,
    selectAllSchedules,
    clearSelection,
    
    // Utilities
    refreshData
  };
};
