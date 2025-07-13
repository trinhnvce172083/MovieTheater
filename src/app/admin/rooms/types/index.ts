// Room Management Types - Import and re-export types from API
import type { CinemaRoom, CinemaRoomCreateRequest } from '@/api/admin/getAllRooms';

export type CinemaRoomResponse = CinemaRoom;
export type RoomCreateRequest = CinemaRoomCreateRequest;

export interface RoomFilters {
  searchTerm: string;
  filterType: string | undefined;
  filterStatus: string | undefined;
}

export interface RoomStatistics {
  totalRooms: number;
  activeRooms: number;
  totalSeats: number;
  avgSeats: number;
}

export type BackendStatus = "checking" | "connected" | "disconnected";

export interface RoomManagementState {
  roomData: CinemaRoomResponse[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  totalElements: number;
  isModalVisible: boolean;
  editingRoom: CinemaRoomResponse | null;
  isUsingApiData: boolean;
  backendStatus: BackendStatus;
}
