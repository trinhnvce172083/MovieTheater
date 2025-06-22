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
import Image from "next/image";

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Promotion Management Component
export default function ProfessionalPromotionManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewingPromotion, setViewingPromotion] = useState<PromotionDto | null>(
    null
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedPromotions, setSelectedPromotions] = useState<PromotionDto[]>(
    []
  );
  const [editingPromotion, setEditingPromotion] = useState<PromotionDto | null>(
    null
  );
  const [form] = Form.useForm();

  // Thay thế dữ liệu tĩnh bằng API call
  const [promotions, setPromotions] = useState<PromotionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch data from API
  const fetchPromotions = async (
    page = 0,
    pageSize = 10,
    sortBy = "startDate",
    sortDirection = "desc",
    isActive = null
  ) => {
    try {
      setLoading(true);
      let url = `http://localhost:8080/cinema/api/promotions?page=${page}&size=${pageSize}&sortBy=${sortBy}&sortDirection=${sortDirection}`;

      if (isActive !== null) {
        url += `&isActive=${isActive}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      setPromotions(data.content || []);
      setTotalCount(data.totalElements || 0);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      message.error("Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };
  // Gọi API khi component mount hoặc các tham số thay đổi
  useEffect(() => {
    fetchPromotions(currentPage - 1, pageSize, "startDate", "desc", null);
  }, [currentPage, pageSize]);

  // Filter and search logic
  const filteredData = useMemo(() => {
    return promotions.filter((promotion) => {
      const matchesSearch =
        (promotion.promotionName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (promotion.promotionId || "")
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (promotion.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [searchTerm, promotions]);
  // Statistics calculations
  const statistics = useMemo(() => {
    const totalPromotions = promotions.length;
    const activePromotions = promotions.filter(
      (p) => p.isActive && !p.isExpired
    ).length;
    const pointsPromotions = promotions.filter(
      (p) => p.isPointsPromotion
    ).length;
    const featuredPromotions = promotions.filter((p) => p.isFeatured).length;

    return {
      totalPromotions,
      activePromotions,
      pointsPromotions,
      featuredPromotions,
    };
  }, [promotions]);
  const handleAdd = () => {
    setEditingPromotion(null);
    form.resetFields();
    // Set some default values to prevent validation errors
    form.setFieldsValue({
      status: "ACTIVE",
      promotionType: "PUBLIC",
      discountType: "PERCENTAGE",
      discountValue: 10, // Default to 10%
      memberOnly: false,
      isFeatured: false,
      minPurchase: 10000, // Default minimum purchase
      maxDiscount: 100000, // Default maximum discount
    });
    setIsModalVisible(true);
  };
  const handleEdit = (record: PromotionDto) => {
    console.log("Editing promotion record:", record); // Debug log
    setEditingPromotion(record);

    // Convert backend data to form format
    const formData = {
      name: record.promotionName || "",
      description: record.description || "",
      discountType: record.discountType || "PERCENTAGE",
      discountValue: record.discountValue || 0,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
      status: record.isActive ? "ACTIVE" : "INACTIVE",
      minPurchase: record.minPurchaseAmount || 0,
      maxDiscount: record.maxDiscountAmount || 0,
      promoCode: record.promotionCode || "",
      promotionType: record.promotionType || "PUBLIC",
      memberOnly: Boolean(record.memberOnly),
      pointsRequired: record.pointsRequired || "",
      membershipLevels: record.membershipLevels
        ? record.membershipLevels.split(",").filter(Boolean)
        : [],
      maxUsageCount: record.maxUsageCount || "",
      maxUsagePerUser: record.maxUsagePerUser || "",
      isFeatured: Boolean(record.isFeatured),
    };

    console.log("Form data being set:", formData); // Debug log
    form.setFieldsValue(formData);
    setIsModalVisible(true);
  };
  const handleView = (record: PromotionDto) => {
    setViewingPromotion(record);
    setIsViewModalVisible(true);
  };

  const handleBulkDelete = async () => {
    try {
      const promises = selectedPromotions.map((promotion) =>
        fetch(
          `http://localhost:8080/cinema/api/promotions/${promotion.promotionId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        )
      );

      await Promise.all(promises);
      message.success(
        `Deleted ${selectedPromotions.length} promotions successfully`
      );
      setSelectedRowKeys([]);
      setSelectedPromotions([]);
      fetchPromotions(currentPage - 1, pageSize);
    } catch (error) {
      console.error("Error bulk deleting:", error);
      message.error("Failed to delete some promotions");
    }
  };

  const handleExportData = () => {
    const exportData = filteredData.map((promotion) => ({
      "Promotion Code": promotion.promotionCode,
      "Promotion Name": promotion.promotionName,
      Description: promotion.description,
      "Discount Type": promotion.discountType,
      "Discount Value": promotion.discountDisplay,
      "Min Purchase": promotion.minPurchaseAmount,
      "Max Discount": promotion.maxDiscountAmount || "N/A",
      "Start Date": promotion.startDate,
      "End Date": promotion.endDate,
      Status: promotion.statusDisplay,
      Usage: promotion.usageDisplay,
      Membership: promotion.membershipDisplay,
      "Promotion Type": promotion.promotionTypeDisplay,
      "Points Required": promotion.pointsDisplay || "N/A",
      Featured: promotion.isFeatured ? "Yes" : "No",
      "Created At": promotion.createdAt,
    }));

    const csvContent =
      "data:text/csv;charset=utf-8," +
      Object.keys(exportData[0]).join(",") +
      "\n" +
      exportData
        .map((row) =>
          Object.values(row)
            .map((val) => `"${val}"`)
            .join(",")
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `promotions-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success("Data exported successfully");
  };
  const handleDelete = async (record: PromotionDto) => {
    try {
      const response = await fetch(
        `http://localhost:8080/cinema/api/promotions/${record.promotionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete promotion: ${response.status}`);
      }

      message.success(`Deleted "${record.promotionName}" successfully`);

      // Refresh the data
      fetchPromotions(currentPage - 1, pageSize);
    } catch (error) {
      console.error("Error deleting promotion:", error);
      message.error(`Failed to delete promotion: ${error.message}`);
    }
  };
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

      // Prepare data for backend - more careful validation
      console.log("Form values before processing:", values);

      const payload: any = {};

      // Required fields with validation
      if (!values.promoCode?.trim()) {
        message.error("Mã promotion là bắt buộc");
        return;
      }
      if (!values.name?.trim()) {
        message.error("Tên promotion là bắt buộc");
        return;
      }

      payload.promotionCode = values.promoCode.toString().toUpperCase().trim();
      payload.promotionName = values.name.toString().trim();
      payload.description = values.description?.toString()?.trim() || "";
      payload.discountType = values.discountType || "PERCENTAGE";
      payload.discountValue = Number(values.discountValue) || 0;
      payload.isActive = values.status === "ACTIVE";

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
      payload.memberOnly = Boolean(values.memberOnly);
      payload.isFeatured = Boolean(values.isFeatured);

      // String fields
      payload.promotionType = values.promotionType || "PUBLIC";

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
          "Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại."
        );
      }

      let response;
      if (editingPromotion) {
        // Cập nhật khuyến mãi
        console.log(
          "Updating promotion with ID:",
          editingPromotion.promotionId
        );
        response = await fetch(
          `http://localhost:8080/cinema/api/promotions/${editingPromotion.promotionId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        // Tạo khuyến mãi mới
        console.log("Creating new promotion");
        response = await fetch("http://localhost:8080/cinema/api/promotions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });
      }
      if (!response.ok) {
        let errorMessage = `Lỗi server: ${response.status} - ${response.statusText}`;
        console.error("Request failed:", {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          method: editingPromotion ? "PUT" : "POST",
          payload: payload,
          headers: response.headers,
        });

        try {
          const errorData = await response.text();
          console.error("Server error response:", errorData);

          // Try to parse as JSON for better error messages
          if (errorData && errorData.trim()) {
            try {
              const errorJson = JSON.parse(errorData);
              if (errorJson.message) {
                errorMessage = errorJson.message;
              } else if (errorJson.error) {
                errorMessage = errorJson.error;
              } else if (errorJson.details) {
                errorMessage = errorJson.details;
              } else if (typeof errorJson === "string") {
                errorMessage = errorJson;
              }
            } catch (e) {
              // If not JSON, use the raw text if it's meaningful
              if (errorData.length < 200) {
                errorMessage = errorData;
              }
            }
          }
        } catch (e) {
          console.error("Could not read error response:", e);
        }

        // Show specific error messages
        if (response.status === 403) {
          errorMessage =
            "Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ admin để được cấp quyền.";
        } else if (response.status === 401) {
          errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
          // Optionally redirect to login
          // window.location.href = '/login';
        } else if (response.status === 400) {
          errorMessage = `Dữ liệu gửi lên không hợp lệ: ${errorMessage}`;
        } else if (response.status === 500) {
          errorMessage = "Lỗi server nội bộ. Vui lòng thử lại sau.";
        } else if (response.status === 404) {
          errorMessage = "Không tìm thấy promotion cần chỉnh sửa.";
        }

        throw new Error(errorMessage);
      }

      console.log("Response successful, parsing result...");
      let result;
      try {
        const responseText = await response.text();
        console.log("Raw response:", responseText);

        if (responseText) {
          result = JSON.parse(responseText);
        } else {
          // If response is empty but successful, create a default result
          result = {
            promotionId: editingPromotion?.promotionId,
            promotionCode: payload.promotionCode,
            promotionName: payload.promotionName,
          };
        }
      } catch (e) {
        console.error("Error parsing response:", e);
        // If we can't parse but response was ok, assume success
        result = {
          promotionId: editingPromotion?.promotionId,
          promotionCode: payload.promotionCode,
          promotionName: payload.promotionName,
        };
      }

      console.log("Parsed result:", result);

      // Upload banner nếu có
      if (values.banner && values.banner.length > 0) {
        const bannerFormData = new FormData();
        bannerFormData.append("banner", values.banner[0].originFileObj);

        await fetch(
          `http://localhost:8080/cinema/api/promotions/${result.promotionId}/banner`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            body: bannerFormData,
          }
        );
      }
      message.success(
        editingPromotion
          ? `Cập nhật promotion thành công: ${
              result.promotionCode || result.promotionName
            }`
          : `Tạo promotion mới thành công: ${
              result.promotionCode || result.promotionName
            }`
      );

      // Refresh the data - wait a bit to ensure backend is updated
      setTimeout(() => {
        fetchPromotions(currentPage - 1, pageSize);
      }, 500);

      setIsModalVisible(false);
      setEditingPromotion(null);
      form.resetFields();
    } catch (error) {
      console.error("Error saving promotion:", error);

      // Improved error handling
      let errorMessage = "Không thể lưu promotion";
      if (error.message) {
        errorMessage = error.message;
      }

      // Show user-friendly error message
      message.error(errorMessage);

      // If it's a 401 error, might need to refresh token
      if (error.message && error.message.includes("401")) {
        message.warning(
          "Phiên đăng nhập có thể đã hết hạn. Vui lòng thử lại sau khi refresh trang."
        );
      }
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingPromotion(null);
    form.resetFields();
  };
  const columns: ColumnsType<PromotionDto> = [
    {
      title: "#",
      dataIndex: "promotionId",
      key: "promotionId",
      width: 60,
      render: (_: any, record: PromotionDto, index: number) => (
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
      render: (_: any, record: PromotionDto) => (
        <div className="flex items-center gap-3">
          {record.bannerUrl ? (
            <Avatar
              src={record.bannerUrl}
              size={40}
              className="flex-shrink-0"
            />
          ) : (
            <Avatar
              icon={<GiftOutlined />}
              size={40}
              className="bg-purple-100 text-purple-600 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 mb-1 truncate text-sm">
              {record.promotionName}
            </div>
            <div className="text-xs text-gray-600 mb-1 truncate">
              {record.description}
            </div>{" "}
            <div className="flex items-center gap-1 flex-wrap">
              <Tag color="purple" className="text-xs m-0">
                {record.promotionCode}
              </Tag>
              <Tag color="cyan" className="text-xs m-0">
                {record.promotionTypeDisplay}
              </Tag>
              {record.isPointsPromotion && (
                <Tag color="orange" className="text-xs m-0">
                  {record.pointsDisplay}
                </Tag>
              )}
              {record.memberOnly && (
                <Tag color="green" className="text-xs m-0">
                  Member Only
                </Tag>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Discount",
      key: "discount",
      width: 120,
      render: (_: any, record: PromotionDto) => {
        let displayValue;

        if (record.discountType === "BUY_ONE_GET_ONE") {
          displayValue = "BOGO";
        } else if (record.discountType?.toLowerCase().includes("percentage")) {
          displayValue = `${record.discountValue}%`;
        } else {
          // For FIXED_AMOUNT, format as VND
          displayValue =
            Number(record.discountValue).toLocaleString("vi-VN") + " ₫";
        }

        const colorMap = {
          PERCENTAGE: "blue",
          FIXED_AMOUNT: "green",
          BUY_ONE_GET_ONE: "purple",
        };

        const labelMap = {
          PERCENTAGE: "Percentage",
          FIXED_AMOUNT: "Fixed Amount",
          BUY_ONE_GET_ONE: "Buy One Get One",
        };
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900 mb-1">{displayValue}</div>
            <Tag
              color={colorMap[record.discountType] || "blue"}
              className="text-xs"
            >
              {labelMap[record.discountType] || record.discountType}
            </Tag>{" "}
            {record.maxDiscountAmount && record.maxDiscountAmount > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Max: {Number(record.maxDiscountAmount).toLocaleString("vi-VN")}{" "}
                ₫
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Period",
      key: "period",
      width: 150,
      render: (_: any, record: PromotionDto) => (
        <div className="text-sm">
          <div className="text-gray-900 mb-1">
            {new Date(record.startDate).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">
            to {new Date(record.endDate).toLocaleDateString()}
          </div>
          {record.validityDisplay && (
            <div className="text-xs text-blue-600 mt-1">
              {record.validityDisplay}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 100,
      align: "center" as const,
      render: (_: any, record: PromotionDto) => {
        // Use the pre-calculated statusDisplay from backend
        const status =
          record.statusDisplay ||
          (record.isExpired
            ? "expired"
            : record.isActive
            ? "active"
            : "inactive");

        let color = "default";
        if (record.isActive && !record.isExpired) color = "success";
        else if (record.isExpired) color = "error";
        else color = "warning";
        return (
          <div className="text-center">
            <Tag color={color} className="font-medium text-xs">
              {status}
            </Tag>
            {record.isFeatured && (
              <div className="text-xs text-orange-500 mt-1">Featured</div>
            )}
          </div>
        );
      },
    },
    {
      title: "Usage",
      dataIndex: "currentUsageCount",
      key: "currentUsageCount",
      width: 80,
      align: "center" as const,
      render: (count: number, record: PromotionDto) => (
        <div className="text-center">
          <div className="text-sm font-medium">{count || 0}</div>
          <div className="text-xs text-gray-500">
            {record.usageDisplay || `${count || 0} times`}
          </div>
          {record.remainingUsage && record.remainingUsage !== 2147483647 && (
            <div className="text-xs text-blue-600">
              {record.remainingUsage} left
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Min Purchase",
      dataIndex: "minPurchaseAmount",
      key: "minPurchaseAmount",
      width: 100,
      align: "right" as const,
      render: (value: number) => (
        <div className="text-right">
          {" "}
          <span className="font-mono text-sm">
            {value && value > 0
              ? `${Number(value).toLocaleString("vi-VN")} ₫`
              : "None"}
          </span>
        </div>
      ),
    },
    {
      title: "Membership",
      key: "membership",
      width: 120,
      render: (_: any, record: PromotionDto) => (
        <div className="text-sm">
          <div className="text-gray-900 mb-1">
            {record.membershipDisplay ||
              (record.memberOnly ? "Members Only" : "All Users")}
          </div>
          {record.applicabilityDisplay && (
            <div className="text-xs text-gray-500">
              {record.applicabilityDisplay}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right" as const,
      align: "center" as const,
      render: (_: any, record: PromotionDto) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              className="text-blue-600 hover:bg-blue-50"
              onClick={() => handleView(record)}
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
              description={`Are you sure you want to delete "${record.promotionName}"?`}
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
    <div className="min-h-screen transition-colors duration-200">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={12} lg={6}>
            <Card
              className="text-center border-0 shadow-sm h-32 flex flex-col justify-center"
              size="small"
            >
              <Statistic
                title="Total Promotions"
                value={statistics.totalPromotions}
                prefix={<GiftOutlined className="text-blue-600" />}
                valueStyle={{ color: "#1677ff", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card
              className="text-center border-0 shadow-sm h-32 flex flex-col justify-center"
              size="small"
            >
              <Statistic
                title="Active Promotions"
                value={statistics.activePromotions}
                prefix={<CalendarOutlined className="text-green-600" />}
                valueStyle={{ color: "#52c41a", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>{" "}
          <Col xs={12} sm={12} lg={6}>
            <Card
              className="text-center border-0 shadow-sm h-32 flex flex-col justify-center"
              size="small"
            >
              <Statistic
                title="Points Promotions"
                value={statistics.pointsPromotions}
                prefix={<DollarOutlined className="text-purple-600" />}
                valueStyle={{ color: "#722ed1", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card
              className="text-center border-0 shadow-sm h-32 flex flex-col justify-center"
              size="small"
            >
              <Statistic
                title="Featured Promotions"
                value={statistics.featuredPromotions}
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
              <Title
                level={2}
                className="m-0 text-gray-900 text-xl xl:text-2xl"
              >
                Promotion Management
              </Title>
              <Text type="secondary" className="text-sm xl:text-base">
                Manage and organize your cinema's promotional campaigns
              </Text>
            </div>{" "}
            <div className="flex items-center gap-3">
              {" "}
              {selectedRowKeys.length > 0 && (
                <Space>
                  <Popconfirm
                    title="Bulk Delete"
                    description={`Delete ${selectedRowKeys.length} selected promotions? This action cannot be undone.`}
                    onConfirm={handleBulkDelete}
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                  >
                    <Button size="small" danger>
                      Delete Selected ({selectedRowKeys.length})
                    </Button>
                  </Popconfirm>
                </Space>
              )}
              <Button
                icon={<ReloadOutlined />}
                size="middle"
                className="border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500"
                onClick={() => fetchPromotions(currentPage - 1, pageSize)}
              >
                Refresh
              </Button>
              <Button
                size="middle"
                className="border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-500"
                onClick={handleExportData}
              >
                Export CSV
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="middle"
                className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm text-xs xl:text-sm h-10 px-4"
                onClick={handleAdd}
              >
                Add New Promotion
              </Button>
            </div>
          </div>{" "}
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
              <Col xs={12} sm={6} lg={3} xl={3}>
                <Button
                  icon={<ReloadOutlined />}
                  className="w-full h-10 px-4"
                  size="middle"
                  onClick={() => {
                    setSearchTerm("");
                  }}
                >
                  Reset
                </Button>
              </Col>
            </Row>
          </div>
          {/* Table Section */}
          <div className="bg-white">
            {" "}
            <Table
              dataSource={filteredData}
              columns={columns}
              pagination={false}
              scroll={{ x: 1200 }}
              className="professional-table"
              size="small"
              loading={loading}
              rowSelection={{
                selectedRowKeys,
                onChange: (
                  selectedRowKeys: React.Key[],
                  selectedRows: PromotionDto[]
                ) => {
                  setSelectedRowKeys(selectedRowKeys);
                  setSelectedPromotions(selectedRows);
                },
                getCheckboxProps: (record: PromotionDto) => ({
                  name: record.promotionCode,
                }),
              }}
              rowKey="promotionId"
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
        {" "}
        <Form form={form} layout="vertical" className="mt-6">
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
                        // Generate random alphanumeric code
                        const randomCode = Math.random()
                          .toString(36)
                          .substring(2, 8)
                          .toUpperCase();
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
                    form.getFieldValue("discountType") === "PERCENTAGE"
                      ? 100
                      : undefined
                  }
                  className="w-full h-10"
                  placeholder={
                    form.getFieldValue("discountType") === "PERCENTAGE"
                      ? "Enter percentage (1-100)"
                      : form.getFieldValue("discountType") === "BUY_ONE_GET_ONE"
                      ? "1"
                      : "Enter amount in VND"
                  }
                  disabled={
                    form.getFieldValue("discountType") === "BUY_ONE_GET_ONE"
                  }
                  value={
                    form.getFieldValue("discountType") === "BUY_ONE_GET_ONE"
                      ? 1
                      : undefined
                  }
                  addonAfter={
                    form.getFieldValue("discountType") === "PERCENTAGE"
                      ? "%"
                      : form.getFieldValue("discountType") === "FIXED_AMOUNT"
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
                    form.getFieldValue("promotionType") !== "POINT_BASED"
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

      {/* View Promotion Details Modal */}
      <Modal
        title={`Promotion Details: ${viewingPromotion?.promotionName || ""}`}
        open={isViewModalVisible}
        onCancel={() => {
          setIsViewModalVisible(false);
          setViewingPromotion(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setIsViewModalVisible(false);
              setViewingPromotion(null);
            }}
          >
            Close
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setIsViewModalVisible(false);
              if (viewingPromotion) {
                handleEdit(viewingPromotion);
              }
            }}
          >
            Edit Promotion
          </Button>,
        ]}
        width={900}
        className="professional-modal"
      >
        {viewingPromotion && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Basic Information
              </h3>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Promotion Code
                    </label>
                    <div className="text-base font-mono bg-gray-50 p-2 rounded">
                      {viewingPromotion.promotionCode}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Promotion Name
                    </label>
                    <div className="text-base bg-gray-50 p-2 rounded">
                      {viewingPromotion.promotionName}
                    </div>
                  </div>
                </Col>
                <Col xs={24}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Description
                    </label>
                    <div className="text-base bg-gray-50 p-2 rounded">
                      {viewingPromotion.description}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Discount Information */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Discount Information
              </h3>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Discount Type
                    </label>
                    <div className="text-base bg-gray-50 p-2 rounded">
                      <Tag
                        color={
                          viewingPromotion.discountType === "PERCENTAGE"
                            ? "blue"
                            : viewingPromotion.discountType === "FIXED_AMOUNT"
                            ? "green"
                            : "purple"
                        }
                      >
                        {viewingPromotion.discountType}
                      </Tag>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Discount Value
                    </label>
                    <div className="text-base bg-gray-50 p-2 rounded font-medium">
                      {viewingPromotion.discountDisplay}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Min Purchase
                    </label>
                    <div className="text-base bg-gray-50 p-2 rounded">
                      {viewingPromotion.minPurchaseAmount?.toLocaleString()}₫
                    </div>
                  </div>
                </Col>
                {viewingPromotion.maxDiscountAmount && (
                  <Col xs={24} sm={8}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">
                        Max Discount
                      </label>
                      <div className="text-base bg-gray-50 p-2 rounded">
                        {viewingPromotion.maxDiscountAmount.toLocaleString()}₫
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </div>

            {/* Validity & Usage */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Validity & Usage
              </h3>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Validity Period
                    </label>
                    <div className="text-base bg-gray-50 p-2 rounded">
                      {viewingPromotion.validityDisplay}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Status
                    </label>
                    <div className="text-base bg-gray-50 p-2 rounded">
                      <Tag
                        color={
                          viewingPromotion.isActive &&
                          !viewingPromotion.isExpired
                            ? "success"
                            : viewingPromotion.isExpired
                            ? "error"
                            : "warning"
                        }
                      >
                        {viewingPromotion.statusDisplay}
                      </Tag>
                      {viewingPromotion.isFeatured && (
                        <Tag color="orange" className="ml-2">
                          Featured
                        </Tag>
                      )}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Usage
                    </label>
                    <div className="text-base bg-gray-50 p-2 rounded">
                      {viewingPromotion.usageDisplay}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Membership
                    </label>
                    <div className="text-base bg-gray-50 p-2 rounded">
                      {viewingPromotion.membershipDisplay}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Points Information (if applicable) */}
            {viewingPromotion.isPointsPromotion && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Points Information
                </h3>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">
                        Points Required
                      </label>
                      <div className="text-base bg-gray-50 p-2 rounded">
                        {viewingPromotion.pointsDisplay}
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">
                        Code Validity
                      </label>
                      <div className="text-base bg-gray-50 p-2 rounded">
                        {viewingPromotion.codeValidityHours} hours
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            )}

            {/* Applicability */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Applicability
              </h3>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Promotion Type
                    </label>
                    <div className="text-base bg-gray-50 p-2 rounded">
                      <Tag color="cyan">
                        {viewingPromotion.promotionTypeDisplay}
                      </Tag>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Restrictions
                    </label>
                    <div className="text-base bg-gray-50 p-2 rounded">
                      {viewingPromotion.applicabilityDisplay}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Banner */}
            {viewingPromotion.bannerUrl && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Banner
                </h3>
                <Image
                  width={600}
                  height={200}
                  className="w-full h-auto object-cover rounded"
                  src={viewingPromotion.bannerUrl}
                  alt="Promotion Banner"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
      <style jsx global>{`
        .professional-table .ant-table-thead > tr > th {
          font-weight: 600;
          border-bottom: 2px solid var(--ant-color-border);
        }

        .professional-pagination .ant-pagination-item-active {
          background: var(--ant-color-primary);
          border-color: var(--ant-color-primary);
        }

        .professional-pagination .ant-pagination-item-active a {
          color: white;
        }

        .professional-modal .ant-modal-header {
          border-bottom: 1px solid var(--ant-color-border);
          padding: 24px 24px 16px;
        }

        .professional-modal .ant-modal-body {
          padding: 24px;
        }
      `}</style>
    </div>
  );
}
