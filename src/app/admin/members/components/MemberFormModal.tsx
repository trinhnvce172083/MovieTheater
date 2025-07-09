import React, { useEffect } from 'react';
import { Modal, Form, Row, Col, Input, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { MemberData, MemberCreateRequest } from '../types';

const { Option } = Select;

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
      form.setFieldsValue({
        name: editingMember.name,
        username: editingMember.username || editingMember.id,
        email: editingMember.email,
        phone: editingMember.phone,
        type: editingMember.type,
        joinDate: editingMember.joinDate,
        address: editingMember.address || '',
        dob: editingMember.dob ? dayjs(editingMember.dob) : null,
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
        isActive: editingMember ? editingMember.status === 'active' : true,
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
            >
              <Input.Password
                placeholder={editingMember ? "Leave blank to keep current password" : "Enter password"}
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
              rules={[{ required: !editingMember, message: "Please enter address" }]}
            >
              <Input.TextArea 
                placeholder="Enter address" 
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
              rules={[{ required: !editingMember, message: "Please select date of birth" }]}
            >
              <DatePicker 
                className="w-full h-10" 
                format="DD-MM-YYYY" 
                disabled={!!editingMember}
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
                disabled={!!editingMember}
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
