import axiosClient from "../axiosClient";

// Types matching backend DTOs
export interface DashboardSummaryResponse {
  overview: OverviewMetrics;
  revenue: RevenueMetrics;
  bookings: BookingMetrics;
  topMovies: MoviePerformance[];
  recentActivities: RecentActivity[];
  charts: ChartsData;
}

export interface OverviewMetrics {
  totalCustomers: number;
  totalBookings: number;
  totalRevenue: number;
  totalMovies: number;
  activeMovies: number;
  totalShows: number;
  averageRating: number;
  occupancyRate: number;
  customerGrowth: number;
  bookingGrowth: number;
  revenueGrowth: number;
  showGrowth: number;
}

export interface RevenueMetrics {
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  avgRevenuePerBooking: number;
  avgRevenuePerCustomer: number;
  revenueByPaymentMethod: Record<string, number>;
  dailyGrowth: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  monthlyTarget: number;
  monthlyProgress: number;
}

export interface BookingMetrics {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  cancellationRate: number;
  showRate: number;
  todayBookings: number;
  weeklyBookings: number;
  monthlyBookings: number;
  peakBookingTimes: PeakTime[];
  peakShowTimes: PeakTime[];
}

export interface MoviePerformance {
  movieId: number;
  movieTitle: string;
  posterUrl: string;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalShows: number;
  soldSeats: number;
  totalSeats: number;
  occupancyRate: number;
  genre: string;
  director: string;
  duration: number;
}

export interface RecentActivity {
  type: string;
  title: string;
  description: string;
  customerName: string;
  movieTitle: string;
  amount: number;
  activityDate: string;
  status: string;
  displayIcon: string;
  displayColor: string;
}

export interface ChartsData {
  revenueChart: ChartPoint[];
  bookingChart: ChartPoint[];
  customerChart: ChartPoint[];
  genreChart: GenrePerformance[];
  hourlyBookings: ChartPoint[];
  weeklyBookings: ChartPoint[];
}

export interface ChartPoint {
  label: string;
  value: number;
  count?: number;
  color?: string;
}

export interface GenrePerformance {
  genre: string;
  movieCount: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  color: string;
}

export interface PeakTime {
  timeLabel: string;
  hour: number;
  bookingCount: number;
  revenue: number;
  percentage: number;
}

// Mock data for fallback when backend is unavailable
const mockDashboardData: DashboardSummaryResponse = {
  overview: {
    totalCustomers: 2847,
    totalBookings: 1523,
    totalRevenue: 125680000,
    totalMovies: 24,
    activeMovies: 12,
    totalShows: 156,
    averageRating: 4.2,
    occupancyRate: 75,
    customerGrowth: 12.5,
    bookingGrowth: 8.3,
    revenueGrowth: 15.7,
    showGrowth: 5.2
  },
  revenue: {
    todayRevenue: 4250000,
    weeklyRevenue: 28750000,
    monthlyRevenue: 125680000,
    yearlyRevenue: 1450000000,
    avgRevenuePerBooking: 82500,
    avgRevenuePerCustomer: 44150,
    revenueByPaymentMethod: {
      "CASH": 45620000,
      "VNPAY": 52340000,
      "MOMO": 27720000
    },
    dailyGrowth: 5.2,
    weeklyGrowth: 12.8,
    monthlyGrowth: 15.7,
    monthlyTarget: 150000000,
    monthlyProgress: 83.8
  },
  bookings: {
    totalBookings: 1523,
    pendingBookings: 28,
    confirmedBookings: 1245,
    cancelledBookings: 89,
    completedBookings: 1161,
    cancellationRate: 5.8,
    showRate: 93.2,
    todayBookings: 47,
    weeklyBookings: 342,
    monthlyBookings: 1523,
    peakBookingTimes: [
      { timeLabel: "19:00-20:00", hour: 19, bookingCount: 156, revenue: 12870000, percentage: 28.5 },
      { timeLabel: "20:00-21:00", hour: 20, bookingCount: 134, revenue: 11045000, percentage: 24.8 },
      { timeLabel: "14:00-15:00", hour: 14, bookingCount: 89, revenue: 7335000, percentage: 16.4 }
    ],
    peakShowTimes: [
      { timeLabel: "Chủ nhật", hour: 0, bookingCount: 287, revenue: 23670000, percentage: 18.8 },
      { timeLabel: "Thứ bảy", hour: 6, bookingCount: 245, revenue: 20212500, percentage: 16.1 },
      { timeLabel: "Thứ sáu", hour: 5, bookingCount: 198, revenue: 16335000, percentage: 13.0 }
    ]
  },
  topMovies: [
    {
      movieId: 1,
      movieTitle: "Spider-Man: No Way Home",
      posterUrl: "/images/spiderman.jpg",
      totalBookings: 234,
      totalRevenue: 19305000,
      averageRating: 4.8,
      totalShows: 28,
      soldSeats: 2106,
      totalSeats: 2800,
      occupancyRate: 75.2,
      genre: "Action, Adventure",
      director: "Jon Watts",
      duration: 148
    },
    {
      movieId: 2,
      movieTitle: "Avengers: Endgame",
      posterUrl: "/images/avengers.jpg",
      totalBookings: 198,
      totalRevenue: 16335000,
      averageRating: 4.9,
      totalShows: 24,
      soldSeats: 1782,
      totalSeats: 2400,
      occupancyRate: 74.3,
      genre: "Action, Sci-Fi",
      director: "Russo Brothers",
      duration: 181
    }
  ],
  recentActivities: [
    {
      type: "BOOKING",
      title: "Đặt vé mới",
      description: "Khách hàng đặt 2 vé xem Spider-Man",
      customerName: "Nguyễn Văn A",
      movieTitle: "Spider-Man: No Way Home",
      amount: 165000,
      activityDate: "2025-07-30",
      status: "CONFIRMED",
      displayIcon: "ticket",
      displayColor: "green"
    },
    {
      type: "PAYMENT",
      title: "Thanh toán thành công",
      description: "Thanh toán VNPay cho đơn hàng #1234",
      customerName: "Trần Thị B",
      movieTitle: "Avengers: Endgame",
      amount: 245000,
      activityDate: "2025-07-30",
      status: "PAID",
      displayIcon: "credit-card",
      displayColor: "blue"
    }
  ],
  charts: {
    revenueChart: [
      { label: "01/07", value: 3250000 },
      { label: "02/07", value: 4120000 },
      { label: "03/07", value: 3890000 },
      { label: "04/07", value: 4560000 },
      { label: "05/07", value: 5230000 },
      { label: "06/07", value: 4890000 },
      { label: "07/07", value: 6150000 }
    ],
    bookingChart: [
      { label: "Mon", value: 45, count: 45 },
      { label: "Tue", value: 52, count: 52 },
      { label: "Wed", value: 38, count: 38 },
      { label: "Thu", value: 67, count: 67 },
      { label: "Fri", value: 84, count: 84 },
      { label: "Sat", value: 95, count: 95 },
      { label: "Sun", value: 103, count: 103 }
    ],
    customerChart: [
      { label: "Jan", value: 2100 },
      { label: "Feb", value: 2300 },
      { label: "Mar", value: 2450 },
      { label: "Apr", value: 2380 },
      { label: "May", value: 2650 },
      { label: "Jun", value: 2847 }
    ],
    genreChart: [
      { genre: "Action", movieCount: 8, totalBookings: 456, totalRevenue: 37620000, averageRating: 4.3, color: "#3B82F6" },
      { genre: "Comedy", movieCount: 5, totalBookings: 287, totalRevenue: 23670000, averageRating: 4.1, color: "#10B981" },
      { genre: "Drama", movieCount: 6, totalBookings: 345, totalRevenue: 28462500, averageRating: 4.5, color: "#F59E0B" },
      { genre: "Horror", movieCount: 3, totalBookings: 198, totalRevenue: 16335000, averageRating: 3.9, color: "#EF4444" },
      { genre: "Romance", movieCount: 2, totalBookings: 237, totalRevenue: 19552500, averageRating: 4.2, color: "#EC4899" }
    ],
    hourlyBookings: [
      { label: "00:00", value: 2 },
      { label: "01:00", value: 1 },
      { label: "02:00", value: 0 },
      { label: "09:00", value: 12 },
      { label: "10:00", value: 23 },
      { label: "11:00", value: 34 },
      { label: "12:00", value: 45 },
      { label: "13:00", value: 52 },
      { label: "14:00", value: 67 },
      { label: "15:00", value: 78 },
      { label: "16:00", value: 89 },
      { label: "17:00", value: 95 },
      { label: "18:00", value: 112 },
      { label: "19:00", value: 156 },
      { label: "20:00", value: 134 },
      { label: "21:00", value: 89 },
      { label: "22:00", value: 45 },
      { label: "23:00", value: 23 }
    ],
    weeklyBookings: [
      { label: "Mon", value: 45 },
      { label: "Tue", value: 52 },
      { label: "Wed", value: 38 },
      { label: "Thu", value: 67 },
      { label: "Fri", value: 84 },
      { label: "Sat", value: 95 },
      { label: "Sun", value: 103 }
    ]
  }
};

// API Functions
export const getDashboardSummary = async (
  startDate?: string,
  endDate?: string
): Promise<DashboardSummaryResponse> => {
  try {
    console.log('Making API call to GET /analytics/dashboard');
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axiosClient.get('/analytics/dashboard', { params });
    console.log('Dashboard API Response:', response.data);
    
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    } else {
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Dashboard API failed, using mock data:', error);
    return mockDashboardData;
  }
};

export const getRevenueAnalytics = async (
  startDate: string,
  endDate: string,
  groupBy: string = 'DAY'
): Promise<any> => {
  try {
    const response = await axiosClient.get('/analytics/revenue', {
      params: { startDate, endDate, groupBy }
    });
    
    if (response.data?.success) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Revenue analytics API failed, using mock data:', error);
    // Return mock data with consistent structure
    return {
      totalRevenue: 125680000,
      revenueData: [
        { label: 'Jan', value: 15000000 },
        { label: 'Feb', value: 18000000 },
        { label: 'Mar', value: 22000000 },
        { label: 'Apr', value: 19000000 },
        { label: 'May', value: 25000000 },
        { label: 'Jun', value: 26680000 }
      ],
      growth: 15.7
    };
  }
};

export const getBookingAnalytics = async (
  startDate: string,
  endDate: string,
  groupBy: string = 'DAY'
): Promise<any> => {
  try {
    const response = await axiosClient.get('/analytics/bookings', {
      params: { startDate, endDate, groupBy }
    });
    return response.data;
  } catch (error) {
    console.error('Booking analytics API failed, using mock data:', error);
    // Return mock data with consistent structure
    return {
      totalBookings: 1523,
      bookingData: [
        { label: 'Mon', value: 120 },
        { label: 'Tue', value: 200 },
        { label: 'Wed', value: 150 },
        { label: 'Thu', value: 300 },
        { label: 'Fri', value: 180 },
        { label: 'Sat', value: 250 },
        { label: 'Sun', value: 323 }
      ],
      cancellationRate: 5.8
    };
  }
};

export const getMoviePerformance = async (
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<any> => {
  try {
    const response = await axiosClient.get('/analytics/movies/performance', {
      params: { startDate, endDate, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Movie performance API failed, using mock data:', error);
    // Return mock data with consistent structure
    return {
      topMovies: [
        { movieTitle: 'Action Movie 1', totalBookings: 150 },
        { movieTitle: 'Drama Movie 2', totalBookings: 120 },
        { movieTitle: 'Comedy Movie 3', totalBookings: 100 },
        { movieTitle: 'Thriller Movie 4', totalBookings: 80 },
        { movieTitle: 'Romance Movie 5', totalBookings: 60 }
      ],
      totalMovies: 5
    };
  }
};

export const getRealTimeStats = async (): Promise<any> => {
  try {
    const response = await axiosClient.get('/analytics/dashboard/real-time');
    
    if (response.data?.success) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Real-time stats API failed:', error);
    return {
      onlineUsers: 847,
      todayBookings: 47,
      todayRevenue: 4250000,
      activeShows: 12
    };
  }
};

// Alias function for backward compatibility
export const getMoviePerformanceAnalytics = getMoviePerformance;

export { mockDashboardData };
