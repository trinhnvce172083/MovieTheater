import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { getAllRooms, createRoom, updateRoom, deleteRoom, CinemaRoom, CinemaRoomCreateRequest, CinemaRoomUpdateRequest } from '@/api/admin/getAllRooms';

interface UseRoomManagementProps {
  initialPageSize?: number;
}

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
    searchTerm: '',
    filterType: undefined,
    filterStatus: undefined,
  });

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
    }
  }, [pagination.currentPage, pagination.pageSize]);

  // Load data on component mount and when pagination changes
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Filtered data based on current filters
  const filteredData = useMemo(() => {
    if (!allRoomData || !Array.isArray(allRoomData)) return [];
    
    return allRoomData.filter(room => {
      const matchesSearch = !filters.searchTerm || 
        room.cinemaRoomName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        room.description?.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesType = !filters.filterType || room.roomType === filters.filterType;
      
      const matchesStatus = !filters.filterStatus || 
        (filters.filterStatus === 'active' && room.isActive) ||
        (filters.filterStatus === 'inactive' && !room.isActive);
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [allRoomData, filters]);

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
