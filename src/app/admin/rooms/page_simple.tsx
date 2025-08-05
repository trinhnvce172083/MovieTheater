"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Card,
  Button,
  Form,
  message,
  Typography,
  Pagination,
  Alert,
  Input,
  Select,
} from "antd";
import {
  PlusOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { getAllRooms, createRoom, updateRoom, deleteRoom } from "@/api/admin/getAllRooms";
import { useRouter } from 'next/navigation';

// Import basic components only
import {
  createRoomTableColumns,
  RoomFormModal,
} from './components';
import { CinemaRoomResponse, RoomCreateRequest } from './types';

const { Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function CinemaRoomManagement() {
  const [form] = Form.useForm();
  const router = useRouter();
  
  // Basic state
  const [allRoomData, setAllRoomData] = useState<CinemaRoomResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<CinemaRoomResponse | null>(null);
  const [isUsingApiData, setIsUsingApiData] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Simple filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);

  // Fetch rooms function
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllRooms(currentPage - 1, pageSize);
      
      if (response && response.content && Array.isArray(response.content)) {
        setAllRoomData(response.content);
        setTotalElements(response.page.totalElements);
        console.log('Rooms fetched successfully:', response.content.length, 'rooms');
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
  }, [currentPage, pageSize]);

  // Load data on component mount and when pagination changes
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Filter data locally (simple client-side filtering)
  const filteredData = React.useMemo(() => {
    if (!allRoomData || !Array.isArray(allRoomData)) return [];
    
    return allRoomData.filter(room => {
      const matchesSearch = !searchTerm || 
        room.cinemaRoomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = !filterType || room.roomType === filterType;
      
      const matchesStatus = !filterStatus || 
        (filterStatus === 'active' && room.isActive) ||
        (filterStatus === 'inactive' && !room.isActive);
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [allRoomData, searchTerm, filterType, filterStatus]);

  // Calculate basic statistics
  const statistics = React.useMemo(() => {
    const totalRooms = allRoomData.length;
    const activeRooms = allRoomData.filter(r => r.isActive).length;
    const totalSeats = allRoomData.reduce((sum, room) => sum + room.seatQuantity, 0);
    const avgSeats = totalRooms > 0 ? Math.round(totalSeats / totalRooms) : 0;
    
    return { totalRooms, activeRooms, totalSeats, avgSeats };
  }, [allRoomData]);

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

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType(undefined);
    setFilterStatus(undefined);
  };

  // Table columns
  const columns = React.useMemo(() => createRoomTableColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onView: handleView,
    loading,
    isUsingApiData,
  }), [handleEdit, handleDelete, handleView, loading, isUsingApiData]);

  return (
    <div className="p-6 space-y-6">
      {/* Basic Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">{statistics.totalRooms}</div>
          <div className="text-gray-600">Total Rooms</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">{statistics.activeRooms}</div>
          <div className="text-gray-600">Active Rooms</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600">{statistics.totalSeats}</div>
          <div className="text-gray-600">Total Seats</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-orange-500">{statistics.avgSeats}</div>
          <div className="text-gray-600">Average Seats</div>
        </Card>
      </div>

      {/* Simple Filters */}
      <Card title="Filters" size="small">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <Search
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Room Type</label>
            <Select
              placeholder="All Types"
              value={filterType}
              onChange={setFilterType}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="STANDARD">Standard</Option>
              <Option value="VIP">VIP</Option>
              <Option value="IMAX">IMAX</Option>
              <Option value="4DX">4DX</Option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              placeholder="All Status"
              value={filterStatus}
              onChange={setFilterStatus}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </div>
          <div>
            <Button 
              icon={<ClearOutlined />} 
              onClick={handleClearFilters}
              className="w-full"
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content */}
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
      >
        {!isUsingApiData && (
          <Alert
            message="Backend Connection Issues"
            description="Unable to connect to the backend server. Please check your backend connection."
            type="warning"
            showIcon
            className="mb-4"
          />
        )}

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="cinemaRoomId"
          loading={loading}
          pagination={false}
          scroll={{ x: 1200 }}
          size="middle"
        />

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <Text type="secondary">
            Showing {filteredData.length} of {totalElements} rooms
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
