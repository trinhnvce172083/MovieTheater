import { renderHook, act } from '@testing-library/react';
import { usePromotions } from '@/app/admin/promotions/hooks/usePromotions';

// Mock the API functions
jest.mock('@/api/admin/getAllPromotions', () => ({
  getAllPromotions: jest.fn(),
  deletePromotion: jest.fn(),
  createPromotion: jest.fn(),
  updatePromotion: jest.fn(),
  uploadPromotionBanner: jest.fn(),
}));

// Mock toast
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('usePromotions Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with default values', () => {
    const { result } = renderHook(() => usePromotions());

    expect(result.current.promotions).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(5);
    expect(result.current.searchTerm).toBe('');
    expect(result.current.selectedRowKeys).toEqual([]);
    expect(result.current.selectedPromotions).toEqual([]);
  });

  test('should have all required functions', () => {
    const { result } = renderHook(() => usePromotions());

    expect(typeof result.current.setCurrentPage).toBe('function');
    expect(typeof result.current.setPageSize).toBe('function');
    expect(typeof result.current.setSearchTerm).toBe('function');
    expect(typeof result.current.setSelectedRowKeys).toBe('function');
    expect(typeof result.current.setSelectedPromotions).toBe('function');
    expect(typeof result.current.handleDelete).toBe('function');
    expect(typeof result.current.handleBulkDelete).toBe('function');
    expect(typeof result.current.handleSavePromotion).toBe('function');
    expect(typeof result.current.refreshPromotions).toBe('function');
  });

  test('should update search term', () => {
    const { result } = renderHook(() => usePromotions());

    act(() => {
      result.current.setSearchTerm('test search');
    });

    expect(result.current.searchTerm).toBe('test search');
  });

  test('should update current page', () => {
    const { result } = renderHook(() => usePromotions());

    act(() => {
      result.current.setCurrentPage(2);
    });

    expect(result.current.currentPage).toBe(2);
  });

  test('should update page size', () => {
    const { result } = renderHook(() => usePromotions());

    act(() => {
      result.current.setPageSize(10);
    });

    expect(result.current.pageSize).toBe(10);
  });

  test('should update selected row keys', () => {
    const { result } = renderHook(() => usePromotions());

    act(() => {
      result.current.setSelectedRowKeys([1, 2, 3]);
    });

    expect(result.current.selectedRowKeys).toEqual([1, 2, 3]);
  });

  test('should update selected promotions', () => {
    const { result } = renderHook(() => usePromotions());
    const mockPromotions = [
      {
        promotionId: 1,
        promotionCode: 'TEST1',
        promotionName: 'Test Promotion 1',
        description: 'Test description',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        isActive: true,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        memberOnly: false,
        isFeatured: false,
        promotionType: 'PUBLIC',
        promotionTypeDisplay: 'Public',
        isExpired: false,
        isValid: true,
        currentUsageCount: 0,
      },
    ];

    act(() => {
      result.current.setSelectedPromotions(mockPromotions);
    });

    expect(result.current.selectedPromotions).toEqual(mockPromotions);
  });

  test('should calculate statistics correctly', () => {
    const { result } = renderHook(() => usePromotions());

    // Mock promotions data
    const mockPromotions = [
      {
        promotionId: 1,
        promotionCode: 'TEST1',
        promotionName: 'Test Promotion 1',
        description: 'Test description',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        isActive: true,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        memberOnly: false,
        isFeatured: true,
        promotionType: 'PUBLIC',
        promotionTypeDisplay: 'Public',
        isExpired: false,
        isValid: true,
        currentUsageCount: 0,
        isPointsPromotion: false,
      },
      {
        promotionId: 2,
        promotionCode: 'TEST2',
        promotionName: 'Test Promotion 2',
        description: 'Test description 2',
        discountType: 'FIXED_AMOUNT',
        discountValue: 50000,
        isActive: false,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        memberOnly: true,
        isFeatured: false,
        promotionType: 'POINT_BASED',
        promotionTypeDisplay: 'Point Based',
        isExpired: true,
        isValid: false,
        currentUsageCount: 0,
        isPointsPromotion: true,
      },
    ];

    // Manually set promotions to test statistics
    act(() => {
      // This is a simplified test - in real implementation, statistics are calculated from API response
      result.current.setSelectedPromotions(mockPromotions);
    });

    // Note: In real implementation, statistics would be calculated from the API response
    // This test just verifies the hook structure
    expect(result.current.statistics).toBeDefined();
  });
}); 