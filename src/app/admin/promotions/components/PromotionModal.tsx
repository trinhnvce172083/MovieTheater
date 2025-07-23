import React, { useEffect } from 'react';
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
import { PromotionDto } from '@/types/Admin/promotion';

const { Option } = Select;

interface PromotionModalProps {
  isVisible: boolean;
  editingPromotion: PromotionDto | null;
  onOk: () => void;
  onCancel: () => void;
  form: any;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  isVisible,
  editingPromotion,
  onOk,
  onCancel,
  form,
}) => {
  // Lấy giá trị discountType và promotionType bằng Form.useWatch
  const discountType = Form.useWatch('discountType', form);
  const promotionType = Form.useWatch('promotionType', form);

  const handleSubmit = async (values: any) => {
    // Form validation is handled in the parent component
    onOk();
  };

  return (
    <Modal
      title={editingPromotion ? "Edit Promotion" : "Add New Promotion"}
      open={isVisible}
      onCancel={onCancel}
      width={800}
      className="professional-modal"
      footer={null}
      destroyOnHidden
    >
      <Form
        form={form}
        key={isVisible ? 'open' : 'closed'}
        layout="vertical"
        className="mt-6"
        onFinish={handleSubmit}
        initialValues={editingPromotion ? {
          promoCode: editingPromotion.promotionCode,
          name: editingPromotion.promotionName,
          description: editingPromotion.description,
          discountType: editingPromotion.discountType,
          discountValue: editingPromotion.discountValue,
          startDate: editingPromotion.startDate ? dayjs(editingPromotion.startDate) : null,
          endDate: editingPromotion.endDate ? dayjs(editingPromotion.endDate) : null,
          minPurchase: editingPromotion.minPurchaseAmount,
          maxDiscount: editingPromotion.maxDiscountAmount,
          status: editingPromotion.isActive ? 'ACTIVE' : 'INACTIVE',
          promotionType: editingPromotion.pointsDiscount ? 'POINT_BASED' : 'PUBLIC',
          memberOnly: false,
          membershipLevels: '',
          maxUsageCount: editingPromotion.maxUsageCount,
          maxUsagePerUser: editingPromotion.maxUsagePerUser,
          pointsRequired: editingPromotion.pointsRequired,
          isFeatured: editingPromotion.isFeatured,
          banner: undefined,
        } : {}}
      >
        {/* Basic Information */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="name"
              label="Promotion Name"
              rules={[
                { required: !editingPromotion, message: "Please enter promotion name" },
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
                { required: !editingPromotion, message: "Please enter promotion code" },
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
                      // Tạo mã gồm 6 ký tự in hoa và số
                      const length = 6 + Math.floor(Math.random() * 3); // 6-8 ký tự
                      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                      let randomCode = '';
                      for (let i = 0; i < length; i++) {
                        randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      form.setFieldsValue({ promoCode: randomCode });
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
                { required: !editingPromotion, message: "Please enter description" },
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
                { required: !editingPromotion, message: "Please select discount type" },
              ]}
            >
              <Select placeholder="Select discount type" className="h-10">
                <Option value="PERCENTAGE">Percentage</Option>
                <Option value="FIXED">Fixed Amount</Option>
                <Option value="POINTS">Points</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="discountValue"
              label="Discount Value"
              rules={[
                { required: !editingPromotion, message: "Please enter discount value" },
              ]}
              dependencies={["discountType"]}
            >
              <InputNumber
                min={0}
                max={discountType === "PERCENTAGE" ? 100 : undefined}
                className="w-full h-10"
                placeholder={
                  discountType === "PERCENTAGE"
                    ? "Enter percentage (1-100)"
                    : discountType === "POINTS"
                    ? "Enter points required"
                    : "Enter amount in VND"
                }
                addonAfter={
                  discountType === "PERCENTAGE"
                    ? "%"
                    : discountType === "FIXED"
                    ? "VND"
                    : discountType === "POINTS"
                    ? "points"
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
                { required: !editingPromotion, message: "Please select start date" },
              ]}
            >
              <DatePicker className="w-full h-10" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="endDate"
              label="End Date"
              rules={[
                { required: !editingPromotion, message: "Please select end date" },
              ]}
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
                  required: !editingPromotion,
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
                  required: !editingPromotion,
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
              rules={[{ required: !editingPromotion, message: "Please select status" }]}
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
              rules={[{ required: !editingPromotion, message: "'promotionType' is required" }]}
              tooltip="PUBLIC promotions are available to all users, POINT_BASED can be redeemed with points"
            >
              <Select placeholder="Select promotion type">
                <Option value="PUBLIC">Public</Option>
                <Option value="POINT_BASED">Point Based</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Usage Limits */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="maxUsageCount"
              label={<span>Max Usage Count <span style={{ color: 'red' }}>*</span></span>}
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
              label={<span>Max Usage Per User <span style={{ color: 'red' }}>*</span></span>}
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
            >
              <InputNumber
                min={0}
                className="w-full"
                disabled={discountType !== "POINTS"}
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
        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button onClick={onCancel} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              {editingPromotion ? "Update Promotion" : "Add Promotion"}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}; 