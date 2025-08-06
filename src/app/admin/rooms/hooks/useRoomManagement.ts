import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
<<<<<<< HEAD
import { getAllRooms } from '@/src/api/admin/rooms/getAllRooms';
import { CinemaRoomResponse, RoomCreateRequest, RoomManagementState, RoomFilters, BackendStatus } from '../types';
import { MOCK_ROOMS, filterRooms, calculateRoomStatistics } from '../utils';
=======
import { getAllRooms, createRoom, updateRoom, deleteRoom, CinemaRoom, CinemaRoomCreateRequest, CinemaRoomUpdateRequest } from '@/api/admin/getAllRooms';
>>>>>>> adminpage5

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

<<<<<<< HEAD
  const [filters, setFilters] = useState<RoomFilters>({
=======
interface Filters {
  searchTerm: string;
  filterType: string | undefined;
  filterStatus: string | undefined;
}

interface Pagination {
  currentPage: number;
  pageSize: number;
}

export const useRoomManagement = ({ initialPageSize = 10 }: UseRoomManagementProps = {}) => {
  // Data state
  const [allRoomData, setAllRoomData] = useState<CinemaRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUsingApiData, setIsUsingApiData] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Debug: Log when allRoomData changes
  useEffect(() => {
    console.log('🔄 allRoomData updated:', allRoomData.length, 'rooms');
    if (allRoomData.length > 0) {
      console.log('📝 First room data:', allRoomData[0]);
    }
  }, [allRoomData]);

  // Filter state
  const [filters, setFilters] = useState<Filters>({
>>>>>>> adminpage5
    searchTerm: '',
    filterType: undefined,
    filterStatus: undefined,
  });

<<<<<<< HEAD
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
=======
  // Pagination state
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    pageSize: initialPageSize,
  });

  // Fetch rooms function
  const fetchRooms = useCallback(async () => {
    console.log('🔄 Fetching rooms - Page:', pagination.currentPage, 'Size:', pagination.pageSize);
    setLoading(true);
    try {
      const response = await getAllRooms(pagination.currentPage - 1, pagination.pageSize);
      
      if (response && response.content && Array.isArray(response.content)) {
        console.log('✅ Rooms fetched successfully:', response.content.length, 'rooms');
        console.log('📊 Room data:', response.content.map(r => ({id: r.cinemaRoomId, name: r.cinemaRoomName, updatedAt: r.updatedAt})));
        
        // Force state update by creating new array reference
        const newRoomData = [...response.content];
        setAllRoomData(newRoomData);
        setTotalElements(response.page.totalElements);
        console.log('🔄 State updated with new room data:', newRoomData.length, 'rooms');
        setIsUsingApiData(true);
      } else {
        console.warn('⚠️ Unexpected API response structure:', response);
        setAllRoomData([]);
        setTotalElements(0);
        setIsUsingApiData(false);
      }
    } catch (error) {
      console.error("❌ Failed to fetch rooms:", error);
      message.error("Failed to connect to backend server");
      setAllRoomData([]);
      setTotalElements(0);
      setIsUsingApiData(false);
    } finally {
      setLoading(false);
>>>>>>> adminpage5
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

<<<<<<< HEAD
  // Initialize data
  useEffect(() => {
    fetchRooms(1, state.pageSize);
  }, []);
=======
  // Paginated data for display
  const paginatedData = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, pagination]);

  // Statistics
  const statistics = useMemo(() => {
    const totalRooms = allRoomData.length;
    const activeRooms = allRoomData.filter(room => room.isActive).length;
    const totalSeats = allRoomData.reduce((sum, room) => sum + room.seatQuantity, 0);
    const avgSeats = totalRooms > 0 ? Math.round(totalSeats / totalRooms) : 0;

    return {
      totalRooms,
      activeRooms,
      totalSeats,
      avgSeats,
    };
  }, [allRoomData]);

  // CRUD operations
  const createRoomAction = useCallback(async (roomData: CinemaRoomCreateRequest): Promise<boolean> => {
    setLoading(true);
    try {
      await createRoom(roomData);
      message.success('Room created successfully!');
      await fetchRooms();
      return true;
    } catch (error) {
      console.error('Failed to create room:', error);
      message.error('Failed to create room');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchRooms]);

  const updateRoomAction = useCallback(async (id: number, roomData: CinemaRoomUpdateRequest): Promise<boolean> => {
    setLoading(true);
    try {
      console.log('🔄 Starting update for room ID:', id, 'with data:', roomData);
      const updatedRoom = await updateRoom(id, roomData);
      console.log('✅ Update API returned:', updatedRoom);
      
      message.success('Room updated successfully!');
      
      // Add small delay to ensure backend has processed the update
      console.log('⏳ Waiting 500ms before refresh...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🔄 Refreshing room list...');
      await fetchRooms();
      console.log('✅ Room list refreshed');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to update room:', error);
      message.error('Failed to update room');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchRooms]);

  const deleteRoomAction = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    try {
      await deleteRoom(id);
      message.success('Room deleted successfully!');
      await fetchRooms();
      return true;
    } catch (error) {
      console.error('Failed to delete room:', error);
      message.error('Failed to delete room');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchRooms]);
>>>>>>> adminpage5

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
