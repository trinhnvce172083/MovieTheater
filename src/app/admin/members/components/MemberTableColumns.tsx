import React from 'react';
import { Space, Button, Tooltip, Popconfirm, Avatar, Tag } from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
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
  onLock,
  onUnlock,
  onActivate,
  onDeactivate,
}) => {
  const isLocked = record.accountLockedUntil && new Date(record.accountLockedUntil) > new Date();
  const isActive = record.isActive;

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
      {canEdit(currentUser, record) && isUsingApiData && (
        <Tooltip title="Edit">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            className="text-green-600 hover:bg-green-50"
            onClick={() => onEdit(record)}
          />
        </Tooltip>
      )}

      {/* Lock/Unlock */}
      {isUsingApiData && (
        <>
          {isLocked ? (
            canUnlockUser(currentUser, record) && (
              <Tooltip title="Unlock User">
                <Button
                  type="text"
                  icon={<UnlockOutlined />}
                  size="small"
                  className="text-green-600 hover:bg-green-50"
                  onClick={() => onUnlock(record)}
                />
              </Tooltip>
            )
          ) : (
            canLockUser(currentUser, record) && (
              <Tooltip title="Lock User">
                <Button
                  type="text"
                  icon={<LockOutlined />}
                  size="small"
                  className="text-orange-600 hover:bg-orange-50"
                  onClick={() => onLock(record)}
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
            canDeactivateUser(currentUser, record) && (
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
            )
          ) : (
            canActivateUser(currentUser, record) && (
              <Tooltip title="Activate User">
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  size="small"
                  className="text-green-600 hover:bg-green-50"
                  onClick={() => onActivate(record)}
                />
              </Tooltip>
            )
          )}
        </>
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
    width: 85,
    align: "center" as const,
    render: (type: string) => (
      <div className="flex justify-center">
        <Tag
          color={
            type === "ADMIN" ? "red" :
            type === "EMPLOYEE" ? "orange" :
            type === "MEMBER" ? "green" :
            "blue"
          }
          className="text-xs"
          style={{
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '11px',
            padding: '2px 6px',
            margin: 0,
            lineHeight: '1.2',
            display: 'inline-block',
            width: 'fit-content'
          }}
        >
          {type}
        </Tag>
      </div>
    ),
  },
  {
    title: "Status",
    key: "status",
    width: 85,
    align: "center" as const,
    render: (_: unknown, record: MemberData) => {
      const isLocked = record.accountLockedUntil && new Date(record.accountLockedUntil) > new Date();
      const isActive = record.isActive;
      
      return (
        <div className="flex flex-col items-center gap-1">
          <Tag
            color={isActive ? "green" : "red"}
            className="text-xs"
            style={{
              borderRadius: '8px',
              fontWeight: '500',
              fontSize: '11px',
              padding: '2px 6px',
              margin: 0,
              lineHeight: '1.2',
              display: 'inline-block',
              width: 'fit-content'
            }}
          >
            {isActive ? "Active" : "Inactive"}
          </Tag>
          {isLocked && (
            <Tag 
              color="orange" 
              className="text-xs"
              style={{
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '10px',
                padding: '2px 6px',
                margin: 0,
                lineHeight: '1.2',
                display: 'inline-block',
                width: 'fit-content'
              }}
            >
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
    width: 120,
    fixed: "right" as const,
    align: "center" as const,
    render: (_: unknown, record: MemberData) => (
      <TableActions
        record={record}
        currentUser={currentUser}
        isUsingApiData={isUsingApiData}
        onViewDetail={onViewDetail}
        onEdit={onEdit}
        onLock={onLock}
        onUnlock={onUnlock}
        onActivate={onActivate}
        onDeactivate={onDeactivate}
      />
    ),
  },
];
