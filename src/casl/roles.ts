/**
 * Define user roles for the cinema application
 */
export enum Role {
  ADMIN = 'admin',
  STAFF = 'staff',
  MEMBER = 'member',   // Authorized user
  CUSTOMER = 'customer' // Guest/non-member
}

// Map role to display names for UI
export const roleNames = {
  [Role.ADMIN]: 'Administrator',
  [Role.STAFF]: 'Staff Member',
  [Role.MEMBER]: 'Member',
  [Role.CUSTOMER]: 'Customer',
};
