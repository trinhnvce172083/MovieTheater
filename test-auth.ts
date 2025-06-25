// Test script to verify token detection
import { getAuthTokenFromCookies } from '../src/utils/authCookies';

console.log('Testing token detection...');

// Test getting token from cookies
const cookieToken = getAuthTokenFromCookies();
console.log('Cookie token:', cookieToken ? 'Found' : 'Not found');

// Test localStorage
const localToken = localStorage?.getItem?.('accessToken');
console.log('LocalStorage token:', localToken ? 'Found' : 'Not found');

export {};
