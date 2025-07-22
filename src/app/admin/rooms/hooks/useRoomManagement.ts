import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { getAllRooms } from '@/src/api/admin/rooms/getAllRooms';
import { CinemaRoomResponse, RoomCreateRequest, RoomManagementState, RoomFilters, BackendStatus } from '../types';
import { MOCK_ROOMS, filterRooms, calculateRoomStatistics } from '../utils';

export const useRoomManagement = () => {
  const [state, setState] = useState<RoomManagementState>({
    roomData: [],
    loading: false,
    currentPage: 1,
    pageSize: 10,
    totalElements: 0,
    isModalVisible: false,
    editingRoom: null,
    isUsingApiData: true,
    backendStatus: "checking",
  });

  const [filters, setFilters] = useState<RoomFilters>({
    searchTerm: '',
    filterType: undefined,
    filterStatus: undefined,
  });

  const checkBackendStatus = useCallback(async (): Promise<BackendStatus> => {
    try {
      const response = await fetch('/api/admin/rooms/health', { 
        method: 'HEAD',
        timeout: 5000 
      } as any);
      return response.ok ? "connected" : "disconnected";
    } catch {
      return "disconnected";
    }
  }, []);

  const fetchRooms = useCallback(async (page: number = 1, size: number = 10) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const backendStatus = await checkBackendStatus();
      setState(prev => ({ ...prev, backendStatus }));

      if (backendStatus === "connected") {
        const response = await getAllRooms(page - 1, size);
        setState(prev => ({
          ...prev,
          roomData: response.content || response,
          totalElements: response.totalElements || response.length || 0,
          isUsingApiData: true,
          loading: false,
        }));
      } else {
        // Use mock data when backend is unavailable
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const paginatedData = MOCK_ROOMS.slice(startIndex, endIndex);
        
        setState(prev => ({
          ...prev,
          roomData: paginatedData,
          totalElements: MOCK_ROOMS.length,
          isUsingApiData: false,
          loading: false,
        }));
        message.warning('Backend unavailable. Using offline data.');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      
      // Fallback to mock data
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      const paginatedData = MOCK_ROOMS.slice(startIndex, endIndex);
      
      setState(prev => ({
        ...prev,
        roomData: paginatedData,
        totalElements: MOCK_ROOMS.length,
        isUsingApiData: false,
        loading: false,
      }));
      message.error('Failed to fetch rooms. Using offline data.');
    }
  }, [checkBackendStatus]);

  const handleCreateRoom = useCallback(async (roomData: RoomCreateRequest) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      if (state.isUsingApiData) {
        await createRoom(roomData);
        message.success('Room created successfully!');
      } else {
        // Mock creation for offline mode
        const newRoom: CinemaRoomResponse = {
          cinemaRoomId: Math.max(...MOCK_ROOMS.map(r => r.cinemaRoomId)) + 1,
          ...roomData,
          isActive: roomData.isActive ?? true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        MOCK_ROOMS.push(newRoom);
        message.success('Room created successfully! (Offline mode)');
      }
      
      await fetchRooms(state.currentPage, state.pageSize);
      setState(prev => ({ ...prev, isModalVisible: false }));
    } catch (error) {
      console.error('Error creating room:', error);
      message.error('Failed to create room. Please try again.');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.isUsingApiData, state.currentPage, state.pageSize, fetchRooms]);

  const handleUpdateRoom = useCallback(async (roomId: number, roomData: Partial<RoomCreateRequest>) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      if (state.isUsingApiData) {
        await updateRoom(roomId, roomData);
        message.success('Room updated successfully!');
      } else {
        // Mock update for offline mode
        const index = MOCK_ROOMS.findIndex(r => r.cinemaRoomId === roomId);
        if (index !== -1) {
          MOCK_ROOMS[index] = { 
            ...MOCK_ROOMS[index], 
            ...roomData,
            updatedAt: new Date().toISOString()
          };
        }
        message.success('Room updated successfully! (Offline mode)');
      }
      
      await fetchRooms(state.currentPage, state.pageSize);
      setState(prev => ({ ...prev, isModalVisible: false, editingRoom: null }));
    } catch (error) {
      console.error('Error updating room:', error);
      message.error('Failed to update room. Please try again.');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.isUsingApiData, state.currentPage, state.pageSize, fetchRooms]);

  const handleDeleteRoom = useCallback(async (roomId: number) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      if (state.isUsingApiData) {
        await deleteRoom(roomId);
        message.success('Room deleted successfully!');
      } else {
        // Mock deletion for offline mode
        const index = MOCK_ROOMS.findIndex(r => r.cinemaRoomId === roomId);
        if (index !== -1) {
          MOCK_ROOMS.splice(index, 1);
        }
        message.success('Room deleted successfully! (Offline mode)');
      }
      
      await fetchRooms(state.currentPage, state.pageSize);
    } catch (error) {
      console.error('Error deleting room:', error);
      message.error('Failed to delete room. Please try again.');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.isUsingApiData, state.currentPage, state.pageSize, fetchRooms]);

  // Computed values
  const filteredRooms = filterRooms(state.roomData, filters);
  const statistics = calculateRoomStatistics(state.roomData);

  // Modal handlers
  const showModal = useCallback((room?: CinemaRoomResponse) => {
    setState(prev => ({
      ...prev,
      isModalVisible: true,
      editingRoom: room || null,
    }));
  }, []);

  const hideModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isModalVisible: false,
      editingRoom: null,
    }));
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((page: number, size?: number) => {
    const newSize = size || state.pageSize;
    setState(prev => ({ ...prev, currentPage: page, pageSize: newSize }));
    fetchRooms(page, newSize);
  }, [state.pageSize, fetchRooms]);

  // Filter handlers
  const updateFilters = useCallback((newFilters: Partial<RoomFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      filterType: undefined,
      filterStatus: undefined,
    });
  }, []);

  // Initialize data
  useEffect(() => {
    fetchRooms(1, state.pageSize);
  }, []);

  return {
    // State
    ...state,
    filters,
    filteredRooms,
    statistics,
    
    // Actions
    fetchRooms,
    handleCreateRoom,
    handleUpdateRoom,
    handleDeleteRoom,
    showModal,
    hideModal,
    handlePageChange,
    updateFilters,
    clearFilters,
  };
};
