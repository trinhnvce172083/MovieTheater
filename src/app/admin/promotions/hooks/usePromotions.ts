import { useState, useEffect, useMemo } from 'react';
import { PromotionDto } from '@/types/Admin/promotion';
import {
  getAllPromotions,
  deletePromotion,
  createPromotion,
  updatePromotion,
  uploadPromotionBanner,
  updatePromotionBanner,
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

      // Debug: Kiểm tra response structure
      console.log('API Response structure:', {
        hasData: !!res.data,
        hasContent: !!res.content,
        promotionsCount: promotions.length,
        firstPromotion: promotions[0] ? {
          id: promotions[0].promotionId,
          name: promotions[0].promotionName,
          bannerUrl: promotions[0].bannerImageUrl,
          hasBanner: !!promotions[0].bannerImageUrl
        } : null
      });
      
      // Merge với state hiện tại để giữ nguyên banner URL
      setPromotions(prevPromotions => {
        return promotions.map(apiPromotion => {
          const existingPromotion = prevPromotions.find(p => p.promotionId === apiPromotion.promotionId);
          if (existingPromotion && existingPromotion.bannerImageUrl && !apiPromotion.bannerImageUrl) {
            console.log(`Keeping banner URL for promotion ${apiPromotion.promotionId}:`, existingPromotion.bannerImageUrl);
            return { ...apiPromotion, bannerImageUrl: existingPromotion.bannerImageUrl };
          }
          return apiPromotion;
        });
      });
      setTotalCount(totalCount);
    } catch (error) {
      toast.error("Unable to load promotions list");
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
      toast.error('Unable to delete promotion');
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
      toast.error("Unable to delete promotions");
    }
  };

  const handleSavePromotion = async (values: any, editingPromotion: PromotionDto | null) => {
    if (isSavingPromotion) return false;
    isSavingPromotion = true;
    try {
      let result: PromotionDto;
      
      // Tách riêng trường banner ra khỏi values
      const { banner, ...rest } = values;
      
      // Map dữ liệu sang đúng format backend API
      const mappedData: any = {
        code: rest.promoCode?.toString().toUpperCase().trim(),
        name: rest.name?.toString().trim(),
        description: rest.description?.toString().trim() || "",
        discountType: rest.discountType,
        discountValue: rest.discountValue ? Number(rest.discountValue) : 0,
        maxDiscountAmount: rest.maxDiscount ? Number(rest.maxDiscount) : 0,
        minPurchaseAmount: rest.minPurchase ? Number(rest.minPurchase) : 0,
        startDate: rest.startDate ? dayjs(rest.startDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        endDate: rest.endDate ? dayjs(rest.endDate).format('YYYY-MM-DD') : dayjs().add(30, 'day').format('YYYY-MM-DD'),
        maxUsageCount: rest.maxUsageCount ? Number(rest.maxUsageCount) : 1000,
        maxUsagePerUser: rest.maxUsagePerUser ? Number(rest.maxUsagePerUser) : 1,
        isFeatured: Boolean(rest.isFeatured),
        bannerImageUrl: "",
        pointsRequired: rest.pointsRequired ? Number(rest.pointsRequired) : 0,
        codeValidityHour: 24
      };

      // Debug: Log the mapped data being sent to API
      console.log('=== API REQUEST DEBUG ===');
      console.log('Original form values:', values);
      console.log('Mapped data for API:', mappedData);
      console.log('Is editing mode:', !!editingPromotion);
      
      if (editingPromotion) {
        const updateResponse = await updatePromotion(editingPromotion.promotionId, mappedData);
        console.log('Update promotion response:', updateResponse);
        // Extract data from response structure
        result = (updateResponse as any).data || updateResponse;
        console.log('Update promotion result:', result);
        
        // Đảm bảo result có bannerImageUrl từ editingPromotion nếu API không trả về
        console.log('=== EDIT MODE DEBUG ===');
        console.log('Result bannerImageUrl:', result.bannerImageUrl);
        console.log('Result bannerUrl:', (result as any).bannerUrl);
        console.log('EditingPromotion bannerImageUrl:', editingPromotion.bannerImageUrl);
        console.log('EditingPromotion bannerUrl:', (editingPromotion as any).bannerUrl);
        console.log('Result object keys:', Object.keys(result));
        console.log('EditingPromotion object keys:', Object.keys(editingPromotion));
        
        // Kiểm tra cả bannerImageUrl và bannerUrl
        const resultBannerUrl = result.bannerImageUrl || (result as any).bannerUrl;
        const editingBannerUrl = editingPromotion.bannerImageUrl || (editingPromotion as any).bannerUrl;
        
        if (!resultBannerUrl && editingBannerUrl) {
          result.bannerImageUrl = editingBannerUrl;
          console.log('Set bannerImageUrl from editingPromotion:', editingBannerUrl);
        }
      } else {
        const createResponse = await createPromotion(mappedData);
        console.log('Create promotion response:', createResponse);
        // Extract data from response structure
        result = (createResponse as any).data || createResponse;
        console.log('Create promotion result:', result);
      }
      
      // Upload banner nếu có file mới được chọn
      const promotionId = result?.promotionId || editingPromotion?.promotionId;
      
      // Debug: Log banner data
      console.log('=== BANNER UPLOAD DEBUG ===');
      console.log('Banner data:', banner);
      console.log('Banner length:', banner?.length);
      console.log('Result promotionId:', result?.promotionId);
      console.log('Editing promotionId:', editingPromotion?.promotionId);
      console.log('Using promotionId:', promotionId);
      console.log('Is editing mode:', !!editingPromotion);
      
      if (banner && banner.length > 0 && promotionId) {
        try {
          const bannerFile = banner[0].originFileObj;
          console.log('Banner file object:', bannerFile);
          console.log('Banner file type:', bannerFile?.type);
          console.log('Banner file size:', bannerFile?.size);
          console.log('Banner[0].url:', banner[0].url);
          console.log('Banner[0].originFileObj:', !!banner[0].originFileObj);
          
          // Chỉ upload nếu có file mới (originFileObj)
          if (bannerFile) {
            console.log('=== UPLOADING BANNER ===');
            // Sử dụng uploadPromotionBanner cho cả create và edit mode vì updatePromotionBanner có thể không được hỗ trợ
            const uploadResult = await uploadPromotionBanner(promotionId, bannerFile);
            
            console.log('Upload result:', uploadResult);
            console.log('Upload result.data:', uploadResult?.data);
            
            // Cập nhật bannerImageUrl cho result
            if (uploadResult) {
              // Upload API có thể trả về url trực tiếp hoặc trong data
              const bannerUrl = (uploadResult as any).url || uploadResult.data;
              if (bannerUrl) {
                result.bannerImageUrl = bannerUrl;
                console.log('Set bannerImageUrl to:', bannerUrl);
              } else {
                console.log('Upload result has no url/data:', uploadResult);
              }
            } else {
              console.log('Upload result is null/undefined');
            }
            
            // Lấy lại promotion mới nhất để đảm bảo có bannerImageUrl (chỉ khi cần)
            if (!result.bannerImageUrl) {
              try {
                console.log('=== REFRESHING PROMOTION ===');
                const updatedPromotion = await getPromotionById(promotionId);
                console.log('Updated promotion from API:', updatedPromotion);
                console.log('Updated promotion.bannerImageUrl:', updatedPromotion?.bannerImageUrl);
                if (updatedPromotion && updatedPromotion.bannerImageUrl) {
                  result.bannerImageUrl = updatedPromotion.bannerImageUrl;
                  console.log('Updated bannerImageUrl from API:', updatedPromotion.bannerImageUrl);
                } else {
                  console.log('Updated promotion has no bannerImageUrl');
                }
              } catch (refreshError) {
                console.error('Error refreshing promotion:', refreshError);
              }
            } else {
              console.log('=== BANNER URL ALREADY SET, SKIPPING REFRESH ===');
            }
          } else {
            console.log('=== NO NEW FILE, KEEPING EXISTING ===');
            // Nếu không có file mới nhưng có URL (edit mode, giữ nguyên ảnh cũ)
            if (banner[0].url && !banner[0].originFileObj) {
              console.log('Keeping existing banner:', banner[0].url);
              result.bannerImageUrl = banner[0].url;
            } else {
              // Kiểm tra cả bannerImageUrl và bannerUrl từ editingPromotion
              const editingBannerUrl = editingPromotion?.bannerImageUrl || (editingPromotion as any)?.bannerUrl;
              if (editingBannerUrl) {
                console.log('Keeping existing banner from editingPromotion:', editingBannerUrl);
                result.bannerImageUrl = editingBannerUrl;
              } else {
                console.log('No existing banner URL found');
              }
            }
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          toast.warning('Promotion created but unable to upload banner');
        }
      } else {
        console.log('=== NO BANNER TO PROCESS ===');
        console.log('Banner exists:', !!banner);
        console.log('Banner length:', banner?.length);
        console.log('Result promotionId:', result?.promotionId);
        console.log('Using promotionId:', promotionId);
      }
      
      toast.success(
        editingPromotion
          ? `Promotion updated successfully: ${result.promotionCode || result.promotionName || 'Promotion'}`
          : `New promotion created successfully: ${result.promotionCode || result.promotionName || 'Promotion'}`
      );
      
      // Cập nhật promotion trong danh sách với banner URL mới (nếu có)
      const resultBannerUrl = result.bannerImageUrl || (result as any).bannerUrl;
      const editingBannerUrl = editingPromotion?.bannerImageUrl || (editingPromotion as any)?.bannerUrl;
      
      if (resultBannerUrl) {
        setPromotions(prevPromotions => 
          prevPromotions.map(p => 
            p.promotionId === result.promotionId 
              ? { ...p, bannerImageUrl: resultBannerUrl }
              : p
          )
        );
        console.log('Updated promotion in list with banner URL:', resultBannerUrl);
      } else if (editingBannerUrl) {
        // Nếu không có banner URL mới nhưng có ảnh cũ, giữ nguyên ảnh cũ
        setPromotions(prevPromotions => 
          prevPromotions.map(p => 
            p.promotionId === result.promotionId 
              ? { ...p, bannerImageUrl: editingBannerUrl }
              : p
          )
        );
        console.log('Keeping existing banner URL in list:', editingBannerUrl);
      } else {
        // Fallback: Tìm ảnh từ danh sách hiện tại
        const currentPromotion = promotions.find(p => p.promotionId === result.promotionId);
        const currentBannerUrl = currentPromotion?.bannerImageUrl || (currentPromotion as any)?.bannerUrl;
        if (currentBannerUrl) {
          setPromotions(prevPromotions => 
            prevPromotions.map(p => 
              p.promotionId === result.promotionId 
                ? { ...p, bannerImageUrl: currentBannerUrl }
                : p
            )
          );
          console.log('Fallback: Keeping banner URL from current list:', currentBannerUrl);
        }
      }
      
      // Refresh danh sách một lần duy nhất sau khi tạo/cập nhật thành công
      setTimeout(() => {
        fetchPromotions(currentPage - 1, pageSize, "createdAt", "DESC", null);
      }, 500);
      
      return true;
    } catch (error) {
      let errorMessage = "Unable to save promotion";
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