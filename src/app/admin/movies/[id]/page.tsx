"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMovieById, updateMovie, deleteMovie } from "../../../../api/admin/getAllMovies";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Space,
  Statistic,
  Divider,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Spin,
  Alert,
  Descriptions,
  Image,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  StarOutlined,
  DollarOutlined,
  GlobalOutlined,
  SaveOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  UserOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  TrophyOutlined,
  FireOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

// Movie interface based on API response
interface Movie {
  movieId: number;
  title: string;
  originalTitle?: string;
  description?: string;
  genre?: string;
  duration: number;
  formattedDuration?: string;
  releaseDate: string;
  rating: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  price?: number;
  status: string;
  imdbRating?: number;
  isFeatured?: boolean;
  isAdultContent?: boolean;
  director?: string;
  cast?: string;
  language?: string;
  country?: string;
  productionCompany?: string;
  boxOffice?: number;
  revenue?: number;
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

  useEffect(() => {
    const fetchMovieDetail = async () => {
      setLoading(true);
      try {
        const movieData = await getMovieById(parseInt(movieId));
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
    };

    if (movieId) {
      fetchMovieDetail();
    }
  }, [movieId]);

  const handleEdit = () => {
    if (movie) {
      editForm.setFieldsValue({
        ...movie,
        releaseDate: dayjs(movie.releaseDate),
      });
      setEditModalVisible(true);
    }
  };

  const handleEditSubmit = async (values: Partial<Movie>) => {
    try {
      await updateMovie(movie!.movieId, values);
      message.success("Movie updated successfully");
      setEditModalVisible(false);
      // Update local state
      setMovie(prev => prev ? { ...prev, ...values } : null);
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
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: "24px" }}>
        <Col>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
            >
              Back
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              Movie Details
            </Title>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
              Refresh
            </Button>
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
              Edit Movie
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => setDeleteModalVisible(true)}
            >
              Delete
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Movie Poster & Basic Info */}
        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  borderRadius: "8px",
                }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8A+b3YvGDTrm/5LFq5iS1S9k1r9Y/V1Yds6T2cWECEGBAQEBAQEB"
              />
              
              <div style={{ marginTop: "16px" }}>
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                  <Tag color={getStatusColor(movie.status)} style={{ fontSize: "14px" }}>
                    {movie.status.replace("_", " ")}
                  </Tag>
                  <Tag color={getRatingColor(movie.rating)}>
                    Rated {movie.rating}
                  </Tag>
                  {movie.isFeatured && (
                    <Tag color="gold" icon={<StarOutlined />}>
                      Featured
                    </Tag>
                  )}
                  {movie.isAdultContent && (
                    <Tag color="red">
                      Adult Content
                    </Tag>
                  )}
                </Space>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card style={{ marginTop: "16px" }} title="Quick Stats">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="IMDB Rating"
                  value={movie.imdbRating}
                  precision={1}
                  prefix={<StarOutlined style={{ color: "#faad14" }} />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Duration"
                  value={movie.formattedDuration}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Price"
                  value={movie.price}
                  formatter={(value) => formatCurrency(Number(value))}
                  prefix={<DollarOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Box Office"
                  value={movie.boxOffice || 0}
                  formatter={(value) => `$${formatNumber(Number(value))}`}
                  prefix={<TrophyOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Movie Details */}
        <Col xs={24} md={16}>
          <Card>
            <Title level={3}>{movie.title}</Title>
            {movie.originalTitle && movie.originalTitle !== movie.title && (
              <Text type="secondary" style={{ fontSize: "16px" }}>
                Original Title: {movie.originalTitle}
              </Text>
            )}

            <Divider />

            <Descriptions column={2} bordered>
              <Descriptions.Item label="Genre" span={2}>
                <Space wrap>
                  {movie.genre?.split(", ").map((g, index) => (
                    <Tag key={index} color="blue">
                      {g}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Release Date">
                <Space>
                  <CalendarOutlined />
                  {dayjs(movie.releaseDate).format("MMMM D, YYYY")}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Duration">
                <Space>
                  <ClockCircleOutlined />
                  {movie.formattedDuration} ({movie.duration} minutes)
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Director">
                <Space>
                  <UserOutlined />
                  {movie.director || "Not specified"}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Language">
                <Space>
                  <GlobalOutlined />
                  {movie.language || "Not specified"}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Country">
                <Space>
                  <EnvironmentOutlined />
                  {movie.country || "Not specified"}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Production">
                {movie.productionCompany || "Not specified"}
              </Descriptions.Item>

              <Descriptions.Item label="Cast" span={2}>
                <Space>
                  <TeamOutlined />
                  {movie.cast || "Not specified"}
                </Space>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={4}>Description</Title>
            <Paragraph>
              {movie.description || "No description available."}
            </Paragraph>

            {movie.trailerUrl && (
              <div style={{ marginTop: "16px" }}>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  href={movie.trailerUrl}
                  target="_blank"
                >
                  Watch Trailer
                </Button>
              </div>
            )}
          </Card>

          {/* Revenue & Performance */}
          {(movie.boxOffice || movie.revenue) && (
            <Card title="Financial Performance" style={{ marginTop: "16px" }}>
              <Row gutter={24}>
                {movie.boxOffice && (
                  <Col span={12}>
                    <Statistic
                      title="Box Office"
                      value={movie.boxOffice}
                      formatter={(value) => `$${formatNumber(Number(value))}`}
                      prefix={<TrophyOutlined />}
                    />
                  </Col>
                )}
                {movie.revenue && (
                  <Col span={12}>
                    <Statistic
                      title="Total Revenue"
                      value={movie.revenue}
                      formatter={(value) => `$${formatNumber(Number(value))}`}
                      prefix={<FireOutlined />}
                    />
                  </Col>
                )}
              </Row>
            </Card>
          )}
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal
        title="Edit Movie"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={800}
      >
        <EditMovieForm
          initialValues={movie}
          onFinish={handleEditSubmit}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Movie"
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={handleDelete}
        okText="Delete"
        okType="danger"
      >
        <p>Are you sure you want to delete this movie?</p>
        <p><strong>{movie.title}</strong></p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default MovieDetailPage;