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
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { getAllRooms } from "@/src/api/admin/rooms/getAllRooms";
import { createRoom } from "@/api/admin/getAllRooms";
import { updateRoom } from "@/api/admin/getAllRooms";
import { deleteRoom } from "@/api/admin/getAllRooms";
import { searchRooms } from "@/api/admin/getAllRooms";

// Import organized components
import {
  RoomStatisticsCard,
  RoomFiltersComponent,
  createRoomTableColumns,
  RoomFormModal,
} from './components';
import { CinemaRoomResponse, RoomCreateRequest, RoomFilters, RoomStatistics } from './types';
import { filterRooms, calculateRoomStatistics } from './utils';

const { Text } = Typography;

export default function AdminRoomsPage() {
  const [form] = Form.useForm();
  
  // State
  const [roomData, setRoomData] = useState<CinemaRoomResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<CinemaRoomResponse | null>(null);
  const [isUsingApiData, setIsUsingApiData] = useState(true);
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "disconnected">("checking");

  // Filters
  const [filters, setFilters] = useState<RoomFilters>({
    searchTerm: '',
    filterType: undefined,
    filterStatus: undefined,
  });

  // Fetch rooms function
  const fetchRooms = useCallback(async (page: number = 1, size: number = 10) => {
    setLoading(true);
    try {
      const response = await getAllRooms(page - 1, size);
      setRoomData(response.content || response);
      setTotalElements(response.totalElements || response.length || 0);
      setIsUsingApiData(true);
      setBackendStatus("connected");
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      message.error("Failed to fetch rooms. Using offline data.");
      setIsUsingApiData(false);
      setBackendStatus("disconnected");
    } finally {
      setLoading(false);
    }
  }, []);

  // Search function
  const searchRoomsFunction = useCallback(
    async (keyword: string) => {
      if (!keyword.trim()) {
        fetchRooms();
        return;
      }

      try {
        setLoading(true);
        const response = await searchRooms(keyword, currentPage - 1, pageSize);
        setRoomData(response.content || []);
        setTotalElements(response.page?.totalElements || 0);
        setIsUsingApiData(true);
        setBackendStatus("connected");
      } catch (error) {
        console.error("Failed to search rooms:", error);
        message.error("Failed to search rooms");
        setRoomData([]);
        setTotalElements(0);
        setIsUsingApiData(false);
        setBackendStatus("disconnected");
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, fetchRooms]
  );

  // CRUD operations
  const createRoomFunction = async (roomData: RoomCreateRequest) => {
    try {
      setLoading(true);
      await createRoom(roomData);
      message.success("Room created successfully");
      fetchRooms();
      return true;
    } catch (error) {
      message.error("Failed to create room");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateRoomFunction = async (id: number, roomData: RoomCreateRequest) => {
    try {
      setLoading(true);
      await updateRoom(id, roomData);
      message.success("Room updated successfully");
      fetchRooms();
      return true;
    } catch (error) {
      message.error("Failed to update room");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteRoomFunction = async (id: number) => {
    try {
      setLoading(true);
      await deleteRoom(id);
      message.success("Room deleted successfully");
      fetchRooms();
    } catch (error) {
      message.error("Failed to delete room");
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleEdit = (record: CinemaRoomResponse) => {
    setEditingRoom(record);
    setIsModalVisible(true);
  };

  const handleDelete = (record: CinemaRoomResponse) => {
    deleteRoomFunction(record.cinemaRoomId);
  };

  const handleView = (record: CinemaRoomResponse) => {
    // Implementation for view details
    message.info(`Viewing details for ${record.cinemaRoomName}`);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

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
      // Form validation failed
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
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      filterType: undefined,
      filterStatus: undefined,
    });
  }, []);

  // Computed values
  const filteredData = useMemo(() => {
    return filterRooms(roomData, filters);
  }, [roomData, filters]);

  const statistics = useMemo(() => {
    return calculateRoomStatistics(roomData);
  }, [roomData]);

  // Table columns
  const columns = createRoomTableColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onView: handleView,
    loading,
  });

  // Effects
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (filters.searchTerm) {
        searchRoomsFunction(filters.searchTerm);
      } else {
        fetchRooms();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [filters.searchTerm, searchRoomsFunction, fetchRooms]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
            <p className="text-gray-600">Manage cinema rooms and their configurations</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddNewRoom}
            size="large"
          >
            Add New Room
          </Button>
        </div>

        {/* Statistics */}
        <RoomStatisticsCard statistics={statistics} loading={loading} />

        {/* Filters */}
        <RoomFiltersComponent
          filters={filters}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
        />

        {/* Table */}
        <Card>
          <Spin spinning={loading}>
            <Table
              dataSource={filteredData}
              columns={columns}
              pagination={false}
              scroll={{ x: 950 }}
              rowClassName="hover:bg-gray-50 transition-colors"
              size="small"
              rowKey="cinemaRoomId"
            />
          </Spin>

          {/* Pagination */}
          <div className="px-6 py-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Text type="secondary" className="text-sm">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalElements)} of{" "}
              {totalElements} rooms
            </Text>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalElements}
              onChange={(page, size) => {
                setCurrentPage(page);
                if (size !== pageSize) {
                  setPageSize(size);
                }
              }}
              showSizeChanger
              showQuickJumper={false}
              pageSizeOptions={["5", "10", "20", "50"]}
              size="default"
            />
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
}
