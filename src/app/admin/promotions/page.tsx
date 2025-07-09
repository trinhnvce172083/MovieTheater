"use client";

import React, { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
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
  Switch,
  Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  CalendarOutlined,
  DollarOutlined,
  GiftOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import { PromotionDto } from "@/types/Admin/promotion";
import {
  getAllPromotions,
  deletePromotion,
  activatePromotion,
  deactivatePromotion,
  getPromotionUsage,
  createPromotion,
  updatePromotion,
  uploadPromotionBanner,
  updatePromotionBanner,
  deletePromotionBanner,
  type PromotionCreateRequest,
  type PromotionUpdateRequest,
  type PromotionSearchParams
} from '@/api/admin/getAllPromotions';
import { toast } from 'react-toastify';
import Image from "next/image";

// Đảm bảo các import component như sau:
import { usePromotions } from './hooks/usePromotions';
import { PromotionTable } from './components/PromotionTable';
import { PromotionFilters } from './components/PromotionFilters';
import { PromotionHeader } from './components/PromotionHeader';
import { PromotionModal } from './components/PromotionModal';
import { PromotionViewModal } from './components/PromotionViewModal';
import PromotionDetailModal from './components/PromotionDetailModal';

const { Option } = Select;
const { Title, Text } = Typography;

// Promotion Management Component
export default function PromotionPage() {
  const {
    promotions,
    loading,
    totalCount,
    currentPage,
    pageSize,
    searchTerm,
    selectedRowKeys,
    selectedPromotions,
    statistics,
    setCurrentPage,
    setPageSize,
    setSearchTerm,
    setSelectedRowKeys,
    setSelectedPromotions,
    handleDelete,
    handleBulkDelete,
    handleSavePromotion,
    refreshPromotions,
  } = usePromotions();

  // Modal and selection state
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = React.useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [editingPromotion, setEditingPromotion] = React.useState(null);
  const [viewingPromotion, setViewingPromotion] = React.useState(null);
  const [selectedPromotion, setSelectedPromotion] = React.useState(null);

  // Handlers
  const handleAdd = () => {
    setEditingPromotion(null);
    setIsModalVisible(true);
  };
  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setIsModalVisible(true);
  };
  const handleView = (promotion) => {
    setViewingPromotion(promotion);
    setIsViewModalVisible(true);
  };
  const handleModalOk = () => {
      setIsModalVisible(false);
      setEditingPromotion(null);
  };
  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingPromotion(null);
  };
  const handleViewModalClose = () => {
    setIsViewModalVisible(false);
    setViewingPromotion(null);
  };
  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedPromotion(null);
  };
  const handleSelectionChange = (keys, rows) => {
    setSelectedRowKeys(keys);
    setSelectedPromotions(rows);
  };
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };
  const handleExportData = () => {
    // ...export logic...
  };
  const handleReset = () => {
    setSearchTerm("");
    refreshPromotions();
  };
        
        return (
            <div>
      <PromotionHeader
        statistics={statistics}
        selectedRowKeys={selectedRowKeys}
        onAdd={handleAdd}
        onExport={handleExportData}
        onBulkDelete={handleBulkDelete}
      />
      <PromotionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onReset={handleReset}
      />
      <PromotionTable
        promotions={promotions}
        loading={loading}
        currentPage={currentPage}
                pageSize={pageSize}
        totalCount={totalCount}
        selectedRowKeys={selectedRowKeys}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onSelectionChange={handleSelectionChange}
        onPageChange={handlePageChange}
      />
      <PromotionModal
        isVisible={isModalVisible}
        editingPromotion={editingPromotion}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        handleSavePromotion={handleSavePromotion}
      />
      <PromotionViewModal
        isVisible={isViewModalVisible}
        promotion={viewingPromotion}
        onClose={handleViewModalClose}
        onEdit={handleEdit}
      />
      <PromotionDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
        promotion={selectedPromotion}
      />
    </div>
  );
}
