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
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  HomeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { getAllRooms, createRoom, updateRoom, deleteRoom, searchRooms } from "@/api/admin/getAllRooms";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

// Interface for Create/Update Room Request
interface RoomCreateRequest {
  cinemaRoomName: string;
  roomType: 'STANDARD' | 'VIP' | 'IMAX' | '4DX';
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
  roomType: 'STANDARD' | 'VIP' | 'IMAX' | '4DX';
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
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(
    undefined
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<CinemaRoomResponse | null>(
    null
  );
  const [isUsingApiData, setIsUsingApiData] = useState(true);
<<<<<<< HEAD
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
=======
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");
  const [form] = Form.useForm();
>>>>>>> ee9f592098ddb54141ddf8d238bb87e99df9a954
  const router = useRouter();
  
  // Price multiplier defaults for each room type
  const ROOM_TYPE_MULTIPLIERS = {
    STANDARD: 1.0,
    VIP: 1.5,
    IMAX: 2.5,
    '4DX': 3.0
  };

  // Handle room type change to auto-set price multiplier
  const handleRoomTypeChange = (roomType: string) => {
    const multiplier = ROOM_TYPE_MULTIPLIERS[roomType as keyof typeof ROOM_TYPE_MULTIPLIERS];
    if (multiplier) {
      form.setFieldsValue({
        priceMultiplier: multiplier
      });
    }
  };
  
  // API Functions
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllRooms(
        currentPage - 1, // Backend uses 0-based pagination
        pageSize,
        "cinemaRoomName",
        "asc"
      );
      setRoomData(response.content || []);
      setTotalElements(response.page?.totalElements || 0);
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
  }, [currentPage, pageSize]);

  const searchRoomsFunction = useCallback(
    async (keyword: string) => {
      if (!keyword.trim()) {
        fetchRooms();
        return;
      }

      try {
        setLoading(true);
        const response = await searchRooms(
          keyword,
          currentPage - 1,
          pageSize
        );
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
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm) {
        searchRoomsFunction(searchTerm);
      } else {
        fetchRooms();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, searchRoomsFunction, fetchRooms]);

  // Filter and search logic
  const filteredData = useMemo(() => {
    return roomData.filter((room) => {
      const matchesType = !filterType || room.roomType === filterType;
      const matchesStatus =
        !filterStatus ||
        (filterStatus === "active" ? room.isActive : !room.isActive);

      return matchesType && matchesStatus;
    });
  }, [roomData, filterType, filterStatus]);

  // Statistics calculations
  const statistics = useMemo(() => {
    const totalRooms = roomData.length;
    const activeRooms = roomData.filter((r) => r.isActive).length;
    const totalSeats = roomData.reduce(
      (sum, room) => sum + room.seatQuantity,
      0
    );
    const avgSeats = totalRooms > 0 ? Math.round(totalSeats / totalRooms) : 0;

    return { totalRooms, activeRooms, totalSeats, avgSeats };
  }, [roomData]);

  const handleEdit = (record: CinemaRoomResponse) => {
    setEditingRoom(record);
    setIsModalVisible(true);
  };

  const handleDelete = (record: CinemaRoomResponse) => {
    deleteRoomFunction(record.cinemaRoomId);
  };

  const handleModalOk = async () => {
    try {
<<<<<<< HEAD
      const values = await (editingRoom ? form.validateFields() : form.validateFields());
      
=======
      const values = await form.validateFields();

>>>>>>> ee9f592098ddb54141ddf8d238bb87e99df9a954
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
    // Set default values for new room
    form.setFieldsValue({
      roomType: undefined,
      priceMultiplier: 1.0,
      isActive: true,
      has3D: false,
      hasDolbyAtmos: false,
      hasReclinerSeats: false
    });
    setIsModalVisible(true);
  };

  const columns: ColumnsType<CinemaRoomResponse> = [
    {
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
      ),
    },
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
        <Space size="small">
          {" "}
          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              className="text-blue-600 hover:bg-blue-50"
              onClick={() =>
                router.push(`/admin/rooms/RoomDetail?id=${record.cinemaRoomId}`)
              }
            />
          </Tooltip>{" "}
          <Tooltip
            title={isUsingApiData ? "Edit" : "Edit disabled - backend not connected"}
          >
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              className={
                isUsingApiData
                  ? "text-green-600 hover:bg-green-50"
                  : "text-gray-400"
              }
              onClick={() => handleEdit(record)}
              disabled={!isUsingApiData}
            />
          </Tooltip>
          <Tooltip
            title={isUsingApiData ? "Delete" : "Delete disabled - backend not connected"}
          >
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
                className={
                  isUsingApiData
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-400"
                }
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
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={12} lg={6}>
            <Card
              className="text-center border-0 shadow-sm h-32 flex flex-col justify-center"
              size="small"
            >
              <Statistic
                title="Total Rooms"
                value={statistics.totalRooms}
                prefix={<HomeOutlined className="text-blue-600" />}
                valueStyle={{ color: "#1677ff", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card
              className="text-center border-0 shadow-sm h-32 flex flex-col justify-center"
              size="small"
            >
              <Statistic
                title="Active Rooms"
                value={statistics.activeRooms}
                prefix={<GlobalOutlined className="text-green-600" />}
                valueStyle={{ color: "#52c41a", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card
              className="text-center border-0 shadow-sm h-32 flex flex-col justify-center"
              size="small"
            >
              <Statistic
                title="Total Seats"
                value={statistics.totalSeats}
                prefix={<VideoCameraOutlined className="text-purple-600" />}
                valueStyle={{ color: "#722ed1", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card
              className="text-center border-0 shadow-sm h-32 flex flex-col justify-center"
              size="small"
            >
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
          <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            {" "}
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
            </div>{" "}
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
              </Col>{" "}
              <Col xs={12} sm={6} lg={4} xl={3}>
                <Select
                  placeholder="All Types"
                  value={filterType}
                  onChange={setFilterType}
                  className="w-full h-10 px-4"
                  allowClear
                  size="middle"
                >
                  <Option value="STANDARD">Standard</Option>
                  <Option value="VIP">VIP</Option>
                  <Option value="IMAX">IMAX</Option>
                  <Option value="4DX">4DX</Option>
                </Select>
              </Col>
              <Col xs={12} sm={6} lg={3} xl={3}>
                <Select
                  placeholder="All Status"
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
                    setFilterType(undefined);
                    setFilterStatus(undefined);
                    setCurrentPage(1);
                    message.success("Filters cleared successfully");
                  }}
                  disabled={!searchTerm && !filterType && !filterStatus}
                >
                  Clear Filters
                </Button>
              </Col>
            </Row>
          </div>{" "}
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
      </div>{" "}
      {/* Add/Edit Room Modal */}
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
        destroyOnHidden
      >
<<<<<<< HEAD
        <RoomForm
          initialValues={editingRoom}
          onFinish={handleModalOk}
          loading={loading}
        />
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

const RoomForm = ({ initialValues, onFinish, loading }) => {
  const [form] = Form.useForm();
  useEffect(() => {
    if (initialValues) form.setFieldsValue(initialValues);
    else form.resetFields();
  }, [initialValues, form]);
  return (
    <Form
      form={form}
      layout="vertical"
      className="mt-6"
      onFinish={onFinish}
      initialValues={initialValues}
    >
=======
        <Form form={form} layout="vertical" className="mt-6">
>>>>>>> ee9f592098ddb54141ddf8d238bb87e99df9a954
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="cinemaRoomName"
                label="Room Name"
                rules={[
                  { required: true, message: "Please enter room name" },
                  { max: 50, message: "Room name cannot exceed 50 characters" },
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
              >
                <Select 
                  placeholder="Select room type" 
                  className="h-10"
                  onChange={handleRoomTypeChange}
                >
                  <Option value="STANDARD">Standard (1.0x)</Option>
                  <Option value="VIP">VIP (1.5x)</Option>
                  <Option value="IMAX">IMAX (2.5x)</Option>
                  <Option value="4DX">4DX (3.0x)</Option>
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
                  {
                    type: "number",
                    min: 1,
                    max: 500,
                    message: "Seats must be between 1 and 500",
                  },
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
                  {
                    type: "number",
                    min: 1,
                    max: 30,
                    message: "Rows must be between 1 and 30",
                  },
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
                  {
                    type: "number",
                    min: 1,
                    max: 50,
                    message: "Columns must be between 1 and 50",
                  },
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
                rules={[
                  {
                    max: 1000,
                    message: "Description cannot exceed 1000 characters",
                  },
                ]}
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
                label={
                  <span>
                    Price Multiplier (Hệ số nhân giá){" "}
                    <Tooltip title="Giá vé cuối cùng = Giá vé cơ bản × Price Multiplier. Ví dụ: 100,000 VNĐ × 1.5 = 150,000 VNĐ">
                      <InfoCircleOutlined style={{ color: '#1890ff' }} />
                    </Tooltip>
                  </span>
                }
                rules={[
                  { required: true, message: "Please enter price multiplier" },
                  {
                    type: "number",
                    min: 0.1,
                    max: 10,
                    message: "Multiplier must be between 0.1 and 10",
                  },
                ]}
                extra="Tự động điền khi chọn Room Type. Có thể chỉnh sửa thủ công."
              >
                <InputNumber
                  placeholder="Auto-filled based on room type"
                  className="w-full h-10"
                  min={0.1}
                  max={10}
                  step={0.1}
                  addonAfter="x"
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
              <Form.Item name="has3D" valuePropName="checked">
                <Checkbox>3D Capability</Checkbox>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="hasDolbyAtmos" valuePropName="checked">
                <Checkbox>Dolby Atmos</Checkbox>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="hasReclinerSeats" valuePropName="checked">
                <Checkbox>Recliner Seats</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Form>
<<<<<<< HEAD
=======
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
>>>>>>> ee9f592098ddb54141ddf8d238bb87e99df9a954
  );
};
