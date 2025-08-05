import React from 'react';
import { Space, Button, Tag, Popconfirm, Tooltip, Avatar } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, HomeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { CinemaRoomResponse } from '../types';

interface RoomTableColumnsProps {
  onEdit: (room: CinemaRoomResponse) => void;
  onDelete: (roomId: number) => void;
  onView: (room: CinemaRoomResponse) => void;
  loading?: boolean;
  isUsingApiData?: boolean;
}

export const createRoomTableColumns = ({
  onEdit,
  onDelete,
  onView,
  loading = false,
  isUsingApiData = true
}: RoomTableColumnsProps): ColumnsType<CinemaRoomResponse> => {

  return [
    {
      title: "#",
      dataIndex: "cinemaRoomId",
      key: "cinemaRoomId",
      width: 60,
      render: (_: unknown, record: CinemaRoomResponse, index: number) => (
        <div className="text-center">
          <span className="font-mono text-sm text-gray-500">
            {index + 1}
          </span>
        </div>
      ),
    },
    {
      title: "Room Information",
      key: "room_info",
      width: 280,
      render: (_: unknown, record: CinemaRoomResponse) => (
        <div className="flex items-center gap-3">
          <Avatar
            icon={<HomeOutlined />}
            size={40}
            className="bg-blue-100 text-blue-600 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 mb-1 truncate text-sm">
              {record.cinemaRoomName}
            </div>
            <div className="text-xs text-gray-600 mb-1 truncate">
              {record.rows}x{record.columns} Layout
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Type & Status",
      key: "type_status",
      width: 120,
      render: (_: unknown, record: CinemaRoomResponse) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 truncate mb-1">
            {record.roomType}
          </div>
          <Tag
            color={record.isActive ? "success" : "warning"}
            className="text-xs"
          >
            {record.isActive ? "Active" : "Inactive"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Capacity",
      key: "capacity",
      width: 80,
      align: "center" as const,
      render: (_: unknown, record: CinemaRoomResponse) => (
        <div className="text-center">
          <div className="text-sm font-medium">{record.seatQuantity}</div>
          <div className="text-xs text-gray-500">seats</div>
        </div>
      ),
    },
    {
      title: "Price Multiplier",
      dataIndex: "priceMultiplier",
      key: "priceMultiplier",
      width: 120,
      align: "center" as const,
      render: (multiplier: number) => (
        <div className="text-sm">
          <div className="font-medium">{multiplier}x</div>
        </div>
      ),
    },
    {
      title: "Description",
      key: "description",
      align: "center" as const,
      width: 200,
      render: (_: unknown, record: CinemaRoomResponse) => (
        <div className="text-sm">
          <div className="text-gray-900 line-clamp-2">
            {record.description || "No description available"}
          </div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right" as const,
      align: "center" as const,
      render: (_: unknown, record: CinemaRoomResponse) => (
        <Space size="small">
          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              className="text-blue-600 hover:bg-blue-50"
              onClick={() => onView(record)}
            />
          </Tooltip>
          <Tooltip title={isUsingApiData ? "Edit" : "Edit disabled - backend not connected"}>
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              className={
                isUsingApiData
                  ? "text-green-600 hover:bg-green-50"
                  : "text-gray-400"
              }
              onClick={() => onEdit(record)}
              disabled={!isUsingApiData}
            />
          </Tooltip>
          <Tooltip title={isUsingApiData ? "Delete" : "Delete disabled - backend not connected"}>
            <Popconfirm
              title="Delete Room"
              description={`Are you sure you want to delete "${record.cinemaRoomName}"? This action cannot be undone.`}
              onConfirm={() => onDelete(record.cinemaRoomId)}
              okText="Yes, Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              disabled={!isUsingApiData}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                className={
                  isUsingApiData
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-400"
                }
                disabled={!isUsingApiData}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];
};
