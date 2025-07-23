import { MovieData, ApiMovie, CurrentUser } from '../types';

/**
 * Transform API Movie response to MovieData for display
 */
export const transformApiMovieToMovieData = (apiMovie: ApiMovie): MovieData => {
  return {
    key: apiMovie.movieId.toString(),
    id: apiMovie.movieId,
    title: apiMovie.title || '',
    genre: apiMovie.genre || '',  // Changed from apiMovie.genres to apiMovie.genre
    duration: apiMovie.duration || 0,
    releaseDate: apiMovie.releaseDate || '',
    status: (apiMovie.status as 'NOW_SHOWING' | 'COMING_SOON' | 'ENDED') || 'COMING_SOON',
    posterUrl: apiMovie.posterUrl,
    isFeatured: apiMovie.isFeatured || false,
    price: apiMovie.price || 0,
    rating: apiMovie.rating,
    imdbRating: apiMovie.imdbRating,
    formattedDuration: apiMovie.formattedDuration || `${apiMovie.duration || 0} phút`,
    director: apiMovie.director,
    description: apiMovie.description,
    cast: apiMovie.cast,
    language: apiMovie.language,
    country: apiMovie.country,
    productionCompany: apiMovie.productionCompany,
    budget: apiMovie.budget,
    boxOffice: apiMovie.boxOffice,
    backdropUrl: apiMovie.backdropUrl,
    trailerUrl: apiMovie.trailerUrl,
    endDate: apiMovie.endDate,
    isActive: apiMovie.isActive
  };
};

/**
 * Get current user from storage
 */
export const getCurrentUserFromStorage = (): CurrentUser | null => {
  try {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    return {
      id: user.accountId?.toString() || user.id?.toString() || '',
      name: user.fullName || user.name || '',
      email: user.email || '',
      role: user.role || '',
      avatar: user.avatar || user.avatarUrl
    };
  } catch {
    return null;
  }
};

/**
 * Check if auth token exists
 */
export const checkAuthToken = (): boolean => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('token');
  return !!token && token.trim() !== '';
};

/**
 * Format duration to readable string
 */
export const formatDuration = (minutes: number): string => {
  if (!minutes || minutes <= 0) return '0 phút';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes} phút`;
};

/**
 * Format currency (VND)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

/**
 * Format date to Vietnamese format
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch {
    return dateString;
  }
};

/**
 * Get status color for movie status
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'NOW_SHOWING':
      return 'green';
    case 'COMING_SOON':
      return 'blue';
    case 'ENDED':
      return 'red';
    default:
      return 'default';
  }
};

/**
 * Get status text in Vietnamese
 */
export const getStatusText = (status: string): string => {
  switch (status) {
    case 'NOW_SHOWING':
      return 'Đang chiếu';
    case 'COMING_SOON':
      return 'Sắp chiếu';
    case 'ENDED':
      return 'Đã kết thúc';
    default:
      return status;
  }
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate movie title
 */
export const validateMovieTitle = (title: string): boolean => {
  return title && title.trim().length > 0 && title.length <= 200;
};

/**
 * Validate movie duration
 */
export const validateDuration = (duration: number): boolean => {
  return duration && duration > 0 && duration <= 600;
};

/**
 * Validate movie price
 */
export const validatePrice = (price: number): boolean => {
  return price && price > 0 && price <= 1000000;
};
