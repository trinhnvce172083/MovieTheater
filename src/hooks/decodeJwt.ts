import { jwtDecode } from 'jwt-decode';

// Định nghĩa kiểu dữ liệu cho payload JWT
export interface JwtPayload {
  accountId?: string;
  sub?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  [key: string]: unknown;
}

// Hàm decode JWT, trả về kiểu JwtPayload hoặc null nếu lỗi
export function decodeJwt(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}