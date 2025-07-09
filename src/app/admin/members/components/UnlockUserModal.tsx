import React from 'react';
import { Modal, Button, Typography } from 'antd';
import { UnlockOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface UnlockUserModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
  user: {
    id: number;
    name: string;
    email: string;
    accountLockedUntil?: string;
  } | null;
  loading?: boolean;
}

const UnlockUserModal: React.FC<UnlockUserModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  user,
  loading = false
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <UnlockOutlined className="text-green-500" />
          <span>Unlock User Account</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          loading={loading}
          onClick={onConfirm}
          icon={<CheckCircleOutlined />}
        >
          Unlock User
        </Button>
      ]}
      width={500}
    >
      {user && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">User to unlock:</div>
            <div className="font-semibold">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
            {user.accountLockedUntil && (
              <div className="text-sm text-red-600 mt-2">
                Locked until: {new Date(user.accountLockedUntil).toLocaleString()}
              </div>
            )}
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <div className="text-sm text-green-800">
              <CheckCircleOutlined className="mr-2" />
              This action will immediately restore the user&apos;s access to their account.
              The user will be able to log in and use all features normally.
            </div>
          </div>

          <Text type="secondary">
            Are you sure you want to unlock this user account?
          </Text>
        </div>
      )}
    </Modal>
  );
};

export default UnlockUserModal;
