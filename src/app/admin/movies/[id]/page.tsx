"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMovieById, updateMovie, deleteMovie } from "../../../../api/admin/getAllMovies";
import {
  Card,
  Typography,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Spin,
  Alert,
  Image,
  Switch,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  StarOutlined,
  GlobalOutlined,
  SaveOutlined,
  PlayCircleOutlined,
  UserOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

// Movie interface based on API response - matches backend Movie entity
interface Movie {
  movieId: number;
  title: string;
  originalTitle?: string;
  description?: string;
  genre?: string; // Backend uses 'genres' but API may return as 'genre'
  genres?: string; // Also support 'genres' field name
  duration: number;
  formattedDuration?: string;
  releaseDate: string;
  endDate?: string;
  rating: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  price?: number;
  status: string;
  imdbRating?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  isAdultContent?: boolean;
  director?: string;
  cast?: string;
  language?: string;
  country?: string;
  productionCompany?: string;
  budget?: number;
  boxOffice?: number;
  revenue?: number;
  updatedAt?: string;
  createdAt?: string;
}

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const MovieDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const movieId = params?.id as string;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editForm] = Form.useForm();

  const fetchMovieDetail = useCallback(async () => {
    setLoading(true);
    try {
      // Validate movieId is a valid number
      const numericMovieId = parseInt(movieId);
      if (isNaN(numericMovieId)) {
        throw new Error('Invalid movie ID');
      }

      const movieData = await getMovieById(numericMovieId);

      // Enhance with additional mock data if needed
      const enhancedMovie = {
        ...movieData,
        description: movieData.description || "A gripping horror thriller that continues the legacy of the 28 Days Later franchise. Set 28 years after the initial outbreak, the film explores a world forever changed by the rage virus. Survivors must navigate through a post-apocalyptic landscape filled with danger, hope, and the constant threat of the infected. This installment brings new characters while honoring the intense atmosphere that made the original films so compelling.",
        director: movieData.director || "Danny Boyle",
        cast: movieData.cast || "Jodie Comer, Aaron Taylor-Johnson, Ralph Fiennes, Jack O'Connell",
        language: movieData.language || "English",
        country: movieData.country || "United Kingdom",
        productionCompany: movieData.productionCompany || "DNA Films",
        boxOffice: movieData.boxOffice || 250000000,
        revenue: movieData.revenue || 350000000,
        backdropUrl: movieData.backdropUrl || "https://cuzwjjseeohnyrbfcngs.supabase.co/storage/v1/object/public/image/movies/backdrops/backdrop-28years.jpg",
        trailerUrl: movieData.trailerUrl || "https://www.youtube.com/watch?v=example",
      };
      setMovie(enhancedMovie);
    } catch {
      message.error("Failed to load movie details");
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  // Initial load
  useEffect(() => {
    if (movieId) {
      fetchMovieDetail();
    }
  }, [movieId, fetchMovieDetail]);

  // Add visibility change listener to refresh data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && movieId) {
        fetchMovieDetail();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [movieId, fetchMovieDetail]);

  const handleEdit = () => {
    if (movie) {
      // Map movie fields to form fields with proper field naming
      const formData = {
        ...movie,
        releaseDate: movie.releaseDate ? dayjs(movie.releaseDate) : undefined,
        genres: movie.genre || movie.genres, // Handle both genre and genres field names
        // Ensure boolean values are properly set
        isFeatured: Boolean(movie.isFeatured),
        isActive: Boolean(movie.isActive),
      };

      editForm.setFieldsValue(formData);
      setEditModalVisible(true);
    }
  };

  const handleEditSubmit = async (values: Partial<Movie>) => {
    try {
      // Transform form data to match backend expectations using smart update
      const movieData: Partial<Movie> = {};

      // Only include fields that have been changed
      if (values.title !== undefined) movieData.title = values.title;
      if (values.originalTitle !== undefined) movieData.originalTitle = values.originalTitle;
      if (values.description !== undefined) movieData.description = values.description;
      if (values.duration !== undefined) movieData.duration = values.duration;
      if (values.genres !== undefined) movieData.genres = values.genres;
      if (values.director !== undefined) movieData.director = values.director;
      if (values.cast !== undefined) movieData.cast = values.cast;
      if (values.language !== undefined) movieData.language = values.language;
      if (values.country !== undefined) movieData.country = values.country;
      if (values.releaseDate !== undefined) {
        movieData.releaseDate = values.releaseDate ? dayjs(values.releaseDate).format('YYYY-MM-DD') : null;
      }
      if (values.endDate !== undefined) {
        movieData.endDate = values.endDate ? dayjs(values.endDate).format('YYYY-MM-DD') : null;
      }
      if (values.rating !== undefined) movieData.rating = values.rating;
      if (values.posterUrl !== undefined) movieData.posterUrl = values.posterUrl;
      if (values.backdropUrl !== undefined) movieData.backdropUrl = values.backdropUrl;
      if (values.trailerUrl !== undefined) movieData.trailerUrl = values.trailerUrl;
      if (values.isActive !== undefined) movieData.isActive = values.isActive;
      if (values.isFeatured !== undefined) movieData.isFeatured = values.isFeatured;
      if (values.price !== undefined) movieData.price = values.price;
      if (values.status !== undefined) movieData.status = values.status;
      if (values.imdbRating !== undefined) movieData.imdbRating = values.imdbRating;
      if (values.productionCompany !== undefined) movieData.productionCompany = values.productionCompany;
      if (values.budget !== undefined) movieData.budget = values.budget;
      if (values.boxOffice !== undefined) movieData.boxOffice = values.boxOffice;

      await updateMovie(movie!.movieId, movieData);
      message.success("Movie updated successfully");
      setEditModalVisible(false);
      // Refresh data from API to ensure we have the latest version
      await fetchMovieDetail();
    } catch {
      message.error("Failed to update movie");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMovie(movie!.movieId);
      message.success("Movie deleted successfully");
      router.push("/admin/movies");
    } catch {
      message.error("Failed to delete movie");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NOW_SHOWING":
        return "green";
      case "COMING_SOON":
        return "blue";
      case "ENDED":
        return "red";
      default:
        return "default";
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "G":
        return "green";
      case "PG":
        return "blue";
      case "PG-13":
        return "orange";
      case "R":
        return "red";
      case "NC-17":
        return "volcano";
      default:
        return "default";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!movie) {
    return (
      <Alert
        message="Movie Not Found"
        description="The requested movie could not be found."
        type="error"
        showIcon
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto px-8 py-12 max-w-6xl">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-0 px-4 py-2"
                size="large"
              >
                Back
              </Button>
              <div className="pl-6 border-l border-gray-200">
                <Title level={1} className="!mb-2 text-gray-900 font-light tracking-tight text-3xl">
                  Movie Details
                </Title>
                <Text type="secondary" className="text-gray-500 text-base font-light">
                  Comprehensive movie information and management
                </Text>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                size="large"
                icon={<EditOutlined />}
                onClick={handleEdit}
                className="px-8 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-sm font-medium text-white"
              >
                Edit Movie
              </Button>
              <Button
                danger
                size="large"
                icon={<DeleteOutlined />}
                onClick={() => setDeleteModalVisible(true)}
                className="px-8 h-12 font-medium"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Main Movie Section */}
        <div className="grid grid-cols-12 gap-10 mb-12">
          {/* Movie Poster & Basic Info */}
          <div className="col-span-12 lg:col-span-4">
            <Card
              className="text-center border-0 shadow-sm bg-white/80 backdrop-blur-sm"
              styles={{ body: { padding: '40px 32px' } }}
            >
              <div className="mb-8">
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    borderRadius: "8px",
                  }}
                  className="mx-auto border-4 border-white shadow-lg"
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8A+b3YvGDTrm/5LFq5iS1S9k1r9Y/V1Yds6T2cWECEGBAQEBAQEB"
                />

                <div className="mt-6 space-y-4">
                  <Tag color={getStatusColor(movie.status)} className="text-sm px-4 py-2 rounded-full">
                    {movie.status.replace("_", " ")}
                  </Tag>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Tag color={getRatingColor(movie.rating)} className="px-3 py-1">
                      Rated {movie.rating}
                    </Tag>
                    {movie.isFeatured && (
                      <Tag color="gold" icon={<StarOutlined />} className="px-3 py-1">
                        Featured
                      </Tag>
                    )}
                    {movie.isAdultContent && (
                      <Tag color="red" className="px-3 py-1">
                        Adult Content
                      </Tag>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 text-sm text-gray-400 space-y-2">
                <div className="font-mono">ID: #{movie.movieId}</div>
                <div>Released {dayjs(movie.releaseDate).format("MMMM D, YYYY")}</div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card
              title={
                <div className="flex items-center text-gray-700">
                  <StarOutlined className="mr-3 text-gray-400" />
                  <span className="font-medium tracking-wide">Quick Stats</span>
                </div>
              }
              className="mt-6 border-0 shadow-sm bg-white/80 backdrop-blur-sm"
              styles={{
                header: {
                  backgroundColor: 'transparent',
                  borderBottom: '1px solid #f1f5f9',
                  padding: '24px 32px 16px 32px'
                },
                body: { padding: '32px' }
              }}
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {movie.imdbRating || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    IMDB Rating
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {movie.formattedDuration || `${movie.duration}m`}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    Duration
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {formatCurrency(movie.price || 0)}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    Price
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    ${formatNumber(movie.boxOffice || 0)}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    Box Office
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Movie Details */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Basic Information */}
            <Card
              title={
                <div className="flex items-center text-gray-700">
                  <PlayCircleOutlined className="mr-3 text-gray-400" />
                  <span className="font-medium tracking-wide">Movie Information</span>
                </div>
              }
              className="border-0 shadow-sm bg-white/80 backdrop-blur-sm"
              styles={{
                header: {
                  backgroundColor: 'transparent',
                  borderBottom: '1px solid #f1f5f9',
                  padding: '24px 32px 16px 32px'
                },
                body: { padding: '32px' }
              }}
            >
              <div className="space-y-8">
                <div>
                  <Title level={2} className="!mb-2 text-gray-900 font-medium tracking-tight">
                    {movie.title}
                  </Title>
                  {movie.originalTitle && movie.originalTitle !== movie.title && (
                    <Text type="secondary" className="text-gray-400 text-base font-light">
                      Original Title: {movie.originalTitle}
                    </Text>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Genre
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(movie.genre || movie.genres)?.split(", ").map((g, index) => (
                          <Tag key={index} color="blue" className="px-3 py-1">
                            {g}
                          </Tag>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Director
                      </label>
                      <div className="text-gray-900 font-medium flex items-center">
                        <UserOutlined className="mr-2 text-gray-400" />
                        {movie.director || "Not specified"}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Language
                      </label>
                      <div className="text-gray-900 font-medium flex items-center">
                        <GlobalOutlined className="mr-2 text-gray-400" />
                        {movie.language || "Not specified"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Release Date
                      </label>
                      <div className="text-gray-900 font-medium flex items-center">
                        <CalendarOutlined className="mr-2 text-gray-400" />
                        {dayjs(movie.releaseDate).format("MMMM D, YYYY")}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Country
                      </label>
                      <div className="text-gray-900 font-medium flex items-center">
                        <EnvironmentOutlined className="mr-2 text-gray-400" />
                        {movie.country || "Not specified"}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Production Company
                      </label>
                      <div className="text-gray-900 font-medium">
                        {movie.productionCompany || "Not specified"}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Cast
                  </label>
                  <div className="text-gray-900 font-medium flex items-center">
                    <TeamOutlined className="mr-2 text-gray-400" />
                    {movie.cast || "Not specified"}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Description
                  </label>
                  <Paragraph className="text-gray-700 leading-relaxed">
                    {movie.description || "No description available."}
                  </Paragraph>
                </div>

                {movie.trailerUrl && (
                  <div className="pt-4">
                    <Button
                      size="large"
                      icon={<PlayCircleOutlined />}
                      href={movie.trailerUrl}
                      target="_blank"
                      className="px-8 h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-0 shadow-sm font-medium text-white"
                    >
                      Watch Trailer
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Financial Performance */}
            {(movie.boxOffice || movie.revenue || movie.budget) && (
              <Card
                title={
                  <div className="flex items-center text-gray-700">
                    <TrophyOutlined className="mr-3 text-gray-400" />
                    <span className="font-medium tracking-wide">Financial Performance</span>
                  </div>
                }
                className="border-0 shadow-sm bg-white/80 backdrop-blur-sm"
                styles={{
                  header: {
                    backgroundColor: 'transparent',
                    borderBottom: '1px solid #f1f5f9',
                    padding: '24px 32px 16px 32px'
                  },
                  body: { padding: '32px' }
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {movie.budget && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        ${formatNumber(movie.budget)}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">
                        Budget
                      </div>
                    </div>
                  )}
                  {movie.boxOffice && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        ${formatNumber(movie.boxOffice)}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">
                        Box Office
                      </div>
                    </div>
                  )}
                  {movie.revenue && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        ${formatNumber(movie.revenue)}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">
                        Total Revenue
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-xl p-8">
          <div className="flex justify-between items-center">
            <div className="text-gray-500 text-sm">
              Last updated: {movie.updatedAt ? dayjs(movie.updatedAt).format("MMM D, YYYY [at] h:mm A") : "Never"}
            </div>

            <div className="flex space-x-4">
              <Button
                size="large"
                onClick={() => router.back()}
                className="px-8 h-12 text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-700 font-medium"
              >
                Close
              </Button>

              <Button
                size="large"
                icon={<EditOutlined />}
                onClick={handleEdit}
                className="px-8 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-sm font-medium text-white"
              >
                Edit Movie
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        title={
          <div className="flex items-center text-gray-700 text-xl font-medium">
            <EditOutlined className="mr-3 text-gray-400" />
            <span>Edit Movie</span>
          </div>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={900}
        className="top-8"
        styles={{
          header: {
            backgroundColor: 'transparent',
            borderBottom: '1px solid #f1f5f9',
            padding: '24px 32px 16px 32px'
          }
        }}
      >
        <div className="p-8">
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditSubmit}
            initialValues={movie}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="title"
                label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</span>}
                rules={[{ required: true, message: "Please enter movie title" }]}
              >
                <Input className="h-12" />
              </Form.Item>
              <Form.Item
                name="originalTitle"
                label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Original Title</span>}
              >
                <Input className="h-12" />
              </Form.Item>
            </div>

            <Form.Item
              name="description"
              label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</span>}
            >
              <Input.TextArea rows={4} className="resize-none" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Form.Item
                name="genres"
                label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Genres</span>}
                rules={[{ required: true, message: "Please enter genres" }]}
              >
                <Input placeholder="e.g., Action, Drama, Thriller" className="h-12" />
              </Form.Item>
              <Form.Item
                name="duration"
                label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Duration (minutes)</span>}
                rules={[{ required: true, message: "Please enter duration" }]}
              >
                <InputNumber min={1} className="w-full h-12" />
              </Form.Item>
              <Form.Item
                name="rating"
                label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rating</span>}
                rules={[{ required: true, message: "Please select rating" }]}
              >
                <Select className="h-12">
                  <Option value="G">G</Option>
                  <Option value="PG">PG</Option>
                  <Option value="PG-13">PG-13</Option>
                  <Option value="R">R</Option>
                  <Option value="NC-17">NC-17</Option>
                </Select>
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Form.Item
                name="releaseDate"
                label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Release Date</span>}
                rules={[{ required: true, message: "Please select release date" }]}
              >
                <DatePicker className="w-full h-12" />
              </Form.Item>
              <Form.Item
                name="price"
                label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Price (VND)</span>}
                rules={[{ required: true, message: "Please enter price" }]}
              >
                <InputNumber
                  min={0}
                  className="w-full h-12"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                />
              </Form.Item>
              <Form.Item
                name="status"
                label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</span>}
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select className="h-12">
                  <Option value="COMING_SOON">Coming Soon</Option>
                  <Option value="NOW_SHOWING">Now Showing</Option>
                  <Option value="ENDED">Ended</Option>
                </Select>
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Form.Item
                name="director"
                label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Director</span>}
              >
                <Input className="h-12" />
              </Form.Item>
              <Form.Item
                name="language"
                label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Language</span>}
              >
                <Input className="h-12" />
              </Form.Item>
              <Form.Item
                name="country"
                label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Country</span>}
              >
                <Input className="h-12" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="productionCompany"
                label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Production Company</span>}
              >
                <Input className="h-12" />
              </Form.Item>
              <Form.Item
                name="imdbRating"
                label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">IMDB Rating</span>}
              >
                <InputNumber
                  min={0}
                  max={10}
                  step={0.1}
                  className="w-full h-12"
                  placeholder="0.0 - 10.0"
                />
              </Form.Item>
            </div>

            <Form.Item
              name="cast"
              label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cast</span>}
            >
              <Input.TextArea rows={2} className="resize-none" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Form.Item
                name="posterUrl"
                label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Poster URL</span>}
              >
                <Input className="h-12" />
              </Form.Item>
              <Form.Item
                name="backdropUrl"
                label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Backdrop URL</span>}
              >
                <Input className="h-12" />
              </Form.Item>
              <Form.Item
                name="trailerUrl"
                label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trailer URL</span>}
              >
                <Input className="h-12" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Form.Item
                name="isFeatured"
                label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Featured</span>}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="isActive"
                label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active</span>}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="budget"
                label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Budget</span>}
              >
                <InputNumber
                  min={0}
                  className="w-full h-12"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                />
              </Form.Item>
              <Form.Item
                name="boxOffice"
                label={<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Box Office</span>}
              >
                <InputNumber
                  min={0}
                  className="w-full h-12"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                />
              </Form.Item>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
              <Button
                size="large"
                onClick={() => setEditModalVisible(false)}
                className="px-8 h-12 text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-700 font-medium"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                size="large"
                className="px-8 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-sm font-medium"
              >
                Save Changes
              </Button>
            </div>
          </Form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center text-red-600 text-xl font-medium">
            <DeleteOutlined className="mr-3" />
            <span>Delete Movie</span>
          </div>
        }
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        footer={
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
            <Button
              size="large"
              onClick={() => setDeleteModalVisible(false)}
              className="px-8 h-12 text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-700 font-medium"
            >
              Cancel
            </Button>
            <Button
              danger
              size="large"
              onClick={handleDelete}
              className="px-8 h-12 font-medium"
            >
              Delete Movie
            </Button>
          </div>
        }
        width={500}
        styles={{
          header: {
            backgroundColor: 'transparent',
            borderBottom: '1px solid #f1f5f9',
            padding: '24px 32px 16px 32px'
          },
          body: { padding: '32px' }
        }}
      >
        <div className="space-y-4">
          <div className="text-gray-700">
            Are you sure you want to delete this movie? This action cannot be undone.
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="font-semibold text-red-800">{movie.title}</div>
            <div className="text-sm text-red-600">ID: #{movie.movieId}</div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MovieDetailPage;