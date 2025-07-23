import { getAllPromotions, createPromotion, updatePromotion, deletePromotion } from '@/api/admin/getAllPromotions';

export const testPromotionAPI = async () => {
  try {
    console.log('Testing Promotion API...');
    
    // Test 1: Get all promotions
    console.log('1. Testing getAllPromotions...');
    const promotions = await getAllPromotions({ page: 0, size: 10 });
    console.log('Promotions loaded:', promotions);
    
    // Test 2: Create a test promotion
    console.log('2. Testing createPromotion...');
    const testPromotion = {
      promotionCode: 'TEST' + Date.now(),
      promotionName: 'Test Promotion',
      description: 'This is a test promotion',
      promotionType: 'PUBLIC' as const,
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      isActive: true,
      memberOnly: false,
      isFeatured: false,
    };
    
    const createdPromotion = await createPromotion(testPromotion);
    console.log('Created promotion:', createdPromotion);
    
    // Test 3: Update the promotion
    console.log('3. Testing updatePromotion...');
    const updatedPromotion = await updatePromotion(createdPromotion.promotionId, {
      promotionName: 'Updated Test Promotion',
      discountValue: 15,
    });
    console.log('Updated promotion:', updatedPromotion);
    
    // Test 4: Delete the promotion
    console.log('4. Testing deletePromotion...');
    await deletePromotion(createdPromotion.promotionId);
    console.log('Promotion deleted successfully');
    
    console.log('All API tests passed!');
    return true;
  } catch (error) {
    console.error('API test failed:', error);
    return false;
  }
}; 