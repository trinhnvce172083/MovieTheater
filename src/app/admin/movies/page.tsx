"use client";

import React, { useState, useMemo, useEffect } from "react";
import { getMovies } from "@/api/admin/getAllMovies";
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
  Statistic,
  Row,
  Col,
  Typography,
  Avatar,
} from "antd";
import type { ColumnsType } from 'antd/es/table';
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

// Movie Management Component
// Inside the ProfessionalMovieManagement component
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
  const [apiMovies, setApiMovies] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch movies from API
  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      try {
        const data = await getMovies({
          page: currentPage - 1, // API uses 0-based indexing
          size: pageSize,
          sortBy: "title",
          sortDirection: "asc",
        });
        
        if (data.content && Array.isArray(data.content)) {
          // Transform API data to match our expected format
          const transformedData = data.content.map((movie, index) => ({
            key: String(index + 1),
            id: movie.id || `MV${String(index + 1).padStart(3, '0')}`,
            eng: movie.title || "",
            vn: movie.vietnameseTitle || "",
            date: movie.releaseDate || "",
            company: movie.company || "",
            duration: movie.duration || 0,
            version: movie.versions || ["2D"],
            genre: movie.genres || ["Action"],
            rating: movie.rating || "PG",
            status: movie.status || "active",
            revenue: movie.revenue || 0,
            poster: movie.posterUrl || "/api/placeholder/150/225",
          }));
          
          setApiMovies(transformedData);
          setTotalElements(data.totalElements || data.content.length);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
        // Fallback to local data if API fails
        setApiMovies(movieData);
        setTotalElements(movieData.length);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMovies();
  }, [currentPage, pageSize]);

  // Define the handlePaginationChange function
  const handlePaginationChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // Use API data if available, otherwise use local data
  const displayData = apiMovies.length > 0 ? apiMovies : movieData;

  // Filter and search logic
  const filteredData = useMemo(() => {
    return displayData.filter((movie) => {
      const matchesSearch =
        movie.eng.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.vn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesVersion = !filterVersion || movie.version.includes(filterVersion);
      const matchesStatus = !filterStatus || movie.status === filterStatus;
      const matchesGenre = !filterGenre || movie.genre.includes(filterGenre);

      return matchesSearch && matchesVersion && matchesStatus && matchesGenre;
    });
  }, [searchTerm, filterVersion, filterStatus, filterGenre, dateRange, displayData]);

  // Statistics calculations
  const statistics = useMemo(() => {
    const totalMovies = totalElements || displayData.length;
    const activeMovies = displayData.filter((m) => m.status === "active").length;
    const totalRevenue = displayData.reduce((sum, movie) => sum + movie.revenue, 0);
    const avgDuration = Math.round(
      displayData.reduce((sum, movie) => sum + movie.duration, 0) / (displayData.length || 1)
    );

    return { totalMovies, activeMovies, totalRevenue, avgDuration };
  }, [displayData, totalElements]);

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

  const columns: ColumnsType<any> = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      width: 60,
      align: "center" as const,
      render: (_: any, record: any, index: any) => (
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
      render: (_: any, record: any) => (
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
      render: (_: any, record: any) => (
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
      title: "Duration",
      key: "duration",
      width: 80,
      align: "center",
      render: (_: any, record: any) => (
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
      align: "center" as const,
      width: 120,
      render: (versions: any) => (
        <div className="items-center gap-1">
          {versions.slice(0, 2).map((version: any) => (
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
      align: "center" as const,
      render: (status: any) => (
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
      align: "center" as const,
      render: (revenue: any) => (
        <div className="text-center">
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
      fixed: "right" as const,
      align: "center" as const,
      render: (_: any, record: any) => (
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
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center" size="small">
              <Statistic
                title="Total Movies"
                value={statistics.totalMovies}
                prefix={<VideoCameraOutlined className="text-blue-600" />}
                valueStyle={{ color: "#1677ff", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center" size="small">
              <Statistic
                title="Active Movies"
                value={statistics.activeMovies}
                prefix={<GlobalOutlined className="text-green-600" />}
                valueStyle={{ color: "#52c41a", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center" size="small">
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
            <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center" size="small">
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
          <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div>
              <Title level={2} className="m-0 text-gray-900 text-xl xl:text-2xl">
                Movie Management
              </Title>
              <Text type="secondary" className="text-sm xl:text-base">
                Manage and organize your cinema's movie collection
              </Text>
            </div>

            <div className="flex items-center gap-3">
              <Button
                icon={<ImportOutlined />}
                className="border-gray-300 text-xs xl:text-sm h-10 px-4"
                size="middle"
                onClick={async () => {
                  try {
                    setLoading(true);
                    const data = await getMovies({
                      page: 0,
                      size: 100,
                      sortBy: "title",
                      sortDirection: "asc",
                    });
                    
                    if (data.content && Array.isArray(data.content)) {
                      // Transform API data to match our expected format
                      const transformedData = data.content.map((movie, index) => ({
                        key: String(index + 1),
                        id: movie.id || `MV${String(index + 1).padStart(3, '0')}`,
                        eng: movie.title || "",
                        vn: movie.vietnameseTitle || "",
                        date: movie.releaseDate || "",
                        company: movie.company || "",
                        duration: movie.duration || 0,
                        version: movie.versions || ["2D"],
                        genre: movie.genres || ["Action"],
                        rating: movie.rating || "PG",
                        status: movie.status || "active",
                        revenue: movie.revenue || 0,
                        poster: movie.posterUrl || "/api/placeholder/150/225",
                      }));
                      
                      setApiMovies(transformedData);
                      setTotalElements(data.totalElements || data.content.length);
                      message.success("Movies imported successfully");
                    }
                  } catch (error) {
                    console.error("Error importing movies:", error);
                    message.error("Failed to import movies");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Import
              </Button>
              <Button
                icon={<ExportOutlined />}
                className="border-gray-300 text-xs xl:text-sm h-10 px-4"
                size="middle"
              >
                Export
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="middle"
                className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm text-xs xl:text-sm h-10 px-4"
                onClick={() => setIsModalVisible(true)}
              >
                Add New Movie
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12} lg={10} xl={8}>
                <Input
                  placeholder="Search movies, ID, or titles..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 px-4"
                  allowClear
                />
              </Col>
              <Col xs={12} sm={6} lg={4} xl={3}>
                <Select
                  placeholder="Version"
                  value={filterVersion}
                  onChange={setFilterVersion}
                  className="w-full h-10 px-4"
                  allowClear
                  size="middle"
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
                  className="w-full h-10 px-4"
                  allowClear
                  size="middle"
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
                  className="w-full h-10 px-4"
                  allowClear
                  size="middle"
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
                  className="w-full h-10 px-4"
                  size="middle"
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
              loading={loading}
            />

            {/* Pagination */}
            <div className="px-6 py-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Text type="secondary" className="text-sm">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, totalElements)} of{" "}
                {totalElements} movies
              </Text>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalElements || filteredData.length}
                onChange={handlePaginationChange}
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
                <Input placeholder="Enter English title" className="h-10" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="vn"
                label="Vietnamese Title"
                rules={[{ required: true, message: "Please enter Vietnamese title" }]}
              >
                <Input placeholder="Enter Vietnamese title" className="h-10" />
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
                <Input placeholder="Enter production company" className="h-10" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="date"
                label="Release Date"
                rules={[{ required: true, message: "Please select release date" }]}
              >
                <DatePicker className="w-full h-10" />
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
                <Input type="number" placeholder="Duration" className="h-10" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="rating"
                label="Rating"
                rules={[{ required: true, message: "Please select rating" }]}
              >
                <Select placeholder="Select rating" className="h-10">
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
                <Select placeholder="Select status" className="h-10">
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
                <Select mode="multiple" placeholder="Select versions" className="h-10">
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
                <Select mode="multiple" placeholder="Select genres" className="h-10">
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