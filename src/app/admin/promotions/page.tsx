"use client";

import React, { useState, useEffect } from "react";
import { Table, Button, Space, Tag, Modal, Form, Input, Select, DatePicker, InputNumber, Card, Row, Col, Statistic, Input as AntInput } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

interface Promotion {
  key: string;
  id: string;
  name: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "expired";
  applicableMovies: string[];
  minPurchase: number;
  maxDiscount: number;
}

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockPromotions: Promotion[] = [
      {
        key: "1",
        id: "P001",
        name: "Summer Special",
        description: "Get 20% off on all movies",
        discountType: "percentage",
        discountValue: 20,
        startDate: "2024-06-01",
        endDate: "2024-08-31",
        status: "active",
        applicableMovies: ["All Movies"],
        minPurchase: 0,
        maxDiscount: 50,
      },
      {
        key: "2",
        id: "P002",
        name: "Weekend Deal",
        description: "$5 off on weekend shows",
        discountType: "fixed",
        discountValue: 5,
        startDate: "2024-03-01",
        endDate: "2024-12-31",
        status: "active",
        applicableMovies: ["All Movies"],
        minPurchase: 20,
        maxDiscount: 5,
      },
    ];
    setPromotions(mockPromotions);
  }, []);

  // Calculate statistics
  const statistics = {
    totalPromotions: promotions.length,
    activePromotions: promotions.filter(p => p.status === "active").length,
    totalDiscountValue: promotions.reduce((sum, p) => sum + p.discountValue, 0),
    averageDiscount: promotions.length > 0 
      ? promotions.reduce((sum, p) => sum + p.discountValue, 0) / promotions.length 
      : 0
  };

  const columns: ColumnsType<Promotion> = [
    {
      title: "Promotion ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Discount",
      key: "discount",
      width: 120,
      render: (_, record) => {
        const value = record.discountType === "percentage" 
          ? `${record.discountValue}%` 
          : `$${record.discountValue}`;
        return <span className="font-medium">{value}</span>;
      },
    },
    {
      title: "Period",
      key: "period",
      width: 200,
      render: (_, record) => (
        <div className="text-sm">
          <div>From: {record.startDate}</div>
          <div>To: {record.endDate}</div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const color = status === "active" ? "green" : status === "expired" ? "red" : "orange";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Min Purchase",
      dataIndex: "minPurchase",
      key: "minPurchase",
      width: 120,
      render: (value: number) => value > 0 ? `$${value}` : "None",
    },
    {
      title: "Max Discount",
      dataIndex: "maxDiscount",
      key: "maxDiscount",
      width: 120,
      render: (value: number) => `$${value}`,
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="text-blue-600 hover:bg-blue-50"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            className="hover:bg-red-50"
          />
        </Space>
      ),
    },
  ];

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    form.setFieldsValue(promotion);
    setIsModalVisible(true);
  };

  const handleDelete = (promotion: Promotion) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this promotion?',
      content: `This will permanently delete the promotion "${promotion.name}"`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        // Implement delete logic
        console.log("Delete promotion:", promotion);
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      // Implement save logic
      console.log("Save promotion:", values);
      setIsModalVisible(false);
      form.resetFields();
      setEditingPromotion(null);
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingPromotion(null);
  };

  const filteredPromotions = promotions.filter(promotion =>
    promotion.name.toLowerCase().includes(searchText.toLowerCase()) ||
    promotion.id.toLowerCase().includes(searchText.toLowerCase()) ||
    promotion.description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 bg-blue-600 rounded-lg" />
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Promotion Management
            </h1>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingPromotion(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Promotion
          </Button>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Total Promotions"
                value={statistics.totalPromotions}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Active Promotions"
                value={statistics.activePromotions}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Total Discount Value"
                value={statistics.totalDiscountValue}
                prefix="$"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Average Discount"
                value={statistics.averageDiscount.toFixed(1)}
                prefix="$"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Search and Table Section */}
        <Card className="shadow-sm">
          <div className="mb-4 flex justify-between items-center">
            <AntInput
              placeholder="Search promotions..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => setSearchText("")}
            >
              Reset
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={filteredPromotions}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`
            }}
            scroll={{ x: 1200 }}
            rowClassName="hover:bg-gray-50"
          />
        </Card>

        {/* Modal */}
        <Modal
          title={editingPromotion ? "Edit Promotion" : "New Promotion"}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          width={600}
          okText={editingPromotion ? "Update" : "Create"}
          cancelText="Cancel"
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={editingPromotion || {}}
          >
            <Form.Item
              name="name"
              label="Promotion Name"
              rules={[{ required: true, message: "Please input promotion name!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: "Please input description!" }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item
              name="discountType"
              label="Discount Type"
              rules={[{ required: true, message: "Please select discount type!" }]}
            >
              <Select>
                <Select.Option value="percentage">Percentage</Select.Option>
                <Select.Option value="fixed">Fixed Amount</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="discountValue"
              label="Discount Value"
              rules={[{ required: true, message: "Please input discount value!" }]}
            >
              <InputNumber
                min={0}
                max={form.getFieldValue("discountType") === "percentage" ? 100 : undefined}
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[{ required: true, message: "Please select start date!" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="End Date"
              rules={[{ required: true, message: "Please select end date!" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select status!" }]}
            >
              <Select>
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="inactive">Inactive</Select.Option>
                <Select.Option value="expired">Expired</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="minPurchase"
              label="Minimum Purchase"
              rules={[{ required: true, message: "Please input minimum purchase amount!" }]}
            >
              <InputNumber
                min={0}
                prefix="$"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="maxDiscount"
              label="Maximum Discount"
              rules={[{ required: true, message: "Please input maximum discount amount!" }]}
            >
              <InputNumber
                min={0}
                prefix="$"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default PromotionManagement; 