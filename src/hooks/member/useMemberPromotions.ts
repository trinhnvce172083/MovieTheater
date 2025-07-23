import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import memberPromotionApi, { MemberPromotion } from '@/api/member/promotionApi';
import { MemberApiService } from '@/api/member/memberApiClient';
import { MemberProfile } from '@/types/member';

export interface UseMemberPromotionsReturn {
  // Data
  promotions: MemberPromotion[];
  memberPoints: number;
  memberInfo: MemberProfile | null;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  loadPromotions: () => Promise<void>;
  purchasePromotion: (promotionCode: string) => Promise<string | null>;
  refreshPromotions: () => void;
}

export function useMemberPromotions(): UseMemberPromotionsReturn {
  const [promotions, setPromotions] = useState<MemberPromotion[]>([]);
  const [memberPoints, setMemberPoints] = useState<number>(0);
  const [memberInfo, setMemberInfo] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load promotions and member points from API
  const loadPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load both promotions and member profile in parallel
      const [promotionsResponse, memberProfileResponse] = await Promise.all([
        memberPromotionApi.getPointsPromotions(),
        MemberApiService.getProfile()
      ]);
      
      if (promotionsResponse.success) {
        setPromotions(promotionsResponse.data);
      } else {
        throw new Error(promotionsResponse.message);
      }
      
      if (memberProfileResponse.success) {
        console.log('Profile loaded from server:', memberProfileResponse.data);
        setMemberInfo(memberProfileResponse.data);
        setMemberPoints(memberProfileResponse.data.membershipPoints);
      } else {
        throw new Error(memberProfileResponse.message);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load promotions and member profile';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Purchase promotion with points
  const purchasePromotion = useCallback(async (promotionCode: string): Promise<string | null> => {
    try {
      console.log('=== PURCHASE PROMOTION DEBUG ===');
      console.log('Promotion code:', promotionCode);
      console.log('Current points before purchase:', memberPoints);
      console.log('Available promotions:', promotions);
      
      const response = await memberPromotionApi.purchasePromotion(promotionCode);
      console.log('API response:', response);
      
      if (response.success) {
        message.success(response.message);
        
        // Update member points (subtract points required) - Frontend workaround since backend doesn't actually deduct points
        const promotion = promotions.find(p => p.promotionCode === promotionCode);
        console.log('Found promotion:', promotion);
        
        if (promotion && promotion.pointsRequired) {
          console.log(`Subtracting ${promotion.pointsRequired} points from ${memberPoints}`);
          setMemberPoints(prev => {
            const newPoints = prev - promotion.pointsRequired;
            console.log(`Points updated: ${prev} - ${promotion.pointsRequired} = ${newPoints}`);
            return newPoints;
          });
          
          // Also update memberInfo to keep UI consistent
          if (memberInfo) {
            setMemberInfo(prev => {
              if (prev) {
                const newInfo = {
                  ...prev,
                  membershipPoints: prev.membershipPoints - promotion.pointsRequired
                };
                console.log('Updated memberInfo:', newInfo);
                return newInfo;
              }
              return null;
            });
          }
        } else {
          console.log('Promotion not found or no points required');
        }
        
        // Refresh promotions to update usage counts
        console.log('Refreshing promotions...');
        await loadPromotions();
        console.log('Promotions refreshed');
        
        return response.data; // Return the unique code
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      console.error('Purchase error:', err);
      const errorMessage = err.message || 'Failed to purchase promotion';
      message.error(errorMessage);
      return null;
    }
  }, [promotions, loadPromotions, memberInfo, memberPoints]);

  // Refresh promotions
  const refreshPromotions = useCallback(() => {
    loadPromotions();
  }, [loadPromotions]);

  // Load promotions on mount
  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  return {
    promotions,
    memberPoints,
    memberInfo,
    loading,
    error,
    loadPromotions,
    purchasePromotion,
    refreshPromotions,
  };
} 