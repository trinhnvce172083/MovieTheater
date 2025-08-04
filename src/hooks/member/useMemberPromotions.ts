import { useState, useCallback, useEffect } from 'react';
import { memberPromotionApi, MemberPromotion } from '../../api/member/promotionApi';
import { MemberApiService } from '../../api/member/memberApiClient';

export interface UseMemberPromotionsReturn {
  promotions: MemberPromotion[];
  memberPoints: number;
  memberInfo: any;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMemberPromotions(): UseMemberPromotionsReturn {
  const [promotions, setPromotions] = useState<MemberPromotion[]>([]);
  const [memberPoints, setMemberPoints] = useState<number>(0);
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load promotions từ API mới
  const loadPromotions = useCallback(async () => {
    console.log('🚀 Loading promotions...');
    setLoading(true);
    setError(null);
    
    try {
      // Load promotions và profile parallel
      const [activePromotions, profileRes] = await Promise.all([
        memberPromotionApi.getActivePromotions(),
        MemberApiService.getProfile(false)
      ]);
      
      console.log('📦 Promotions loaded:', activePromotions);
      console.log('👤 Profile loaded:', profileRes.data);
      
      setPromotions(activePromotions);
      setMemberInfo(profileRes.data);
      setMemberPoints(profileRes.data.membershipPoints || 0);
      
      console.log('✅ Promotions and profile loaded successfully');
    } catch (error: any) {
      console.error('❌ Failed to load promotions:', error);
      setError(error.message || 'Failed to load promotions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  return {
    promotions,
    memberPoints,
    memberInfo,
    loading,
    error,
    refetch: loadPromotions,
  };
} 