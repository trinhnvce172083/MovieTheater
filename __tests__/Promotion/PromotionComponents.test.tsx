import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PromotionAPITest } from '@/components/PromotionAPITest';
import { PromotionDemo } from '@/components/PromotionDemo';

// Mock the API functions
jest.mock('@/api/admin/getAllPromotions', () => ({
  getAllPromotions: jest.fn(),
  createPromotion: jest.fn(),
  updatePromotion: jest.fn(),
  deletePromotion: jest.fn(),
}));

// Mock toast
jest.mock('react-toastify', () => ({
  toast: {
    info: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('Promotion Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PromotionAPITest', () => {
    test('renders test button', () => {
      render(<PromotionAPITest />);
      expect(screen.getByText('Test Promotion API')).toBeInTheDocument();
    });

    test('shows loading state when testing', async () => {
      render(<PromotionAPITest />);
      const button = screen.getByText('Test Promotion API');
      
      fireEvent.click(button);
      
      expect(button).toBeDisabled();
      expect(screen.getByText('Test Promotion API')).toBeInTheDocument();
    });
  });

  describe('PromotionDemo', () => {
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
        isExpired: false,
        isValid: true,
        currentUsageCount: 0,
      },
    ];

    test('renders demo component', () => {
      render(<PromotionDemo />);
      expect(screen.getByText('Promotion API Demo')).toBeInTheDocument();
    });

    test('shows load promotions button', () => {
      render(<PromotionDemo />);
      expect(screen.getByText('Load Promotions')).toBeInTheDocument();
    });

    test('shows create test promotion button', () => {
      render(<PromotionDemo />);
      expect(screen.getByText('Create Test Promotion')).toBeInTheDocument();
    });

    test('shows update first promotion button', () => {
      render(<PromotionDemo />);
      expect(screen.getByText('Update First Promotion')).toBeInTheDocument();
    });

    test('shows delete first promotion button', () => {
      render(<PromotionDemo />);
      expect(screen.getByText('Delete First Promotion')).toBeInTheDocument();
    });
  });
}); 