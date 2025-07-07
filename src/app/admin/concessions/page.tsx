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
import { getAllConcessions, addConcession, updateConcession, deleteConcession } from './concessionService';
import { Concession } from "@/types/Concession";
import ConcessionImageUpload from './ConcessionImageUpload';
import ConcessionTable from './ConcessionTable';
import ConcessionForm from './ConcessionForm';
import useConcessions from './useConcessions';

const { Title, Text } = Typography;

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export default function AdminConcessionsPage() {
  const {
    loading,
    formLoading,
    searchTerm,
    setSearchTerm,
    isModalVisible,
    editingConcession,
    imageFile,
    setImageFile,
    filteredData,
    showModal,
    handleCancel,
    handleFormSubmit,
    handleDelete,
  } = useConcessions();

  const { Title, Text } = Typography;

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Total Concessions" value={filteredData.length} prefix={<ShoppingOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Highest Price" value={filteredData.length ? Math.max(...filteredData.map(c => c.price)) : 0} precision={0} prefix={<ArrowUpOutlined />} valueStyle={{ color: '#cf1322' }}/>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Lowest Price" value={filteredData.length ? Math.min(...filteredData.map(c => c.price)) : 0} precision={0} prefix={<ArrowDownOutlined />} valueStyle={{ color: '#3f8600' }}/>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Average Price" value={filteredData.length ? (filteredData.reduce((a, b) => a + b.price, 0) / filteredData.length) : 0} prefix={<DollarCircleOutlined />}/>
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>Concession Management</Title>
            <Text type="secondary">Manage and organize your cinema&apos;s concession list</Text>
          </div>
          <Space>
            <Tooltip title="Reload data">
              <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()} loading={loading}/>
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

        <ConcessionTable
          data={filteredData}
          loading={loading}
          onEdit={showModal}
          onDelete={handleDelete}
        />
      </Card>

      <ConcessionForm
        visible={isModalVisible}
        initialValues={editingConcession || undefined}
        onSubmit={handleFormSubmit}
        onCancel={handleCancel}
        loading={formLoading}
        imageFile={imageFile}
        setImageFile={setImageFile}
        isEdit={!!editingConcession}
      />
    </div>
  );
} 