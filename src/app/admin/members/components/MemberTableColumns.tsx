import React from 'react';
import { Space, Button, Tooltip, Popconfirm, Avatar, Tag } from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined 
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MemberData, CurrentUser } from '../types';
import { canViewDetails, canEdit, canDelete } from '../utils/permissions';

interface TableActionsProps {
  record: MemberData;
  currentUser: CurrentUser | null;
  isUsingApiData: boolean;
  onViewDetail: (record: MemberData) => void;
  onEdit: (record: MemberData) => void;
  onDelete: (record: MemberData) => void;
}

const TableActions: React.FC<TableActionsProps> = ({
  record,
  currentUser,
  isUsingApiData,
  onViewDetail,
  onEdit,
  onDelete,
}) => (
  <Space size="small">
    {/* View Details */}
    {canViewDetails(currentUser, record) && (
      <Tooltip title="View Details">
        <Button
          type="text"
          icon={<EyeOutlined />}
          size="small"
          className="text-blue-600 hover:bg-blue-50"
          onClick={() => onViewDetail(record)}
        />
      </Tooltip>
    )}
    
    {/* Edit */}
    {canEdit(currentUser, record) && (
      <Tooltip title={isUsingApiData ? "Edit" : "Edit disabled in demo mode"}>
        <Button
          type="text"
          icon={<EditOutlined />}
          size="small"
          className={isUsingApiData ? "text-green-600 hover:bg-green-50" : "text-gray-400"}
          onClick={() => onEdit(record)}
          disabled={!isUsingApiData}
        />
      </Tooltip>
    )}
    
    {/* Delete */}
    {canDelete(currentUser, record) && (
      <Tooltip title={isUsingApiData ? "Delete" : "Delete disabled in demo mode"}>
        <Popconfirm
          title="Delete Member"
          description={`Are you sure you want to delete ${record.name}?`}
          onConfirm={() => onDelete(record)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
          disabled={!isUsingApiData}
        >
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            className={isUsingApiData ? "text-red-600 hover:bg-red-50" : "text-gray-400"}
            disabled={!isUsingApiData}
          />
        </Popconfirm>
      </Tooltip>
    )}
  </Space>
);

export const createMemberColumns = (
  currentUser: CurrentUser | null,
  isUsingApiData: boolean,
  currentPage: number,
  pageSize: number,
  onViewDetail: (record: MemberData) => void,
  onEdit: (record: MemberData) => void,
  onDelete: (record: MemberData) => void
): ColumnsType<MemberData> => [
  {
    title: "#",
    dataIndex: "id",
    key: "id",
    width: 60,
    align: "center" as const,
    render: (_: unknown, record: MemberData, index: number) => (
      <div className="text-center">
        <span className="font-mono text-sm text-gray-500">
          {(currentPage - 1) * pageSize + index + 1}
        </span>
      </div>
    ),
  },
  {
    title: "Member",
    key: "member_info",
    width: 220,
    render: (_: unknown, record: MemberData) => (
      <div className="flex items-center gap-3">
        <Avatar src={record.avatar} size={40} icon={<UserOutlined />} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 mb-1 truncate text-sm">
            {record.name}
          </div>
          <div className="text-xs text-gray-600 mb-1 truncate">
            {record.email}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Username",
    dataIndex: "username",
    key: "username",
    width: 120,
    render: (username: string) => (
      <span className="text-sm font-mono text-gray-700">{username}</span>
    ),
  },
  {
    title: "Phone",
    dataIndex: "phone",
    key: "phone",
    width: 120,
    render: (phone: string) => <span className="text-sm">{phone}</span>,
  },
  {
    title: "Join Date",
    dataIndex: "joinDate",
    key: "joinDate",
    width: 120,
    render: (date: string) => (
      <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
    ),
  },
  {
    title: "Role",
    dataIndex: "type",
    key: "type",
    width: 100,
    render: (type: string) => (
      <Tag
        color={
          type === "ADMIN" ? "red" :
          type === "EMPLOYEE" ? "orange" :
          type === "MEMBER" ? "green" :
          "blue"
        }
        className="text-xs m-0"
      >
        {type}
      </Tag>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 90,
    align: "center" as const,
    render: (status: string) => (
      <Tag
        color={status === "active" ? "success" : "default"}
        className="font-medium text-xs"
      >
        {status === "active" ? "Active" : "Inactive"}
      </Tag>
    ),
  },
  {
    title: "Actions",
    key: "actions",
    width: 130,
    fixed: "right" as const,
    align: "center" as const,
    render: (_: unknown, record: MemberData) => (
      <TableActions
        record={record}
        currentUser={currentUser}
        isUsingApiData={isUsingApiData}
        onViewDetail={onViewDetail}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];
