"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  Card,
  Button,
  Form,
  message,
  Spin,
  Typography,
  Pagination,
  Alert,
} from "antd";
import {
  PlusOutlined,
} from "@ant-design/icons";
import { MovieApiService } from "@/api/movie-api";

// Import organized components
import {
  MovieStatisticsCard,
  MovieFiltersComponent,
  createMovieTableColumns,
  MovieFormModal,
} from './components';
import { MovieResponse, MovieCreateRequest, MovieFilters } from './types';
import { filterMovies, calculateMovieStatistics, MOCK_MOVIES } from './utils';

const { Text } = Typography;

export default function AdminMoviesPage() {
  const [form] = Form.useForm();
  
  // State
  const [movieData, setMovieData] = useState<MovieResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMovie, setEditingMovie] = useState<MovieResponse | null>(null);
  const [isUsingApiData, setIsUsingApiData] = useState(true);

  // Filters
  const [filters, setFilters] = useState<MovieFilters>({
    searchTerm: '',
    filterGenre: undefined,
    filterStatus: undefined,
    filterRating: undefined,
  });

  // Fetch movies function
  const fetchMovies = useCallback(async (page: number = 1, size: number = 10) => {
    setLoading(true);
    try {
      const nowShowingResponse = await MovieApiService.getNowShowingMovies();
      const comingSoonResponse = await MovieApiService.getUpComingMovies();
      
      if (nowShowingResponse.success && comingSoonResponse.success) {
        const allMovies = [...nowShowingResponse.data, ...comingSoonResponse.data];
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const paginatedMovies = allMovies.slice(startIndex, endIndex);
        
        setMovieData(paginatedMovies);
        setTotalElements(allMovies.length);
        setIsUsingApiData(true);
      } else {
        throw new Error('Failed to fetch from API');
      }
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      // Fallback to mock data
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      const paginatedMockMovies = MOCK_MOVIES.slice(startIndex, endIndex);
      
      setMovieData(paginatedMockMovies);
      setTotalElements(MOCK_MOVIES.length);
      setIsUsingApiData(false);
      message.warning("Failed to fetch movies from server. Using offline data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // CRUD operations (using mock for now since API doesn't have CRUD)
  const createMovieFunction = async (movieData: MovieCreateRequest) => {
    try {
      setLoading(true);
      // Mock creation since API doesn't support CRUD
      const newMovie: MovieResponse = {
        movieId: Date.now().toString(),
        title: movieData.title,
        genre: movieData.genre,
        duration: movieData.duration,
        formattedDuration: `${Math.floor(movieData.duration / 60)}h ${movieData.duration % 60}m`,
        releaseDate: movieData.releaseDate,
        rating: movieData.rating,
        posterUrl: movieData.posterUrl,
        price: movieData.price,
        status: movieData.status,
        imdbRating: movieData.imdbRating,
        isFeatured: movieData.isFeatured,
        isAdultContent: movieData.isAdultContent,
      };
      
      MOCK_MOVIES.push(newMovie);
      message.success("Movie created successfully! (Mock mode)");
      fetchMovies(currentPage, pageSize);
      return true;
    } catch (error) {
      message.error("Failed to create movie");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateMovieFunction = async (id: string, movieData: MovieCreateRequest) => {
    try {
      setLoading(true);
      // Mock update
      const index = MOCK_MOVIES.findIndex(m => m.movieId === id);
      if (index !== -1) {
        MOCK_MOVIES[index] = {
          ...MOCK_MOVIES[index],
          title: movieData.title,
          genre: movieData.genre,
          duration: movieData.duration,
          formattedDuration: `${Math.floor(movieData.duration / 60)}h ${movieData.duration % 60}m`,
          releaseDate: movieData.releaseDate,
          rating: movieData.rating,
          posterUrl: movieData.posterUrl,
          price: movieData.price,
          status: movieData.status,
          imdbRating: movieData.imdbRating,
          isFeatured: movieData.isFeatured,
          isAdultContent: movieData.isAdultContent,
        };
      }
      message.success("Movie updated successfully! (Mock mode)");
      fetchMovies(currentPage, pageSize);
      return true;
    } catch (error) {
      message.error("Failed to update movie");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteMovieFunction = async (id: string) => {
    try {
      setLoading(true);
      // Mock deletion
      const index = MOCK_MOVIES.findIndex(m => m.movieId === id);
      if (index !== -1) {
        MOCK_MOVIES.splice(index, 1);
      }
      message.success("Movie deleted successfully! (Mock mode)");
      fetchMovies(currentPage, pageSize);
    } catch (error) {
      message.error("Failed to delete movie");
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleEdit = (record: MovieResponse) => {
    setEditingMovie(record);
    setIsModalVisible(true);
  };

  const handleDelete = (movieId: string) => {
    deleteMovieFunction(movieId);
  };

  const handleView = (record: MovieResponse) => {
    message.info(`Viewing details for ${record.title}`);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Convert form values to proper format
      const movieData: MovieCreateRequest = {
        ...values,
        releaseDate: values.releaseDate.format('YYYY-MM-DD'),
      };

      if (editingMovie) {
        const success = await updateMovieFunction(editingMovie.movieId, movieData);
        if (success) {
          setIsModalVisible(false);
          setEditingMovie(null);
          form.resetFields();
        }
      } else {
        const success = await createMovieFunction(movieData);
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
    setEditingMovie(null);
    form.resetFields();
  };

  const handleAddNewMovie = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  // Filter handlers
  const updateFilters = useCallback((newFilters: Partial<MovieFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      filterGenre: undefined,
      filterStatus: undefined,
      filterRating: undefined,
    });
  }, []);

  // Computed values
  const filteredData = useMemo(() => {
    return filterMovies(movieData, filters);
  }, [movieData, filters]);

  const statistics = useMemo(() => {
    return calculateMovieStatistics(movieData);
  }, [movieData]);

  // Table columns
  const columns = createMovieTableColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onView: handleView,
    loading,
  });

  // Effects
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

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

        {/* Statistics Cards */}
        <MovieStatisticsCard statistics={statistics} loading={loading} />

        {/* Main Content Card */}
        <Card
          className="shadow-sm border-0"
          styles={{ body: { padding: 0 } }}
          style={{ borderRadius: 16 }}
        >
          {/* Header Section */}
          <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div>
              <h1 className="m-0 text-gray-900 text-xl xl:text-2xl font-semibold">
                Movie Management
              </h1>
              <Text type="secondary" className="text-sm xl:text-base">
                Manage cinema movies and their information
              </Text>
              {!isUsingApiData && (
                <Text className="text-orange-600 text-sm">⚠️ Currently using offline data</Text>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="middle"
                className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm text-xs xl:text-sm h-10 px-4"
                onClick={handleAddNewMovie}
                title="Add new movie"
              >
                Add New Movie
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <MovieFiltersComponent
            filters={filters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
          />

          {/* Table Section */}
          <div className="bg-white">
            <Spin spinning={loading}>
              <Table
                dataSource={filteredData}
                columns={columns}
                pagination={false}
                scroll={{ x: 1200 }}
                rowClassName="hover:bg-gray-50 transition-colors"
                className="professional-table"
                size="small"
                rowKey="movieId"
              />
            </Spin>

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
                total={totalElements}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  if (size !== pageSize) {
                    setPageSize(size);
                  }
                  fetchMovies(page, size || pageSize);
                }}
                showSizeChanger
                showQuickJumper={false}
                pageSizeOptions={["5", "10", "20", "50"]}
                size="default"
              />
            </div>
          </div>
        </Card>

        {/* Modal */}
        <MovieFormModal
          visible={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          editingMovie={editingMovie}
          loading={loading}
          form={form}
        />
      </div>
    </div>
  );
}
