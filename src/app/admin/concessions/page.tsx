"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Tooltip,
  Popconfirm,
  message,
  Card,
  Input,
  Typography,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  InputNumber
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  DollarCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from "@ant-design/icons";
import concessionApi from "@/api/concessionApi";
import { Concession } from "@/types/Concession";

const { Title, Text } = Typography;

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export default function AdminConcessionsPage() {
  const [concessions, setConcessions] = useState<Concession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingConcession, setEditingConcession] = useState<Concession | null>(null);
  const [form] = Form.useForm();

  const fetchConcessions = async () => {
    try {
      setLoading(true);
      const response = await concessionApi.getAll();
      setConcessions(response.data || []);
    } catch (error) {
      console.error("Failed to fetch concessions:", error);
      message.error("Failed to fetch concessions. Please check the API connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcessions();
  }, []);

  const statistics = useMemo(() => {
    if (concessions.length === 0) {
      return { total: 0, highestPrice: 0, lowestPrice: 0, averagePrice: 0 };
    }
    const prices = concessions.map(c => c.price);
    const total = concessions.length;
    const sum = prices.reduce((a, b) => a + b, 0);
    return {
      total,
      highestPrice: Math.max(...prices),
      lowestPrice: Math.min(...prices),
      averagePrice: total > 0 ? sum / total : 0,
    };
  }, [concessions]);

  const showModal = (concession: Concession | null = null) => {
    setEditingConcession(concession);
    if (concession) {
      form.setFieldsValue(concession);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingConcession(null);
    form.resetFields();
  };

  const handleFormSubmit = async (values: Omit<Concession, 'id'>) => {
    try {
      if (editingConcession) {
        await concessionApi.update(editingConcession.id, values);
        message.success(`Concession "${values.name}" updated successfully!`);
      } else {
        await concessionApi.add(values);
        message.success(`Concession "${values.name}" added successfully!`);
      }
      fetchConcessions(); // Refresh data
      handleCancel();
    } catch (error) {
      console.error("Failed to save concession:", error);
      message.error("Failed to save concession. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await concessionApi.delete(id);
      message.success(`Successfully deleted concession ID: ${id}`);
      fetchConcessions(); // Refresh data
    } catch(error) {
      console.error("Failed to delete concession:", error);
      message.error("Failed to delete concession. Please try again.");
    }
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_: any, record: any, index: number) => (
        <Text type="secondary">{index + 1}</Text>
      ),
    },
    {
      title: 'Name & Description',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Concession, b: Concession) => a.name.localeCompare(b.name),
      render: (name: string, record: Concession) => (
        <div>
          <Text strong>{name}</Text>
          <br/>
          <Text type="secondary" style={{fontSize: '12px'}}>{record.description}</Text>
        </div>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      align: 'right' as const,
      render: (price: number) => formatPrice(price),
      sorter: (a: Concession, b: Concession) => a.price - b.price,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: Concession) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} className="text-blue-600 hover:bg-blue-50" onClick={() => showModal(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Concession"
              description={`Are you sure to delete "${record.name}"?`}
              onConfirm={() => handleDelete(record.id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} className="hover:bg-red-50" />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredData = concessions.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
       <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
            <Card>
                <Statistic title="Total Concessions" value={statistics.total} prefix={<ShoppingOutlined />} />
            </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
            <Card>
                <Statistic title="Highest Price" value={formatPrice(statistics.highestPrice)} precision={0} prefix={<ArrowUpOutlined />} valueStyle={{ color: '#cf1322' }}/>
            </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
            <Card>
                <Statistic title="Lowest Price" value={formatPrice(statistics.lowestPrice)} precision={0} prefix={<ArrowDownOutlined />} valueStyle={{ color: '#3f8600' }}/>
            </Card>
        </Col>
         <Col xs={24} sm={12} lg={6}>
            <Card>
                <Statistic title="Average Price" value={formatPrice(statistics.averagePrice)} prefix={<DollarCircleOutlined />}/>
            </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <Title level={4} style={{ margin: 0 }}>Concession Management</Title>
              <Text type="secondary">Manage and organize your cinema's concession list</Text>
            </div>
            <Space>
                <Tooltip title="Reload data">
                    <Button icon={<ReloadOutlined />} onClick={fetchConcessions} loading={loading}/>
                </Tooltip>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                    Add New Concession
                </Button>
            </Space>
        </div>

        <div style={{ marginBottom: 16 }}>
             <Input
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%' }}
                prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, size: 'default' }}
          bordered
        />
      </Card>
      
      <Modal
        title={editingConcession ? "Edit Concession" : "Add New Concession"}
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okText="Save"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit} initialValues={{ name: '', description: '', price: 0 }}>
            <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter the concession name!' }]}>
                <Input />
            </Form.Item>
            <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter a description!' }]}>
                <Input.TextArea rows={4} />
            </Form.Item>
             <Form.Item name="price" label="Price" rules={[{ required: true, message: 'Please enter the price!' }]}>
                <InputNumber
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 