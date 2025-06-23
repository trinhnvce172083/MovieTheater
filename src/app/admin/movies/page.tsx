"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { getMovies, createMovie, updateMovie, deleteMovie, getMovieStatistics, type Movie } from "../../../api/admin/getAllMovies";
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
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import ShowtimePickerModal from "@/components/ShowtimePickerModal";
import { useRouter } from "next/navigation";

const { Option } = Select;
const { Title, Text } = Typography;

// Enhanced data with more realistic movie information
const movieData: Movie[] = [
  {
    movieId: 1,
    title: "Avatar: The Way of Water",
    vietnameseTitle: "Avatar: Dòng Chảy Của Nước",
    releaseDate: "2024-05-01",
    company: "20th Century Studios",
    duration: 192,
    versions: ["2D", "3D", "IMAX"],
    genres: "Action,Adventure,Fantasy",
    rating: "PG-13",
    status: "NOW_SHOWING",
    revenue: 2300000000,
    posterUrl: "/posters/Avatar.jpg",
    price: 150000,
  },
  {
    movieId: 2,
    title: "Avengers: Endgame",
    vietnameseTitle: "Avengers: Hồi Kết",
    releaseDate: "2024-01-15",
    company: "Marvel Studios",
    duration: 181,
    versions: ["2D", "3D", "IMAX"],
    genres: "Action,Adventure,Sci-Fi",
    rating: "PG-13",
    status: "NOW_SHOWING",
    revenue: 2797800564,
    posterUrl: "/posters/Avenger.jpg",
    price: 150000,
  },
  {
    movieId: 3,
    title: "Everything Everywhere All at Once",
    vietnameseTitle: "Mọi Thứ Mọi Nơi Tất Cả Một Lúc",
    releaseDate: "2024-04-01",
    company: "A24",
    duration: 139,
    versions: ["2D"],
    genres: "Action,Adventure,Fantasy",
    rating: "R",
    status: "NOW_SHOWING",
    revenue: 140000000,
    posterUrl: "/posters/EEAAO.jpg",
    price: 120000,
  },
  {
    movieId: 4,
    title: "Spider-Man: No Way Home",
    vietnameseTitle: "Người Nhện: Không Còn Nhà",
    releaseDate: "2024-02-01",
    company: "Sony Pictures",
    duration: 148,
    versions: ["2D", "3D", "IMAX"],
    genres: "Action,Adventure,Sci-Fi",
    rating: "PG-13",
    status: "NOW_SHOWING",
    revenue: 1921847111,
    posterUrl: "/posters/Spider-man.jpg",
    price: 150000,
  },
  {
    movieId: 5,
    title: "Top Gun: Maverick",
    vietnameseTitle: "Phi Công Siêu Đẳng Maverick",
    releaseDate: "2024-03-01",
    company: "Paramount Pictures",
    duration: 131,
    versions: ["2D", "IMAX"],
    genres: "Action,Drama",
    rating: "PG-13",
    status: "NOW_SHOWING",
    revenue: 1493454116,
    posterUrl: "/posters/Topgun.jpeg",
    price: 140000,
  },
];

// Movie Management Component
export default function ProfessionalMovieManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVersion, setFilterVersion] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [form] = Form.useForm();
  const [apiMovies, setApiMovies] = useState<Movie[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    totalMovies: 0,
    activeMovies: 0,
    totalRevenue: 0,
    avgDuration: 0,
  });

  // Fetch movies from API
  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching movies with params:", {
        page: currentPage - 1,
        size: pageSize,
        sortBy: "title",
        sortDirection: "asc",
      });
      
      const data = await getMovies({
        page: currentPage - 1, // API uses 0-based indexing
        size: pageSize,
        sortBy: "title",
        sortDirection: "asc",
      });
      
      console.log("API Response:", data);
      
      if (data.content && Array.isArray(data.content)) {
        setApiMovies(data.content);
        setTotalElements(data.totalElements || data.content.length);
        console.log("API movies set:", data.content);
      } else {
        console.log("API returned no content, using fallback data");
        // Fallback to local data if API returns empty
        setApiMovies(movieData);
        setTotalElements(movieData.length);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      message.error("Failed to fetch movies. Using sample data.");
      // Fallback to local data if API fails
      setApiMovies(movieData);
      setTotalElements(movieData.length);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const stats = await getMovieStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      // Use fallback statistics with better error handling
      const totalMovies = apiMovies.length || movieData.length;
      const activeMovies = (apiMovies.length > 0 ? apiMovies : movieData).filter(m => m.status === "NOW_SHOWING").length;
      const totalRevenue = (apiMovies.length > 0 ? apiMovies : movieData).reduce((sum, m) => sum + (m.revenue || 0), 0);
      const avgDuration = Math.round((apiMovies.length > 0 ? apiMovies : movieData).reduce((sum, m) => sum + (m.duration || 0), 0) / (apiMovies.length || movieData.length || 1));
      
      setStatistics({ totalMovies, activeMovies, totalRevenue, avgDuration });
      
      // Only show error message for non-403 errors to avoid spam
      if (error && typeof error === 'object' && 'status' in error && error.status !== 403) {
        message.warning('Unable to fetch live statistics. Showing calculated data.');
      }
    }
  }, [apiMovies]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Define the handlePaginationChange function
  const handlePaginationChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // Use API data if available, otherwise use local data
  const displayData = apiMovies.length > 0 ? apiMovies : movieData;

  // Filter and search logic
  const filteredData = useMemo(() => {
    return displayData.filter((movie) => {
      const matchesSearch =
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (movie.vietnameseTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.movieId.toString().includes(searchTerm);

      const movieVersions = Array.isArray(movie.versions) ? movie.versions : [];
      const matchesVersion = !filterVersion || movieVersions.includes(filterVersion);
      
      const matchesStatus = !filterStatus || movie.status === filterStatus;
      
      // Handle genres as comma-separated string or array
      const movieGenres = Array.isArray(movie.genres) 
        ? movie.genres 
        : typeof movie.genres === 'string' 
          ? movie.genres.split(',').map(g => g.trim())
          : [];
      const matchesGenre = !filterGenre || movieGenres.includes(filterGenre);

      return matchesSearch && matchesVersion && matchesStatus && matchesGenre;
    });
  }, [searchTerm, filterVersion, filterStatus, filterGenre, displayData]);

  const handleEdit = (record: Movie) => {
    setEditingMovie(record);
    form.setFieldsValue({
      ...record,
      releaseDate: record.releaseDate ? dayjs(record.releaseDate) : undefined,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (record: Movie) => {
    try {
      await deleteMovie(record.movieId);
      message.success(`Deleted "${record.title}" successfully`);
      fetchMovies(); // Refresh the list
    } catch (error) {
      console.error("Error deleting movie:", error);
      message.error("Failed to delete movie");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingMovie) {
        await updateMovie(editingMovie.movieId, {
          ...values,
          releaseDate: values.releaseDate ? values.releaseDate.format('YYYY-MM-DD') : undefined,
        });
        message.success("Movie updated successfully");
      } else {
        await createMovie({
          ...values,
          releaseDate: values.releaseDate ? values.releaseDate.format('YYYY-MM-DD') : undefined,
        });
        message.success("Movie added successfully");
      }
      
      setIsModalVisible(false);
      setEditingMovie(null);
      form.resetFields();
      fetchMovies(); // Refresh the list
    } catch (error) {
      console.error("Error saving movie:", error);
      message.error("Failed to save movie");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingMovie(null);
    form.resetFields();
  };

  const columns: ColumnsType<Movie> = [
    {
      title: "#",
      dataIndex: "movieId",
      key: "movieId",
      width: 60,
      align: "center" as const,
      render: (value: unknown, record: Movie, index: number) => (
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
      render: (value: unknown, record: Movie) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.posterUrl}
            size={40}
            shape="square"
            className="border border-gray-200 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 mb-1 truncate text-sm">
              {record.title}
            </div>
            <div className="text-xs text-gray-600 mb-1 truncate">
              {record.vietnameseTitle}
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              <Tag color="blue" className="text-xs m-0">
                #{record.movieId}
              </Tag>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Company & Release",
      key: "company_release",
      width: 150,
      render: (value: unknown, record: Movie) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 truncate mb-1">
            {record.company || "Unknown Studio"}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(record.releaseDate).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: "Duration",
      key: "duration",
      width: 80,
      align: "center",
      render: (value: unknown, record: Movie) => (
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
      dataIndex: "versions",
      key: "versions",
      align: "center" as const,
      width: 120,
      render: (versions: string[]) => (
        <div className="items-center gap-1">
          {versions && versions.length > 0 ? (
            <>
              {versions.slice(0, 2).map((version: string, index: number) => (
                <Tag
                  key={`${version}-${index}`}
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
            </>
          ) : (
            <span className="text-gray-400 text-xs">N/A</span>
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
      render: (status: string) => (
        <div className="text-center">
          <Tag
            color={
              status === "NOW_SHOWING" 
                ? "success" 
                : status === "COMING_SOON" 
                ? "processing" 
                : "default"
            }
            className="font-medium text-xs"
          >
            {status === "NOW_SHOWING" ? "Now Showing" : 
             status === "COMING_SOON" ? "Coming Soon" : 
             status === "ENDED" ? "Ended" : status}
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
      render: (revenue: number) => (
        <div className="text-center">
          <span className="font-mono text-sm font-semibold text-green-600">
            ${(revenue / 1000000).toFixed(1)}M
          </span>
        </div>
      ),
    },
    {
      title: "Genres",
      dataIndex: "genres",
      key: "genres",
      width: 120,
      align: "center" as const,
      render: (genres: string) => (
        <div className="items-center gap-1">
          {genres ? (
            <>
              {genres.split(',').slice(0, 2).map((genre: string, index: number) => (
                <Tag
                  key={`${genre.trim()}-${index}`}
                  color="blue"
                  className="text-xs m-0"
                >
                  {genre.trim()}
                </Tag>
              ))}
              {genres.split(',').length > 2 && (
                <Tag className="text-xs m-0">+{genres.split(',').length - 2}</Tag>
              )}
            </>
          ) : (
            <span className="text-gray-400 text-xs">N/A</span>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right" as const,
      align: "center" as const,
      render: (value: unknown, record: Movie) => (
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
                title="Now Showing"
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
          styles={{ body: { padding: 0 } }}
          style={{ borderRadius: 16 }}
        >
          {/* Header Section */}
          <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div>
              <Title level={2} className="m-0 text-gray-900 text-xl xl:text-2xl">
                Movie Management
              </Title>
              <Text type="secondary" className="text-sm xl:text-base">
                Manage and organize your cinema&apos;s movie collection
              </Text>
            </div>

            <div className="flex items-center gap-3">
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
                  <Option value="NOW_SHOWING">Now Showing</Option>
                  <Option value="COMING_SOON">Coming Soon</Option>
                  <Option value="ENDED">Ended</Option>
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
              rowKey="movieId"
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
                name="title"
                label="English Title"
                rules={[{ required: true, message: "Please enter English title" }]}
              >
                <Input placeholder="Enter English title" className="h-10" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="vietnameseTitle"
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
                name="releaseDate"
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
                  <Option value="NOW_SHOWING">Now Showing</Option>
                  <Option value="COMING_SOON">Coming Soon</Option>
                  <Option value="ENDED">Ended</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="versions"
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
                name="genres"
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

      <ShowtimePickerModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onContinue={(schedule) => {
          setShowModal(false);
          router.push(`/booking/seat-selection?scheduleId=${schedule.scheduleId}`);
        }}
        movieTitle="Tên phim"
      />

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