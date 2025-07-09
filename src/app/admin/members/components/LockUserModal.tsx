import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Switch, Button, message } from 'antd';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';

interface LockUserModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (lockData: LockUserData) => Promise<void>;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface LockUserData {
  reason: string;
  lockHours: number;
  sendNotificationEmail: boolean;
  notes?: string;
}

const LockUserModal: React.FC<LockUserModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  user
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onConfirm(values);
      form.resetFields();
      message.success('User locked successfully');
    } catch (error) {
      console.error('Lock user error:', error);
      message.error('Failed to lock user');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <LockOutlined className="text-red-500" />
          <span>Lock User Account</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          danger
          loading={loading}
          onClick={handleSubmit}
          icon={<LockOutlined />}
        >
          Lock User
        </Button>
      ]}
      width={600}
    >
      {user && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">User to lock:</div>
          <div className="font-semibold">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          sendNotificationEmail: true,
          lockHours: 24
        }}
      >
        <Form.Item
          name="reason"
          label="Reason for locking"
          rules={[
            { required: true, message: 'Please provide a reason for locking this user' },
            { min: 10, message: 'Reason must be at least 10 characters long' }
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder="e.g., Violation of terms of service, Inappropriate behavior, etc."
          />
        </Form.Item>

        <Form.Item
          name="lockHours"
          label="Lock duration (hours)"
          rules={[
            { required: true, message: 'Please specify lock duration' },
            { type: 'number', min: 1, message: 'Duration must be at least 1 hour' },
            { type: 'number', max: 8760, message: 'Duration cannot exceed 1 year (8760 hours)' }
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            max={8760}
            placeholder="24"
            addonAfter="hours"
          />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Additional notes (optional)"
        >
          <Input.TextArea
            rows={2}
            placeholder="Any additional notes or context..."
          />
        </Form.Item>

        <Form.Item
          name="sendNotificationEmail"
          valuePropName="checked"
        >
          <Switch />
          <span className="ml-2">Send notification email to user</span>
        </Form.Item>
      </Form>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <div className="text-sm text-yellow-800">
          <strong>Warning:</strong> This action will prevent the user from accessing their account 
          for the specified duration. The user will receive an email notification if enabled.
        </div>
      </div>
    </Modal>
  );
};

export default LockUserModal;
