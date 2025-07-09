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
      setPromotions(
        (response.content || []).map(item => ({
          ...item,
          bannerImageUrl: item.bannerImageUrl || item.bannerImageUrl
        }))
      );
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
      // Fetch promotions for the current page
      await fetchPromotions(currentPage - 1, pageSize);
      // After fetch, if no promotions and currentPage > 1, fallback to previous page
      setTimeout(() => {
        if (promotions.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }, 0);
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
      await fetchPromotions(currentPage - 1, pageSize);
      setTimeout(() => {
        if (promotions.length <= selectedPromotions.length && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }, 0);
    } catch (error) {
      console.error("Error bulk deleting:", error);
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
      // Map discountType FE -> BE
      let discountType = rest.discountType;
      // Không đổi giá trị discountType, giữ nguyên các giá trị: PERCENTAGE, FIXED_AMOUNT, BUY_ONE_GET_ONE
      // Map dữ liệu sang đúng tên trường backend
      const mappedCreate: any = {
        code: rest.promotionCode || rest.promoCode,
        name: rest.promotionName || rest.name,
        description: rest.description,
        discountType: discountType,
        discountValue: rest.discountValue ? Number(rest.discountValue) : undefined,
        maxDiscountAmount: rest.maxDiscountAmount ? Number(rest.maxDiscountAmount) : undefined,
        minPurchaseAmount: rest.minPurchaseAmount ? Number(rest.minPurchaseAmount) : undefined,
        startDate: rest.startDate ? dayjs(rest.startDate).format('YYYY-MM-DD') : undefined,
        endDate: rest.endDate ? dayjs(rest.endDate).format('YYYY-MM-DD') : undefined,
        maxUsageCount: rest.maxUsageCount ? Number(rest.maxUsageCount) : undefined,
        maxUsagePerUser: rest.maxUsagePerUser ? Number(rest.maxUsagePerUser) : undefined,
        isFeatured: !!rest.isFeatured,
        bannerImageUrl: rest.bannerImageUrl || undefined,
        pointsRequired: rest.pointsRequired ? Number(rest.pointsRequired) : undefined,
        codeValidityHour: rest.codeValidityHour ? Number(rest.codeValidityHour) : undefined,
      };
      // Xóa các trường undefined để không gửi lên backend
      Object.keys(mappedCreate).forEach(key => (mappedCreate[key] === undefined) && delete mappedCreate[key]);

      // Khi update chỉ gửi các trường user thực sự muốn sửa
      let mappedUpdate: any = {};
      if (editingPromotion) {
        // Chỉ lấy các trường có trong rest (tức là user đã nhập/sửa)
        Object.keys(rest).forEach(key => {
          let backendKey = key;
          if (key === 'promotionCode' || key === 'promoCode') backendKey = 'code';
          if (key === 'promotionName' || key === 'name') backendKey = 'name';
          if (key === 'discountType') backendKey = 'discountType';
          if (key === 'discountValue') backendKey = 'discountValue';
          if (key === 'maxDiscountAmount') backendKey = 'maxDiscountAmount';
          if (key === 'minPurchaseAmount') backendKey = 'minPurchaseAmount';
          if (key === 'startDate') backendKey = 'startDate';
          if (key === 'endDate') backendKey = 'endDate';
          if (key === 'maxUsageCount') backendKey = 'maxUsageCount';
          if (key === 'maxUsagePerUser') backendKey = 'maxUsagePerUser';
          if (key === 'isFeatured') backendKey = 'isFeatured';
          if (key === 'bannerImageUrl') backendKey = 'bannerImageUrl';
          if (key === 'pointsRequired') backendKey = 'pointsRequired';
          if (key === 'codeValidityHour') backendKey = 'codeValidityHour';
          // Format giá trị nếu cần
          let value = rest[key];
          if ((backendKey === 'startDate' || backendKey === 'endDate') && value) {
            value = dayjs(value).format('YYYY-MM-DD');
          }
          if ([
            'discountValue',
            'maxDiscountAmount',
            'minPurchaseAmount',
            'maxUsageCount',
            'maxUsagePerUser',
            'pointsRequired',
            'codeValidityHour'
          ].includes(backendKey) && value !== undefined && value !== null && value !== "") {
            value = Number(value);
          }
          if (value !== undefined && value !== null && value !== "") {
            mappedUpdate[backendKey] = value;
          }
        });
      }
      // Log JSON gửi lên
      console.log('Promotion JSON gửi lên:', editingPromotion ? mappedUpdate : mappedCreate);
      if (editingPromotion) {
        result = await updatePromotion(editingPromotion.promotionId, mappedUpdate);
      } else {
        result = await createPromotion(mappedCreate);
      }
      // Chỉ upload banner nếu có và đã tạo promotion thành công
      if (banner && banner.length > 0 && result?.promotionId) {
        const bannerFile = banner[0].originFileObj;
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
    refreshPromotions: () => fetchPromotions(currentPage - 1, pageSize)
  };
}; 