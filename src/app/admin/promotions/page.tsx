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
    handleExportData, // <-- lấy từ usePromotions
  } = usePromotions();

  // Modal and selection state
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = React.useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [editingPromotion, setEditingPromotion] = React.useState(null);
  const [viewingPromotion, setViewingPromotion] = React.useState(null);
  const [selectedPromotion, setSelectedPromotion] = React.useState(null);
  const [form] = Form.useForm();

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

  // Xoá các khai báo trùng lặp của handleBulkDelete, handleDelete, handleExportData
  // Sửa các chỗ gọi fetchPromotions thành refreshPromotions
  // Giữ lại các hàm modal, selection, page change, reset, ...
  const handleModalOk = async () => {
    console.log("handleModalOk called"); // Debug log
    try {
      console.log("Starting form validation..."); // Debug log
      const values = await form.validateFields();
      console.log("Form values received:", values); // Debug log
      // Validate required fields
      if (!values.startDate || !values.endDate) {
        message.error("Please select start and end dates");
        return;
      }

      if (!values.promoCode || !values.name) {
        message.error("Please fill in all required fields");
        return;
      } // More thorough validation
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
        values.discountType === "BUY_ONE_GET_ONE" &&
        values.discountValue !== 1
      ) {
        // For BOGO, set discount value to 1
        values.discountValue = 1;
      }

      if (!values.status) {
        message.error("Please select promotion status");
        return;
      }

      if (!values.promotionType) {
        message.error("Please select promotion type");
        return;
      }
      if (!values.minPurchase && values.minPurchase !== 0) {
        message.error("Please enter minimum purchase amount");
        return;
      }

      if (!values.maxDiscount && values.maxDiscount !== 0) {
        message.error("Please enter maximum discount amount");
        return;
      }

      // Prepare data for backend with proper typing
      console.log("Form values before processing:", values);

      const payload: {
        promotionCode: string;
        promotionName: string;
        description: string;
        discountType: string;
        discountValue: number;
        isActive: boolean;
        startDate?: string;
        endDate?: string;
        minPurchaseAmount?: number;
        maxDiscountAmount?: number;
        pointsRequired?: number;
        maxUsageCount?: number;
        maxUsagePerUser?: number;
        memberOnly: boolean;
        isFeatured: boolean;
        promotionType: string;
        membershipLevels?: string;
      } = {
        promotionCode: values.promoCode.toString().toUpperCase().trim(),
        promotionName: values.name.toString().trim(),
        description: values.description?.toString()?.trim() || "",
        discountType: values.discountType || "PERCENTAGE",
        discountValue: Number(values.discountValue) || 0,
        isActive: values.status === "ACTIVE",
        memberOnly: Boolean(values.memberOnly),
        isFeatured: Boolean(values.isFeatured),
        promotionType: values.promotionType || "PUBLIC",
      };

      // Required fields with validation
      if (!values.promoCode?.trim()) {
        message.error("Promotion code is required");
        return;
      }
      if (!values.name?.trim()) {
        message.error("Promotion name is required");
        return;
      }

      // Date fields
      if (values.startDate) {
        payload.startDate = values.startDate?.format
          ? values.startDate.format("YYYY-MM-DD")
          : values.startDate;
      }
      if (values.endDate) {
        payload.endDate = values.endDate?.format
          ? values.endDate.format("YYYY-MM-DD")
          : values.endDate;
      }

      // Optional numeric fields - only include if they have valid values
      if (
        values.minPurchase !== undefined &&
        values.minPurchase !== null &&
        values.minPurchase !== ""
      ) {
        payload.minPurchaseAmount = Number(values.minPurchase);
      } else {
        payload.minPurchaseAmount = 0; // Default value
      }

      if (
        values.maxDiscount !== undefined &&
        values.maxDiscount !== null &&
        values.maxDiscount !== ""
      ) {
        payload.maxDiscountAmount = Number(values.maxDiscount);
      }

      if (
        values.pointsRequired !== undefined &&
        values.pointsRequired !== null &&
        values.pointsRequired !== ""
      ) {
        payload.pointsRequired = Number(values.pointsRequired);
      }

      if (
        values.maxUsageCount !== undefined &&
        values.maxUsageCount !== null &&
        values.maxUsageCount !== ""
      ) {
        payload.maxUsageCount = Number(values.maxUsageCount);
      }

      if (
        values.maxUsagePerUser !== undefined &&
        values.maxUsagePerUser !== null &&
        values.maxUsagePerUser !== ""
      ) {
        payload.maxUsagePerUser = Number(values.maxUsagePerUser);
      }

      // Boolean fields
      // payload.memberOnly = Boolean(values.memberOnly);
      // payload.isFeatured = Boolean(values.isFeatured);

      // String fields
      // payload.promotionType = values.promotionType || "PUBLIC";

      // Array field
      if (
        values.membershipLevels &&
        Array.isArray(values.membershipLevels) &&
        values.membershipLevels.length > 0
      ) {
        payload.membershipLevels = values.membershipLevels
          .filter(Boolean)
          .join(",");
      }

      console.log("Final payload:", payload); // Debug log
      console.log("Editing promotion:", editingPromotion); // Debug log

      // Check if we have access token
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error(
          "Login token not found. Please login again."
        );
      }

      let result: PromotionDto;
      if (editingPromotion) {
        // Update existing promotion
        console.log(
          "Updating promotion with ID:",
          editingPromotion.promotionId
        );
        result = await updatePromotion(editingPromotion.promotionId, payload as PromotionUpdateRequest);
      } else {
        // Create new promotion
        console.log("Creating new promotion");
        result = await createPromotion(payload as PromotionCreateRequest);
      }

      console.log("API call successful, result:", result);

      // Upload banner if provided
      if (values.banner && values.banner.length > 0) {
        const bannerFile = values.banner[0].originFileObj;
        await uploadPromotionBanner(result.promotionId, bannerFile);
      }

      toast.success(
        editingPromotion
          ? `Promotion updated successfully: ${
              result.promotionCode || result.promotionName
            }`
          : `New promotion created successfully: ${
              result.promotionCode || result.promotionName
            }`
      );

      // Refresh the data - wait a bit to ensure backend is updated
      setTimeout(() => {
        refreshPromotions();
      }, 500);

      setIsModalVisible(false);
      setEditingPromotion(null);
      form.resetFields();
    } catch (error) {
      console.error("Error saving promotion:", error);

      // Improved error handling
      let errorMessage = "Unable to save promotion";
      if (error.message) {
        errorMessage = error.message;
      }

      // Show user-friendly error message
      toast.error(errorMessage);

      // If it's a 401 error, might need to refresh token
      if (error.message && error.message.includes("401")) {
        toast.warning(
          "Login session may have expired. Please try again after refreshing the page."
        );
      }
    }
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
