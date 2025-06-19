"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Pagination,
  Tooltip,
  Popconfirm,
  message,
  Modal,
  Form,
  DatePicker,
  Tag,
  Statistic,
  Row,
  Col,
  Typography,
  Avatar,
  InputNumber,
} from "antd";
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  ExportOutlined,
  ImportOutlined,
  ReloadOutlined,
  CalendarOutlined,
  DollarOutlined,
  GiftOutlined,
  PercentageOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Enhanced data with more realistic promotion information
const promotionData = [
  {
    key: "1",
    id: "P001",
    name: "Summer Special",
    description: "Get 20% off on all movies during summer season",
    discountType: "percentage",
    discountValue: 20,
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    status: "active",
    applicableMovies: ["All Movies"],
    minPurchase: 0,
    maxDiscount: 50,
    usageCount: 150,
  },
  {
    key: "2",
    id: "P002",
    name: "Weekend Deal",
    description: "$5 off on weekend shows for all customers",
    discountType: "fixed",
    discountValue: 5,
    startDate: "2024-03-01",
    endDate: "2024-12-31",
    status: "active",
    applicableMovies: ["All Movies"],
    minPurchase: 20,
    maxDiscount: 5,
    usageCount: 89,
  },
  {
    key: "3",
    id: "P003",
    name: "Student Discount",
    description: "15% discount for students with valid ID",
    discountType: "percentage",
    discountValue: 15,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "active",
    applicableMovies: ["All Movies"],
    minPurchase: 0,
    maxDiscount: 25,
    usageCount: 234,
  },
  {
    key: "4",
    id: "P004",
    name: "Early Bird Special",
    description: "10% off for shows before 6 PM",
    discountType: "percentage",
    discountValue: 10,
    startDate: "2024-02-01",
    endDate: "2024-05-31",
    status: "expired",
    applicableMovies: ["All Movies"],
    minPurchase: 0,
    maxDiscount: 15,
    usageCount: 67,
  },
];

// Promotion Management Component
export default function ProfessionalPromotionManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [form] = Form.useForm();

  // Filter and search logic
  const filteredData = useMemo(() => {
    return promotionData.filter((promotion) => {
      const matchesSearch =
        promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promotion.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promotion.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !filterStatus || promotion.status === filterStatus;
      const matchesType = !filterType || promotion.discountType === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchTerm, filterStatus, filterType]);

  // Statistics calculations
  const statistics = useMemo(() => {
    const totalPromotions = promotionData.length;
    const activePromotions = promotionData.filter((p) => p.status === "active").length;
    const totalDiscountValue = promotionData.reduce((sum, p) => sum + p.discountValue, 0);
    const avgDiscount = Math.round(totalDiscountValue / totalPromotions);

    return { totalPromotions, activePromotions, totalDiscountValue, avgDiscount };
  }, []);

  const handleEdit = (record) => {
    setEditingPromotion(record);
    form.setFieldsValue({
      ...record,
      startDate: record.startDate,
      endDate: record.endDate,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    message.success(`Deleted "${record.name}" successfully`);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      message.success(
        editingPromotion ? "Promotion updated successfully" : "Promotion added successfully"
      );
      setIsModalVisible(false);
      setEditingPromotion(null);
      form.resetFields();
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingPromotion(null);
    form.resetFields();
  };

  const columns: ColumnsType<any> = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      width: 60,
      render: (_: any, record: any, index: any) => (
        <div className="text-center">
          <span className="font-mono text-sm text-gray-500">
            {(currentPage - 1) * pageSize + index + 1}
          </span>
        </div>
      ),
    },
    {
      title: "Promotion Information",
      key: "promotion_info",
      width: 280,
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar
            icon={<GiftOutlined />}
            size={40}
            className="bg-purple-100 text-purple-600 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 mb-1 truncate text-sm">
              {record.name}
            </div>
            <div className="text-xs text-gray-600 mb-1 truncate">
              {record.description}
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              <Tag color="purple" className="text-xs m-0">
                {record.id}
              </Tag>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Discount",
      key: "discount",
      width: 120,
      render: (_: any, record: any) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 mb-1">
            {record.discountType === "percentage" ? `${record.discountValue}%` : `$${record.discountValue}`}
          </div>
          <Tag
            color={record.discountType === "percentage" ? "blue" : "green"}
            className="text-xs"
          >
            {record.discountType === "percentage" ? "Percentage" : "Fixed"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Period",
      key: "period",
      width: 150,
      render: (_: any, record: any) => (
        <div className="text-sm">
          <div className="text-gray-900 mb-1">
            {new Date(record.startDate).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">
            to {new Date(record.endDate).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      align: "center" as const,
      render: (status: any) => (
        <div className="text-center">
          <Tag
            color={status === "active" ? "success" : status === "expired" ? "error" : "warning"}
            className="font-medium text-xs"
          >
            {status === "active" ? "Active" : status === "expired" ? "Expired" : "Inactive"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Usage",
      dataIndex: "usageCount",
      key: "usageCount",
      width: 80,
      align: "center" as const,
      render: (count: any) => (
        <div className="text-center">
          <div className="text-sm font-medium">{count}</div>
          <div className="text-xs text-gray-500">times</div>
        </div>
      ),
    },
    {
      title: "Min Purchase",
      dataIndex: "minPurchase",
      key: "minPurchase",
      width: 100,
      align: "right" as const,
      render: (value: any) => (
        <div className="text-right">
          <span className="font-mono text-sm">
            {value > 0 ? `$${value}` : "None"}
          </span>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right" as const,
      align: "center" as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              className="text-blue-600 hover:bg-blue-50"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              className="text-green-600 hover:bg-green-50"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Promotion"
              description="Are you sure?"
              onConfirm={() => handleDelete(record)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                className="text-red-600 hover:bg-red-50"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center" size="small">
              <Statistic
                title="Total Promotions"
                value={statistics.totalPromotions}
                prefix={<GiftOutlined className="text-blue-600" />}
                valueStyle={{ color: "#1677ff", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center" size="small">
              <Statistic
                title="Active Promotions"
                value={statistics.activePromotions}
                prefix={<CalendarOutlined className="text-green-600" />}
                valueStyle={{ color: "#52c41a", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center" size="small">
              <Statistic
                title="Total Discount Value"
                value={statistics.totalDiscountValue}
                prefix={<DollarOutlined className="text-purple-600" />}
                valueStyle={{ color: "#722ed1", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center border-0 shadow-sm h-32 flex flex-col justify-center" size="small">
              <Statistic
                title="Avg Discount"
                value={statistics.avgDiscount}
                prefix={<PercentageOutlined className="text-orange-600" />}
                valueStyle={{ color: "#faad14", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Card */}
        <Card
          className="shadow-sm border-0"
          bodyStyle={{ padding: 0 }}
          style={{ borderRadius: 16 }}
        >
          {/* Header Section */}
          <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div>
              <Title level={2} className="m-0 text-gray-900 text-xl xl:text-2xl">
                Promotion Management
              </Title>
              <Text type="secondary" className="text-sm xl:text-base">
                Manage and organize your cinema's promotional campaigns
              </Text>
            </div>

            <div className="flex items-center gap-3">
              <Button
                icon={<ImportOutlined />}
                className="border-gray-300 text-xs xl:text-sm h-10 px-4"
                size="middle"
              >
                Import
              </Button>
              <Button
                icon={<ExportOutlined />}
                className="border-gray-300 text-xs xl:text-sm h-10 px-4"
                size="middle"
              >
                Export
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="middle"
                className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm text-xs xl:text-sm h-10 px-4"
                onClick={() => setIsModalVisible(true)}
              >
                Add New Promotion
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12} lg={10} xl={8}>
                <Input
                  placeholder="Search promotions, ID, or names..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 px-4"
                  allowClear
                />
              </Col>
              <Col xs={12} sm={6} lg={4} xl={3}>
                <Select
                  placeholder="Status"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  className="w-full h-10 px-4"
                  allowClear
                  size="middle"
                >
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="expired">Expired</Option>
                </Select>
              </Col>
              <Col xs={12} sm={6} lg={3} xl={3}>
                <Select
                  placeholder="Type"
                  value={filterType}
                  onChange={setFilterType}
                  className="w-full h-10 px-4"
                  allowClear
                  size="middle"
                >
                  <Option value="percentage">Percentage</Option>
                  <Option value="fixed">Fixed Amount</Option>
                </Select>
              </Col>
              <Col xs={12} sm={6} lg={3} xl={3}>
                <Button
                  icon={<ReloadOutlined />}
                  className="w-full h-10 px-4"
                  size="middle"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("");
                    setFilterType("");
                  }}
                >
                  Reset
                </Button>
              </Col>
            </Row>
          </div>

          {/* Table Section */}
          <div className="bg-white">
            <Table
              dataSource={filteredData}
              columns={columns}
              pagination={false}
              scroll={{ x: 950 }}
              rowClassName="hover:bg-gray-50 transition-colors"
              className="professional-table"
              size="small"
            />

            {/* Pagination */}
            <div className="px-6 py-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Text type="secondary" className="text-sm">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
                {filteredData.length} promotions
              </Text>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredData.length}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
                showSizeChanger
                showQuickJumper={false}
                pageSizeOptions={["5", "10", "20", "50"]}
                className="professional-pagination"
                size="small"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Add/Edit Promotion Modal */}
      <Modal
        title={editingPromotion ? "Edit Promotion" : "Add New Promotion"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        className="professional-modal"
        okText={editingPromotion ? "Update Promotion" : "Add Promotion"}
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-6"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Promotion Name"
                rules={[{ required: true, message: "Please enter promotion name" }]}
              >
                <Input placeholder="Enter promotion name" className="h-10" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="id"
                label="Promotion ID"
                rules={[{ required: true, message: "Please enter promotion ID" }]}
              >
                <Input placeholder="Enter promotion ID" className="h-10" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: "Please enter description" }]}
              >
                <Input.TextArea rows={3} placeholder="Enter promotion description" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="discountType"
                label="Discount Type"
                rules={[{ required: true, message: "Please select discount type" }]}
              >
                <Select placeholder="Select discount type" className="h-10">
                  <Option value="percentage">Percentage</Option>
                  <Option value="fixed">Fixed Amount</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="discountValue"
                label="Discount Value"
                rules={[{ required: true, message: "Please enter discount value" }]}
              >
                <InputNumber
                  min={0}
                  max={form.getFieldValue("discountType") === "percentage" ? 100 : undefined}
                  className="w-full h-10"
                  placeholder="Enter discount value"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="startDate"
                label="Start Date"
                rules={[{ required: true, message: "Please select start date" }]}
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

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select placeholder="Select status" className="h-10">
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="expired">Expired</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="minPurchase"
                label="Minimum Purchase"
                rules={[{ required: true, message: "Please enter minimum purchase amount" }]}
              >
                <InputNumber
                  min={0}
                  prefix="$"
                  className="w-full h-10"
                  placeholder="Enter minimum purchase"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="maxDiscount"
                label="Maximum Discount"
                rules={[{ required: true, message: "Please enter maximum discount amount" }]}
              >
                <InputNumber
                  min={0}
                  prefix="$"
                  className="w-full h-10"
                  placeholder="Enter maximum discount"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <style jsx global>{`
        .professional-table .ant-table-thead > tr > th {
          background: #fafafa;
          border-bottom: 2px solid #f0f0f0;
          font-weight: 600;
          color: #262626;
        }
        
        .professional-table .ant-table-tbody > tr:hover > td {
          background: #f8faff;
        }
        
        .professional-pagination .ant-pagination-item-active {
          background: #1677ff;
          border-color: #1677ff;
        }
        
        .professional-pagination .ant-pagination-item-active a {
          color: white;
        }
        
        .professional-modal .ant-modal-header {
          border-bottom: 1px solid #f0f0f0;
          padding: 24px 24px 16px;
        }
        
        .professional-modal .ant-modal-body {
          padding: 24px;
        }
      `}</style>
    </div>
  );
} 