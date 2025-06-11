"use client";

import React, { useState, useMemo } from "react";
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
  Dropdown,
  Badge,
  Statistic,
  Row,
  Col,
  Typography,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  SearchOutlined,
  MoreOutlined,
  EyeOutlined,
  ExportOutlined,
  ImportOutlined,
  ReloadOutlined,
  CalendarOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { Bell, UserCircle, Settings, LogOut } from "lucide-react";
import Image from "next/image";

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Enhanced data with more realistic movie information
const movieData = [
  {
    key: "1",
    id: "MV001",
    eng: "Doctor Strange",
    vn: "Doctor Strange: Phù Thủy Tối Thượng",
    date: "2016-11-18",
    company: "Marvel Studios",
    duration: 116,
    version: ["2D", "3D", "IMAX"],
    genre: ["Action", "Adventure", "Fantasy"],
    rating: "PG-13",
    status: "active",
    revenue: 677718395,
    poster: "/api/placeholder/150/225",
  },
  {
    key: "2",
    id: "MV002",
    eng: "Avengers: Infinity War",
    vn: "Avengers: Cuộc Chiến Vô Cực",
    date: "2018-04-25",
    company: "Marvel Studios",
    duration: 149,
    version: ["2D", "3D", "IMAX", "4DX"],
    genre: ["Action", "Adventure", "Sci-Fi"],
    rating: "PG-13",
    status: "active",
    revenue: 2048359754,
    poster: "/api/placeholder/150/225",
  },
  {
    key: "3",
    id: "MV003",
    eng: "Spider-Man: No Way Home",
    vn: "Spider-Man: Không Còn Nhà",
    date: "2021-12-15",
    company: "Sony Pictures",
    duration: 148,
    version: ["2D", "3D", "IMAX"],
    genre: ["Action", "Adventure", "Sci-Fi"],
    rating: "PG-13",
    status: "active",
    revenue: 1921847111,
    poster: "/api/placeholder/150/225",
  },
  {
    key: "4",
    id: "MV004",
    eng: "The Batman",
    vn: "Người Dơi",
    date: "2022-03-01",
    company: "Warner Bros.",
    duration: 176,
    version: ["2D", "IMAX"],
    genre: ["Action", "Crime", "Drama"],
    rating: "PG-13",
    status: "inactive",
    revenue: 771326348,
    poster: "/api/placeholder/150/225",
  },
];

// Professional Admin Header Component
const ProfessionalAdminHeader = () => {
  const userMenuItems = [
    {
      key: "profile",
      label: (
        <div className="flex items-center gap-2 px-2 py-1">
          <UserCircle size={16} />
          <span>Profile Settings</span>
        </div>
      ),
    },
    {
      key: "settings",
      label: (
        <div className="flex items-center gap-2 px-2 py-1">
          <Settings size={16} />
          <span>System Settings</span>
        </div>
      ),
    },
    { type: "divider" },
    {
      key: "logout",
      label: (
        <div className="flex items-center gap-2 px-2 py-1 text-red-600">
          <LogOut size={16} />
          <span>Sign Out</span>
        </div>
      ),
    },
  ];

  return (
    <header className="w-full flex items-center justify-between px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <VideoCameraOutlined className="text-white text-lg" />
          </div>
          <div>
            <Title level={3} className="m-0 text-gray-800">
              Cinema Management
            </Title>
            <Text type="secondary" className="text-sm">
              Professional Admin Dashboard
            </Text>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Badge count={5} size="small">
          <Button
            type="text"
            icon={<Bell size={20} />}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/50"
          />
        </Badge>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/50 cursor-pointer transition-all">
            <Avatar
              size={32}
              src="/api/placeholder/32/32"
              className="border-2 border-blue-200"
            />
            <div className="text-left">
              <Text strong className="block text-sm">
                Administrator
              </Text>
              <Text type="secondary" className="text-xs">
                Super Admin
              </Text>
            </div>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};

// Movie Management Component
export default function ProfessionalMovieManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVersion, setFilterVersion] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [form] = Form.useForm();

  // Filter and search logic
  const filteredData = useMemo(() => {
    return movieData.filter((movie) => {
      const matchesSearch =
        movie.eng.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.vn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesVersion = !filterVersion || movie.version.includes(filterVersion);
      const matchesStatus = !filterStatus || movie.status === filterStatus;
      const matchesGenre = !filterGenre || movie.genre.includes(filterGenre);

      return matchesSearch && matchesVersion && matchesStatus && matchesGenre;
    });
  }, [searchTerm, filterVersion, filterStatus, filterGenre, dateRange]);

  // Statistics calculations
  const statistics = useMemo(() => {
    const totalMovies = movieData.length;
    const activeMovies = movieData.filter((m) => m.status === "active").length;
    const totalRevenue = movieData.reduce((sum, movie) => sum + movie.revenue, 0);
    const avgDuration = Math.round(
      movieData.reduce((sum, movie) => sum + movie.duration, 0) / totalMovies
    );

    return { totalMovies, activeMovies, totalRevenue, avgDuration };
  }, []);

  const handleEdit = (record) => {
    setEditingMovie(record);
    form.setFieldsValue({
      ...record,
      date: record.date,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    message.success(`Deleted "${record.eng}" successfully`);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      message.success(
        editingMovie ? "Movie updated successfully" : "Movie added successfully"
      );
      setIsModalVisible(false);
      setEditingMovie(null);
      form.resetFields();
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingMovie(null);
    form.resetFields();
  };

  const columns = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      width: 60,
      render: (text, record, index) => (
        <div className="text-center">
          <span className="font-mono text-sm text-gray-500">
            {(currentPage - 1) * pageSize + index + 1}
          </span>
        </div>
      ),
    },
    {
      title: "Movie Information",
      key: "movie_info",
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.poster}
            size={40}
            shape="square"
            className="border border-gray-200 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 mb-1 truncate text-sm">
              {record.eng}
            </div>
            <div className="text-xs text-gray-600 mb-1 truncate">
              {record.vn}
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              <Tag color="blue" className="text-xs m-0">
                {record.id}
              </Tag>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Company",
      key: "company",
      width: 120,
      render: (_, record: any) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 truncate">
            {record.company}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(record.date).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: "Details",
      key: "details",
      width: 80,
      render: (_, record) => (
        <div className="text-center">
          <div className="text-sm font-medium">{record.duration}m</div>
          <Tag color="orange" className="text-xs mt-1">
            {record.rating}
          </Tag>
        </div>
      ),
    },
    {
      title: "Versions",
      dataIndex: "version",
      key: "version",
      width: 120,
      render: (versions) => (
        <div className="flex flex-wrap gap-1">
          {versions.slice(0, 2).map((version) => (
            <Tag
              key={version}
              color={
                version === "IMAX"
                  ? "gold"
                  : version === "4DX"
                  ? "purple"
                  : "blue"
              }
              className="text-xs m-0"
            >
              {version}
            </Tag>
          ))}
          {versions.length > 2 && (
            <Tag className="text-xs m-0">+{versions.length - 2}</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (status) => (
        <div className="text-center">
          <Tag
            color={status === "active" ? "success" : "default"}
            className="font-medium text-xs"
          >
            {status === "active" ? "Active" : "Inactive"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      width: 90,
      render: (revenue) => (
        <div className="text-right">
          <span className="font-mono text-sm font-semibold text-green-600">
            ${(revenue / 1000000).toFixed(1)}M
          </span>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              className="text-blue-600 hover:bg-blue-50"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              className="text-green-600 hover:bg-green-50"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Movie"
              description="Are you sure?"
              onConfirm={() => handleDelete(record)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                className="text-red-600 hover:bg-red-50"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfessionalAdminHeader />

      <div className="p-2 xl:p-4 max-w-full">
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm" size="small">
              <Statistic
                title="Total Movies"
                value={statistics.totalMovies}
                prefix={<VideoCameraOutlined className="text-blue-600" />}
                valueStyle={{ color: "#1677ff", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm" size="small">
              <Statistic
                title="Active Movies"
                value={statistics.activeMovies}
                prefix={<GlobalOutlined className="text-green-600" />}
                valueStyle={{ color: "#52c41a", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm" size="small">
              <Statistic
                title="Total Revenue"
                value={statistics.totalRevenue / 1000000}
                suffix="M"
                prefix="$"
                precision={1}
                valueStyle={{ color: "#faad14", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm" size="small">
              <Statistic
                title="Avg Duration"
                value={statistics.avgDuration}
                suffix="min"
                prefix={<ClockCircleOutlined className="text-purple-600" />}
                valueStyle={{ color: "#722ed1", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Card */}
        <Card
          className="shadow-sm border-0"
          bodyStyle={{ padding: 0 }}
          style={{ borderRadius: 16 }}
        >
          {/* Header Section */}
          <div className="px-4 xl:px-8 py-4 xl:py-6 border-b border-gray-100 bg-white">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
              <div>
                <Title level={2} className="m-0 text-gray-900 text-xl xl:text-2xl">
                  Movie Management
                </Title>
                <Text type="secondary" className="text-sm xl:text-base">
                  Manage and organize your cinema's movie collection
                </Text>
              </div>

              <div className="flex items-center gap-2 xl:gap-3">
                <Button
                  icon={<ImportOutlined />}
                  className="border-gray-300 text-xs xl:text-sm"
                  size="small"
                >
                  Import
                </Button>
                <Button
                  icon={<ExportOutlined />}
                  className="border-gray-300 text-xs xl:text-sm"
                  size="small"
                >
                  Export
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="middle"
                  className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm text-xs xl:text-sm"
                  onClick={() => setIsModalVisible(true)}
                >
                  Add New Movie
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="px-4 xl:px-8 py-4 xl:py-6 bg-gray-50 border-b border-gray-100">
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12} lg={10} xl={8}>
                <Input
                  placeholder="Search movies, ID, or titles..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9"
                  allowClear
                />
              </Col>
              <Col xs={12} sm={6} lg={4} xl={3}>
                <Select
                  placeholder="Version"
                  value={filterVersion}
                  onChange={setFilterVersion}
                  className="w-full h-9"
                  allowClear
                  size="small"
                >
                  <Option value="2D">2D</Option>
                  <Option value="3D">3D</Option>
                  <Option value="IMAX">IMAX</Option>
                  <Option value="4DX">4DX</Option>
                </Select>
              </Col>
              <Col xs={12} sm={6} lg={3} xl={3}>
                <Select
                  placeholder="Status"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  className="w-full h-9"
                  allowClear
                  size="small"
                >
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Col>
              <Col xs={12} sm={6} lg={3} xl={3}>
                <Select
                  placeholder="Genre"
                  value={filterGenre}
                  onChange={setFilterGenre}
                  className="w-full h-9"
                  allowClear
                  size="small"
                >
                  <Option value="Action">Action</Option>
                  <Option value="Adventure">Adventure</Option>
                  <Option value="Fantasy">Fantasy</Option>
                  <Option value="Sci-Fi">Sci-Fi</Option>
                  <Option value="Crime">Crime</Option>
                  <Option value="Drama">Drama</Option>
                </Select>
              </Col>
              <Col xs={12} sm={6} lg={4} xl={3}>
                <Button
                  icon={<ReloadOutlined />}
                  className="w-full h-9"
                  size="small"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterVersion("");
                    setFilterStatus("");
                    setFilterGenre("");
                    setDateRange(null);
                  }}
                >
                  Reset
                </Button>
              </Col>
            </Row>
          </div>

          {/* Table Section */}
          <div className="bg-white">
            <Table
              dataSource={filteredData}
              columns={columns}
              pagination={false}
              scroll={{ x: 950 }}
              rowClassName="hover:bg-gray-50 transition-colors"
              className="professional-table"
              size="small"
            />

            {/* Pagination */}
            <div className="px-4 xl:px-8 py-4 xl:py-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Text type="secondary" className="text-sm">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
                {filteredData.length} movies
              </Text>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredData.length}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
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

      {/* Add/Edit Movie Modal */}
      <Modal
        title={editingMovie ? "Edit Movie" : "Add New Movie"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        className="professional-modal"
        okText={editingMovie ? "Update Movie" : "Add Movie"}
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-6"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="eng"
                label="English Title"
                rules={[{ required: true, message: "Please enter English title" }]}
              >
                <Input placeholder="Enter English title" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="vn"
                label="Vietnamese Title"
                rules={[{ required: true, message: "Please enter Vietnamese title" }]}
              >
                <Input placeholder="Enter Vietnamese title" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="company"
                label="Production Company"
                rules={[{ required: true, message: "Please enter production company" }]}
              >
                <Input placeholder="Enter production company" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="date"
                label="Release Date"
                rules={[{ required: true, message: "Please select release date" }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="duration"
                label="Duration (minutes)"
                rules={[{ required: true, message: "Please enter duration" }]}
              >
                <Input type="number" placeholder="Duration" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="rating"
                label="Rating"
                rules={[{ required: true, message: "Please select rating" }]}
              >
                <Select placeholder="Select rating">
                  <Option value="G">G</Option>
                  <Option value="PG">PG</Option>
                  <Option value="PG-13">PG-13</Option>
                  <Option value="R">R</Option>
                  <Option value="NC-17">NC-17</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select placeholder="Select status">
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="version"
                label="Available Versions"
                rules={[{ required: true, message: "Please select versions" }]}
              >
                <Select mode="multiple" placeholder="Select versions">
                  <Option value="2D">2D</Option>
                  <Option value="3D">3D</Option>
                  <Option value="IMAX">IMAX</Option>
                  <Option value="4DX">4DX</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="genre"
                label="Genres"
                rules={[{ required: true, message: "Please select genres" }]}
              >
                <Select mode="multiple" placeholder="Select genres">
                  <Option value="Action">Action</Option>
                  <Option value="Adventure">Adventure</Option>
                  <Option value="Fantasy">Fantasy</Option>
                  <Option value="Sci-Fi">Sci-Fi</Option>
                  <Option value="Crime">Crime</Option>
                  <Option value="Drama">Drama</Option>
                  <Option value="Comedy">Comedy</Option>
                  <Option value="Horror">Horror</Option>
                  <Option value="Thriller">Thriller</Option>
                </Select>
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