import { useState, useEffect, useCallback, useMemo } from 'react';
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

  return {
    // Data
    allRoomData,
    filteredData,
    paginatedData,
    statistics,
    
    // State
    loading,
    isUsingApiData,
    totalElements,
    filters,
    pagination,
    
    // Actions
    setFilters,
    setPagination,
    fetchRooms,
    createRoom: createRoomAction,
    updateRoom: updateRoomAction,
    deleteRoom: deleteRoomAction,
  };
};
