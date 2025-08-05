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
import { createRoom, updateRoom, deleteRoom } from "@/api/admin/getAllRooms";
import { useRouter } from 'next/navigation';

// Import enhanced components
import {
  createRoomTableColumns,
  RoomFormModal,
  AdvancedRoomFilters,
  EnhancedRoomStatistics,
} from './components';
import { CinemaRoomResponse, RoomCreateRequest } from './types';
import { RoomFilterService, AdvancedRoomFilters as AdvancedFilters } from './services/RoomFilterService';

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
  const [totalElements, setTotalElements] = useState(0);

  // Enhanced filters with debounced search
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    searchTerm: '',
    filterType: undefined,
    filterStatus: undefined,
    minCapacity: undefined,
    maxCapacity: undefined,
    features: [],
    premiumOnly: false,
  });

  // Debounce search term to improve performance
  const debouncedSearchTerm = useDebounce(advancedFilters.searchTerm || '', 300);

  // Create debounced filters object
  const debouncedFilters = useMemo(() => ({
    ...advancedFilters,
    searchTerm: debouncedSearchTerm
  }), [advancedFilters, debouncedSearchTerm]);

  // Count active filters
  const activeFiltersCount = useMemo(() => 
    RoomFilterService.countActiveFilters(debouncedFilters), [debouncedFilters]);

  // Fetch rooms function with enhanced filters
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      // Use enhanced filtering service
      const response = await RoomFilterService.getFilteredRooms(
        debouncedFilters, 
        currentPage - 1, // API uses 0-based pagination
        pageSize
      );
      
      // Check if response has the expected structure
      if (response && response.content && Array.isArray(response.content)) {
        setAllRoomData(response.content);
        setTotalElements(response.page.totalElements);
      } else {
        console.warn('Unexpected API response structure:', response);
        setAllRoomData([]);
        setTotalElements(0);
      }
      setIsUsingApiData(true);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      message.error("Failed to connect to backend server");
      setAllRoomData([]);
      setTotalElements(0);
      setIsUsingApiData(false);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedFilters, pageSize]);

  // Load data on component mount and when filters/pagination change
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // CRUD operations
  const createRoomFunction = useCallback(async (roomData: RoomCreateRequest) => {
    try {
      setLoading(true);
      const response = await createRoom(roomData);
      console.log('Create room response:', response);
      message.success("Room created successfully!");
      await fetchRooms();
      return true;
    } catch (error: unknown) {
      console.error('Create room error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create room";
      message.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchRooms]);

  const updateRoomFunction = useCallback(async (id: number, roomData: RoomCreateRequest) => {
    try {
      setLoading(true);
      const response = await updateRoom(id, roomData);
      console.log('Update room response:', response);
      message.success("Room updated successfully!");
      await fetchRooms();
      return true;
    } catch (error: unknown) {
      console.error('Update room error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update room";
      message.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchRooms]);

  const deleteRoomFunction = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await deleteRoom(id);
      message.success("Room deleted successfully!");
      await fetchRooms();
    } catch (error: unknown) {
      console.error('Delete room error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete room";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchRooms]);

  // Event handlers
  const handleEdit = useCallback((record: CinemaRoomResponse) => {
    setEditingRoom(record);
    setIsModalVisible(true);
  }, []);

  const handleDelete = useCallback((roomId: number) => {
    deleteRoomFunction(roomId);
  }, [deleteRoomFunction]);

  const handleView = useCallback((record: CinemaRoomResponse) => {
    router.push(`/admin/rooms/${record.cinemaRoomId}`);
  }, [router]);

  const handleModalOk = useCallback(async () => {
    try {
      const values = await form.validateFields();
      let success = false;

      if (editingRoom) {
        success = await updateRoomFunction(editingRoom.cinemaRoomId, values);
      } else {
        success = await createRoomFunction(values);
      }

      if (success) {
        setIsModalVisible(false);
        setEditingRoom(null);
        form.resetFields();
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  }, [editingRoom, form, createRoomFunction, updateRoomFunction]);

  const handleModalCancel = useCallback(() => {
    setIsModalVisible(false);
    setEditingRoom(null);
    form.resetFields();
  }, [form]);

  // Filter handlers
  const handleFiltersChange = useCallback((newFilters: Partial<AdvancedFilters>) => {
    setAdvancedFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const handleClearFilters = useCallback(() => {
    const clearedFilters = RoomFilterService.clearAllFilters();
    setAdvancedFilters(clearedFilters);
    setCurrentPage(1);
  }, []);

  const handleQuickFilter = useCallback(async (type: 'premium' | 'standard' | 'has3D' | 'dolbyAtmos' | 'recliner') => {
    try {
      setLoading(true);
      const rooms = await RoomFilterService.getQuickFilterRooms(type);
      setAllRoomData(rooms);
      setTotalElements(rooms.length);
      setCurrentPage(1);
      
      // Update filters to reflect the quick filter
      const filterUpdates: Partial<AdvancedFilters> = {};
      if (type === 'premium') {
        filterUpdates.premiumOnly = true;
      } else if (type === 'standard') {
        filterUpdates.filterType = 'STANDARD';
      } else {
        const featureMap: Record<string, string> = {
          'has3D': 'has3D',
          'dolbyAtmos': 'hasDolbyAtmos',
          'recliner': 'hasReclinerSeats'
        };
        filterUpdates.features = [featureMap[type]];
      }
      setAdvancedFilters(prev => ({ ...prev, ...filterUpdates }));
    } catch (error) {
      console.error('Quick filter error:', error);
      message.error('Failed to apply quick filter');
    } finally {
      setLoading(false);
    }
  }, []);

  // Table columns
  const columns = useMemo(() => createRoomTableColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onView: handleView,
    loading,
    isUsingApiData,
  }), [handleEdit, handleDelete, handleView, loading, isUsingApiData]);

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Statistics */}
      <EnhancedRoomStatistics loading={loading} />

      {/* Advanced Filters */}
      <AdvancedRoomFilters
        filters={advancedFilters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        onQuickFilter={handleQuickFilter}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Main Content Card */}
      <Card 
        title={
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Cinema Room Management</span>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
              disabled={!isUsingApiData}
            >
              Add New Room
            </Button>
          </div>
        }
        className="shadow-sm"
      >
        {!isUsingApiData && (
          <Alert
            message="Backend Connection Issues"
            description="Unable to connect to the backend server. Displaying fallback data for demonstration purposes."
            type="warning"
            showIcon
            className="mb-4"
          />
        )}

        <Table
          columns={columns}
          dataSource={allRoomData}
          rowKey="cinemaRoomId"
          loading={loading}
          pagination={false}
          scroll={{ x: 1200 }}
          size="middle"
          className="custom-table"
        />

        {/* Custom Pagination */}
        <div className="flex justify-between items-center mt-4">
          <Text type="secondary">
            Showing {allRoomData.length} of {totalElements} rooms
          </Text>
          <Pagination
            current={currentPage}
            total={totalElements}
            pageSize={pageSize}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => 
              `${range[0]}-${range[1]} of ${total} rooms`
            }
            onChange={(page, size) => {
              setCurrentPage(page);
              if (size !== pageSize) {
                setPageSize(size);
                setCurrentPage(1);
              }
            }}
            disabled={loading}
          />
        </div>
      </Card>

      {/* Room Form Modal */}
      <RoomFormModal
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        editingRoom={editingRoom}
        loading={loading}
        form={form}
      />
    </div>
  );
}
