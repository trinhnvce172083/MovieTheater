
export const InputData = {
  username: "admin1",
  password: "12345Aa@",
  rememberMe: true,
};

export const SuccessResponse = {
  data: {
    success: true,
    message: "Đăng nhập thành công",
    data: {
      accessToken: "token",
      refreshToken: "refresh-token",
      expiresIn: 86400000,
      user: {
        id: 3,
        username: "admin1",
        email: "Vinhlcse184764@fpt.edu.vn",
        fullName: "Lê Công Vinh",
        phoneNumber: "0869723587",
        role: "MEMBER",
        emailVerified: true,
      },
    },
    timestamp: "2025-07-14T01:55:11.727250736",
  },
};

export const WrongInputResponse = {
  response: {
    data: {
      success: false,
      code: 1102,
      message: "Thông tin đăng nhập không đúng",
      errorCode: "INVALID_CREDENTIALS",
      timestamp: "2025-07-14T01:56:25.040958606",
    },
  },
};

export const NoUserFoundResponse = {
  response: {
    data: {
      success: false,
      code: 1102,
      message: "Thông tin đăng nhập không đúng",
      errorCode: "INVALID_CREDENTIALS",
      timestamp: "2025-07-14T02:10:27.321990104",
    },
  },
};