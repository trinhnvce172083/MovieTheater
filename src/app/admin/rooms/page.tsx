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
  Tag,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { getAllRooms, createRoom, updateRoom, deleteRoom, searchRooms } from "@/api/admin/getAllRooms";

// Import organized components
import {
  RoomStatisticsCard,
  RoomFiltersComponent,
  createRoomTableColumns,
  RoomFormModal,
} from './components';
import { CinemaRoomResponse, RoomCreateRequest, RoomFilters } from './types';
import { filterRooms, calculateRoomStatistics } from './utils';

const { Text, Title } = Typography;

export default function CinemaRoomManagement() {
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
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");

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
      setRoomData(response.content);
      setTotalElements(response.page.totalElements);
      setIsUsingApiData(true);
      setBackendStatus("connected");
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      message.error("Failed to connect to backend server");
      setRoomData([]);
      setTotalElements(0);
      setIsUsingApiData(false);
      setBackendStatus("disconnected");
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleDelete = (roomId: number) => {
    deleteRoomFunction(roomId);
  };

  const handleView = (record: CinemaRoomResponse) => {
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
    isUsingApiData,
  });

  // Effects
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Backend Status Alert */}
        {!isUsingApiData && (
          <Alert
            message="Backend Connection Failed"
            description="Backend server is not available. Please ensure the backend server is running on localhost:8080/cinema/api"
            type="error"
            showIcon
            closable
            className="mb-4"
            action={
              <Button
                size="small"
                type="primary"
                onClick={() => window.location.reload()}
              >
                Retry Connection
              </Button>
            }
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
              <div className="flex items-center gap-2 mb-1">
                <Title
                  level={2}
                  className="m-0 text-gray-900 text-xl xl:text-2xl"
                >
                  Room Management
                </Title>
                {backendStatus === "disconnected" && (
                  <Tag color="red" className="text-xs">
                    Disconnected
                  </Tag>
                )}
                {backendStatus === "checking" && (
                  <Tag color="blue" className="text-xs">
                    Connecting...
                  </Tag>
                )}
              </div>
              <Text type="secondary" className="text-sm xl:text-base">
                Manage and organize your cinema room facilities
              </Text>
            </div>
            <div className="flex items-center gap-3">
              {backendStatus === "disconnected" && (
                <Button
                  type="default"
                  icon={<ReloadOutlined />}
                  size="middle"
                  className="text-xs xl:text-sm h-10 px-4"
                  onClick={() => window.location.reload()}
                  title="Retry connection to backend"
                >
                  Retry Connection
                </Button>
              )}
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="middle"
                className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm text-xs xl:text-sm h-10 px-4"
                onClick={handleAddNewRoom}
                disabled={!isUsingApiData}
                title={
                  !isUsingApiData
                    ? "Create/Edit functions require backend connection"
                    : "Add new room"
                }
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
              <Table
                dataSource={filteredData}
                columns={columns}
                pagination={false}
                scroll={{ x: 950 }}
                rowClassName="hover:bg-gray-50 transition-colors"
                className="professional-table"
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

      {/* Add Professional Styling */}
      <style jsx global>{`
        .professional-table .ant-table-thead > tr > th {
          background: #fafafa;
          border-bottom: 2px solid #f0f0f0;
          font-weight: 600;
          color: #262626;
        }

        .professional-table .ant-table-tbody > tr:hover > td {
          background: #f8faff;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
