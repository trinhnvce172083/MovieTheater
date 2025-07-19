"use client";

import React, { useState } from 'react';
import { Card, Table, Button, Typography, Alert, Pagination, message, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

// Local imports
import { useMovieManagement } from './hooks/useMovieManagement';
import {
  MovieStatisticsCard,
  MovieFilters,
  MovieFormModal,
  createMovieColumns
} from './components';
import { MovieData, MovieCreateRequest } from './types';

const { Text } = Typography;

export default function AdminMovieManagement() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMovie, setEditingMovie] = useState<MovieData | null>(null);

  // Use custom hook for all movie management logic
  const {
    // Data
    paginatedData,
    filteredData,
    statistics,

    // State
    loading,
    showAuthWarning,
    isUsingApiData,
    filters,
    pagination,

    // Actions
    setFilters,
    setPagination,
    createMovie,
    updateMovie,
    deleteMovie,
    toggleFeatureMovie,
  } = useMovieManagement();

  // Event handlers
  const handleEdit = (record: MovieData) => {
    setEditingMovie(record);
    setIsModalVisible(true);
  };

  const handleViewDetail = () => {
    // Temporarily disabled - will implement later
    message.info('Movie detail feature will be updated later');
  };

  const handleModalSubmit = async (movieData: MovieCreateRequest) => {
    try {
      let success = false;
      if (editingMovie) {
        success = await updateMovie(editingMovie.id, movieData);
      } else {
        success = await createMovie(movieData);
      }

      if (success) {
        setIsModalVisible(false);
        setEditingMovie(null);
      }
    } catch {
      message.error('Please check required fields and try again.');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingMovie(null);
  };

  const handleDelete = async (record: MovieData) => {
    await deleteMovie(record.id);
  };

  const handleToggleFeature = async (record: MovieData) => {
    await toggleFeatureMovie(record.id, record.isFeatured);
  };

  // Create table columns with handlers
  const columns = createMovieColumns(
    handleViewDetail,
    handleEdit,
    handleDelete,
    handleToggleFeature
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {!isUsingApiData && (
          <Alert
            message="Demo Mode - Using Sample Data"
            description="You are viewing sample data. Connect to backend server to use full CRUD functionality."
            type="warning"
            showIcon
            className="mb-6"
            closable
          />
        )}

        {showAuthWarning && (
          <Alert
            message="Authentication Notice"
            description="You are not logged in. Displaying sample data for demo. Please login to access real data."
            type="warning"
            showIcon
            className="mb-6"
            action={
              <Button size="small" type="link" href="/auth/Login">
                Login
              </Button>
            }
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
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div>
              <h1 className="m-0 text-gray-900 text-xl xl:text-2xl font-semibold">
                Movie Management
              </h1>
              <Text type="secondary" className="text-sm xl:text-base">
                Manage cinema movie catalog
              </Text>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="middle"
                className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm text-xs xl:text-sm h-10 px-4"
                onClick={() => {
                  setEditingMovie(null);
                  setIsModalVisible(true);
                }}
                disabled={!isUsingApiData}
                title={!isUsingApiData ? "Create/Edit feature requires backend connection" : "Add new movie"}
              >
                Add New Movie
              </Button>
            </div>
          </div>

          {/* Filters */}
          <MovieFilters
            filters={{
              keyword: filters.searchTerm,
              status: filters.filterStatus,
              genre: filters.filterGenre
            }}
            onFiltersChange={(newFilters) => {
              setFilters(prev => ({
                ...prev,
                searchTerm: newFilters.keyword !== undefined ? newFilters.keyword : prev.searchTerm,
                filterStatus: newFilters.status !== undefined ? newFilters.status : prev.filterStatus,
                filterGenre: newFilters.genre !== undefined ? newFilters.genre : prev.filterGenre
              }));
            }}
          />

          {/* Table */}
          <div className="bg-white">
            <Spin spinning={loading}>
              <Table
                dataSource={paginatedData}
                columns={columns}
                pagination={false}
                scroll={{ x: 1200 }}
                rowClassName="hover:bg-gray-50 transition-colors"
                className="professional-table"
                size="small"
                rowKey="key"
                sortDirections={['ascend', 'descend']}
              />
            </Spin>
            
            {/* Pagination */}
            <div className="px-6 py-5 border-t border-gray-100 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Text type="secondary" className="text-sm">
                    Showing{" "}
                    <span className="font-medium text-gray-900">
                      {Math.max(1, (pagination.currentPage - 1) * pagination.pageSize + 1)}
                    </span>
                    {" "}to{" "}
                    <span className="font-medium text-gray-900">
                      {Math.min(pagination.currentPage * pagination.pageSize, filteredData.length)}
                    </span>
                    {" "}of{" "}
                    <span className="font-medium text-gray-900">
                      {filteredData.length}
                    </span>
                    {" "}movies
                  </Text>
                </div>
                <Pagination
                  current={pagination.currentPage}
                  pageSize={pagination.pageSize}
                  total={filteredData.length}
                  onChange={(page, size) => {
                    setPagination({ 
                      currentPage: page, 
                      pageSize: size || pagination.pageSize
                    });
                  }}
                  showSizeChanger
                  showQuickJumper={false}
                  pageSizeOptions={["5", "10", "20", "50"]}
                  size="default"
                  className="flex-shrink-0"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal */}
      <MovieFormModal
        open={isModalVisible}
        editingMovie={editingMovie}
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        loading={loading}
      />
    </div>
  );
}
