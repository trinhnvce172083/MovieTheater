"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  DatePicker,
  Tag,
  Row,
  Col,
  Typography,
  Avatar,
  Statistic,
  Alert,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  UserAddOutlined,
  UserSwitchOutlined,
  UsergroupAddOutlined,
  CheckCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { getAllUsers } from "@/api/admin/getAllUsers";

import axiosClient from "@/api/axiosClient";
import { useRouter } from "next/navigation";

const { Option } = Select;
const { Title, Text } = Typography;

// Interface for Member Data
interface MemberData {
  key: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: "active" | "inactive";
  type: string;
  avatar: string;
}

// Interface for API User Response
interface ApiUser {
  accountId?: number;
  fullName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  createdAt?: string;
  isActive?: boolean;
  role?: string;
  avatar?: string;
}

// Interface for creating/updating members
interface MemberCreateRequest {
  username: string;
  password?: string; // Optional for updates
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  role: string;
  isActive: boolean;
}

// Interface for error responses
interface ApiErrorResponse {
  response: {
    status: number;
    data: unknown;
  };
}

// Interface for Member Statistics
interface MemberStatistics {
  totalMembers: number;
  activeMembers: number;
  newMembers: number;
  types: Record<string, number>;
}

export default function AdminMemberManagement() {
  const [memberData, setMemberData] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberData | null>(null);
  const [form] = Form.useForm();
  const router = useRouter();
  // Simple auth status check
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [isUsingApiData, setIsUsingApiData] = useState(true);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("Fetching users...");
      const response = await getAllUsers();
      console.log("API Response:", response);

      // Check if response and response.content exist and is an array
      if (!response || !response.content || !Array.isArray(response.content)) {
        console.warn("Invalid API response structure:", response);
        setMemberData([]);
        return;
      } // Transform API data to match our table structure
      const transformedData: MemberData[] = response.content.map(
        (user: unknown, index: number) => {
          console.log("Processing user:", user);
          try {
            const userObj = user as ApiUser; // Type assertion for API response
            return {
              key: userObj.accountId
                ? userObj.accountId.toString()
                : index.toString(),
              id: userObj.accountId
                ? userObj.accountId.toString()
                : `MB${String(index + 1).padStart(3, "0")}`,
              name: userObj.fullName || userObj.username || "N/A",
              email: userObj.email || "N/A",
              phone: userObj.phoneNumber || "N/A",
              joinDate: userObj.createdAt
                ? new Date(userObj.createdAt).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
              status: (userObj.isActive !== false ? "active" : "inactive") as
                | "active"
                | "inactive",
              type: userObj.role || "CUSTOMER",
              avatar:
                userObj.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  userObj.fullName || userObj.username || "User"
                )}&background=random`,
            };
          } catch (error) {
            console.error("Error processing user:", user, error);
            const inactiveStatus = "inactive" as const;
            return {
              key: index.toString(),
              id: `MB${String(index + 1).padStart(3, "0")}`,
              name: "Error Loading User",
              email: "N/A",
              phone: "N/A",
              joinDate: new Date().toISOString().split("T")[0],
              status: inactiveStatus,
              type: "CUSTOMER",
              avatar:
                "https://ui-avatars.com/api/?name=Error&background=random",
            };
          }
        }
      );
      console.log("Transformed data:", transformedData);
      setMemberData(transformedData || []);
      setIsUsingApiData(true);
    } catch (error) {
      console.error("Error fetching users:", error);
      // Since getAllUsers now returns mock data on error, this is less likely to happen
      // But if it does, show a more informative message
      console.log("Using fallback data due to API error");
      message.warning(
        "Using sample data - please check your connection or login status"
      );
      setMemberData([]);
      setIsUsingApiData(false);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("accessToken");

    console.log("🔍 Auth check - Token found:", token ? "YES" : "NO");
    if (token) {
      console.log(
        "Token source:",
        localStorage.getItem("accessToken")
          ? "localStorage(accessToken)"
          : localStorage.getItem("access_token")
          ? "localStorage(access_token)"
          : localStorage.getItem("authToken")
          ? "localStorage(authToken)"
          : sessionStorage.getItem("accessToken")
          ? "sessionStorage(accessToken)"
          : "unknown"
      );
      console.log("Token preview:", token.substring(0, 20) + "...");
    }

    setShowAuthWarning(!token);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []); // Filter and search logic
  const filteredData = useMemo(() => {
    try {
      if (!memberData || !Array.isArray(memberData)) {
        console.log("memberData is not an array:", memberData);
        return [];
      }

      return memberData.filter((member) => {
        try {
          if (!member) return false;

          const matchesSearch =
            !searchTerm ||
            (member.name &&
              member.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (member.email &&
              member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (member.id &&
              member.id.toLowerCase().includes(searchTerm.toLowerCase()));

          const matchesStatus = !filterStatus || member.status === filterStatus;
          const matchesType = !filterType || member.type === filterType;

          return matchesSearch && matchesStatus && matchesType;
        } catch (error) {
          console.error("Error filtering member:", member, error);
          return false;
        }
      });
    } catch (error) {
      console.error("Error in filteredData calculation:", error);
      return [];
    }
  }, [searchTerm, filterStatus, filterType, memberData]);
  // Paginated data for table display
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterType]); // Statistics calculations
  const statistics: MemberStatistics = useMemo(() => {
    try {
      const totalMembers = memberData?.length || 0;
      const activeMembers =
        memberData?.filter((m) => m.status === "active")?.length || 0;

      const newMembers =
        memberData?.filter((m) => {
          try {
            const join = new Date(m.joinDate);
            const now = new Date();
            return (
              join.getMonth() === now.getMonth() &&
              join.getFullYear() === now.getFullYear()
            );
          } catch (error) {
            console.error("Error processing date for member:", m, error);
            return false;
          }
        })?.length || 0;

      const types =
        memberData?.reduce((acc: Record<string, number>, m) => {
          try {
            acc[m.type] = (acc[m.type] || 0) + 1;
            return acc;
          } catch (error) {
            console.error("Error processing type for member:", m, error);
            return acc;
          }
        }, {}) || {};

      return { totalMembers, activeMembers, newMembers, types };
    } catch (error) {
      console.error("Error calculating statistics:", error);
      return { totalMembers: 0, activeMembers: 0, newMembers: 0, types: {} };
    }
  }, [memberData]);

  // CRUD Operations
  const createMember = async (memberData: MemberCreateRequest) => {
    try {
      setLoading(true);
      console.log("Creating member with data:", memberData);
      // Ensure all required fields are present and properly formatted
      const payload = {
        ...memberData,
        // Ensure role is uppercase
        role: memberData.role?.toUpperCase() || "STAFF",
      };

      console.log("Sending payload:", payload);
      const response = await axiosClient.post("/admin/users", payload);
      console.log("Create response:", response.data);
      message.success("Member created successfully");
      await fetchUsers(); // Refresh the list
      return true;
    } catch (error) {
      console.error("Error creating member:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as ApiErrorResponse;
        console.error("Backend error details:", axiosError.response.data);
        if (axiosError.response.status === 400) {
          message.error(
            "Validation error. Please check all required fields are filled correctly."
          );
        } else if (axiosError.response.status === 401) {
          message.error("Authentication failed. Please login again.");
        } else if (axiosError.response.status === 403) {
          message.error("Access denied. You may not have admin permissions.");
        } else {
          message.error(
            `Failed to create member: ${axiosError.response.status}`
          );
        }
      } else {
        message.error("Failed to create member");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateMember = async (id: string, memberData: MemberCreateRequest) => {
    try {
      setLoading(true);
      console.log("Updating member:", id, memberData);
      const response = await axiosClient.put(`/admin/users/${id}`, memberData);
      console.log("Update response:", response.data);
      message.success("Member updated successfully");
      await fetchUsers(); // Refresh the list
      return true;
    } catch (error) {
      console.error("Error updating member:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as ApiErrorResponse;
        if (axiosError.response.status === 401) {
          message.error("Authentication failed. Please login again.");
        } else if (axiosError.response.status === 403) {
          message.error("Access denied. You may not have admin permissions.");
        } else {
          message.error(
            `Failed to update member: ${axiosError.response.status}`
          );
        }
      } else {
        message.error("Failed to update member");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (id: string, name: string) => {
    try {
      setLoading(true);
      console.log("Deleting member:", id);
      const response = await axiosClient.delete(`/admin/users/${id}`);
      console.log("Delete response:", response.data);
      message.success(`Deleted member "${name}" successfully`);
      await fetchUsers(); // Refresh the list
      return true;
    } catch (error) {
      console.error("Error deleting member:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as ApiErrorResponse;
        if (axiosError.response.status === 401) {
          message.error("Authentication failed. Please login again.");
        } else if (axiosError.response.status === 403) {
          message.error("Access denied. You may not have admin permissions.");
        } else {
          message.error(
            `Failed to delete member: ${axiosError.response.status}`
          );
        }
      } else {
        message.error("Failed to delete member");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (record: MemberData) => {
    setEditingMember(record);
    form.setFieldsValue({
      name: record.name,
      username: record.id, // Use the id as username for now, you might want to store actual username
      email: record.email,
      phone: record.phone,
      type: record.type,
      status: record.status,
      joinDate: record.joinDate,
    });
    setIsModalVisible(true);
  };
  const handleDelete = (record: MemberData) => {
    deleteMember(record.id, record.name);
  };

  const handleViewDetail = (record: MemberData) => {
    router.push(`/admin/members/MemberDetail?id=${record.id}`);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form values:", values); // Transform form data to match API expectations
      const memberData: MemberCreateRequest = {
        username: values.username,
        fullName: values.name,
        email: values.email,
        phoneNumber: values.phone || undefined,
        address: values.address || undefined,
        dateOfBirth: values.dob ? values.dob.format("YYYY-MM-DD") : undefined,
        role: values.type,
        isActive: values.status === "active",
      };

      // Add password for create, or for update if provided
      if (!editingMember || (editingMember && values.password)) {
        memberData.password = values.password;
      }

      let success = false;
      if (editingMember) {
        success = await updateMember(editingMember.id, memberData);
      } else {
        success = await createMember(memberData);
      }

      if (success) {
        setIsModalVisible(false);
        setEditingMember(null);
        form.resetFields();
      }
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingMember(null);
    form.resetFields();
  };
  const columns: ColumnsType<MemberData> = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      width: 60,
      align: "center" as const,
      render: (_: unknown, record: MemberData, index: number) => (
        <div className="text-center">
          <span className="font-mono text-sm text-gray-500">
            {(currentPage - 1) * pageSize + index + 1}
          </span>
        </div>
      ),
    },
    {
      title: "Member",
      key: "member_info",
      width: 220,
      render: (_: unknown, record: MemberData) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.avatar} size={40} icon={<UserOutlined />} />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 mb-1 truncate text-sm">
              {record.name}
            </div>
            <div className="text-xs text-gray-600 mb-1 truncate">
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 120,
      render: (phone: string) => <span className="text-sm">{phone}</span>,
    },
    {
      title: "Join Date",
      dataIndex: "joinDate",
      key: "joinDate",
      width: 120,
      render: (date: string) => (
        <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: string) => (
        <Tag
          color={
            type === "ADMIN"
              ? "red"
              : type === "STAFF"
              ? "purple"
              : type === "EMPLOYEE"
              ? "orange"
              : "blue"
          }
          className="text-xs m-0"
        >
          {type}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 90,
      align: "center" as const,
      render: (status: string) => (
        <Tag
          color={status === "active" ? "success" : "default"}
          className="font-medium text-xs"
        >
          {status === "active" ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 130,
      fixed: "right" as const,
      align: "center" as const,
      render: (_: unknown, record: MemberData) => (
        <Space size="small">
          {/* Only show View Details button for Staff and Employee, not for Admin */}
          {record.type !== "ADMIN" && (
            <Tooltip title="View Details">
              <Button
                type="text"
                icon={<EyeOutlined />}
                size="small"
                className="text-blue-600 hover:bg-blue-50"
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>
          )}
          <Tooltip
            title={isUsingApiData ? "Edit" : "Edit disabled in demo mode"}
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
            title={isUsingApiData ? "Delete" : "Delete disabled in demo mode"}
          >
            <Popconfirm
              title="Delete Member"
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

        {/* Authentication Warning */}
        {showAuthWarning && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <div className="flex items-center gap-3">
              <UserOutlined className="text-orange-600" />
              <div>
                <strong>Authentication Notice</strong>
                <p className="text-sm text-gray-600 mb-0">
                  You are not logged in. Displaying sample data for
                  demonstration.
                  <a href="/auth/Login" className="text-blue-600 ml-1">
                    Log in here
                  </a>{" "}
                  to access real data.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={12} lg={6}>
            <Card
              className="text-center border-0 shadow-sm h-32 flex flex-col justify-center"
              size="small"
            >
              <Statistic
                title="Total Members"
                value={statistics.totalMembers}
                prefix={<UsergroupAddOutlined className="text-blue-600" />}
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
                title="Active Members"
                value={statistics.activeMembers}
                prefix={<CheckCircleOutlined className="text-green-600" />}
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
                title="New This Month"
                value={statistics.newMembers}
                prefix={<UserAddOutlined className="text-purple-600" />}
                valueStyle={{ color: "#722ed1", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            {" "}
            <Card
              className="text-center border-0 shadow-sm h-32 flex flex-col justify-center"
              size="small"
            >
              <Statistic
                title="Admin/Staff/Employee"
                value={Object.entries(statistics.types)
                  .map(([type, count]) => `${type}:${count}`)
                  .join(" ")}
                prefix={<UserSwitchOutlined className="text-gold-600" />}
                valueStyle={{ color: "#faad14", fontSize: "1.1rem" }}
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
            <div>
              <Title
                level={2}
                className="m-0 text-gray-900 text-xl xl:text-2xl"
              >
                Member Management
              </Title>
              <Text type="secondary" className="text-sm xl:text-base">
                Manage and organize your cinema&apos;s member list
              </Text>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="middle"
                className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm text-xs xl:text-sm h-10 px-4"
                onClick={() => setIsModalVisible(true)}
                disabled={!isUsingApiData}
                title={
                  !isUsingApiData
                    ? "Create/Edit functions require backend connection"
                    : "Add new member"
                }
              >
                Add New Member
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12} lg={10} xl={8}>
                <Input
                  placeholder="Search members, ID, or email..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10"
                  allowClear
                />
              </Col>
              <Col xs={12} sm={6} lg={4} xl={3}>
                <Select
                  placeholder="Status"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  className="w-full h-10"
                  allowClear
                  size="middle"
                >
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Col>{" "}
              <Col xs={12} sm={6} lg={4} xl={3}>
                <Select
                  placeholder="Type"
                  value={filterType}
                  onChange={setFilterType}
                  className="w-full h-10"
                  allowClear
                  size="middle"
                >
                  <Option value="ADMIN">Admin</Option>
                  <Option value="STAFF">Staff</Option>
                  <Option value="EMPLOYEE">Employee</Option>
                  <Option value="CUSTOMER">Customer</Option>
                </Select>
              </Col>
            </Row>
          </div>

          {/* Table Section */}
          <div className="bg-white">
            {" "}
            <Table
              dataSource={paginatedData}
              columns={columns}
              pagination={false}
              scroll={{ x: 950 }}
              rowClassName="hover:bg-gray-50 transition-colors"
              className="professional-table"
              size="small"
              loading={loading}
              rowKey="key"
            />
            {/* Pagination */}
            <div className="px-6 py-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Text type="secondary" className="text-sm">
                Showing {Math.max(1, (currentPage - 1) * pageSize + 1)} to{" "}
                {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
                {filteredData.length} members
              </Text>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredData.length}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  if (size) setPageSize(size);
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
      </div>

      {/* Add/Edit Member Modal */}
      <Modal
        title={editingMember ? "Edit Member" : "Add New Member"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        className="professional-modal"
        okText={editingMember ? "Update Member" : "Add Member"}
        cancelText="Cancel"
      >
        {" "}
        <Form form={form} layout="vertical" className="mt-6">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: "Please enter full name" }]}
              >
                <Input placeholder="Enter full name" className="h-10" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: "Please enter username" }]}
              >
                <Input placeholder="Enter username" className="h-10" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Invalid email!" },
                ]}
              >
                <Input
                  placeholder="Enter email"
                  className="h-10"
                  type="email"
                />
              </Form.Item>
            </Col>{" "}
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[
                  { required: true, message: "Please enter phone number" },
                ]}
              >
                <Input
                  placeholder="Enter phone number"
                  className="h-10"
                  type="tel"
                />
              </Form.Item>
            </Col>{" "}
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  {
                    required: !editingMember,
                    message: "Please enter password",
                  },
                  {
                    min: 6,
                    message: "Password must be at least 6 characters",
                  },
                ]}
              >
                <Input.Password
                  placeholder={
                    editingMember
                      ? "Leave blank to keep current password"
                      : "Enter password"
                  }
                  className="h-10"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              {/* Empty space for layout */}
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: "Please enter address" }]}
              >
                <Input.TextArea placeholder="Enter address" rows={2} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="dob"
                label="Date of Birth"
                rules={[
                  { required: true, message: "Please select date of birth" },
                ]}
              >
                <DatePicker className="w-full h-10" format="DD-MM-YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: "Please select gender" }]}
              >
                <Select placeholder="Select gender" className="h-10">
                  <Option value="M">Male</Option>
                  <Option value="F">Female</Option>
                  <Option value="O">Other</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="idNumber"
                label="ID Number"
                rules={[{ required: true, message: "Please enter ID number" }]}
              >
                <Input
                  placeholder="Enter ID number"
                  className="h-10"
                  type="number"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              {" "}
              <Form.Item
                name="type"
                label="Role"
                rules={[{ required: true, message: "Please select role" }]}
              >
                <Select placeholder="Select role" className="h-10">
                  <Option value="STAFF">Staff</Option>
                  <Option value="EMPLOYEE">Employee</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select placeholder="Select status" className="h-10">
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="joinDate"
                label="Join Date"
                rules={[{ required: true, message: "Please select join date" }]}
              >
                <DatePicker className="w-full h-10" format="DD-MM-YYYY" />
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
      `}</style>
    </div>
  );
}
