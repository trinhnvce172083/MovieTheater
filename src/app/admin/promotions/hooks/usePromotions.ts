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
  type PromotionSearchParams,
  getPromotionById
} from '@/api/admin/getAllPromotions';
import { toast } from 'react-toastify';
import { PromotionStatistics } from '../types';
import dayjs from 'dayjs';


let isSavingPromotion = false;

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
    page = currentPage - 1,
    size = pageSize,
    sortBy = "createdAt",
    sortDirection: "DESC", // sửa mặc định thành in hoa
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
      const res: any = response;
      let promotions: PromotionDto[] = [];
      let totalCount = 0;
      if (res && res.data && res.data.content) {
        promotions = res.data.content;
        totalCount = res.data.page?.totalElements || 0;
      } else if (res.content) {
        promotions = res.content;
        totalCount = res.page?.totalElements || 0;
      }
      setPromotions(promotions);
      setTotalCount(totalCount);
    } catch (error) {
      toast.error("Không thể tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions(currentPage - 1, pageSize, "createdAt", "DESC", null);
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
      (p) => p.valid && !p.expired
    ).length;
    const pointsPromotions = promotions.filter(
      (p) => p.pointsDiscount
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
      // Fetch promotions for the current page
      await fetchPromotions(currentPage - 1, pageSize, "createdAt", "DESC", null);
      // After fetch, if no promotions and currentPage > 1, fallback to previous page
      setTimeout(() => {
        if (promotions.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }, 0);
    } catch (error) {
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
      await fetchPromotions(currentPage - 1, pageSize, "createdAt", "DESC", null);
      setTimeout(() => {
        if (promotions.length <= selectedPromotions.length && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }, 0);
    } catch (error) {
      toast.error("Không thể xóa khuyến mãi");
    }
  };

  const handleSavePromotion = async (values: any, editingPromotion: PromotionDto | null) => {
    if (isSavingPromotion) return false;
    isSavingPromotion = true;
    try {
      let result: PromotionDto;
      
      // Tách riêng trường banner ra khỏi values
      const { banner, ...rest } = values;
      
      // Map dữ liệu sang đúng format backend
      const mappedData: any = {
        code: rest.promoCode?.toString().toUpperCase().trim(),
        name: rest.name?.toString().trim(),
        description: rest.description?.toString().trim() || "",
        discountType: rest.discountType,
        discountValue: rest.discountValue ? Number(rest.discountValue) : 0,
        isFeatured: Boolean(rest.isFeatured),
        startDate: rest.startDate ? dayjs(rest.startDate).format('YYYY-MM-DD') : undefined,
        endDate: rest.endDate ? dayjs(rest.endDate).format('YYYY-MM-DD') : undefined,
        maxDiscountAmount: rest.maxDiscount ? Number(rest.maxDiscount) : undefined,
        minPurchaseAmount: rest.minPurchase ? Number(rest.minPurchase) : undefined,
        maxUsageCount: rest.maxUsageCount ? Number(rest.maxUsageCount) : undefined,
        maxUsagePerUser: rest.maxUsagePerUser ? Number(rest.maxUsagePerUser) : undefined,
        pointsRequired: rest.pointsRequired ? Number(rest.pointsRequired) : 0,
        codeValidityHour: 24,
      };
      // Nếu có banner, truyền bannerImageUrl
      if (rest.banner && rest.banner.length > 0 && rest.banner[0].url) {
        mappedData.bannerImageUrl = rest.banner[0].url;
      }

      // Optional numeric fields
      if (rest.minPurchase !== undefined && rest.minPurchase !== null && rest.minPurchase !== "") {
        mappedData.minPurchaseAmount = Number(rest.minPurchase);
      }
      if (rest.maxDiscount !== undefined && rest.maxDiscount !== null && rest.maxDiscount !== "") {
        mappedData.maxDiscountAmount = Number(rest.maxDiscount);
      }
      if (rest.pointsRequired !== undefined && rest.pointsRequired !== null && rest.pointsRequired !== "") {
        mappedData.pointsRequired = Number(rest.pointsRequired);
      }
      if (rest.maxUsageCount !== undefined && rest.maxUsageCount !== null && rest.maxUsageCount !== "") {
        mappedData.maxUsageCount = Number(rest.maxUsageCount);
      }
      if (rest.maxUsagePerUser !== undefined && rest.maxUsagePerUser !== null && rest.maxUsagePerUser !== "") {
        mappedData.maxUsagePerUser = Number(rest.maxUsagePerUser);
      }

      // Log JSON gửi lên
      console.log('Promotion JSON gửi lên:', mappedData);
      
      if (editingPromotion) {
        result = await updatePromotion(editingPromotion.promotionId, mappedData);
      } else {
        result = await createPromotion(mappedData);
      }
      
      // Upload banner nếu có và đã tạo promotion thành công
      if (banner && banner.length > 0 && result?.promotionId) {
        const bannerFile = banner[0].originFileObj;
        await uploadPromotionBanner(result.promotionId, bannerFile);
        // Lấy lại promotion mới nhất (có bannerImageUrl)
        result = await getPromotionById(result.promotionId);
      }
      
      toast.success(
        editingPromotion
          ? `Cập nhật promotion thành công: ${result.promotionCode || result.promotionName}`
          : `Tạo promotion mới thành công: ${result.promotionCode || result.promotionName}`
      );
      
      fetchPromotions(currentPage - 1, pageSize, "createdAt", "DESC", null);
      return true;
    } catch (error) {
      let errorMessage = "Không thể lưu promotion";
      if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      return false;
    } finally {
      setTimeout(() => { isSavingPromotion = false; }, 1000);
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
    refreshPromotions: () => fetchPromotions(currentPage - 1, pageSize, "createdAt", "DESC", null)
  };
}; 