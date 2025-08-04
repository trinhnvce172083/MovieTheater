"use client";

import React, { useState } from 'react';
import { Card, Button, Typography, message, Alert } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

// Local imports
import { useScheduleManagement } from './hooks/useScheduleManagement';
import { ScheduleForm } from './components/ScheduleForm';
import { ScheduleTable } from './components/ScheduleTable';
import { ScheduleFiltersComponent } from './components/ScheduleFilters';
import ScheduleStatisticsCard from './components/ScheduleStatisticsCard';
import {
  AdminSchedule,
  ScheduleCreateRequest,
  ScheduleUpdateRequest,
  ScheduleFilters
} from './types';

const { Text } = Typography;

export default function AdminScheduleManagement() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<AdminSchedule | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Use custom hook for all schedule management logic
  const {
    schedules,
    loading,
    pagination,
    selectedSchedules,
    statistics,
    movieOptions,
    roomOptions,
    loadSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    bulkDeleteSchedules,
    checkConflicts,
    setSelectedSchedules,
    toggleScheduleSelection,
    selectAllSchedules,
    clearSelection,
    refreshData
  } = useScheduleManagement();

  // Event handlers
  const handleEdit = (record: AdminSchedule) => {
    setEditingSchedule(record);
    setIsModalVisible(true);
  };

  const handleModalSubmit = async (scheduleData: ScheduleCreateRequest | ScheduleUpdateRequest) => {
    try {
      let success = false;
      if ('scheduleId' in scheduleData) {
        await updateSchedule(scheduleData);
        success = true;
      } else {
        await createSchedule(scheduleData);
        success = true;
      }

      if (success) {
        setIsModalVisible(false);
        setEditingSchedule(null);
      }
    } catch {
      message.error('Please check required fields and try again.');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingSchedule(null);
  };

  const handleDelete = async (scheduleId: number) => {
    await deleteSchedule(scheduleId);
  };

  const handleViewDetail = (schedule: AdminSchedule) => {
    // Navigate to detail view - can be implemented later
    message.info(`Viewing details for schedule: ${schedule.movieName}`);
  };

  // Bulk actions handlers
  const handleBulkDelete = async () => {
    const scheduleIds = selectedRowKeys.map(key => Number(key));
    await bulkDeleteSchedules(scheduleIds);
    setSelectedRowKeys([]);
  };

  // Table row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Demo Data Warning - if needed */}
        {!schedules?.length && !loading && (
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
        <ScheduleStatisticsCard 
          statistics={{
            totalSchedules: statistics?.totalSchedules || 0,
            scheduledCount: statistics?.scheduledCount || 0,
            averageOccupancyRate: statistics?.averageOccupancyRate || 0,
            totalRevenue: statistics?.totalRevenue || 0
          }}
          loading={loading}
        />

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
                Schedule Management
              </h1>
              <Text type="secondary" className="text-sm xl:text-base">
                Manage movie schedules, showtimes, and theater bookings
              </Text>
            </div>
            <div className="flex items-center gap-3">
              {selectedRowKeys.length > 0 && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="middle"
                  className="text-xs xl:text-sm h-10 px-4"
                  onClick={handleBulkDelete}
                >
                  Delete Selected ({selectedRowKeys.length})
                </Button>
              )}
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="middle"
                className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm text-xs xl:text-sm h-10 px-4"
                onClick={() => setIsModalVisible(true)}
                title="Add new schedule"
              >
                Add New Schedule
              </Button>
            </div>
          </div>

          {/* Filters */}
          <ScheduleFiltersComponent
            filters={{}}
            movieOptions={movieOptions || []}
            roomOptions={roomOptions || []}
            onFiltersChange={(filters) => loadSchedules(filters, { currentPage: 1 })}
            onClearFilters={() => loadSchedules({}, { currentPage: 1 })}
          />

          {/* Table */}
          <div className="bg-white">
            <ScheduleTable
              schedules={schedules || []}
              loading={loading}
              pagination={pagination}
              selectedSchedules={selectedSchedules || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleViewDetail}
              onSelectionChange={setSelectedRowKeys}
              onPageChange={(page, pageSize) => loadSchedules({}, { currentPage: page, pageSize })}
            />
          </div>
        </Card>

        {/* Schedule Form Modal */}
        <ScheduleForm
          visible={isModalVisible}
          editingSchedule={editingSchedule}
          onSubmit={handleModalSubmit}
          onCancel={handleModalCancel}
          movieOptions={movieOptions || []}
          roomOptions={roomOptions || []}
          onCheckConflicts={checkConflicts}
        />
      </div>
    </div>
  );
}