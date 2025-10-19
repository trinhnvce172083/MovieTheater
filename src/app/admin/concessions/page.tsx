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
import { useIsMobile } from "@/hooks/use-mobile";

const { Title, Text } = Typography;

const formatPrice = (price: number) => {
  const roundedPrice = Math.round(price);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(roundedPrice);
};

// Helper function to round numbers for display
const roundNumber = (num: number) => Math.round(num);

export default function AdminConcessionsPage() {
  const isMobile = useIsMobile();
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
    <div className="space-y-4 sm:space-y-6">
      <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className={isMobile ? 'p-3' : 'p-4'}>
            <Statistic 
              title={<span className={isMobile ? 'text-xs' : 'text-sm'}>Total Concessions</span>} 
              value={filteredData.length} 
              prefix={<ShoppingOutlined className={isMobile ? 'text-sm' : 'text-base'} />} 
              valueStyle={{ fontSize: isMobile ? '16px' : '24px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={isMobile ? 'p-3' : 'p-4'}>
            <Statistic 
              title={<span className={isMobile ? 'text-xs' : 'text-sm'}>Highest Price</span>} 
              value={filteredData.length ? roundNumber(Math.max(...filteredData.map(c => c.price))) : 0} 
              precision={0} 
              prefix={<ArrowUpOutlined className={isMobile ? 'text-sm' : 'text-base'} />} 
              valueStyle={{ color: '#cf1322', fontSize: isMobile ? '16px' : '24px' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={isMobile ? 'p-3' : 'p-4'}>
            <Statistic 
              title={<span className={isMobile ? 'text-xs' : 'text-sm'}>Lowest Price</span>} 
              value={filteredData.length ? roundNumber(Math.min(...filteredData.map(c => c.price))) : 0} 
              precision={0} 
              prefix={<ArrowDownOutlined className={isMobile ? 'text-sm' : 'text-base'} />} 
              valueStyle={{ color: '#3f8600', fontSize: isMobile ? '16px' : '24px' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={isMobile ? 'p-3' : 'p-4'}>
            <Statistic
              title="Average Price" 
              value={filteredData.length ? Math.round((filteredData.reduce((a, b) => a + b.price, 0) / filteredData.length) * 100) / 100 : 0} 
              prefix={<DollarCircleOutlined />} 
              precision={0}
            />
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
              <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()} loading={loading} />
            </Tooltip>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
              Add New Concession
            </Button>
          </Space>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={16} lg={18}>
              <Input
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%' }}
                prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                allowClear
              />
            </Col>
            <Col xs={24} sm={8} lg={6}>
              <Button
                icon={<ReloadOutlined />}
                style={{ width: '100%' }}
                onClick={() => {
                  setSearchTerm("");
                  message.success("Search cleared successfully");
                }}
                disabled={!searchTerm}
              >
                Clear Search
              </Button>
            </Col>
          </Row>
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