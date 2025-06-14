import { jwtDecode } from 'jwt-decode';

export function decodeJwt(token: string): any {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}