import React from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  Upload,
  Row,
  Col,
  Button,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { PromotionModalProps } from '../types';

const { Option } = Select;

export const PromotionModal: React.FC<PromotionModalProps> = ({
  isVisible,
  editingPromotion,
  onOk,
  onCancel,
  formRef,
}) => {
  return (
    <Modal
      title={editingPromotion ? "Edit Promotion" : "Add New Promotion"}
      open={isVisible}
      onOk={onOk}
      onCancel={onCancel}
      width={800}
      className="professional-modal"
      okText={editingPromotion ? "Update Promotion" : "Add Promotion"}
      cancelText="Cancel"
    >
      <Form ref={formRef} layout="vertical" className="mt-6">
        {/* Basic Information */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="name"
              label="Promotion Name"
              rules={[
                { required: true, message: "Please enter promotion name" },
              ]}
            >
              <Input
                placeholder="Enter promotion name (e.g., Summer Sale)"
                className="h-10"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="promoCode"
              label="Promotion Code"
              rules={[
                { required: true, message: "Please enter promotion code" },
                { min: 4, message: "Code must be at least 4 characters" },
                {
                  pattern: /^[A-Za-z0-9]+$/,
                  message: "Only alphanumeric characters allowed",
                },
              ]}
              tooltip="This code will be shared with customers to apply the discount"
            >
              <Input
                placeholder="e.g. SUMMER20, WEEKEND5"
                className="h-10"
                addonAfter={
                  <Button
                    type="text"
                    size="small"
                    onClick={() => {
                      const randomCode = Math.random()
                        .toString(36)
                        .substring(2, 8)
                        .toUpperCase();
                      formRef.current?.setFieldsValue({ promoCode: randomCode });
                    }}
                  >
                    Generate
                  </Button>
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please enter description" },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Enter promotion description (e.g., Get 20% off on all movie tickets this summer!)"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Discount Information */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="discountType"
              label="Discount Type"
              rules={[
                { required: true, message: "Please select discount type" },
              ]}
            >
              <Select placeholder="Select discount type" className="h-10">
                <Option value="PERCENTAGE">Percentage</Option>
                <Option value="FIXED_AMOUNT">Fixed Amount</Option>
                <Option value="BUY_ONE_GET_ONE">Buy One Get One</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="discountValue"
              label="Discount Value"
              rules={[
                { required: true, message: "Please enter discount value" },
              ]}
              dependencies={["discountType"]}
            >
              <InputNumber
                min={0}
                max={
                  formRef.current?.getFieldValue("discountType") === "PERCENTAGE"
                    ? 100
                    : undefined
                }
                className="w-full h-10"
                placeholder={
                  formRef.current?.getFieldValue("discountType") === "PERCENTAGE"
                    ? "Enter percentage (1-100)"
                    : formRef.current?.getFieldValue("discountType") === "BUY_ONE_GET_ONE"
                    ? "1"
                    : "Enter amount in VND"
                }
                disabled={
                  formRef.current?.getFieldValue("discountType") === "BUY_ONE_GET_ONE"
                }
                value={
                  formRef.current?.getFieldValue("discountType") === "BUY_ONE_GET_ONE"
                    ? 1
                    : undefined
                }
                addonAfter={
                  formRef.current?.getFieldValue("discountType") === "PERCENTAGE"
                    ? "%"
                    : formRef.current?.getFieldValue("discountType") === "FIXED_AMOUNT"
                    ? "VND"
                    : ""
                }
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Validity Period */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[
                { required: true, message: "Please select start date" },
              ]}
            >
              <DatePicker className="w-full h-10" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="endDate"
              label="End Date"
              rules={[{ required: true, message: "Please select end date" }]}
            >
              <DatePicker className="w-full h-10" />
            </Form.Item>
          </Col>
        </Row>

        {/* Purchase Limits */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="minPurchase"
              label="Minimum Purchase (VND)"
              rules={[
                {
                  required: true,
                  message: "Please enter minimum purchase amount",
                },
              ]}
            >
              <InputNumber
                min={0}
                className="w-full h-10"
                placeholder="Enter minimum purchase"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="maxDiscount"
              label="Maximum Discount (VND)"
              rules={[
                {
                  required: true,
                  message: "Please enter maximum discount amount",
                },
              ]}
            >
              <InputNumber
                min={0}
                className="w-full h-10"
                placeholder="Enter maximum discount"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Status and Type */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select placeholder="Select status" className="h-10">
                <Option value="ACTIVE">Active</Option>
                <Option value="INACTIVE">Inactive</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="promotionType"
              label="Promotion Type"
              rules={[{ required: true }]}
              tooltip="PUBLIC promotions are available to all users, POINT_BASED can be redeemed with points"
            >
              <Select placeholder="Select promotion type">
                <Option value="PUBLIC">Public</Option>
                <Option value="POINT_BASED">Point Based</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Member Restrictions */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="memberOnly"
              label="Member Only"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="membershipLevels"
              label="Membership Levels"
              tooltip="Leave empty for all membership levels"
            >
              <Select
                mode="multiple"
                placeholder="Select applicable membership levels"
                allowClear
              >
                <Option value="BRONZE">Bronze</Option>
                <Option value="SILVER">Silver</Option>
                <Option value="GOLD">Gold</Option>
                <Option value="PLATINUM">Platinum</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Usage Limits */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="maxUsageCount"
              label="Max Usage Count"
              tooltip="Maximum number of times this promotion can be used"
            >
              <InputNumber
                min={0}
                className="w-full"
                placeholder="Leave empty for unlimited"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="maxUsagePerUser"
              label="Max Usage Per User"
              tooltip="Maximum number of times each user can use this promotion"
            >
              <InputNumber
                min={0}
                className="w-full"
                placeholder="Leave empty for unlimited"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Point-based promotion fields */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="pointsRequired"
              label="Points Required"
              tooltip="Required points to redeem (for POINT_BASED promotions only)"
              dependencies={["promotionType"]}
            >
              <InputNumber
                min={0}
                className="w-full"
                disabled={
                  formRef.current?.getFieldValue("promotionType") !== "POINT_BASED"
                }
                placeholder="Enter points required"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="isFeatured"
              label="Featured Promotion"
              valuePropName="checked"
              tooltip="Featured promotions are displayed prominently"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        {/* Banner Upload */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="banner"
              label="Promotion Banner"
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            >
              <Upload
                name="banner"
                listType="picture-card"
                maxCount={1}
                beforeUpload={() => false}
                accept="image/png,image/jpeg,image/gif"
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}; 