import { useState, useEffect, useMemo } from 'react';
import { PromotionDto } from '@/types/Admin/promotion';
import {
  getAllPromotions,
  deletePromotion,
  createPromotion,
  updatePromotion,
  uploadPromotionBanner,
  type PromotionCreateRequest,
  type PromotionUpdateRequest,
  type PromotionSearchParams
} from '@/api/admin/getAllPromotions';
import { toast } from 'react-toastify';
import { PromotionStatistics } from '../types';

export const usePromotions = () => {
  const [promotions, setPromotions] = useState<PromotionDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedPromotions, setSelectedPromotions] = useState<PromotionDto[]>([]);

  const fetchPromotions = async (
    page = 0,
    size = 10,
    sortBy = "startDate",
    sortDirection: "ASC" | "DESC" = "DESC",
    isActive: boolean | null = null
  ) => {
    try {
      setLoading(true);
      
      const params: PromotionSearchParams = {
        page,
        size,
        sortBy,
        sortDirection,
        ...(isActive !== null && { isActive }),
        ...(searchTerm && { search: searchTerm })
      };

      const response = await getAllPromotions(params);
      setPromotions(response.content || []);
      setTotalCount(response.page?.totalElements || 0);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toast.error("Không thể tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions(currentPage - 1, pageSize, "startDate", "DESC", null);
  }, [currentPage, pageSize, searchTerm]);

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

  const statistics: PromotionStatistics = useMemo(() => {
    const totalPromotions = totalCount;
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
  }, [totalCount, promotions]);

  const handleDelete = async (record: PromotionDto) => {
    try {
      await deletePromotion(record.promotionId);
      toast.success(`Deleted "${record.promotionName}" successfully`);
      fetchPromotions(currentPage - 1, pageSize);
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Không thể xóa khuyến mãi');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const promises = selectedPromotions.map((promotion) =>
        deletePromotion(promotion.promotionId)
      );

      await Promise.all(promises);
      toast.success(
        `Deleted ${selectedPromotions.length} promotions successfully`
      );
      setSelectedRowKeys([]);
      setSelectedPromotions([]);
      fetchPromotions(currentPage - 1, pageSize);
    } catch (error) {
      console.error("Error bulk deleting:", error);
      toast.error("Không thể xóa khuyến mãi");
    }
  };

  const handleSavePromotion = async (values: any, editingPromotion: PromotionDto | null) => {
    try {
      let result: PromotionDto;
      
      if (editingPromotion) {
        result = await updatePromotion(editingPromotion.promotionId, values as PromotionUpdateRequest);
      } else {
        result = await createPromotion(values as PromotionCreateRequest);
      }

      if (values.banner && values.banner.length > 0) {
        const bannerFile = values.banner[0].originFileObj;
        await uploadPromotionBanner(result.promotionId, bannerFile);
      }

      toast.success(
        editingPromotion
          ? `Cập nhật promotion thành công: ${result.promotionCode || result.promotionName}`
          : `Tạo promotion mới thành công: ${result.promotionCode || result.promotionName}`
      );

      fetchPromotions(currentPage - 1, pageSize);
      return true;
    } catch (error) {
      console.error("Error saving promotion:", error);
      let errorMessage = "Không thể lưu promotion";
      if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      return false;
    }
  };

  return {
    promotions: filteredData,
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
    refreshPromotions: () => fetchPromotions(currentPage - 1, pageSize)
  };
}; 