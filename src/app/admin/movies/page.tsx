"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { getMovies, createMovie, deleteMovie, getMovieStatistics, type Movie } from "../../../api/admin/getAllMovies";
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
  InputNumber,
  Switch,
} from "antd";
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

// Interface for error responses
interface ApiErrorResponse {
  response: {
    status: number;
    data: unknown;
  };
}

// Movie Management Component
export default function AdminMovieManagement() {
  const [movieData, setMovieData] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterGenre, setFilterGenre] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger

  const [form] = Form.useForm();
  const router = useRouter();

  const [statistics, setStatistics] = useState({
    totalMovies: 0,
    activeMovies: 0,
    totalRevenue: 0,
    avgDuration: 0,
  });

  // Fetch movies from API
  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: 0,
        size: 100,
        sortBy: "title",
        sortDirection: "asc" as const,
      };

      const response = await getMovies(params);

      if (response && response.content && Array.isArray(response.content)) {
        setMovieData(response.content);
      } else if (response && Array.isArray(response)) {
        setMovieData(response);
      } else {
        setMovieData([]);
      }
    } catch {
      setMovieData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const stats = await getMovieStatistics();
      setStatistics(stats);
    } catch {
      // Fallback to local calculation if API fails
      if (movieData.length === 0) {
        setStatistics({ totalMovies: 0, activeMovies: 0, totalRevenue: 0, avgDuration: 0 });
        return;
      }

      const totalMovies = movieData.length;

      // Check for multiple possible "now showing" status values
      const activeMovies = movieData.filter(m =>
        m.status === "NOW_SHOWING" ||
        m.status === "Now Showing" ||
        m.status === "ACTIVE" ||
        m.status === "now_showing"
      ).length;

      // Calculate total revenue from box office data, fallback to price sum
      const totalRevenue = movieData.reduce((sum, m) => {
        if (m.boxOffice && m.boxOffice > 0) return sum + m.boxOffice;
        if (m.revenue && m.revenue > 0) return sum + m.revenue;
        return sum + (m.price || 0);
      }, 0);

      const totalDuration = movieData.reduce((sum, m) => sum + (m.duration || 0), 0);
      const avgDuration = Math.round(totalDuration / movieData.length);

      setStatistics({ totalMovies, activeMovies, totalRevenue, avgDuration });
    }
  }, [movieData]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies, refreshTrigger]);

  useEffect(() => {
    // Calculate statistics after movieData is loaded
    if (movieData.length > 0) {
      const totalMovies = movieData.length;
      const activeMovies = movieData.filter(m =>
        m.status === "NOW_SHOWING" ||
        m.status === "Now Showing" ||
        m.status === "ACTIVE" ||
        m.status === "now_showing"
      ).length;

      const totalRevenue = movieData.reduce((sum, m) => {
        if (m.boxOffice && m.boxOffice > 0) return sum + m.boxOffice;
        if (m.revenue && m.revenue > 0) return sum + m.revenue;
        return sum + (m.price || 0);
      }, 0);

      const totalDuration = movieData.reduce((sum, m) => sum + (m.duration || 0), 0);
      const avgDuration = Math.round(totalDuration / movieData.length);

      setStatistics({ totalMovies, activeMovies, totalRevenue, avgDuration });
    }
  }, [movieData]);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterGenre]);

  // Filter and search logic
  const filteredData = useMemo(() => {
    try {
      if (!movieData || !Array.isArray(movieData)) {
        return [];
      }

      return movieData.filter((movie) => {
        try {
          if (!movie) return false;

          const matchesSearch = !searchTerm ||
            (movie.title && movie.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (movie.movieId && movie.movieId.toString().includes(searchTerm));

          const matchesStatus = !filterStatus || movie.status === filterStatus;

          const movieGenres = movie.genre
            ? movie.genre.split(',').map(g => g.trim())
            : (movie.genres ? (typeof movie.genres === 'string' ? movie.genres.split(',').map(g => g.trim()) : movie.genres) : []);
          const matchesGenre = !filterGenre || movieGenres.includes(filterGenre);

          return matchesSearch && matchesStatus && matchesGenre;
        } catch {
          return false;
        }
      });
    } catch {
      return [];
    }
  }, [searchTerm, filterStatus, filterGenre, movieData]);

  // Paginated data for table display
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  // CRUD Operations
  const createMovieHandler = async (movieData: Omit<Movie, 'movieId'>) => {
    try {
      setLoading(true);

      // Validate required fields
      if (!movieData.title || !movieData.releaseDate) {
        message.error('Please fill in all required fields: Title and Release Date');
        return false;
      }

      const response = await createMovie(movieData);

      if (response) {
        message.success('Movie created successfully');

        setMovieData(prevMovies => {
          const newMovies = [...prevMovies, response];
          return newMovies;
        });

        await fetchMovies();
        await fetchStatistics();
        setCurrentPage(1);
        setRefreshTrigger(prev => prev + 1);
        return true;
      } else {
        message.error('Failed to create movie - no response from server');
        return false;
      }
    } catch (error) {

      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as ApiErrorResponse;
        const status = apiError.response?.status;

        switch (status) {
          case 400:
            message.error('Validation error. Please check all required fields are filled correctly.');
            break;
          case 401:
            message.error('Authentication failed. Please login again.');
            break;
          case 403:
            message.error('Access denied. You may not have admin permissions.');
            break;
          case 409:
            message.error('A movie with this title already exists. Please use a different title.');
            break;
          case 422:
            message.error('Invalid data format. Please check your input.');
            break;
          case 500:
            message.error('Server error. Please try again later.');
            break;
          default:
            message.error(`Failed to create movie: ${status || 'Unknown error'}`);
        }
      } else {
        message.error('Failed to create movie. Please check your network connection.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteMovieHandler = async (id: number, title: string) => {
    try {
      setLoading(true);
      await deleteMovie(id);
      message.success(`Deleted "${title}" successfully`);
      await fetchMovies();
      return true;
    } catch (error) {

      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as ApiErrorResponse;
        const status = apiError.response?.status;

        switch (status) {
          case 404:
            message.error('Movie not found. It might have been already deleted.');
            break;
          case 401:
            message.error('Authentication failed. Please login again.');
            break;
          case 403:
            message.error('Access denied. You may not have admin permissions.');
            break;
          case 409:
            message.error('Cannot delete this movie. It may have active schedules or bookings.');
            break;
          case 500:
            message.error('Server error. Please try again later.');
            break;
          default:
            message.error(`Failed to delete "${title}": ${status || 'Unknown error'}`);
        }
      } else {
        message.error(`Failed to delete "${title}". Please check your network connection.`);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (record: Movie) => {
    await deleteMovieHandler(record.movieId, record.title);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      // Transform form data to match backend Movie entity structure
      const movieData = {
        title: values.title,
        originalTitle: values.originalTitle || values.title, // Use title as fallback
        description: values.description || null,
        duration: values.duration ? parseInt(values.duration) : null,
        genres: Array.isArray(values.genres) ? values.genres.join(', ') : values.genres, // Backend expects comma-separated string
        director: values.director || null,
        cast: values.cast || null,
        language: values.language || "English", // Default to English
        country: values.country || "USA", // Default to USA
        releaseDate: values.releaseDate ? values.releaseDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        rating: values.rating || "PG-13",
        posterUrl: values.posterUrl || null,
        backdropUrl: values.backdropUrl || null,
        trailerUrl: values.trailerUrl || null,
        isActive: Boolean(values.isActive !== false), // Default to true
        isFeatured: Boolean(values.isFeatured),
        price: values.price ? parseFloat(values.price) : 0,
        status: values.status || "COMING_SOON",
        imdbRating: values.imdbRating ? parseFloat(values.imdbRating) : null,
        productionCompany: values.productionCompany || null,
        budget: values.budget ? parseInt(values.budget) : null,
        boxOffice: values.boxOffice ? parseInt(values.boxOffice) : null,
        revenue: values.revenue ? parseInt(values.revenue) : null,
      };

      // Remove truly null/undefined fields but keep false booleans and 0 numbers
      const cleanedMovieData: Omit<Movie, 'movieId'> = Object.fromEntries(
        Object.entries(movieData).filter(([, value]) => value !== null && value !== undefined)
      ) as Omit<Movie, 'movieId'>;

      const success = await createMovieHandler(cleanedMovieData);

      if (success) {
        setIsModalVisible(false);
        form.resetFields();
      }
    } catch {
      message.error('Please check all required fields and try again.');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
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
          </div>
        </div>
      ),
    },
    {
      title: "Release Date",
      key: "release_date",
      width: 120,
      render: (value: unknown, record: Movie) => (
        <div className="text-sm text-center">
          <div className="text-xs text-gray-500">
            {new Date(record.releaseDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
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
          <div className="text-sm font-medium">
            {record.formattedDuration || `${record.duration}m`}
          </div>
        </div>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      align: "center" as const,
      width: 80,
      render: (rating: string) => (
        <div className="text-center">
          <Tag color="orange" className="text-xs">
            {rating}
          </Tag>
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
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 90,
      align: "center" as const,
      render: (price: number) => (
        <div className="text-center">
          <span className="font-mono text-sm font-semibold text-green-600">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              minimumFractionDigits: 0
            }).format(price || 0)}
          </span>
        </div>
      ),
    },
    {
      title: "Genres",
      key: "genres",
      width: 120,
      align: "center" as const,
      render: (value: unknown, record: Movie) => (
        <div className="text-center">
          <span className="text-xs text-gray-700">
            {(record.genre || record.genres) || "N/A"}
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
      render: (value: unknown, record: Movie) => (
        <Space size="small">
          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              className="text-blue-600 hover:bg-blue-50"
              onClick={() => router.push(`/admin/movies/${record.movieId}`)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Movie"
              description={`Are you sure you want to delete "${record.title}"? This action cannot be undone.`}
              onConfirm={() => handleDelete(record)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              icon={<DeleteOutlined style={{ color: 'red' }} />}
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
                value={statistics.totalRevenue}
                prefix={<DollarOutlined className="text-green-600" />}
                formatter={(value) =>
                  new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(Number(value))
                }
                valueStyle={{ color: "#52c41a", fontSize: "1.2rem" }}
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
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <Title level={2} className="m-0 text-gray-900 text-xl xl:text-2xl">
                  Movie Management
                </Title>
              </div>
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
                title="Add new movie"
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
              <Col xs={12} sm={6} lg={3} xl={3}>
                <Select
                  placeholder="All Status"
                  value={filterStatus || undefined}
                  onChange={setFilterStatus}
                  className="w-full h-10 px-4"
                  allowClear
                  size="middle"
                >
                  <Option value="NOW_SHOWING">Now Showing</Option>
                  <Option value="COMING_SOON">Coming Soon</Option>
                </Select>
              </Col>
              <Col xs={12} sm={6} lg={3} xl={3}>
                <Select
                  placeholder="All Genres"
                  value={filterGenre || undefined}
                  onChange={setFilterGenre}
                  className="w-full h-10 px-4"
                  allowClear
                  size="middle"
                >
                  <Option value="Action">Action</Option>
                  <Option value="Adventure">Adventure</Option>
                  <Option value="Animation">Animation</Option>
                  <Option value="Comedy">Comedy</Option>
                  <Option value="Crime">Crime</Option>
                  <Option value="Documentary">Documentary</Option>
                  <Option value="Drama">Drama</Option>
                  <Option value="Family">Family</Option>
                  <Option value="Fantasy">Fantasy</Option>
                  <Option value="Horror">Horror</Option>
                  <Option value="Musical">Musical</Option>
                  <Option value="Mystery">Mystery</Option>
                  <Option value="Romance">Romance</Option>
                  <Option value="Sci-Fi">Sci-Fi</Option>
                  <Option value="Thriller">Thriller</Option>
                  <Option value="War">War</Option>
                  <Option value="Western">Western</Option>
                </Select>
              </Col>
              <Col xs={12} sm={6} lg={4} xl={3}>
                <Button
                  icon={<ReloadOutlined />}
                  className="w-full h-10 px-4"
                  size="middle"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("");
                    setFilterGenre("");
                    setCurrentPage(1);
                    message.success("Filters cleared successfully");
                  }}
                  disabled={!searchTerm && !filterStatus && !filterGenre}
                >
                  Clear Filters
                </Button>
              </Col>
            </Row>
          </div>

          {/* Table Section */}
          <div className="bg-white">
            <Table
              dataSource={paginatedData}
              columns={columns}
              pagination={false}
              scroll={{ x: 950 }}
              rowClassName="hover:bg-gray-50 transition-colors"
              className="professional-table"
              size="small"
              loading={loading}
              rowKey="movieId"
              locale={{
                emptyText: loading ? "Loading movies..." : "No movies found"
              }}
            />

            {/* Pagination */}
            <div className="px-6 py-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Text type="secondary" className="text-sm">
                Showing {Math.max(1, (currentPage - 1) * pageSize + 1)} to{" "}
                {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
                {filteredData.length} movies
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
                size="default"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Add Movie Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <VideoCameraOutlined className="text-blue-600" />
            <span className="text-lg font-semibold">
              Create New Movie
            </span>
          </div>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        className="professional-modal"
        confirmLoading={loading}
        okText="Create Movie"
        cancelText="Cancel"
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
          initialValues={{
            status: "COMING_SOON",
            rating: "PG-13",
            genres: [], // Keep as genres for form UI, will convert to genre for API
            isActive: true,
            isFeatured: false,
          }}
        >
          {/* Essential Movie Information */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="title"
                label="Movie Title"
                rules={[{ required: true, message: "Please enter movie title" }]}
              >
                <Input placeholder="Enter movie title" className="h-10" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="originalTitle"
                label="Original Title"
              >
                <Input placeholder="Original title (if different)" className="h-10" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="releaseDate"
                label="Release Date"
                rules={[{ required: true, message: "Please select release date" }]}
              >
                <DatePicker className="w-full h-10" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="endDate"
                label="End Date (Optional)"
              >
                <DatePicker className="w-full h-10" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="description"
                label="Description"
              >
                <TextArea
                  rows={3}
                  placeholder="Enter movie description"
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Core Movie Details */}
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="duration"
                label="Duration (minutes)"
                rules={[
                  { required: true, message: "Please enter duration" },
                  { type: 'number', min: 1, max: 500, message: "Duration must be between 1-500 minutes" }
                ]}
              >
                <InputNumber
                  placeholder="Duration"
                  className="w-full h-10"
                  min={1}
                  max={500}
                />
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
                name="price"
                label="Ticket Price (VND)"
                rules={[
                  { required: true, message: "Please enter price" },
                  { type: 'number', min: 0, message: "Price must be positive" }
                ]}
              >
                <InputNumber
                  placeholder="Ticket price"
                  className="w-full h-10"
                  min={0}
                  controls={false}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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
            <Col xs={24} sm={8}>
              <Form.Item
                name="genres"
                label="Genres"
                rules={[{ required: true, message: "Please select genres" }]}
              >
                <Select mode="multiple" placeholder="Select genres" className="h-10">
                  <Option value="Action">Action</Option>
                  <Option value="Adventure">Adventure</Option>
                  <Option value="Animation">Animation</Option>
                  <Option value="Comedy">Comedy</Option>
                  <Option value="Crime">Crime</Option>
                  <Option value="Documentary">Documentary</Option>
                  <Option value="Drama">Drama</Option>
                  <Option value="Family">Family</Option>
                  <Option value="Fantasy">Fantasy</Option>
                  <Option value="Horror">Horror</Option>
                  <Option value="Musical">Musical</Option>
                  <Option value="Mystery">Mystery</Option>
                  <Option value="Romance">Romance</Option>
                  <Option value="Sci-Fi">Sci-Fi</Option>
                  <Option value="Thriller">Thriller</Option>
                  <Option value="War">War</Option>
                  <Option value="Western">Western</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="director"
                label="Director"
              >
                <Input placeholder="Enter director name" className="h-10" />
              </Form.Item>
            </Col>
          </Row>

          {/* Additional Movie Information */}
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="language"
                label="Language"
              >
                <Input placeholder="e.g., English, Vietnamese" className="h-10" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="country"
                label="Country"
              >
                <Input placeholder="e.g., USA, Vietnam" className="h-10" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="imdbRating"
                label="IMDB Rating (0-10)"
                rules={[{ type: 'number', min: 0, max: 10, message: "Rating must be between 0-10" }]}
              >
                <InputNumber
                  placeholder="e.g., 8.5"
                  className="w-full h-10"
                  min={0}
                  max={10}
                  step={0.1}
                  controls={false}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="productionCompany"
                label="Production Company"
              >
                <Input placeholder="Enter production company" className="h-10" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="cast"
                label="Cast"
              >
                <Input placeholder="Main cast members (separated by commas)" className="h-10" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="budget"
                label="Budget (USD)"
                rules={[{ type: 'number', min: 0, message: "Budget must be positive" }]}
              >
                <InputNumber
                  placeholder="Production budget"
                  className="w-full h-10"
                  min={0}
                  controls={false}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="boxOffice"
                label="Box Office (USD)"
                rules={[{ type: 'number', min: 0, message: "Box office must be positive" }]}
              >
                <InputNumber
                  placeholder="Box office earnings"
                  className="w-full h-10"
                  min={0}
                  controls={false}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="revenue"
                label="Total Revenue (USD)"
                rules={[{ type: 'number', min: 0, message: "Revenue must be positive" }]}
              >
                <InputNumber
                  placeholder="Total revenue"
                  className="w-full h-10"
                  min={0}
                  controls={false}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Media & Settings */}
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="posterUrl"
                label="Poster URL (Optional)"
                rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
              >
                <Input placeholder="Enter poster URL" className="h-10" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="backdropUrl"
                label="Backdrop URL (Optional)"
                rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
              >
                <Input placeholder="Enter backdrop URL" className="h-10" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="trailerUrl"
                label="Trailer URL (Optional)"
                rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
              >
                <Input placeholder="Enter trailer URL" className="h-10" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="isFeatured" label="Featured Movie" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="isActive" label="Active Movie" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>


    </div>
  );
}