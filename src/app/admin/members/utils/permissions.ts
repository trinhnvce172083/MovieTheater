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
  
  // Admin can edit all users except other admins
  if (currentUser.role === 'ADMIN') {
    // Admin cannot edit other admins (for safety)
    if (targetUser.type === 'ADMIN') {
      // Only allow editing self if both are admins
      const currentUserId = String(currentUser.id);
      const targetUserId = String(targetUser.id);
      return currentUserId === targetUserId;
    }
    // Admin can edit all non-admin users
    return true;
  }
  
  // Non-admin users can only edit their own information
  const currentUserId = String(currentUser.id);
  const targetUserId = String(targetUser.id);
  return currentUserId === targetUserId;
};

export const canDelete = (currentUser: CurrentUser | null, targetUser: MemberData): boolean => {
  if (!currentUser) return false;
  
  // Cannot delete yourself
  const currentUserId = String(currentUser.id);
  const targetUserId = String(targetUser.id);
  if (currentUserId === targetUserId) return false;
  
  // Only ADMIN can delete users
  if (currentUser.role !== 'ADMIN') return false;
  
  // Admin cannot delete other admins (for safety)
  if (targetUser.type === 'ADMIN') return false;
  
  return true;
};

/**
 * Check if current user can lock the target user
 */
export const canLockUser = (currentUser: CurrentUser | null, targetUser: MemberData): boolean => {
  if (!currentUser) return false;
  
  // Cannot lock yourself
  const currentUserId = String(currentUser.id);
  const targetUserId = String(targetUser.id);
  if (currentUserId === targetUserId) return false;
  
  // Only ADMIN can lock users
  if (currentUser.role !== 'ADMIN') return false;
  
  // Admin cannot lock other admins (for safety)
  if (targetUser.type === 'ADMIN') return false;
  
  return true;
};

/**
 * Check if current user can unlock the target user
 */
export const canUnlockUser = (currentUser: CurrentUser | null, targetUser: MemberData): boolean => {
  if (!currentUser) return false;
  
  // Cannot unlock yourself
  const currentUserId = String(currentUser.id);
  const targetUserId = String(targetUser.id);
  if (currentUserId === targetUserId) return false;
  
  // Only ADMIN can unlock users
  if (currentUser.role !== 'ADMIN') return false;
  
  // Admin cannot unlock other admins (for safety)
  if (targetUser.type === 'ADMIN') return false;
  
  return true;
};

/**
 * Check if current user can activate the target user
 */
export const canActivateUser = (currentUser: CurrentUser | null, targetUser: MemberData): boolean => {
  if (!currentUser) return false;
  
  // Cannot activate yourself
  const currentUserId = String(currentUser.id);
  const targetUserId = String(targetUser.id);
  if (currentUserId === targetUserId) return false;
  
  // Only ADMIN can activate users
  if (currentUser.role !== 'ADMIN') return false;
  
  // Admin cannot activate other admins (for safety)
  if (targetUser.type === 'ADMIN') return false;
  
  return true;
};

/**
 * Check if current user can deactivate the target user
 */
export const canDeactivateUser = (currentUser: CurrentUser | null, targetUser: MemberData): boolean => {
  if (!currentUser) return false;
  
  // Cannot deactivate yourself
  const currentUserId = String(currentUser.id);
  const targetUserId = String(targetUser.id);
  if (currentUserId === targetUserId) return false;
  
  // Only ADMIN can deactivate users
  if (currentUser.role !== 'ADMIN') return false;
  
  // Admin cannot deactivate other admins (for safety)
  if (targetUser.type === 'ADMIN') return false;
  
  return true;
};
