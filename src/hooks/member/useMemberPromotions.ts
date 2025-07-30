import { useState, useCallback, useEffect } from 'react';
import { memberPromotionApi, MemberPromotion } from '../../api/member/promotionApi';
import { MemberApiClient } from '../../api/member/memberApiClient';

export interface UseMemberPromotionsReturn {
  promotions: MemberPromotion[];
  memberPoints: number;
  memberInfo: any;
  loading: boolean;
  error: string | null;
}

export function useMemberPromotions(): UseMemberPromotionsReturn {
  const [promotions, setPromotions] = useState<MemberPromotion[]>([]);
  const [memberPoints, setMemberPoints] = useState<number>(0);
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load promotions từ API mới
  const loadPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activePromotions = await memberPromotionApi.getActivePromotions();
      setPromotions(activePromotions);
      const profile = await MemberApiClient.getProfile();
      setMemberInfo(profile);
      setMemberPoints(profile.membershipPoints || 0);
    } catch (error: any) {
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
  };
} 