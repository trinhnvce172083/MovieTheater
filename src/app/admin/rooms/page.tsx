"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  Card,
  Button,
  Form,
  message,
  Spin,
  Typography,
  Pagination,
  Alert,
} from "antd";
import {
  PlusOutlined,
} from "@ant-design/icons";
import { getAllRooms, createRoom, updateRoom, deleteRoom } from "@/api/admin/getAllRooms";
import { useRouter } from 'next/navigation';

// Import organized components
import {
  RoomStatisticsCard,
  RoomFiltersComponent,
  createRoomTableColumns,
  RoomFormModal,
} from './components';
import { CinemaRoomResponse, RoomCreateRequest, RoomFilters } from './types';
import { filterRooms, calculateRoomStatistics } from './utils';
import { useIsMobile } from "@/hooks/use-mobile";

const { Text } = Typography;

// Custom hook for debounced value
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function CinemaRoomManagement() {
  const isMobile = useIsMobile();
  const [form] = Form.useForm();
  const router = useRouter();
  
  // State
  const [allRoomData, setAllRoomData] = useState<CinemaRoomResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<CinemaRoomResponse | null>(null);
  const [isUsingApiData, setIsUsingApiData] = useState(true);

  // Filters with debounced search
  const [filters, setFilters] = useState<RoomFilters>({
    searchTerm: '',
    filterType: undefined,
    filterStatus: undefined,
  });

  // Debounce search term to improve performance
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  // Create debounced filters object
  const debouncedFilters = useMemo(() => ({
    ...filters,
    searchTerm: debouncedSearchTerm
  }), [filters, debouncedSearchTerm]);

  // Fetch rooms function with filters
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all rooms data (we'll handle pagination on frontend due to no filter API)
      const response = await getAllRooms(0, 1000); // Get all rooms
      
      // Check if response has the expected structure
      if (response && response.content && Array.isArray(response.content)) {
        setAllRoomData(response.content);
      } else {
        console.warn('Unexpected API response structure:', response);
        setAllRoomData([]);
      }
      setIsUsingApiData(true);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      message.error("Failed to connect to backend server");
      setAllRoomData([]);
      setIsUsingApiData(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Computed values for filtering and pagination
  const filteredData = useMemo(() => {
    // Ensure allRoomData is an array before filtering
    if (!allRoomData || !Array.isArray(allRoomData)) {
      return [];
    }
    return filterRooms(allRoomData, debouncedFilters);
  }, [allRoomData, debouncedFilters]);

  const paginatedData = useMemo(() => {
    // Ensure filteredData is an array before slicing
    if (!filteredData || !Array.isArray(filteredData)) {
      return [];
    }
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  const statistics = useMemo(() => {
    // Ensure allRoomData is an array before calculating statistics
    if (!allRoomData || !Array.isArray(allRoomData)) {
      return { totalRooms: 0, activeRooms: 0, totalSeats: 0, avgSeats: 0 };
    }
    return calculateRoomStatistics(allRoomData);
  }, [allRoomData]);
  const createRoomFunction = async (roomData: RoomCreateRequest) => {
    try {
      setLoading(true);
      const response = await createRoom(roomData);
      console.log('Create room response:', response);
      message.success("Room created successfully!");
      await fetchRooms(); // Wait for refresh to complete
      return true;
    } catch (error: unknown) {
      console.error('Create room error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create room";
      message.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateRoomFunction = async (id: number, roomData: RoomCreateRequest) => {
    try {
      setLoading(true);
      console.log('Updating room with ID:', id, 'Data:', roomData);
      
      // Show warning for features that will be lost due to backend limitations
      if (roomData.has3D || roomData.hasDolbyAtmos || roomData.hasReclinerSeats || 
          (roomData.priceMultiplier && roomData.priceMultiplier !== 1.0) ||
          roomData.roomType === 'IMAX' || roomData.roomType === '4DX') {
        message.warning(
          'Note: Some advanced features (3D, Dolby Atmos, Recliner Seats, Custom Price Multiplier, IMAX/4DX types) ' +
          'may not be fully preserved due to backend limitations. Only basic room information will be updated.',
          5
        );
      }
      
      const response = await updateRoom(id, roomData);
      console.log('Update room response:', response);
      message.success("Room updated successfully!");
      console.log('Refreshing room list after small delay...');
      
      // Small delay to ensure backend consistency
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchRooms(); // Wait for refresh to complete
      console.log('Room list refreshed');
      return true;
    } catch (error: unknown) {
      console.error('Update room error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update room";
      message.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteRoomFunction = async (id: number) => {
    try {
      setLoading(true);
      await deleteRoom(id);
      message.success("Room deleted successfully!");
      await fetchRooms(); // Wait for refresh to complete
    } catch (error: unknown) {
      console.error('Delete room error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete room";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleEdit = (record: CinemaRoomResponse) => {
    setEditingRoom(record);
    setIsModalVisible(true);
  };

  const handleDelete = (roomId: number) => {
    deleteRoomFunction(roomId);
  };

  const handleView = (record: CinemaRoomResponse) => {
    console.log('Navigating to room detail with ID:', record.cinemaRoomId);
    router.push(`/admin/rooms/${record.cinemaRoomId}`);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Additional validation
      if (values.rows * values.columns !== values.seatQuantity) {
        message.error('Seat quantity must equal rows × columns');
        return;
      }

      if (editingRoom) {
        const success = await updateRoomFunction(editingRoom.cinemaRoomId, values);
        if (success) {
          setIsModalVisible(false);
          setEditingRoom(null);
          form.resetFields();
        }
      } else {
        const success = await createRoomFunction(values);
        if (success) {
          setIsModalVisible(false);
          form.resetFields();
        }
      }
    } catch (error) {
      console.error('Form validation failed:', error);
      // Form validation errors are automatically displayed by Ant Design
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingRoom(null);
    form.resetFields();
  };

  const handleAddNewRoom = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  // Filter handlers
  const updateFilters = useCallback((newFilters: Partial<RoomFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [filters]);

  const clearFilters = useCallback(() => {
    const clearedFilters = {
      searchTerm: '',
      filterType: undefined,
      filterStatus: undefined,
    };
    setFilters(clearedFilters);
    // Reset to page 1 when clearing filters
    setCurrentPage(1);
  }, []);

  // Computed values
  // (statistics already computed above)

  // Table columns
  const columns = createRoomTableColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onView: handleView,
    loading,
    isUsingApiData,
  });

  // Effects
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Demo Data Warning */}
        {!isUsingApiData && (
          <Alert
            message="Demo Mode - Using Sample Data"
            description="You are viewing sample data. Connect to the backend server to enable full CRUD operations."
            type="warning"
            showIcon
            className="mb-6"
            closable
          />
        )}

        {/* Statistics Cards */}
        <RoomStatisticsCard statistics={statistics} loading={loading} />

        {/* Main Content Card */}
        <Card
          className="shadow-sm border-0"
          styles={{ body: { padding: 0 } }}
          style={{ borderRadius: 16 }}
        >
          {/* Header Section */}
          <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div>
              <h1 className="m-0 text-gray-900 text-xl xl:text-2xl font-semibold">
                Room Management
              </h1>
              <Text type="secondary" className="text-sm xl:text-base">
                Manage and organize your cinema room facilities
              </Text>
              {!isUsingApiData && (
                <Text className="text-orange-600 text-sm">⚠️ Currently using offline data</Text>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="middle"
                className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm text-xs xl:text-sm h-10 px-4"
                onClick={handleAddNewRoom}
                disabled={!isUsingApiData}
                title={!isUsingApiData ? "Create/Edit functions require backend connection" : "Add new room"}
              >
                Add New Room
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <RoomFiltersComponent
            filters={filters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
          />

          {/* Table Section */}
          <div className="bg-white">
            <Spin spinning={loading}>
              {filteredData.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="text-gray-400 text-6xl mb-4">🏠</div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    {allRoomData.length === 0 ? 'No rooms found' : 'No rooms match your filters'}
                  </h3>
                  <p className="text-gray-500 text-center mb-4">
                    {allRoomData.length === 0 
                      ? 'Create your first cinema room to get started'
                      : 'Try adjusting your search terms or filters'
                    }
                  </p>
                  {allRoomData.length === 0 && isUsingApiData && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddNewRoom}
                    >
                      Add Your First Room
                    </Button>
                  )}
                </div>
              ) : (
                <Table
                  dataSource={paginatedData}
                  columns={columns}
                  pagination={false}
                  scroll={{ x: 950 }}
                  rowClassName="hover:bg-gray-50 transition-colors"
                  className="professional-table"
                  size="small"
                  loading={loading}
                  rowKey="cinemaRoomId"
                />
              )}
            </Spin>
            
            {/* Pagination */}
            <div className="px-6 py-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Text type="secondary" className="text-sm">
                Showing {Math.max(1, (currentPage - 1) * pageSize + 1)} to{" "}
                {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
                {filteredData.length} rooms
              </Text>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredData.length}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  if (size !== pageSize) {
                    setPageSize(size);
                    setCurrentPage(1); // Reset to page 1 when page size changes
                  }
                }}
                showSizeChanger
                showQuickJumper={false}
                pageSizeOptions={["5", "10", "20", "50"]}
                size="default"
              />
            </div>
          </div>
        </Card>

        {/* Modal */}
        <RoomFormModal
          visible={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          editingRoom={editingRoom}
          loading={loading}
          form={form}
        />
      </div>
    </div>
  );
};
