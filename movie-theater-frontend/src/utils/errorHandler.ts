/**
 * Error Handler Utility
 * Xử lý error response từ backend với error code chuẩn
 * 
 * @author Dũng_Solo
 * @version 1.0.0
 */

export interface ApiError {
    success: boolean;
    code: number;
    message: string;
    errorCode: string;
    data?: any;
    timestamp: string;
}

export interface ErrorResponse {
    response?: {
        data?: ApiError;
        status?: number;
    };
    message?: string;
}

/**
 * Xử lý error response và trả về message phù hợp
 */
export const handleApiError = (error: ErrorResponse, defaultMessage: string = 'Có lỗi xảy ra'): string => {
    // Nếu có error response từ server
    if (error?.response?.data) {
        const errorData = error.response.data;

        // Ưu tiên message từ server
        if (errorData.message) {
            return errorData.message;
        }

        // Fallback dựa trên error code
        return getErrorMessageByCode(errorData.errorCode, errorData.code);
    }

    // Nếu có message từ axios/network error
    if (error?.message) {
        return error.message;
    }

    return defaultMessage;
};

/**
 * Lấy error message dựa trên error code
 */
const getErrorMessageByCode = (errorCode?: string, code?: number): string => {
    const errorMessages: Record<string, string> = {
        // Authentication & Authorization
        'UNAUTHENTICATED': 'Phiên đăng nhập đã hết hạn',
        'UNAUTHORIZED': 'Bạn không có quyền thực hiện thao tác này',
        'ACCESS_DENIED': 'Truy cập bị từ chối',
        'INVALID_CREDENTIALS': 'Thông tin đăng nhập không đúng',
        'TOKEN_EXPIRED': 'Token đã hết hạn',
        'TOKEN_INVALID': 'Token không hợp lệ',
        'ACCOUNT_LOCKED': 'Tài khoản đã bị khóa',
        'EMAIL_NOT_VERIFIED': 'Email chưa được xác thực',

        // User Management
        'USER_NOT_FOUND': 'Người dùng không tồn tại',
        'USER_ALREADY_EXISTS': 'Người dùng đã tồn tại',
        'USERNAME_ALREADY_EXISTS': 'Username đã được sử dụng',
        'EMAIL_ALREADY_EXISTS': 'Email đã được sử dụng',
        'PHONE_ALREADY_EXISTS': 'Số điện thoại đã được sử dụng',
        'USERNAME_INVALID': 'Username không hợp lệ',
        'EMAIL_INVALID': 'Email không đúng định dạng',
        'PASSWORD_INVALID': 'Mật khẩu không hợp lệ',
        'PASSWORD_NOT_MATCH': 'Mật khẩu xác nhận không khớp',
        'PHONE_INVALID': 'Số điện thoại không hợp lệ',
        'AGE_INVALID': 'Tuổi không hợp lệ',
        'FULLNAME_INVALID': 'Tên đầy đủ không hợp lệ',
        'TERMS_NOT_AGREED': 'Bạn phải đồng ý với điều khoản sử dụng',

        // Validation
        'VALIDATION_ERROR': 'Dữ liệu không hợp lệ',
        'RESOURCE_NOT_FOUND': 'Tài nguyên không tìm thấy',

        // Rate Limiting
        'RATE_LIMIT_EXCEEDED': 'Quá nhiều yêu cầu, vui lòng thử lại sau',
        'REGISTRATION_RATE_LIMIT': 'Quá nhiều yêu cầu đăng ký từ IP này',
        'LOGIN_RATE_LIMIT': 'Quá nhiều yêu cầu đăng nhập từ IP này',
        'EMAIL_RATE_LIMIT': 'Quá nhiều yêu cầu gửi email từ địa chỉ này',

        // System
        'UNCATEGORIZED_EXCEPTION': 'Lỗi hệ thống không xác định',
        'INVALID_KEY': 'Khóa thông báo không hợp lệ'
    };

    // Ưu tiên error code
    if (errorCode && errorMessages[errorCode]) {
        return errorMessages[errorCode];
    }

    // Fallback dựa trên HTTP status code
    if (code) {
        switch (code) {
            case 400:
                return 'Yêu cầu không hợp lệ';
            case 401:
                return 'Chưa đăng nhập hoặc phiên đã hết hạn';
            case 403:
                return 'Không có quyền truy cập';
            case 404:
                return 'Không tìm thấy tài nguyên';
            case 409:
                return 'Dữ liệu đã tồn tại';
            case 429:
                return 'Quá nhiều yêu cầu, vui lòng thử lại sau';
            case 500:
                return 'Lỗi máy chủ nội bộ';
            case 502:
                return 'Máy chủ không phản hồi';
            case 503:
                return 'Dịch vụ tạm thời không khả dụng';
            default:
                return 'Có lỗi xảy ra';
        }
    }

    return 'Có lỗi xảy ra';
};

/**
 * Xử lý validation errors từ server
 */
export const handleValidationErrors = (error: ErrorResponse): Record<string, string> => {
    const validationErrors: Record<string, string> = {};

    if (error?.response?.data?.data && typeof error.response.data.data === 'object') {
        return error.response.data.data;
    }

    return validationErrors;
};

/**
 * Check if error is authentication error
 */
export const isAuthError = (error: ErrorResponse): boolean => {
    const authErrorCodes = ['UNAUTHENTICATED', 'TOKEN_EXPIRED', 'TOKEN_INVALID'];
    const errorCode = error?.response?.data?.errorCode;
    const status = error?.response?.status;

    return authErrorCodes.includes(errorCode || '') || status === 401;
};

/**
 * Check if error is permission error
 */
export const isPermissionError = (error: ErrorResponse): boolean => {
    const permissionErrorCodes = ['UNAUTHORIZED', 'ACCESS_DENIED'];
    const errorCode = error?.response?.data?.errorCode;
    const status = error?.response?.status;

    return permissionErrorCodes.includes(errorCode || '') || status === 403;
};

/**
 * Format error for logging
 */
export const formatErrorForLogging = (error: ErrorResponse, context?: string): string => {
    const errorData = error?.response?.data;
    const status = error?.response?.status;

    const logParts = [];

    if (context) {
        logParts.push(`[${context}]`);
    }

    if (status) {
        logParts.push(`Status: ${status}`);
    }

    if (errorData?.errorCode) {
        logParts.push(`Code: ${errorData.errorCode}`);
    }

    if (errorData?.message) {
        logParts.push(`Message: ${errorData.message}`);
    } else if (error?.message) {
        logParts.push(`Message: ${error.message}`);
    }

    return logParts.join(' | ');
}; 