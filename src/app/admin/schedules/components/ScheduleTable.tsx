import React from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Tooltip,
  Progress,
  Avatar,
  Dropdown,
  MenuProps
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  DollarCircleOutlined,
  MoreOutlined,
  PlayCircleOutlined,
  StopOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { AdminSchedule, SchedulePagination } from '../types';

const { Text } = Typography;

interface ScheduleTableProps {
  schedules: AdminSchedule[];
  loading: boolean;
  pagination: SchedulePagination;
  selectedSchedules: number[];
  onEdit: (schedule: AdminSchedule) => void;
  onDelete: (scheduleId: number) => void;
  onView: (schedule: AdminSchedule) => void;
  onSelectionChange: (selectedRowKeys: React.Key[]) => void;
  onPageChange: (page: number, pageSize?: number) => void;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  schedules,
  loading,
  pagination,
  selectedSchedules,
  onEdit,
  onDelete,
  onView,
  onSelectionChange,
  onPageChange
}) => {

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <CalendarOutlined style={{ color: '#1890ff' }} />;
      case 'ONGOING':
        return <PlayCircleOutlined style={{ color: '#52c41a' }} />;
      case 'COMPLETED':
        return <CheckCircleOutlined style={{ color: '#8c8c8c' }} />;
      case 'CANCELLED':
        return <StopOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'blue';
      case 'ONGOING':
        return 'green';
      case 'COMPLETED':
        return 'default';
      case 'CANCELLED':
        return 'red';
      default:
        return 'orange';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Đã lên lịch';
      case 'ONGOING':
        return 'Đang chiếu';
      case 'COMPLETED':
        return 'Đã hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getActionMenuItems = (schedule: AdminSchedule): MenuProps['items'] => [
    {
      key: 'view',
      label: 'Xem chi tiết',
      icon: <EyeOutlined />,
      onClick: () => onView(schedule)
    },
    {
      key: 'edit',
      label: 'Chỉnh sửa',
      icon: <EditOutlined />,
      onClick: () => onEdit(schedule),
      disabled: schedule.status === 'COMPLETED' || schedule.status === 'ONGOING'
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      label: 'Xóa lịch chiếu',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => onDelete(schedule.scheduleId),
      disabled: schedule.status === 'ONGOING' || schedule.bookedSeats > 0
    }
  ];

  const columns: ColumnsType<AdminSchedule> = [
    {
      title: 'Phim',
      dataIndex: 'movieName',
      key: 'movieName',
      width: 200,
      render: (title: string, record) => (
        <Space>
          {record.moviePoster && (
            <Avatar
              src={record.moviePoster}
              size={40}
              shape="square"
            />
          )}
          <div>
            <Text strong>{title}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.movieDuration} phút
            </Text>
          </div>
        </Space>
      ),
      sorter: (a, b) => a.movieName.localeCompare(b.movieName)
    },
    {
      title: 'Phòng chiếu',
      dataIndex: 'cinemaRoomName',
      key: 'cinemaRoomName',
      width: 120,
      render: (roomName: string, record) => (
        <div>
          <Text strong>{roomName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.roomType}
          </Text>
        </div>
      ),
      sorter: (a, b) => a.cinemaRoomName.localeCompare(b.cinemaRoomName)
    },
    {
      title: 'Ngày & Giờ',
      key: 'datetime',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={4}>
          <Space>
            <CalendarOutlined style={{ color: '#1890ff' }} />
            <Text>{record.displayDate}</Text>
          </Space>
          <Space>
            <ClockCircleOutlined style={{ color: '#52c41a' }} />
            <Text>{record.displayTime}</Text>
            <Text type="secondary">→</Text>
            <Text>{record.endTime.substring(0, 5)}</Text>
          </Space>
        </Space>
      ),
      sorter: (a, b) => {
        const dateA = new Date(`${a.showDate}T${a.startTime}`);
        const dateB = new Date(`${b.showDate}T${b.startTime}`);
        return dateA.getTime() - dateB.getTime();
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag 
          icon={getStatusIcon(status)}
          color={getStatusColor(status)}
        >
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: 'Đã lên lịch', value: 'SCHEDULED' },
        { text: 'Đang chiếu', value: 'ONGOING' },
        { text: 'Đã hoàn thành', value: 'COMPLETED' },
        { text: 'Đã hủy', value: 'CANCELLED' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Đặt chỗ',
      key: 'booking',
      width: 150,
      render: (_, record) => (
        <div>
          <Space align="center">
            <TeamOutlined style={{ color: '#1890ff' }} />
            <Text>
              {record.bookedSeats}/{record.totalSeats}
            </Text>
          </Space>
          <Progress 
            percent={record.occupancyRate} 
            size="small" 
            status={record.occupancyRate > 80 ? 'success' : record.occupancyRate > 50 ? 'active' : 'normal'}
            style={{ marginTop: 4 }}
          />
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {record.occupancyRate}% đã đặt
          </Text>
        </div>
      ),
      sorter: (a, b) => a.occupancyRate - b.occupancyRate
    },
    {
      title: 'Giá vé',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number, record) => (
        <Space direction="vertical" size={2}>
          <Space>
            <DollarCircleOutlined style={{ color: '#faad14' }} />
            <Text strong>{record.priceDisplay}</Text>
          </Space>
          {record.specialFeatures !== 'Standard' && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {record.specialFeatures}
            </Text>
          )}
        </Space>
      ),
      sorter: (a, b) => a.price - b.price
    },
    {
      title: 'Tùy chọn',
      key: 'options',
      width: 100,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          {(record.is3D || record.isIMAX || record.is4DX) && (
            <Space size={4}>
              {record.is3D && <Tag color="cyan" style={{ fontSize: '10px' }}>3D</Tag>}
              {record.isIMAX && <Tag color="orange" style={{ fontSize: '10px' }}>IMAX</Tag>}
              {record.is4DX && <Tag color="purple" style={{ fontSize: '10px' }}>4DX</Tag>}
            </Space>
          )}
          <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
            {record.subtitleLanguage !== 'None' && `Sub: ${record.subtitleLanguage}`}
            {record.subtitleLanguage !== 'None' && record.audioLanguage && ' | '}
            {record.audioLanguage && `Audio: ${record.audioLanguage}`}
          </div>
        </Space>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            style={{ padding: '4px 8px' }}
          />
        </Dropdown>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys: selectedSchedules,
    onChange: onSelectionChange,
    getCheckboxProps: (record: AdminSchedule) => ({
      disabled: record.status === 'ONGOING' || record.bookedSeats > 0,
      name: record.movieName
    })
  };

  return (
    <Table<AdminSchedule>
      columns={columns}
      dataSource={schedules}
      rowKey="scheduleId"
      loading={loading}
      rowSelection={rowSelection}
      pagination={{
        current: pagination.currentPage,
        pageSize: pagination.pageSize,
        total: pagination.totalElements,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} của ${total} lịch chiếu`,
        onChange: onPageChange,
        onShowSizeChange: (current, size) => onPageChange(current, size),
        pageSizeOptions: ['10', '20', '50', '100']
      }}
      scroll={{ x: 1200 }}
      size="small"
      bordered
      style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    />
  );
};
