"use client";

import React, { useState } from 'react';
import {
  Layout,
  Typography,
  Button,
  Space,
  Card,
  Statistic,
  Row,
  Col,
  Modal,
  message,
  Divider
} from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  DeleteOutlined,
  ExportOutlined,
  ReloadOutlined,
  ScheduleOutlined,
  TeamOutlined,
  DollarCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { ScheduleForm } from './components/ScheduleForm';
import { ScheduleTable } from './components/ScheduleTable';
import { ScheduleFiltersComponent } from './components/ScheduleFilters';
import { useScheduleManagement } from './hooks/useScheduleManagement';
import {
  AdminSchedule,
  ScheduleCreateRequest,
  ScheduleUpdateRequest,
  ScheduleFilters
} from './types';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { confirm } = Modal;

export default function ScheduleManagementPage() {
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

  const [formVisible, setFormVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<AdminSchedule | null>(null);
  const [currentFilters, setCurrentFilters] = useState<ScheduleFilters>({});

  // Form handlers
  const handleCreateNew = () => {
    setEditingSchedule(null);
    setFormVisible(true);
  };

  const handleEdit = (schedule: AdminSchedule) => {
    setEditingSchedule(schedule);
    setFormVisible(true);
  };

  const handleFormSubmit = async (data: ScheduleCreateRequest | ScheduleUpdateRequest) => {
    try {
      if ('scheduleId' in data) {
        await updateSchedule(data);
      } else {
        await createSchedule(data);
      }
      setFormVisible(false);
      setEditingSchedule(null);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleFormCancel = () => {
    setFormVisible(false);
    setEditingSchedule(null);
  };

  // Delete handlers
  const handleDelete = (scheduleId: number) => {
    const schedule = schedules.find(s => s.scheduleId === scheduleId);
    
    confirm({
      title: 'Xác nhận xóa lịch chiếu',
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa lịch chiếu này?</p>
          <div style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 4, marginTop: 8 }}>
            <Text strong>{schedule?.movieName}</Text>
            <br />
            <Text type="secondary">
              {schedule?.cinemaRoomName} - {schedule?.displayDate} {schedule?.displayTime}
            </Text>
          </div>
          {schedule?.bookedSeats && schedule.bookedSeats > 0 && (
            <div style={{ marginTop: 8, color: '#ff4d4f' }}>
              <Text type="danger">
                ⚠️ Lịch chiếu này đã có {schedule.bookedSeats} vé được đặt!
              </Text>
            </div>
          )}
        </div>
      ),
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: () => deleteSchedule(scheduleId)
    });
  };

  const handleBulkDelete = () => {
    if (selectedSchedules.length === 0) {
      message.warning('Vui lòng chọn lịch chiếu cần xóa');
      return;
    }

    const selectedScheduleDetails = schedules.filter(s => selectedSchedules.includes(s.scheduleId));
    const hasBookedSchedules = selectedScheduleDetails.some(s => s.bookedSeats > 0);

    confirm({
      title: 'Xác nhận xóa nhiều lịch chiếu',
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa {selectedSchedules.length} lịch chiếu đã chọn?</p>
          {hasBookedSchedules && (
            <div style={{ marginTop: 8, color: '#ff4d4f' }}>
              <Text type="danger">
                ⚠️ Một số lịch chiếu đã có vé được đặt!
              </Text>
            </div>
          )}
        </div>
      ),
      okText: 'Xóa tất cả',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: () => bulkDeleteSchedules(selectedSchedules)
    });
  };

  // View handler
  const handleView = (schedule: AdminSchedule) => {
    Modal.info({
      title: 'Chi tiết lịch chiếu',
      width: 600,
      content: (
        <div style={{ marginTop: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card size="small" title="Thông tin phim">
                <Space direction="vertical" size={4}>
                  <Text strong>{schedule.movieName}</Text>
                  <Text type="secondary">Thời lượng: {schedule.movieDuration} phút</Text>
                  {schedule.moviePoster && (
                    <img 
                      src={schedule.moviePoster} 
                      alt={schedule.movieName}
                      style={{ width: 80, height: 120, objectFit: 'cover', borderRadius: 4 }}
                    />
                  )}
                </Space>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card size="small" title="Thông tin phòng">
                <Space direction="vertical" size={4}>
                  <Text strong>{schedule.cinemaRoomName}</Text>
                  <Text type="secondary">Loại: {schedule.roomType}</Text>
                  <Text type="secondary">Tổng ghế: {schedule.totalSeats}</Text>
                </Space>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card size="small" title="Thời gian chiếu">
                <Space direction="vertical" size={4}>
                  <Text><CalendarOutlined /> {schedule.displayDate}</Text>
                  <Text>{schedule.displayTime} - {schedule.endTime.substring(0, 5)}</Text>
                </Space>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card size="small" title="Tình trạng đặt vé">
                <Space direction="vertical" size={4}>
                  <Text>Đã đặt: {schedule.bookedSeats}/{schedule.totalSeats}</Text>
                  <Text>Tỷ lệ: {schedule.occupancyRate}%</Text>
                  <Text strong>Giá vé: {schedule.priceDisplay}</Text>
                </Space>
              </Card>
            </Col>
            
            <Col span={24}>
              <Card size="small" title="Tùy chọn đặc biệt">
                <Space wrap>
                  <Text>Định dạng: {schedule.specialFeatures}</Text>
                  <Text>Phụ đề: {schedule.subtitleLanguage}</Text>
                  <Text>Âm thanh: {schedule.audioLanguage}</Text>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      ),
      okText: 'Đóng'
    });
  };

  // Filter handlers
  const handleFiltersChange = (filters: ScheduleFilters) => {
    setCurrentFilters(filters);
    loadSchedules(filters, { currentPage: 1 });
  };

  const handleClearFilters = () => {
    setCurrentFilters({});
    loadSchedules({}, { currentPage: 1 });
  };

  // Table handlers
  const handleSelectionChange = (selectedRowKeys: React.Key[]) => {
    setSelectedSchedules(selectedRowKeys as number[]);
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    loadSchedules(currentFilters, { currentPage: page, pageSize });
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Header style={{ 
        backgroundColor: '#fff', 
        padding: '0 24px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Space>
          <ScheduleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            Quản lý lịch chiếu
          </Title>
        </Space>
        
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateNew}
          >
            Tạo lịch chiếu
          </Button>
          
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshData}
            loading={loading}
          >
            Làm mới
          </Button>
          
          {selectedSchedules.length > 0 && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBulkDelete}
            >
              Xóa ({selectedSchedules.length})
            </Button>
          )}
        </Space>
      </Header>

      <Content style={{ padding: '24px' }}>
        {/* Statistics Cards */}
        {statistics && (
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng lịch chiếu"
                  value={statistics.totalSchedules}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Hôm nay"
                  value={statistics.totalSchedules}
                  prefix={<ScheduleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tỷ lệ đặt vé TB"
                  value={statistics.averageOccupancyRate}
                  suffix="%"
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Doanh thu"
                  value={statistics.totalRevenue}
                  prefix={<DollarCircleOutlined />}
                  suffix="đ"
                  valueStyle={{ color: '#f5222d' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Card>
            </Col>
          </Row>
        )}

        <Divider />

        {/* Filters */}
        <ScheduleFiltersComponent
          filters={currentFilters}
          movieOptions={movieOptions}
          roomOptions={roomOptions}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          loading={loading}
        />

        {/* Table */}
        <ScheduleTable
          schedules={schedules}
          loading={loading}
          pagination={pagination}
          selectedSchedules={selectedSchedules}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onSelectionChange={handleSelectionChange}
          onPageChange={handlePageChange}
        />

        {/* Form Modal */}
        <ScheduleForm
          visible={formVisible}
          onCancel={handleFormCancel}
          onSubmit={handleFormSubmit}
          onCheckConflicts={checkConflicts}
          movieOptions={movieOptions}
          roomOptions={roomOptions}
          editingSchedule={editingSchedule}
          loading={loading}
        />
      </Content>
    </Layout>
  );
}
