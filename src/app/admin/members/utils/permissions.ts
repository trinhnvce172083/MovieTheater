import { MemberData, CurrentUser } from '../types';

/**
 * Permission checking utilities for member management
 */

export const canViewDetails = (currentUser: CurrentUser | null, targetUser: MemberData): boolean => {
  if (!currentUser) return false;
  // Admin can view all users
  if (currentUser.role === 'ADMIN') return true;
  // Users can view their own details
  return String(currentUser.id) === String(targetUser.id);
};

export const canEdit = (currentUser: CurrentUser | null, targetUser: MemberData): boolean => {
  if (!currentUser) return false;
  // Users can only edit their own information
  const currentUserId = String(currentUser.id);
  const targetUserId = String(targetUser.id);
  
  return currentUserId === targetUserId;
};

export const canDelete = (currentUser: CurrentUser | null, targetUser: MemberData): boolean => {
  if (!currentUser) return false;
  // Admin can delete non-admin users (EMPLOYEE, MEMBER, CUSTOMER)
  if (currentUser.role === 'ADMIN' && targetUser.type !== 'ADMIN') {
    return true;
  }
  return false;
};
