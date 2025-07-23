"use client";

import React, { useState } from "react";
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
  Alert,
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
import { toast } from 'react-toastify';
import Image from "next/image";

// Import components
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
  const [editingPromotion, setEditingPromotion] = React.useState<PromotionDto | null>(null);
  const [viewingPromotion, setViewingPromotion] = React.useState<PromotionDto | null>(null);
  const [selectedPromotion, setSelectedPromotion] = React.useState<PromotionDto | null>(null);
  const [form] = Form.useForm();

  // Handlers
  const handleAdd = () => {
    setEditingPromotion(null);
    setIsModalVisible(true);
  };

  const handleEdit = (promotion: PromotionDto) => {
    setEditingPromotion(promotion);
    setIsModalVisible(true);
  };

  const handleView = (promotion: PromotionDto) => {
    setViewingPromotion(promotion);
    setIsViewModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Validate required fields
      if (!values.startDate || !values.endDate) {
        message.error("Please select start and end dates");
        return;
      }

      if (!values.promoCode || !values.name) {
        message.error("Please fill in all required fields");
        return;
      }

      if (!values.discountType || !values.discountValue) {
        message.error("Please select discount type and enter discount value");
        return;
      }

      // Validate discount value based on type
      if (
        values.discountType === "PERCENTAGE" &&
        (values.discountValue <= 0 || values.discountValue > 100)
      ) {
        message.error("Percentage discount must be between 1 and 100");
        return;
      }

      if (values.discountType === "FIXED_AMOUNT" && values.discountValue <= 0) {
        message.error("Fixed amount discount must be greater than 0");
        return;
      }

      if (
        values.discountType === "POINTS" &&
        (!values.pointsRequired || values.pointsRequired <= 0)
      ) {
        message.error("Please enter points required for points discount");
        return;
      }

      if (!values.status) {
        message.error("Please select promotion status");
        return;
      }

      if (!values.promotionType) {
        message.error("Please select promotion type");
        return;
      }

      // Call the save function from usePromotions hook
      const success = await handleSavePromotion(values, editingPromotion);
      
      if (success) {
        setIsModalVisible(false);
        setEditingPromotion(null);
        form.resetFields();
      }
    } catch (error) {
      console.error("Error saving promotion:", error);
      toast.error("Unable to save promotion");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingPromotion(null);
    form.resetFields();
  };

  const handleViewModalClose = () => {
    setIsViewModalVisible(false);
    setViewingPromotion(null);
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedPromotion(null);
  };

  const handleSelectionChange = (keys: React.Key[], rows: PromotionDto[]) => {
    setSelectedRowKeys(keys);
    setSelectedPromotions(rows);
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
    // Gọi lại fetchPromotions với page - 1 nếu backend phân trang từ 0
    // Nếu usePromotions đã tự động fetch khi currentPage thay đổi thì không cần gọi lại ở đây
  };

  const handleReset = () => {
    setSearchTerm("");
    refreshPromotions();
  };

  const handleExportData = () => {
    // Simple export function - can be enhanced later
    toast.info("Export feature coming soon!");
  };

  return (
    <div>
      {totalCount < 7 && (
        <Alert
          message="Chỉ hiển thị các khuyến mãi đang hoạt động. Nếu không thấy promotion mới tạo, hãy kiểm tra ngày bắt đầu/kết thúc và trạng thái active."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
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
        form={form}
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
