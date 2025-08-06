"use client";

import React, { useState } from "react";
import { Card, Table, Button, Typography, Alert, Pagination, message, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useRouter } from 'next/navigation';

// Local imports
import { useRoomManagement } from './hooks/useRoomManagement';
import { 
  RoomStatisticsCard,
  RoomFilters,
  createRoomTableColumns,
  RoomFormModal,
} from './components';
import { CinemaRoom, CinemaRoomCreateRequest } from '@/api/admin/getAllRooms';

const { Text } = Typography;

export default function AdminRoomManagement() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<CinemaRoom | null>(null);
  const [tableKey, setTableKey] = useState(0); // Force table re-render
  const router = useRouter();

  // Use custom hook for all room management logic
  const {
    // Data
    paginatedData,
    filteredData,
    statistics,

    // State
    loading,
    isUsingApiData,
    filters,
    pagination,

    // Actions
    setFilters,
    setPagination,
    createRoom,
    updateRoom,
    deleteRoom,
  } = useRoomManagement();

  // Event handlers
  const handleEdit = (record: CinemaRoom) => {
    setEditingRoom(record);
    setIsModalVisible(true);
  };

  const handleViewDetail = (record: CinemaRoom) => {
    router.push(`/admin/rooms/${record.cinemaRoomId}`);
  };

  const handleModalSubmit = async (roomData: CinemaRoomCreateRequest) => {
    try {
      let success = false;
      if (editingRoom) {
        console.log('Updating room:', editingRoom.cinemaRoomId, roomData);
        success = await updateRoom(editingRoom.cinemaRoomId, roomData);
      } else {
        console.log('Creating new room:', roomData);
        success = await createRoom(roomData);
      }

      if (success) {
        console.log('Operation successful, closing modal');
        setIsModalVisible(false);
        setEditingRoom(null);
        setTableKey(prev => prev + 1); // Force table re-render
        // The useRoomManagement hook already calls fetchRooms() after update/create
      }
    } catch (error) {
      console.error('Modal submit error:', error);
      message.error('Please check required fields and try again.');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingRoom(null);
  };

  const handleDelete = async (record: CinemaRoom) => {
    await deleteRoom(record.cinemaRoomId);
  };

  // Create table columns with handlers
  const columns = createRoomTableColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onView: handleViewDetail,
    isUsingApiData,
  });

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

        {/* Statistics Cards */}
        <RoomStatisticsCard statistics={statistics} loading={loading} />

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
                Cinema Room Management
              </h1>
              <Text type="secondary" className="text-sm xl:text-base">
                Manage and organize your cinema rooms
              </Text>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="middle"
                className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm text-xs xl:text-sm h-10 px-4"
                onClick={() => {
                  setEditingRoom(null);
                  setIsModalVisible(true);
                }}
                disabled={!isUsingApiData}
                title={!isUsingApiData ? "Create/Edit feature requires backend connection" : "Add new room"}
              >
                Add New Room
              </Button>
            </div>
          </div>

          {/* Filters */}
          <RoomFilters
            filters={{
              keyword: filters.searchTerm,
              type: filters.filterType,
              status: filters.filterStatus
            }}
            onFiltersChange={(newFilters) => {
              setFilters(prev => ({
                ...prev,
                searchTerm: newFilters.keyword !== undefined ? newFilters.keyword : prev.searchTerm,
                filterType: newFilters.type,
                filterStatus: newFilters.status
              }));
              // Reset pagination to page 1 when filters change
              setPagination(prev => ({
                ...prev,
                currentPage: 1
              }));
            }}
          />

          {/* Table */}
          <div className="bg-white">
            <Spin spinning={loading}>
              <Table
                dataSource={[...paginatedData]} // Force new array reference
                columns={columns}
                pagination={false}
                scroll={{ x: 1200 }}
                rowClassName="hover:bg-gray-50 transition-colors"
                className="professional-table"
                size="small"
                rowKey="cinemaRoomId"
                key={`table-${tableKey}-${paginatedData.length}`} // More specific key
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
                    {" "}rooms
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
      <RoomFormModal
        visible={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={handleModalCancel}
        editingRoom={editingRoom}
        loading={loading}
      />
    </div>
  );
}
