import React from 'react';
import { Space, Button, Tooltip, Popconfirm, Avatar, Tag } from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  LockOutlined,
  UnlockOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MemberData, CurrentUser } from '../types';
import { 
  canViewDetails, 
  canEdit, 
  canDelete, 
  canLockUser, 
  canUnlockUser, 
  canActivateUser, 
  canDeactivateUser 
} from '../utils/permissions';

interface TableActionsProps {
  record: MemberData;
  currentUser: CurrentUser | null;
  isUsingApiData: boolean;
  onViewDetail: (record: MemberData) => void;
  onEdit: (record: MemberData) => void;
  onDelete: (record: MemberData) => void;
  onLock: (record: MemberData) => void;
  onUnlock: (record: MemberData) => void;
  onActivate: (record: MemberData) => void;
  onDeactivate: (record: MemberData) => void;
}

const TableActions: React.FC<TableActionsProps> = ({
  record,
  currentUser,
  isUsingApiData,
  onViewDetail,
  onEdit,
  onDelete,
  onLock,
  onUnlock,
  onActivate,
  onDeactivate,
}) => {
  const isLocked = record.accountLockedUntil && new Date(record.accountLockedUntil) > new Date();
  const isActive = record.isActive;

  // Debug logging
  if (record.username === 'PhoenixZ') {
    console.log('Debug info for current user:', {
      currentUser,
      targetUser: record,
      canLock: canLockUser(currentUser, record),
      canUnlock: canUnlockUser(currentUser, record),
      canActivate: canActivateUser(currentUser, record),
      canDeactivate: canDeactivateUser(currentUser, record),
      canDelete: canDelete(currentUser, record)
    });
  }

  return (
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

      {/* Lock/Unlock */}
      {isUsingApiData && (
        <>
          {isLocked ? (
            canUnlockUser(currentUser, record) ? (
              <Tooltip title="Unlock User">
                <Button
                  type="text"
                  icon={<UnlockOutlined />}
                  size="small"
                  className="text-green-600 hover:bg-green-50"
                  onClick={() => onUnlock(record)}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Cannot unlock: You cannot unlock yourself or other admins">
                <Button
                  type="text"
                  icon={<UnlockOutlined />}
                  size="small"
                  className="text-gray-400"
                  disabled
                />
              </Tooltip>
            )
          ) : (
            canLockUser(currentUser, record) ? (
              <Tooltip title="Lock User">
                <Button
                  type="text"
                  icon={<LockOutlined />}
                  size="small"
                  className="text-orange-600 hover:bg-orange-50"
                  onClick={() => onLock(record)}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Cannot lock: You cannot lock yourself or other admins">
                <Button
                  type="text"
                  icon={<LockOutlined />}
                  size="small"
                  className="text-gray-400"
                  disabled
                />
              </Tooltip>
            )
          )}
        </>
      )}

      {/* Activate/Deactivate */}
      {isUsingApiData && (
        <>
          {isActive ? (
            canDeactivateUser(currentUser, record) ? (
              <Tooltip title="Deactivate User">
                <Popconfirm
                  title="Deactivate User"
                  description={`Are you sure you want to deactivate ${record.name}?`}
                  onConfirm={() => onDeactivate(record)}
                  okText="Deactivate"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="text"
                    icon={<StopOutlined />}
                    size="small"
                    className="text-red-600 hover:bg-red-50"
                  />
                </Popconfirm>
              </Tooltip>
            ) : (
              <Tooltip title="Cannot deactivate: You cannot deactivate yourself or other admins">
                <Button
                  type="text"
                  icon={<StopOutlined />}
                  size="small"
                  className="text-gray-400"
                  disabled
                />
              </Tooltip>
            )
          ) : (
            canActivateUser(currentUser, record) ? (
              <Tooltip title="Activate User">
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  size="small"
                  className="text-green-600 hover:bg-green-50"
                  onClick={() => onActivate(record)}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Cannot activate: You cannot activate yourself or other admins">
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  size="small"
                  className="text-gray-400"
                  disabled
                />
              </Tooltip>
            )
          )}
        </>
      )}
      
      {/* Delete */}
      {canDelete(currentUser, record) ? (
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
      ) : (
        <Tooltip title="Cannot delete: You cannot delete yourself or other admins">
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            className="text-gray-400"
            disabled
          />
        </Tooltip>
      )}
    </Space>
  );
};

export const createMemberColumns = (
  currentUser: CurrentUser | null,
  isUsingApiData: boolean,
  currentPage: number,
  pageSize: number,
  onViewDetail: (record: MemberData) => void,
  onEdit: (record: MemberData) => void,
  onDelete: (record: MemberData) => void,
  onLock: (record: MemberData) => void,
  onUnlock: (record: MemberData) => void,
  onActivate: (record: MemberData) => void,
  onDeactivate: (record: MemberData) => void
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
    key: "status",
    width: 120,
    align: "center" as const,
    render: (_: unknown, record: MemberData) => {
      const isLocked = record.accountLockedUntil && new Date(record.accountLockedUntil) > new Date();
      const isActive = record.isActive;
      
      return (
        <div className="flex flex-col gap-1">
          <Tag
            color={isActive ? "success" : "default"}
            className="font-medium text-xs"
          >
            {isActive ? "Active" : "Inactive"}
          </Tag>
          {isLocked && (
            <Tag color="orange" className="font-medium text-xs">
              Locked
            </Tag>
          )}
        </div>
      );
    },
  },
  {
    title: "Actions",
    key: "actions",
    width: 200,
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
        onLock={onLock}
        onUnlock={onUnlock}
        onActivate={onActivate}
        onDeactivate={onDeactivate}
      />
    ),
  },
];
