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
  MenuProps,
  Pagination,
  Spin
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
        return 'Scheduled';
      case 'ONGOING':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getActionMenuItems = (schedule: AdminSchedule): MenuProps['items'] => [
    {
      key: 'view',
      label: 'View Details',
      icon: <EyeOutlined />,
      onClick: () => onView(schedule)
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: () => onEdit(schedule),
      disabled: schedule.status === 'COMPLETED' || schedule.status === 'ONGOING'
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      label: 'Delete Schedule',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => onDelete(schedule.scheduleId),
      disabled: schedule.status === 'ONGOING' || schedule.bookedSeats > 0
    }
  ];

  const columns: ColumnsType<AdminSchedule> = [
    {
      title: 'Movie',
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
              {record.movieDuration} min
            </Text>
          </div>
        </Space>
      ),
      sorter: (a, b) => a.movieName.localeCompare(b.movieName)
    },
    {
      title: 'Cinema Room',
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
      title: 'Date & Time',
      key: 'datetime',
      width: 150,
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-1 mb-1">
            <CalendarOutlined className="text-blue-500 text-xs" />
            <Text className="text-sm font-medium">{record.displayDate}</Text>
          </div>
          <div className="flex items-center gap-1">
            <ClockCircleOutlined className="text-green-500 text-xs" />
            <Text className="text-sm">{record.displayTime}</Text>
            <Text type="secondary" className="text-xs">-</Text>
            <Text className="text-sm">{record.endTime.substring(0, 5)}</Text>
          </div>
        </div>
      ),
      sorter: (a, b) => {
        const dateA = new Date(`${a.showDate}T${a.startTime}`);
        const dateB = new Date(`${b.showDate}T${b.startTime}`);
        return dateA.getTime() - dateB.getTime();
      }
    },
    {
      title: 'Status',
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
        { text: 'Scheduled', value: 'SCHEDULED' },
        { text: 'In Progress', value: 'ONGOING' },
        { text: 'Completed', value: 'COMPLETED' },
        { text: 'Cancelled', value: 'CANCELLED' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Bookings',
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
            {record.occupancyRate}% booked
          </Text>
        </div>
      ),
      sorter: (a, b) => a.occupancyRate - b.occupancyRate
    },
    {
      title: 'Ticket Price',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => (
        <Text strong className="text-orange-600">
          {price.toLocaleString()}đ
        </Text>
      ),
      sorter: (a, b) => a.price - b.price
    },
    {
      title: 'Features',
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
      title: 'Actions',
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
    <div>
      <Spin spinning={loading}>
        <Table<AdminSchedule>
          columns={columns}
          dataSource={schedules}
          rowKey="scheduleId"
          loading={false}
          rowSelection={rowSelection}
          pagination={false}
          scroll={{ x: 1200 }}
          size="small"
          rowClassName="hover:bg-gray-50 transition-colors"
          className="professional-table"
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
                {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalElements)}
              </span>
              {" "}of{" "}
              <span className="font-medium text-gray-900">
                {pagination.totalElements}
              </span>
              {" "}schedules
            </Text>
          </div>
          <Pagination
            current={pagination.currentPage}
            pageSize={pagination.pageSize}
            total={pagination.totalElements}
            onChange={(page, size) => {
              onPageChange(page, size || pagination.pageSize);
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
  );
};
