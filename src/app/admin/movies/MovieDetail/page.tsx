"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Typography,
  Spin,
  Alert,
  Tag,
  Image,
  Statistic,
} from "antd";
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  StarOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
  VideoCameraOutlined,
  GlobalOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { MovieDetailsApiService, type MovieDetails } from "@/api/movie-details-api";

const { Title, Text, Paragraph } = Typography;

// Interface for current user info (to check permissions)
interface CurrentUser {
  accountId: number;
  role: string;
}

const MovieDetailPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const movieId = searchParams.get('id');
  
  const [movieDetail, setMovieDetail] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isUsingApiData, setIsUsingApiData] = useState(false);

  // Fetch current user info to check permissions
  const fetchCurrentUser = async (): Promise<CurrentUser | null> => {
    try {
      // Try to get user info from localStorage first
      const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        return {
          accountId: parsedUser.accountId || parsedUser.id || 4,
          role: parsedUser.role || 'ADMIN'
        };
      }
      
      // Return fallback admin user
      return {
        accountId: 4,
        role: 'ADMIN'
      };
    } catch {
      // Return fallback admin user
      return {
        accountId: 4,
        role: 'ADMIN'
      };
    }
  };

  // Load movie details
  const loadMovieDetail = async () => {
    if (!movieId) {
      setError("Movie ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      // Fetch both current user and movie details
      const [currentUserData, movieDetailData] = await Promise.all([
        fetchCurrentUser(),
        MovieDetailsApiService.getMovieDetails(movieId)
      ]);

      if (!currentUserData) {
        setError("Failed to authenticate. Please login again.");
        setLoading(false);
        return;
      }

      if (!movieDetailData.success || !movieDetailData.data) {
        setError("Movie not found");
        setLoading(false);
        return;
      }

      setMovieDetail(movieDetailData.data);
      setIsUsingApiData(true);
    } catch {
      setError("Failed to load movie details. Please try again.");
      setIsUsingApiData(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovieDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  const handleBack = () => {
    router.push('/admin/movies');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (num?: number) => {
    if (!num) return 'N/A';
    return new Intl.NumberFormat().format(num);
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'NOW_SHOWING':
        return 'success';
      case 'COMING_SOON':
        return 'warning';
      case 'ENDED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'NOW_SHOWING':
        return 'Now Showing';
      case 'COMING_SOON':
        return 'Coming Soon';
      case 'ENDED':
        return 'Ended';
      default:
        return status || 'Unknown';
    }
  };

  const getRatingColor = (rating?: string) => {
    switch (rating?.toUpperCase()) {
      case 'G':
        return 'green';
      case 'PG':
        return 'blue';
      case 'PG-13':
        return 'orange';
      case 'R':
        return 'red';
      case 'NC-17':
        return 'red';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Button 
            type="default" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            className="mb-4"
          >
            Back to Movies
          </Button>
        </div>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={loadMovieDetail}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!movieDetail) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Button 
            type="default" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            className="mb-4"
          >
            Back to Movies
          </Button>
        </div>
        <Alert
          message="Movie Not Found"
          description="The requested movie could not be found."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto px-8 py-12 max-w-7xl">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={handleBack}
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
            
            {!isUsingApiData && (
              <Alert
                message="Demo Mode"
                description="Viewing sample data"
                type="warning"
                showIcon
                className="!mb-0 border-amber-200 bg-amber-50/70"
              />
            )}
          </div>
        </div>

        {/* Main Movie Section */}
        <div className="grid grid-cols-12 gap-10 mb-12">
          {/* Movie Poster & Quick Info */}
          <div className="col-span-12 lg:col-span-4">
            <Card 
              className="text-center border-0 shadow-sm bg-white/80 backdrop-blur-sm" 
              styles={{ body: { padding: '32px' } }}
            >
              <div className="mb-8">
                <div className="relative inline-block">
                  <Image
                    width="100%"
                    height={400}
                    src={movieDetail.posterUrl || '/placeholder-movie.jpg'}
                    alt={movieDetail.title}
                    className="rounded-lg shadow-lg object-cover"
                    fallback="/placeholder-movie.jpg"
                  />
                  <div className={`absolute -bottom-3 -right-3 p-2 rounded-full border-4 border-white shadow-lg ${
                    movieDetail.isActive ? 'bg-emerald-400' : 'bg-red-400'
                  }`}>
                    {movieDetail.isActive ? (
                      <CheckCircleOutlined className="text-white text-lg" />
                    ) : (
                      <CloseCircleOutlined className="text-white text-lg" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Title level={2} className="!mb-2 text-gray-900 font-medium tracking-tight">
                    {movieDetail.title}
                  </Title>
                  <Text type="secondary" className="text-gray-400 text-sm">
                    ID: #{movieDetail.movieId}
                  </Text>
                </div>
                
                <div className="py-4 space-y-3">
                  <Tag 
                    color={getStatusColor(movieDetail.status)} 
                    className="px-4 py-2 text-sm font-medium rounded-full border-0"
                  >
                    {getStatusText(movieDetail.status)}
                  </Tag>
                  
                  <Tag 
                    color={getRatingColor(movieDetail.rating)} 
                    className="px-4 py-2 text-sm font-medium rounded-full border-0 ml-2"
                  >
                    {movieDetail.rating || 'Not Rated'}
                  </Tag>
                  
                  {movieDetail.isFeatured && (
                    <Tag 
                      color="gold" 
                      icon={<CrownOutlined />}
                      className="px-4 py-2 text-sm font-medium rounded-full border-0 ml-2"
                    >
                      Featured
                    </Tag>
                  )}
                </div>
                
                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Statistic
                      title="IMDB Rating"
                      value={movieDetail.imdbRating || 0}
                      precision={1}
                      suffix="/ 10"
                      prefix={<StarOutlined />}
                      valueStyle={{ color: '#faad14' }}
                    />
                    <Statistic
                      title="Schedules"
                      value={movieDetail.scheduleCount || 0}
                      prefix={<CalendarOutlined />}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Detailed Information */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* Basic Information */}
            <Card 
              title={
                <div className="flex items-center text-gray-700">
                  <VideoCameraOutlined className="mr-3 text-gray-400" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Title
                    </label>
                    <div className="text-gray-900 font-medium text-lg">
                      {movieDetail.title}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Genre
                    </label>
                    <div className="text-gray-900 font-medium">
                      {movieDetail.genre || 'Not specified'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Director
                    </label>
                    <div className="text-gray-900 font-medium">
                      {movieDetail.director || <span className="text-gray-400 italic font-normal">Not specified</span>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Language
                    </label>
                    <div className="text-gray-900 font-medium">
                      {movieDetail.language || <span className="text-gray-400 italic font-normal">Not specified</span>}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Duration
                    </label>
                    <div className="flex items-center text-gray-900 font-medium">
                      <ClockCircleOutlined className="mr-2 text-gray-400" />
                      {movieDetail.formattedDuration || `${movieDetail.duration} minutes`}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Release Date
                    </label>
                    <div className="flex items-center text-gray-900 font-medium">
                      <CalendarOutlined className="mr-2 text-gray-400" />
                      {formatDate(movieDetail.releaseDate)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Country
                    </label>
                    <div className="flex items-center text-gray-900 font-medium">
                      <GlobalOutlined className="mr-2 text-gray-400" />
                      {movieDetail.country || <span className="text-gray-400 italic font-normal">Not specified</span>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Ticket Price
                    </label>
                    <div className="flex items-center text-gray-900 font-medium">
                      <DollarOutlined className="mr-2 text-gray-400" />
                      {formatCurrency(movieDetail.price)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {movieDetail.description && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    <VideoCameraOutlined className="mr-2" />
                    Description
                  </label>
                  <Paragraph className="text-gray-700 leading-relaxed text-base">
                    {movieDetail.description}
                  </Paragraph>
                </div>
              )}

              {/* Cast */}
              {movieDetail.cast && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    <UserOutlined className="mr-2" />
                    Cast
                  </label>
                  <div className="text-gray-700">
                    {movieDetail.cast}
                  </div>
                </div>
              )}
            </Card>

            {/* Production & Financial Details */}
            <Card 
              title={
                <div className="flex items-center text-gray-700">
                  <DollarOutlined className="mr-3 text-gray-400" />
                  <span className="font-medium tracking-wide">Production & Financial Details</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Statistic
                  title="Production Company"
                  value={movieDetail.productionCompany || 'N/A'}
                  valueStyle={{ fontSize: '16px', fontWeight: 500 }}
                />
                <Statistic
                  title="Budget"
                  value={movieDetail.budget ? formatNumber(movieDetail.budget) : 'N/A'}
                  prefix="$"
                  valueStyle={{ fontSize: '16px', fontWeight: 500 }}
                />
                <Statistic
                  title="Box Office"
                  value={movieDetail.boxOffice ? formatNumber(movieDetail.boxOffice) : 'N/A'}
                  prefix="$"
                  valueStyle={{ fontSize: '16px', fontWeight: 500 }}
                />
                <Statistic
                  title="IMDB Rating"
                  value={movieDetail.imdbRating || 'N/A'}
                  suffix="/ 10"
                  precision={1}
                  prefix={<StarOutlined />}
                  valueStyle={{ fontSize: '16px', fontWeight: 500, color: '#faad14' }}
                />
              </div>
            </Card>

            {/* System Information */}
            <Card 
              title={
                <div className="flex items-center text-gray-700">
                  <CrownOutlined className="mr-3 text-gray-400" />
                  <span className="font-medium tracking-wide">System Information</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Status
                    </label>
                    <Tag 
                      color={getStatusColor(movieDetail.status)} 
                      className="px-4 py-2 text-sm font-medium rounded-full border-0"
                    >
                      {getStatusText(movieDetail.status)}
                    </Tag>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Active Status
                    </label>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${
                      movieDetail.isActive 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {movieDetail.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                      <span className="ml-2 uppercase tracking-wider">{movieDetail.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Featured Movie
                    </label>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${
                      movieDetail.isFeatured 
                        ? 'bg-yellow-50 text-yellow-600 border-yellow-100' 
                        : 'bg-gray-50 text-gray-600 border-gray-100'
                    }`}>
                      <CrownOutlined />
                      <span className="ml-2 uppercase tracking-wider">{movieDetail.isFeatured ? 'Featured' : 'Regular'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Created Date
                    </label>
                    <div className="text-gray-900 font-medium">
                      {formatDateTime(movieDetail.createdAt)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Last Updated
                    </label>
                    <div className="text-gray-900 font-medium">
                      {formatDateTime(movieDetail.updatedAt)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Adult Content
                    </label>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${
                      movieDetail.isAdultContent 
                        ? 'bg-red-50 text-red-600 border-red-100' 
                        : 'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      <span className="uppercase tracking-wider">
                        {movieDetail.isAdultContent ? 'Adult Content' : 'Family Friendly'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Trailer Link */}
            {movieDetail.trailerUrl && (
              <Card 
                title={
                  <div className="flex items-center text-gray-700">
                    <PlayCircleOutlined className="mr-3 text-gray-400" />
                    <span className="font-medium tracking-wide">Media</span>
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
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Trailer
                    </label>
                    <Text className="text-gray-600">
                      Watch the official trailer for this movie
                    </Text>
                  </div>
                  <Button 
                    type="primary" 
                    icon={<PlayCircleOutlined />}
                    href={movieDetail.trailerUrl}
                    target="_blank"
                    className="bg-red-500 hover:bg-red-600 border-0"
                  >
                    Watch Trailer
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-xl p-8">
          <div className="flex justify-between items-center">
            <div className="text-gray-500 text-sm">
              Last viewed: {new Date().toLocaleString()}
            </div>
            
            <div className="flex space-x-4">
              <Button 
                size="large"
                onClick={handleBack}
                className="px-8 h-12 text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-700 font-medium"
              >
                Close
              </Button>
              
              <Button 
                type="primary" 
                size="large"
                onClick={() => router.push(`/admin/movies?edit=${movieDetail.movieId}`)}
                disabled={!isUsingApiData}
                className="px-8 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-sm font-medium"
              >
                Edit Movie
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;