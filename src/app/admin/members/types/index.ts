/**
 * Type definitions for Member Management
 */

// Interface for Member Data displayed in table
export interface MemberData {
  key: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: "active" | "inactive";
  type: string;
  avatar: string;
  username?: string;
  address?: string;
  dob?: string;
}

// Interface for API User Response from backend
export interface ApiUser {
  accountId?: number;
  fullName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  createdAt?: string;
  isActive?: boolean;
  role?: string;
  avatar?: string;
  address?: string;
  dateOfBirth?: string;
}

// Interface for creating/updating members
export interface MemberCreateRequest {
  username: string;
  password?: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  role: string;
  isActive: boolean;
}

// Interface for error responses
export interface ApiErrorResponse {
  response: {
    status: number;
    data: unknown;
  };
}

// Interface for Member Statistics
export interface MemberStatistics {
  totalMembers: number;
  activeMembers: number;
  newMembers: number;
  types: Record<string, number>;
}

// Interface for Current User
export interface CurrentUser {
  id: string;
  role: string;
  username: string;
}

// Interface for filters
export interface MemberFilters {
  searchTerm: string;
  filterStatus: string;
  filterType: string;
}

// Interface for pagination
export interface PaginationState {
  currentPage: number;
  pageSize: number;
}
