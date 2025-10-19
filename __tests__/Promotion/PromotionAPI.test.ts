import { getAllPromotions, createPromotion, updatePromotion, deletePromotion } from '@/api/admin/getAllPromotions';
import { testPromotionAPI } from '@/utils/promotion-test-utils';

// Jest test functions
describe('Promotion API', () => {
  test('should get all promotions', async () => {
    const promotions = await getAllPromotions({ page: 0, size: 10 });
    expect(promotions).toBeDefined();
    expect(promotions.content).toBeDefined();
    expect(Array.isArray(promotions.content)).toBe(true);
  });

  test('should create, update and delete promotion', async () => {
    const result = await testPromotionAPI();
    expect(result).toBe(true);
  });
}); 