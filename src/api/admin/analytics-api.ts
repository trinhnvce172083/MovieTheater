import axiosClient from '../axiosClient';

export interface DashboardSummaryResponse {
  overview: {
    totalRevenue: number;
    totalBookings: number;
    totalCustomers: number;
    totalMovies: number;
    revenueGrowth: number;
    bookingGrowth: number;
    customerGrowth: number;
  };
  revenue: {
    todayRevenue: number;
    monthRevenue: number;
    yearRevenue: number;
    averageOrderValue: number;
  };
  bookings: {
    todayBookings: number;
    monthBookings: number;
    totalSeatsBooked: number;
    averageOccupancyRate: number;
  };
  topMovies: Array<{
    movieId: number;
    title: string;
    revenue: number;
    bookings: number;
    occupancyRate: number;
    posterUrl: string;
  }>;
  recentActivities: Array<{
    type: string;
    message: string;
    timestamp: string;
    user: string;
  }>;
  charts: {
    revenueChart: Array<{
      date: string;
      revenue: number;
      bookings: number;
    }>;
    genreChart: Array<{
      genre: string;
      count: number;
      revenue: number;
    }>;
    timeSlotChart: Array<{
      timeSlot: string;
      bookings: number;
      revenue: number;
    }>;
  };
}

export interface ReportRequest {
  reportType: 'REVENUE' | 'BOOKING' | 'MOVIE_PERFORMANCE' | 'CUSTOMER_ANALYSIS' | 'PEAK_TIME_ANALYSIS' | 'COMPREHENSIVE';
  startDate: string;
  endDate: string;
  exportFormat?: 'JSON' | 'CSV' | 'PDF' | 'EXCEL';
  groupBy?: 'DAY' | 'WEEK' | 'MONTH';
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export class AnalyticsApiService {
  private static getAuthHeaders(token: string) {
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  }

  /**
   * Get dashboard summary
   */
  static async getDashboardSummary(
    token: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<DashboardSummaryResponse>> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await axiosClient.get(
        `/analytics/dashboard${params.toString() ? `?${params}` : ''}`,
        this.getAuthHeaders(token)
      );

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Error fetching dashboard summary:', error);
      return {
        success: false,
        data: null as any,
        message: error.response?.data?.message || 'Failed to fetch dashboard summary'
      };
    }
  }

  /**
   * Get real-time statistics
   */
  static async getRealTimeStats(token: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosClient.get(
        '/analytics/dashboard/real-time',
        this.getAuthHeaders(token)
      );

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Error fetching real-time stats:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch real-time stats'
      };
    }
  }

  /**
   * Get revenue analytics
   */
  static async getRevenueAnalytics(
    token: string,
    startDate: string,
    endDate: string,
    groupBy: string = 'DAY'
  ): Promise<ApiResponse<any>> {
    try {
      const response = await axiosClient.get('/analytics/revenue', {
        ...this.getAuthHeaders(token),
        params: { startDate, endDate, groupBy }
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Error fetching revenue analytics:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch revenue analytics'
      };
    }
  }

  /**
   * Get booking analytics
   */
  static async getBookingAnalytics(
    token: string,
    startDate: string,
    endDate: string,
    groupBy: string = 'DAY'
  ): Promise<ApiResponse<any>> {
    try {
      const response = await axiosClient.get('/analytics/bookings', {
        ...this.getAuthHeaders(token),
        params: { startDate, endDate, groupBy }
      });

      return {
        success: true,
        data: response.data,
        message: 'Booking analytics fetched successfully'
      };
    } catch (error: any) {
      console.error('Error fetching booking analytics:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch booking analytics'
      };
    }
  }

  /**
   * Get movie performance analytics
   */
  static async getMoviePerformance(
    token: string,
    startDate: string,
    endDate: string,
    limit: number = 20
  ): Promise<ApiResponse<any>> {
    try {
      const response = await axiosClient.get('/analytics/movies/performance', {
        ...this.getAuthHeaders(token),
        params: { startDate, endDate, limit }
      });

      return {
        success: true,
        data: response.data,
        message: 'Movie performance fetched successfully'
      };
    } catch (error: any) {
      console.error('Error fetching movie performance:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch movie performance'
      };
    }
  }

  /**
   * Get customer analytics
   */
  static async getCustomerAnalytics(
    token: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await axiosClient.get('/analytics/customers', {
        ...this.getAuthHeaders(token),
        params: { startDate, endDate }
      });

      return {
        success: true,
        data: response.data,
        message: 'Customer analytics fetched successfully'
      };
    } catch (error: any) {
      console.error('Error fetching customer analytics:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch customer analytics'
      };
    }
  }

  /**
   * Get peak time analytics
   */
  static async getPeakTimeAnalytics(
    token: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await axiosClient.get('/analytics/peak-times', {
        ...this.getAuthHeaders(token),
        params: { startDate, endDate }
      });

      return {
        success: true,
        data: response.data,
        message: 'Peak time analytics fetched successfully'
      };
    } catch (error: any) {
      console.error('Error fetching peak time analytics:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch peak time analytics'
      };
    }
  }

  /**
   * Get genre analytics
   */
  static async getGenreAnalytics(
    token: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await axiosClient.get('/analytics/genres', {
        ...this.getAuthHeaders(token),
        params: { startDate, endDate }
      });

      return {
        success: true,
        data: response.data,
        message: 'Genre analytics fetched successfully'
      };
    } catch (error: any) {
      console.error('Error fetching genre analytics:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch genre analytics'
      };
    }
  }

  /**
   * Get payment analytics
   */
  static async getPaymentAnalytics(
    token: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await axiosClient.get('/analytics/payments', {
        ...this.getAuthHeaders(token),
        params: { startDate, endDate }
      });

      return {
        success: true,
        data: response.data,
        message: 'Payment analytics fetched successfully'
      };
    } catch (error: any) {
      console.error('Error fetching payment analytics:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch payment analytics'
      };
    }
  }

  /**
   * Generate custom report
   */
  static async generateReport(
    token: string,
    reportRequest: ReportRequest
  ): Promise<ApiResponse<any>> {
    try {
      const response = await axiosClient.post(
        '/analytics/reports/generate',
        reportRequest,
        this.getAuthHeaders(token)
      );

      return {
        success: true,
        data: response.data,
        message: 'Report generated successfully'
      };
    } catch (error: any) {
      console.error('Error generating report:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to generate report'
      };
    }
  }

  /**
   * Export report
   */
  static async exportReport(
    token: string,
    reportRequest: ReportRequest
  ): Promise<{ success: boolean; data?: Blob; message?: string }> {
    try {
      const response = await axiosClient.post(
        '/analytics/reports/export',
        reportRequest,
        {
          ...this.getAuthHeaders(token),
          responseType: 'blob'
        }
      );

      return {
        success: true,
        data: response.data,
        message: 'Report exported successfully'
      };
    } catch (error: any) {
      console.error('Error exporting report:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to export report'
      };
    }
  }

  /**
   * Get performance comparison
   */
  static async getPerformanceComparison(
    token: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await axiosClient.get('/analytics/performance/comparison', {
        ...this.getAuthHeaders(token),
        params: { startDate, endDate }
      });

      return {
        success: true,
        data: response.data,
        message: 'Performance comparison fetched successfully'
      };
    } catch (error: any) {
      console.error('Error fetching performance comparison:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch performance comparison'
      };
    }
  }

  /**
   * Get forecast data
   */
  static async getForecastData(
    token: string,
    days: number = 30
  ): Promise<ApiResponse<any>> {
    try {
      const response = await axiosClient.get('/analytics/forecast', {
        ...this.getAuthHeaders(token),
        params: { days }
      });

      return {
        success: true,
        data: response.data,
        message: 'Forecast data fetched successfully'
      };
    } catch (error: any) {
      console.error('Error fetching forecast data:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch forecast data'
      };
    }
  }
}

// Helper functions for chart components
export const getRevenueAnalytics = async (startDate: string, endDate: string, groupBy: string = 'MONTH') => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (!token) {
    console.warn('No auth token found');
    return null;
  }
  
  const result = await AnalyticsApiService.getRevenueAnalytics(token, startDate, endDate, groupBy);
  return result.success ? result.data : null;
};

export const getBookingAnalytics = async (startDate: string, endDate: string, groupBy: string = 'DAY') => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (!token) {
    console.warn('No auth token found');
    return null;
  }
  
  const result = await AnalyticsApiService.getBookingAnalytics(token, startDate, endDate, groupBy);
  return result.success ? result.data : null;
};

export const getMoviePerformanceAnalytics = async (startDate: string, endDate: string, limit: number = 20) => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (!token) {
    console.warn('No auth token found');
    return null;
  }
  
  const result = await AnalyticsApiService.getMoviePerformance(token, startDate, endDate, limit);
  return result.success ? result.data : null;
};
