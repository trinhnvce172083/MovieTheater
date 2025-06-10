// 🎬 Movie Theater Frontend - Environment Configuration
// Centralized environment variables với validation

interface EnvironmentConfig {
  // API Configuration
  apiUrl: string;
  appName: string;
  appVersion: string;
  
  // Development Settings
  isDevelopment: boolean;
  isProduction: boolean;
  debugMode: boolean;
  
  // API Endpoints
  swaggerUrl: string;
  healthCheckUrl: string;
  
  // Authentication
  tokenStorageKey: string;
  userStorageKey: string;
  refreshTokenKey: string;
  tokenExpiresIn: number;
  autoRefreshThreshold: number;
  
  // File Upload
  maxFileSize: number;
  allowedImageTypes: string[];
  
  // Pagination
  defaultPageSize: number;
  maxPageSize: number;
  
  // UI Settings
  theme: string;
  language: string;
  currency: string;
  
  // Feature Flags
  enableAdminFeatures: boolean;
  enableBookingSystem: boolean;
  enablePaymentIntegration: boolean;
  enableEmailNotifications: boolean;
}

function getEnvironmentVariable(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
}

function getBooleanEnvironmentVariable(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

function getNumberEnvironmentVariable(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  return parsed;
}

// Create environment configuration
const environment: EnvironmentConfig = {
  // API Configuration
  apiUrl: getEnvironmentVariable('NEXT_PUBLIC_API_URL', 'http://localhost:8080'),
  appName: getEnvironmentVariable('NEXT_PUBLIC_APP_NAME', 'Lumiere Cinema'),
  appVersion: getEnvironmentVariable('NEXT_PUBLIC_APP_VERSION', '1.0.0'),
  
  // Development Settings
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  debugMode: getBooleanEnvironmentVariable('NEXT_PUBLIC_DEBUG_MODE', false),
  
  // API Endpoints
  swaggerUrl: getEnvironmentVariable(
    'NEXT_PUBLIC_SWAGGER_URL', 
    'http://localhost:8080/cinema/swagger-ui.html'
  ),
  healthCheckUrl: getEnvironmentVariable(
    'NEXT_PUBLIC_HEALTH_CHECK_URL',
    'http://localhost:8080/cinema/actuator/health'
  ),
  
  // Authentication
  tokenStorageKey: getEnvironmentVariable('NEXT_PUBLIC_TOKEN_STORAGE_KEY', 'movie_theater_token'),
  userStorageKey: getEnvironmentVariable('NEXT_PUBLIC_USER_STORAGE_KEY', 'movie_theater_user'),
  refreshTokenKey: getEnvironmentVariable('NEXT_PUBLIC_REFRESH_TOKEN_KEY', 'movie_theater_refresh_token'),
  tokenExpiresIn: getNumberEnvironmentVariable('NEXT_PUBLIC_TOKEN_EXPIRES_IN', 3600),
  autoRefreshThreshold: getNumberEnvironmentVariable('NEXT_PUBLIC_AUTO_REFRESH_THRESHOLD', 300),
  
  // File Upload
  maxFileSize: getNumberEnvironmentVariable('NEXT_PUBLIC_MAX_FILE_SIZE', 5242880), // 5MB
  allowedImageTypes: getEnvironmentVariable(
    'NEXT_PUBLIC_ALLOWED_IMAGE_TYPES',
    'image/jpeg,image/jpg,image/png,image/webp'
  ).split(','),
  
  // Pagination
  defaultPageSize: getNumberEnvironmentVariable('NEXT_PUBLIC_DEFAULT_PAGE_SIZE', 10),
  maxPageSize: getNumberEnvironmentVariable('NEXT_PUBLIC_MAX_PAGE_SIZE', 100),
  
  // UI Settings
  theme: getEnvironmentVariable('NEXT_PUBLIC_THEME', 'light'),
  language: getEnvironmentVariable('NEXT_PUBLIC_LANGUAGE', 'vi'),
  currency: getEnvironmentVariable('NEXT_PUBLIC_CURRENCY', 'VND'),
  
  // Feature Flags
  enableAdminFeatures: getBooleanEnvironmentVariable('NEXT_PUBLIC_ENABLE_ADMIN_FEATURES', true),
  enableBookingSystem: getBooleanEnvironmentVariable('NEXT_PUBLIC_ENABLE_BOOKING_SYSTEM', true),
  enablePaymentIntegration: getBooleanEnvironmentVariable('NEXT_PUBLIC_ENABLE_PAYMENT_INTEGRATION', false),
  enableEmailNotifications: getBooleanEnvironmentVariable('NEXT_PUBLIC_ENABLE_EMAIL_NOTIFICATIONS', false),
};

// Validation
if (environment.isDevelopment) {
  console.log('🎬 Movie Theater Frontend - Development Mode');
  console.log('📡 API URL:', environment.apiUrl);
  console.log('🔧 Debug Mode:', environment.debugMode);
}

// Export configuration
export default environment;

// Export specific configs for convenience
export const {
  apiUrl,
  appName,
  appVersion,
  isDevelopment,
  isProduction,
  debugMode,
  swaggerUrl,
  healthCheckUrl,
  tokenStorageKey,
  userStorageKey,
  refreshTokenKey,
  tokenExpiresIn,
  autoRefreshThreshold,
  maxFileSize,
  allowedImageTypes,
  defaultPageSize,
  maxPageSize,
  theme,
  language,
  currency,
  enableAdminFeatures,
  enableBookingSystem,
  enablePaymentIntegration,
  enableEmailNotifications,
} = environment; 