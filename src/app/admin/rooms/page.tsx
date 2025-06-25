"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Pagination,
  Tooltip,
  Popconfirm,
  message,
  Modal,
  Form,
  Tag,
  Statistic,
  Row,
  Col,
  Typography,
  Avatar,
  Checkbox,
  InputNumber,
  Spin,
  Alert,
} from "antd";
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,  EyeOutlined,
  ReloadOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  GlobalOutlined,  HomeOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import axiosClient from "@/api/axiosClient";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

// Interface for Create/Update Room Request
interface RoomCreateRequest {
  cinemaRoomName: string;
  roomType: string;
  seatQuantity: number;
  rows: number;
  columns: number;
  description?: string;
  has3D?: boolean;
  hasDolbyAtmos?: boolean;
  hasReclinerSeats?: boolean;
  priceMultiplier: number;
  isActive?: boolean;
}

// Interface for Cinema Room Response
interface CinemaRoomResponse {
  cinemaRoomId: number;
  cinemaRoomName: string;
  seatQuantity: number;
  roomType: string;
  isActive: boolean;
  description: string;
  rows: number;
  columns: number;
  has3D: boolean;
  hasDolbyAtmos: boolean;
  hasReclinerSeats: boolean;
  priceMultiplier: number;
  createdAt: string;
  updatedAt: string;
  availableSeats?: number;
  occupiedSeats?: number;
  maintenanceSeats?: number;
  scheduleCount?: number;
}

// Room Management Component
export default function CinemaRoomManagement() {
  const [roomData, setRoomData] = useState<CinemaRoomResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<CinemaRoomResponse | null>(null);
  const [isUsingApiData, setIsUsingApiData] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [form] = Form.useForm();
  const router = useRouter();
  // Sample data for testing (when API is not available)
  const sampleRoomData = useMemo<CinemaRoomResponse[]>(() => [
    {
      cinemaRoomId: 1,
      cinemaRoomName: "Premium Hall A",
      seatQuantity: 48,
      roomType: "VIP",
      isActive: true,
      description: "Premium cinema hall with luxury seating and enhanced viewing experience",
      rows: 6,
      columns: 8,
      has3D: true,
      hasDolbyAtmos: true,
      hasReclinerSeats: true,
      priceMultiplier: 1.5,
      createdAt: "2024-01-15T10:00:00",
      updatedAt: "2024-06-20T14:30:00",
    },
    {
      cinemaRoomId: 2,
      cinemaRoomName: "Standard Hall B",
      seatQuantity: 40,
      roomType: "STANDARD",
      isActive: true,
      description: "Standard cinema hall with comfortable seating for regular movie viewing",
      rows: 5,
      columns: 8,
      has3D: false,
      hasDolbyAtmos: false,
      hasReclinerSeats: false,
      priceMultiplier: 1.0,
      createdAt: "2024-01-20T09:00:00",
      updatedAt: "2024-06-18T11:15:00",
    },    {
      cinemaRoomId: 3,
      cinemaRoomName: "VIP Theater",
      seatQuantity: 32,
      roomType: "VIP",
      isActive: true,
      description: "Exclusive VIP theater with premium amenities and personalized service",
      rows: 4,
      columns: 8,
      has3D: true,
      hasDolbyAtmos: true,
      hasReclinerSeats: true,
      priceMultiplier: 2.0,
      createdAt: "2024-02-01T08:00:00",
      updatedAt: "2024-06-22T16:45:00",
    },
    {
      cinemaRoomId: 4,
      cinemaRoomName: "Standard Hall C",
      seatQuantity: 60,
      roomType: "STANDARD",
      isActive: false,
      description: "Large standard cinema hall currently under maintenance",
      rows: 6,
      columns: 10,
      has3D: false,
      hasDolbyAtmos: false,
      hasReclinerSeats: false,
      priceMultiplier: 1.0,
      createdAt: "2024-03-10T12:00:00",      updatedAt: "2024-06-21T09:30:00",
    },
  ], []);  // API Functions
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching rooms from API...');
      const response = await axiosClient.get('/cinema-rooms', {
        params: {
          page: currentPage - 1, // Backend uses 0-based pagination
          size: pageSize,
          sortBy: 'cinemaRoomName',
          sortDirection: 'asc'
        }
      });      console.log('✅ Rooms fetched successfully:', response.data);
      setRoomData(response.data.content || []);
      setTotalElements(response.data.page?.totalElements || 0);
      setIsUsingApiData(true);
      setBackendStatus('connected');
      message.success('Rooms loaded successfully from API');} catch (error) {
      console.error('❌ Error fetching rooms:', error);
      
      // Provide detailed error information
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number; data: unknown; statusText: string } };
        console.error('Response error:', axiosError.response.status, axiosError.response.data);
        if (axiosError.response.status === 500) {
          message.error('Server error occurred. Please check if the backend server is running on localhost:8080');
        } else if (axiosError.response.status === 401) {
          message.error('Authentication failed. Please login again.');
        } else if (axiosError.response.status === 403) {
          message.error('Access denied. You may not have admin permissions.');
        } else {
          message.error(`API Error: ${axiosError.response.status} - ${axiosError.response.statusText}`);
        }
      } else if (error && typeof error === 'object' && 'request' in error) {
        console.error('Network error:', error);
        message.error('Cannot connect to backend server. Please ensure the server is running on localhost:8080');
      } else {
        console.error('Unknown error:', error);
        message.error('An unexpected error occurred');
      }      message.warning('Using sample data as fallback');
      // Use sample data as fallback
      setRoomData(sampleRoomData);
      setTotalElements(sampleRoomData.length);
      setIsUsingApiData(false);
      setBackendStatus('disconnected');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sampleRoomData]);

  const searchRooms = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      fetchRooms();
      return;
    }
    
    try {
      setLoading(true);
      const response = await axiosClient.get('/cinema-rooms/search', {
        params: {
          keyword,
          page: currentPage - 1,
          size: pageSize
        }
      });      setRoomData(response.data.content || []);
      setTotalElements(response.data.page?.totalElements || 0);
    } catch (error) {
      console.error('Error searching rooms:', error);
      message.error('Failed to search rooms');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, fetchRooms]);
  const createRoom = async (roomData: RoomCreateRequest) => {
    try {
      setLoading(true);
      await axiosClient.post('/cinema-rooms', roomData);
      message.success('Room created successfully');
      fetchRooms();
      return true;
    } catch (error) {
      console.error('Error creating room:', error);
      message.error('Failed to create room');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateRoom = async (id: number, roomData: RoomCreateRequest) => {
    try {
      setLoading(true);
      await axiosClient.put(`/cinema-rooms/${id}`, roomData);
      message.success('Room updated successfully');
      fetchRooms();
      return true;
    } catch (error) {
      console.error('Error updating room:', error);
      message.error('Failed to update room');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (id: number) => {
    try {
      setLoading(true);
      await axiosClient.delete(`/cinema-rooms/${id}`);
      message.success('Room deleted successfully');
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      message.error('Failed to delete room');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm) {
        searchRooms(searchTerm);
      } else {
        fetchRooms();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, searchRooms, fetchRooms]);

  // Filter and search logic
  const filteredData = useMemo(() => {
    return roomData.filter((room) => {
      const matchesType = !filterType || room.roomType === filterType;
      const matchesStatus = !filterStatus || 
        (filterStatus === 'active' ? room.isActive : !room.isActive);

      return matchesType && matchesStatus;
    });
  }, [roomData, filterType, filterStatus]);

  // Statistics calculations
  const statistics = useMemo(() => {
    const totalRooms = roomData.length;
    const activeRooms = roomData.filter((r) => r.isActive).length;
    const totalSeats = roomData.reduce((sum, room) => sum + room.seatQuantity, 0);
    const avgSeats = totalRooms > 0 ? Math.round(totalSeats / totalRooms) : 0;

    return { totalRooms, activeRooms, totalSeats, avgSeats };
  }, [roomData]);

  const handleEdit = (record: CinemaRoomResponse) => {
    setEditingRoom(record);
    form.setFieldsValue({
      cinemaRoomName: record.cinemaRoomName,
      roomType: record.roomType,
      seatQuantity: record.seatQuantity,
      rows: record.rows,
      columns: record.columns,
      description: record.description,
      has3D: record.has3D,
      hasDolbyAtmos: record.hasDolbyAtmos,
      hasReclinerSeats: record.hasReclinerSeats,
      priceMultiplier: record.priceMultiplier,
      isActive: record.isActive,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (record: CinemaRoomResponse) => {
    deleteRoom(record.cinemaRoomId);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingRoom) {
        const success = await updateRoom(editingRoom.cinemaRoomId, values);
        if (success) {
          setIsModalVisible(false);
          setEditingRoom(null);
          form.resetFields();
        }
      } else {
        const success = await createRoom(values);
        if (success) {
          setIsModalVisible(false);
          form.resetFields();
        }
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };
  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingRoom(null);
    form.resetFields();
  };

  const columns: ColumnsType<CinemaRoomResponse> = [{
      title: "#",
      dataIndex: "cinemaRoomId",
      key: "cinemaRoomId",
      width: 60,
      render: (_: unknown, record: CinemaRoomResponse, index: number) => (
        <div className="text-center">
          <span className="font-mono text-sm text-gray-500">
            {(currentPage - 1) * pageSize + index + 1}
          </span>
        </div>
      ),
    },
    {
      title: "Room Information",
      key: "room_info",
      width: 280,
      render: (_: unknown, record: CinemaRoomResponse) => (
        <div className="flex items-center gap-3">
          <Avatar
            icon={<HomeOutlined />}
            size={40}
            className="bg-blue-100 text-blue-600 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 mb-1 truncate text-sm">
              {record.cinemaRoomName}
            </div>
            <div className="text-xs text-gray-600 mb-1 truncate">
              {record.rows}x{record.columns} Layout
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              <Tag color="blue" className="text-xs m-0">
                ID: {record.cinemaRoomId}
              </Tag>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Type & Status",
      key: "type_status",
      width: 120,
      render: (_: unknown, record: CinemaRoomResponse) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 truncate mb-1">
            {record.roomType}
          </div>
          <Tag
            color={record.isActive ? "success" : "warning"}
            className="text-xs"
          >
            {record.isActive ? "Active" : "Inactive"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Capacity",
      key: "capacity",
      width: 80,
      align: "center" as const,
      render: (_: unknown, record: CinemaRoomResponse) => (
        <div className="text-center">
          <div className="text-sm font-medium">{record.seatQuantity}</div>
          <div className="text-xs text-gray-500">seats</div>
        </div>
      ),    },
    {
      title: "Price Multiplier",
      dataIndex: "priceMultiplier",
      key: "priceMultiplier",
      width: 120,
      align: "center" as const,
      render: (multiplier: number) => (
        <div className="text-sm">
          <div className=" font-medium">{multiplier}x</div>
        </div>
      ),
    },
    {
      title: "Description",
      key: "description",
      align: "center" as const,
      width: 200,
      render: (_: unknown, record: CinemaRoomResponse) => (
        <div className="text-sm">
          <div className="text-gray-900 line-clamp-2">
            {record.description || "No description available"}
          </div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right" as const,
      align: "center" as const,
      render: (_: unknown, record: CinemaRoomResponse) => (
        <Space size="small">          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              className="text-blue-600 hover:bg-blue-50"
              onClick={() => router.push(`/admin/rooms/RoomDetail?id=${record.cinemaRoomId}`)}
            />
          </Tooltip>          <Tooltip title={isUsingApiData ? "Edit" : "Edit disabled in demo mode"}>
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              className={isUsingApiData ? "text-green-600 hover:bg-green-50" : "text-gray-400"}
              onClick={() => handleEdit(record)}
              disabled={!isUsingApiData}
            />
          </Tooltip>
          <Tooltip title={isUsingApiData ? "Delete" : "Delete disabled in demo mode"}>
            <Popconfirm
              title="Delete Room"
              description="Are you sure?"
              onConfirm={() => handleDelete(record)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              disabled={!isUsingApiData}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                className={isUsingApiData ? "text-red-600 hover:bg-red-50" : "text-gray-400"}
                disabled={!isUsingApiData}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Backend Status Alert */}
        {!isUsingApiData && (
          <Alert
            message="Demo Mode Active"
            description="Backend server is not available. Currently showing sample data. To connect to real data, ensure the backend server is running on localhost:8080"
            type="warning"
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
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center" size="small">
              <Statistic
                title="Total Rooms"
                value={statistics.totalRooms}
                prefix={<HomeOutlined className="text-blue-600" />}
                valueStyle={{ color: "#1677ff", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center" size="small">
              <Statistic
                title="Active Rooms"
                value={statistics.activeRooms}
                prefix={<GlobalOutlined className="text-green-600" />}
                valueStyle={{ color: "#52c41a", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center" size="small">
              <Statistic
                title="Total Seats"
                value={statistics.totalSeats}
                prefix={<VideoCameraOutlined className="text-purple-600" />}
                valueStyle={{ color: "#722ed1", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center" size="small">
              <Statistic
                title="Avg Seats/Room"
                value={statistics.avgSeats}
                suffix="seats"
                prefix={<ClockCircleOutlined className="text-orange-600" />}
                valueStyle={{ color: "#faad14", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Card */}
        <Card
          className="shadow-sm border-0"
          styles={{ body: { padding: 0 } }}
          style={{ borderRadius: 16 }}
        >
          {/* Header Section */}
          <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">            <div>
              <div className="flex items-center gap-2 mb-1">
                <Title level={2} className="m-0 text-gray-900 text-xl xl:text-2xl">
                  Room Management
                </Title>
                {backendStatus === 'connected' && (
                  <Tag color="green" className="text-xs">
                    API Connected
                  </Tag>
                )}
                {backendStatus === 'disconnected' && (
                  <Tag color="orange" className="text-xs">
                    Demo Mode
                  </Tag>
                )}
                {backendStatus === 'checking' && (
                  <Tag color="blue" className="text-xs">
                    Connecting...
                  </Tag>
                )}
              </div>              
              <Text type="secondary" className="text-sm xl:text-base">
                Manage and organize your cinema room facilities
              </Text>
            </div>            <div className="flex items-center gap-3">
              {backendStatus === 'disconnected' && (
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
                onClick={() => setIsModalVisible(true)}
                disabled={!isUsingApiData}
                title={!isUsingApiData ? "Create/Edit functions require backend connection" : "Add new room"}
              >
                Add New Room
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12} lg={10} xl={8}>
                <Input
                  placeholder="Search rooms, ID, or names..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 px-4"
                  allowClear
                />
              </Col>              <Col xs={12} sm={6} lg={4} xl={3}>
                <Select
                  placeholder="Type"
                  value={filterType}
                  onChange={setFilterType}
                  className="w-full h-10 px-4"
                  allowClear
                  size="middle"
                >
                  <Option value="STANDARD">Standard</Option>
                  <Option value="VIP">VIP</Option>
                </Select>
              </Col>
              <Col xs={12} sm={6} lg={3} xl={3}>
                <Select
                  placeholder="Status"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  className="w-full h-10 px-4"
                  allowClear
                  size="middle"
                >
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Col>
              <Col xs={12} sm={6} lg={3} xl={3}>
                <Button
                  icon={<ReloadOutlined />}
                  className="w-full h-10 px-4"
                  size="middle"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("");
                    setFilterStatus("");
                    fetchRooms();
                  }}
                >
                  Reset
                </Button>
              </Col>
            </Row>
          </div>          {/* Table Section */}
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
                className="professional-pagination"
                size="small"
              />
            </div>
          </div>
        </Card>
      </div>      {/* Add/Edit Room Modal */}
      <Modal
        title={editingRoom ? "Edit Room" : "Add New Room"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        className="professional-modal"
        okText={editingRoom ? "Update Room" : "Add Room"}
        cancelText="Cancel"
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-6"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="cinemaRoomName"
                label="Room Name"
                rules={[
                  { required: true, message: "Please enter room name" },
                  { max: 50, message: "Room name cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="Enter room name" className="h-10" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="roomType"
                label="Room Type"
                rules={[{ required: true, message: "Please select room type" }]}
              >                <Select placeholder="Select room type" className="h-10">
                  <Option value="STANDARD">Standard</Option>
                  <Option value="VIP">VIP</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="seatQuantity"
                label="Total Seats"
                rules={[
                  { required: true, message: "Please enter total seats" },
                  { type: 'number', min: 1, max: 500, message: "Seats must be between 1 and 500" }
                ]}
              >
                <InputNumber 
                  placeholder="Enter total seats" 
                  className="w-full h-10" 
                  min={1}
                  max={500}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="rows"
                label="Rows"
                rules={[
                  { required: true, message: "Please enter number of rows" },
                  { type: 'number', min: 1, max: 30, message: "Rows must be between 1 and 30" }
                ]}
              >
                <InputNumber 
                  placeholder="Enter rows" 
                  className="w-full h-10" 
                  min={1}
                  max={30}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="columns"
                label="Columns"
                rules={[
                  { required: true, message: "Please enter number of columns" },
                  { type: 'number', min: 1, max: 50, message: "Columns must be between 1 and 50" }
                ]}
              >
                <InputNumber 
                  placeholder="Enter columns" 
                  className="w-full h-10" 
                  min={1}
                  max={50}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ max: 1000, message: "Description cannot exceed 1000 characters" }]}
              >
                <TextArea 
                  placeholder="Enter room description" 
                  rows={3}
                  showCount
                  maxLength={1000}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="priceMultiplier"
                label="Price Multiplier"
                rules={[
                  { required: true, message: "Please enter price multiplier" },
                  { type: 'number', min: 0.1, max: 10, message: "Multiplier must be between 0.1 and 10" }
                ]}
              >
                <InputNumber 
                  placeholder="Enter price multiplier" 
                  className="w-full h-10" 
                  min={0.1}
                  max={10}
                  step={0.1}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="isActive"
                label="Status"
                valuePropName="checked"
                initialValue={true}
              >
                <Checkbox>Active</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="has3D"
                valuePropName="checked"
              >
                <Checkbox>3D Capability</Checkbox>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="hasDolbyAtmos"
                valuePropName="checked"
              >
                <Checkbox>Dolby Atmos</Checkbox>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="hasReclinerSeats"
                valuePropName="checked"
              >
                <Checkbox>Recliner Seats</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

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
        
        .professional-pagination .ant-pagination-item-active {
          background: #1677ff;
          border-color: #1677ff;
        }
        
        .professional-pagination .ant-pagination-item-active a {
          color: white;
        }
        
        .professional-modal .ant-modal-header {
          border-bottom: 1px solid #f0f0f0;
          padding: 24px 24px 16px;
        }
          .professional-modal .ant-modal-body {
          padding: 24px;
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
