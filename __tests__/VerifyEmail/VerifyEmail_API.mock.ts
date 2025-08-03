export const ValidToken = "valid-token-12345";
export const InvalidToken = "invalid-token-67890";
export const ExpiredToken = "expired-token-abcde";

export const SuccessVerificationResponse = {
  data: {
    success: true,
    message: "Email đã được xác thực thành công",
    data: {
      userId: 3,
      email: "user@example.com",
      isVerified: true,
      verifiedAt: "2025-08-03T10:30:00.000Z"
    },
    timestamp: "2025-08-03T10:30:00.000Z"
  }
};

export const InvalidTokenResponse = {
  response: {
    data: {
      success: false,
      code: 1201,
      message: "Token xác thực không hợp lệ",
      errorCode: "INVALID_VERIFICATION_TOKEN",
      timestamp: "2025-08-03T10:30:00.000Z"
    },
    status: 400
  }
};

export const ExpiredTokenResponse = {
  response: {
    data: {
      success: false,
      code: 1202,
      message: "Token xác thực đã hết hạn",
      errorCode: "EXPIRED_VERIFICATION_TOKEN",
      timestamp: "2025-08-03T10:30:00.000Z"
    },
    status: 400
  }
};

export const AlreadyVerifiedResponse = {
  response: {
    data: {
      success: false,
      code: 1203,
      message: "Email đã được xác thực trước đó",
      errorCode: "EMAIL_ALREADY_VERIFIED",
      timestamp: "2025-08-03T10:30:00.000Z"
    },
    status: 400
  }
};

export const UserNotFoundResponse = {
  response: {
    data: {
      success: false,
      code: 1204,
      message: "Không tìm thấy người dùng",
      errorCode: "USER_NOT_FOUND",
      timestamp: "2025-08-03T10:30:00.000Z"
    },
    status: 404
  }
};

export const NetworkErrorResponse = {
  response: {
    data: {
      success: false,
      code: 5000,
      message: "Lỗi mạng, vui lòng thử lại sau",
      errorCode: "NETWORK_ERROR",
      timestamp: "2025-08-03T10:30:00.000Z"
    },
    status: 500
  }
};
