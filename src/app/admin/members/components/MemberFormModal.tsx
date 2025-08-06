import React, { useEffect } from 'react';
import { Modal, Form, Row, Col, Input, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { MemberData, MemberCreateRequest } from '../types';

const { Option } = Select;

// Utility functions to safely access member properties
const getMemberName = (member: MemberData): string => {
  const m = (member as unknown) as Record<string, unknown>;
  return (m.name as string) || (m.fullName as string) || '';
};

const getMemberUsername = (member: MemberData): string => {
  const m = (member as unknown) as Record<string, unknown>;
  return (m.username as string) || (m.id as string) || '';
};

const getMemberPhone = (member: MemberData): string => {
  const m = (member as unknown) as Record<string, unknown>;
  return (m.phone as string) || (m.phoneNumber as string) || '';
};

const getMemberRole = (member: MemberData): string => {
  const m = (member as unknown) as Record<string, unknown>;
  return (m.type as string) || (m.role as string) || '';
};

const getMemberAddress = (member: MemberData): string => {
  const m = (member as unknown) as Record<string, unknown>;
  return (m.address as string) || '';
};

const getMemberDob = (member: MemberData): string => {
  const m = (member as unknown) as Record<string, unknown>;
  return (m.dob as string) || (m.dateOfBirth as string) || '';
};

const getMemberStatus = (member: MemberData): boolean => {
  const m = (member as unknown) as Record<string, unknown>;
  return (m.status as string) === 'active';
};

interface MemberFormModalProps {
  visible: boolean;
  editingMember: MemberData | null;
  onSubmit: (values: MemberCreateRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const MemberFormModal: React.FC<MemberFormModalProps> = ({
  visible,
  editingMember,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();

  // Set form values when editing
  useEffect(() => {
    if (editingMember && visible) {
      // Map member data to form fields correctly using utility functions
      form.setFieldsValue({
        name: getMemberName(editingMember),
        username: getMemberUsername(editingMember),
        email: editingMember.email,
        phone: getMemberPhone(editingMember),
        type: getMemberRole(editingMember),
        address: getMemberAddress(editingMember),
        dob: getMemberDob(editingMember) ? dayjs(getMemberDob(editingMember)) : null,
      });
      console.log('Setting form values for editing:', {
        name: getMemberName(editingMember),
        username: getMemberUsername(editingMember),
        email: editingMember.email,
        phone: getMemberPhone(editingMember),
        type: getMemberRole(editingMember),
        address: getMemberAddress(editingMember),
        dob: getMemberDob(editingMember),
      });
    } else if (!editingMember && visible) {
      form.resetFields();
    }
  }, [editingMember, visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const memberData: MemberCreateRequest = {
        username: values.username,
        fullName: values.name,
        email: values.email,
        phoneNumber: values.phone || undefined,
        address: values.address || undefined,
        dateOfBirth: values.dob ? values.dob.format('YYYY-MM-DD') : undefined,
        role: values.type || 'MEMBER',
        isActive: editingMember ? getMemberStatus(editingMember) : true,
      };

      // Add password for create, or for update if provided
      if (!editingMember || (editingMember && values.password)) {
        memberData.password = values.password;
      }

      await onSubmit(memberData);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={editingMember ? "Edit Member" : "Add New Member"}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      width={600}
      className="professional-modal"
      okText={editingMember ? "Update Member" : "Add Member"}
      cancelText="Cancel"
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" className="mt-6">
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: "Please enter full name" }]}
            >
              <Input placeholder="Enter full name" className="h-10" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: "Please enter username" },
                { min: 3, message: "Username must be at least 3 characters" },
                { max: 20, message: "Username must be less than 20 characters" },
                { 
                  pattern: /^[a-zA-Z0-9_]+$/, 
                  message: "Username can only contain letters, numbers, and underscores" 
                }
              ]}
            >
              <Input 
                placeholder="Enter username (letters, numbers, underscore only)" 
                className="h-10" 
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter a valid email address" }
              ]}
            >
              <Input 
                placeholder="Enter email address" 
                className="h-10" 
                type="email" 
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="phone"
              label="Phone"
              rules={[
                { 
                  pattern: /^[+]?[0-9\s\-\(\)]+$/, 
                  message: "Please enter a valid phone number" 
                }
              ]}
            >
              <Input 
                placeholder="Enter phone number (optional)" 
                className="h-10" 
                type="tel" 
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: !editingMember,
                  message: "Please enter password"
                },
                {
                  min: 6,
                  message: "Password must be at least 6 characters"
                }
              ]}
              help={editingMember ? "Leave blank to keep current password" : undefined}
            >
              <Input.Password
                placeholder={editingMember ? "Leave blank to keep current password" : "Enter password (min 6 characters)"}
                className="h-10"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            {/* Empty space for layout */}
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item
              name="address"
              label="Address"
            >
              <Input.TextArea 
                placeholder="Enter address (optional)" 
                rows={2} 
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="dob"
              label="Date of Birth"
            >
              <DatePicker 
                className="w-full h-10" 
                format="DD-MM-YYYY"
                placeholder="Select date of birth (optional)"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>              
            <Form.Item
              name="type"
              label="Role"
              rules={[{ required: true, message: "Please select role" }]}
            >
              <Select 
                placeholder="Select role" 
                className="h-10"
              >
                <Option value="EMPLOYEE">Employee</Option>
                <Option value="MEMBER">Member</Option>
                <Option value="CUSTOMER">Customer</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default MemberFormModal;
