import axiosClient from "../axiosClient";
import axios from 'axios';

export interface CinemaRoom {
  cinemaRoomId: number;
  cinemaRoomName: string;
  seatQuantity: number;
  roomType: 'STANDARD' | 'VIP' | 'IMAX' | '4DX';
  isActive: boolean;
  description: string;
  rows: number;
  columns: number;
  has3D: boolean;
  hasDolbyAtmos: boolean;
  hasReclinerSeats: boolean;
  priceMultiplier: number;
  createdAt: string;
  updatedAt: string;
  displayName?: string;
  isVIP?: boolean;
  isIMAX?: boolean;
  is4DX?: boolean;
  isPremium?: boolean;
  availableSeats?: number;
  occupiedSeats?: number;
  temporarilyReservedSeats?: number;
  maintenanceSeats?: number;
  scheduleCount?: number;
}

export interface CinemaRoomCreateRequest {
  cinemaRoomName: string;
  roomType: 'STANDARD' | 'VIP' | 'IMAX' | '4DX';
  seatQuantity: number;
  rows: number;
  columns: number;
  description?: string;
  has3D?: boolean;
  hasDolbyAtmos?: boolean;
  hasReclinerSeats?: boolean;
  priceMultiplier: number;
  isActive?: boolean;
}

export interface CinemaRoomUpdateRequest {
  cinemaRoomName?: string;
  roomType?: 'STANDARD' | 'VIP' | 'IMAX' | '4DX';
  seatQuantity?: number;
  rows?: number;
  columns?: number;
  description?: string;
  has3D?: boolean;
  hasDolbyAtmos?: boolean;
  hasReclinerSeats?: boolean;
  priceMultiplier?: number;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface CinemaRoomStatistics {
  totalRooms: number;
  activeRooms: number;
  totalSeats: number;
  averageSeatsPerRoom: number;
  vipRooms: number;
  standardRooms: number;
  premiumRooms: number;
  imaxRooms: number;
  fourDxRooms: number;
}

// Mock data for fallback
const mockRooms: CinemaRoom[] = [
  {
    cinemaRoomId: 1,
    cinemaRoomName: "Premium Hall A",
    seatQuantity: 48,
    roomType: "VIP",
    isActive: true,
    description: "Premium cinema hall with luxury seating and enhanced viewing experience",
    rows: 6,
    columns: 8,
    has3D: true,
    hasDolbyAtmos: true,
    hasReclinerSeats: true,
    priceMultiplier: 1.5,
    createdAt: "2024-01-15T10:00:00",
    updatedAt: "2024-06-20T14:30:00",
  },
  {
    cinemaRoomId: 2,
    cinemaRoomName: "Standard Hall B",
    seatQuantity: 40,
    roomType: "STANDARD",
    isActive: true,
    description: "Standard cinema hall with comfortable seating for regular movie viewing",
    rows: 5,
    columns: 8,
    has3D: false,
    hasDolbyAtmos: false,
    hasReclinerSeats: false,
    priceMultiplier: 1.0,
    createdAt: "2024-01-20T09:00:00",
    updatedAt: "2024-06-18T11:15:00",
  },
  {
    cinemaRoomId: 3,
    cinemaRoomName: "IMAX Theater",
    seatQuantity: 80,
    roomType: "IMAX",
    isActive: true,
    description: "Large format IMAX theater with premium viewing experience",
    rows: 8,
    columns: 10,
    has3D: true,
    hasDolbyAtmos: true,
    hasReclinerSeats: true,
    priceMultiplier: 2.5,
    createdAt: "2024-02-01T08:00:00",
    updatedAt: "2024-06-22T16:45:00",
  },
  {
    cinemaRoomId: 4,
    cinemaRoomName: "4DX Experience",
    seatQuantity: 32,
    roomType: "4DX",
    isActive: true,
    description: "4DX theater with motion seats and environmental effects",
    rows: 4,
    columns: 8,
    has3D: true,
    hasDolbyAtmos: true,
    hasReclinerSeats: true,
    priceMultiplier: 3.0,
    createdAt: "2024-03-10T12:00:00",
    updatedAt: "2024-06-21T09:30:00",
  },
];

// # Create API Response error handler
const handleApiError = (error: unknown, operation: string) => {
  console.error(`${operation} failed:`, error);
  
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   `Failed to ${operation.toLowerCase()}`;
    throw new Error(message);
  }
  
  throw new Error(`Failed to ${operation.toLowerCase()}`);
};
export const getAllRooms = async (
  page = 0,
  size = 10,
  sortBy = 'cinemaRoomName',
  sortDirection = 'asc'
): Promise<PaginatedResponse<CinemaRoom>> => {
  try {
    console.log('Making API call to GET /cinema-rooms'); // Debug log
    const response = await axiosClient.get('/cinema-rooms', {
      params: { 
        page, 
        size, 
        sortBy, 
        sortDirection,
        _t: Date.now() // Cache busting parameter
      }
    });
    console.log('Get rooms API Response received:', response.data); // Debug log
    
    // Handle API response structure: {success, message, data}
    if (response.data?.success && response.data?.data) {
      console.log('Returning room list data:', response.data.data);
      return response.data.data; // Extract data from ApiResponse wrapper
    } else if (response.data && response.data.content) {
      return response.data; // Direct paginated response
    } else {
      throw new Error('Unexpected API response structure');
    }
  } catch (error) {
    console.error('Get rooms API call failed, using mock data:', error);
    // Return mock data as fallback
    const start = page * size;
    const end = start + size;
    const paginatedMockRooms = mockRooms.slice(start, end);
    
    return {
      content: paginatedMockRooms,
      page: {
        size,
        number: page,
        totalElements: mockRooms.length,
        totalPages: Math.ceil(mockRooms.length / size)
      },
      first: page === 0,
      last: end >= mockRooms.length,
      numberOfElements: paginatedMockRooms.length,
      empty: paginatedMockRooms.length === 0
    };
  }
};

export const getRoomById = async (id: number): Promise<CinemaRoom> => {
  try {
    console.log(`Making API call to /cinema-rooms/${id}`);
    const response = await axiosClient.get(`/cinema-rooms/${id}`);
    console.log('API Response:', response.data);
    
    // Handle API response structure: {success, message, data}
    if (response.data?.success && response.data?.data) {
      console.log('Returning room data:', response.data.data);
      return response.data.data;
    } else {
      console.warn('Unexpected API response structure:', response.data);
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('API call failed, falling back to mock data:', error);
    const mockRoom = mockRooms.find(room => room.cinemaRoomId === id);
    if (!mockRoom) {
      throw new Error('Room not found');
    }
    console.log('Using mock room data:', mockRoom);
    return mockRoom;
  }
};

export const createRoom = async (roomData: CinemaRoomCreateRequest): Promise<CinemaRoom> => {
  try {
    const response = await axiosClient.post('/cinema-rooms', roomData);
    
    // Handle different response structures
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    // First try to handle API error with proper error message
    try {
      handleApiError(error, 'Create room');
    } catch (handledError) {
      throw handledError;
    }
    
    // This shouldn't be reached, but fallback for demo mode
    console.warn('Backend unavailable, using mock response for create room');
    const newId = Math.max(...mockRooms.map(r => r.cinemaRoomId)) + 1;
    const newRoom: CinemaRoom = {
      cinemaRoomId: newId,
      ...roomData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: roomData.isActive ?? true,
      has3D: roomData.has3D ?? false,
      hasDolbyAtmos: roomData.hasDolbyAtmos ?? false,
      hasReclinerSeats: roomData.hasReclinerSeats ?? false,
      description: roomData.description ?? '',
    };
    
    // Add to mock data for session storage
    mockRooms.push(newRoom);
    return newRoom;
  }
};

export const updateRoom = async (
  id: number, 
  roomData: CinemaRoomUpdateRequest
): Promise<CinemaRoom> => {
  try {
    console.log(`Making API call to PUT /cinema-rooms/${id}`, roomData);
    
    // Transform frontend data to match backend expectations
    const backendPayload = {
      cinemaRoomName: roomData.cinemaRoomName,
      // Map frontend roomType to backend enum (only STANDARD and VIP are supported)
      roomType: (roomData.roomType === 'IMAX' || roomData.roomType === '4DX') ? 'VIP' : roomData.roomType,
      // Backend expects 'totalSeats' not 'seatQuantity'
      totalSeats: roomData.seatQuantity,
      rows: roomData.rows,
      columns: roomData.columns,
      description: roomData.description,
      isActive: roomData.isActive
      // Note: has3D, hasDolbyAtmos, hasReclinerSeats, priceMultiplier are not supported by backend DTO
      // They will be reset to defaults (false, false, false, 1.0) due to backend limitations
    };
    
    console.log('Transformed payload for backend:', backendPayload);
    const response = await axiosClient.put(`/cinema-rooms/${id}`, backendPayload);
    console.log('Update API Response:', response.data);
    
    // Handle API response structure: {success, message, data}
    if (response.data?.success && response.data?.data) {
      console.log('Returning updated room data:', response.data.data);
      return response.data.data;
    } else {
      console.warn('Unexpected API response structure:', response.data);
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('Update API call failed:', error);
    // First try to handle API error with proper error message
    try {
      handleApiError(error, 'Update room');
    } catch (handledError) {
      throw handledError;
    }
    
    // This shouldn't be reached, but fallback for demo mode
    console.warn('Backend unavailable, using mock response for update room');
    const roomIndex = mockRooms.findIndex(room => room.cinemaRoomId === id);
    if (roomIndex === -1) {
      throw new Error('Room not found');
    }
    
    const updatedRoom = {
      ...mockRooms[roomIndex],
      ...roomData,
      updatedAt: new Date().toISOString(),
    };
    
    // Update mock data for session storage
    mockRooms[roomIndex] = updatedRoom;
    return updatedRoom;
  }
};

export const deleteRoom = async (id: number): Promise<void> => {
  try {
    await axiosClient.delete(`/cinema-rooms/${id}`);
  } catch (error) {
    // First try to handle API error with proper error message
    try {
      handleApiError(error, 'Delete room');
    } catch (handledError) {
      throw handledError;
    }
    
    // This shouldn't be reached, but fallback for demo mode (soft delete)
    console.warn('Backend unavailable, using mock response for delete room');
    const roomIndex = mockRooms.findIndex(room => room.cinemaRoomId === id);
    if (roomIndex === -1) {
      throw new Error('Room not found');
    }
    
    // Soft delete - set isActive to false
    mockRooms[roomIndex] = {
      ...mockRooms[roomIndex],
      isActive: false,
      updatedAt: new Date().toISOString(),
    };
  }
};

export const searchRooms = async (
  keyword: string,
  page = 0,
  size = 10
): Promise<PaginatedResponse<CinemaRoom>> => {
  try {
    const response = await axiosClient.get('/cinema-rooms/search', {
      params: { keyword, page, size }
    });
    return response.data;
  } catch (error) {
    // Filter mock data by keyword
    const filtered = mockRooms.filter(room => 
      room.cinemaRoomName.toLowerCase().includes(keyword.toLowerCase()) ||
      room.roomType.toLowerCase().includes(keyword.toLowerCase()) ||
      room.description.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const start = page * size;
    const end = start + size;
    const paginatedFiltered = filtered.slice(start, end);
    
    return {
      content: paginatedFiltered,
      page: {
        size,
        number: page,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size)
      },
      first: page === 0,
      last: end >= filtered.length,
      numberOfElements: paginatedFiltered.length,
      empty: paginatedFiltered.length === 0
    };
  }
};

export const getRoomsByType = async (type: string): Promise<CinemaRoom[]> => {
  try {
    const response = await axiosClient.get(`/cinema-rooms/type/${type}`);
    return response.data;
  } catch {
    return mockRooms.filter(room => room.roomType === type);
  }
};

export const getRoomStatistics = async (): Promise<CinemaRoomStatistics> => {
  try {
    const response = await axiosClient.get('/cinema-rooms/statistics');
    return response.data;
  } catch (error) {
    // Calculate mock statistics
    const totalRooms = mockRooms.length;
    const activeRooms = mockRooms.filter(r => r.isActive).length;
    const totalSeats = mockRooms.reduce((sum, room) => sum + room.seatQuantity, 0);
    const averageSeatsPerRoom = totalRooms > 0 ? totalSeats / totalRooms : 0;
    const vipRooms = mockRooms.filter(r => r.roomType === 'VIP').length;
    const standardRooms = mockRooms.filter(r => r.roomType === 'STANDARD').length;
    const imaxRooms = mockRooms.filter(r => r.roomType === 'IMAX').length;
    const fourDxRooms = mockRooms.filter(r => r.roomType === '4DX').length;
    const premiumRooms = vipRooms + imaxRooms + fourDxRooms;
    
    return {
      totalRooms,
      activeRooms,
      totalSeats,
      averageSeatsPerRoom,
      vipRooms,
      standardRooms,
      premiumRooms,
      imaxRooms,
      fourDxRooms
    };
  }
};

export const getPremiumRooms = async (): Promise<CinemaRoom[]> => {
  try {
    const response = await axiosClient.get('/cinema-rooms/premium');
    return response.data;
  } catch {
    return mockRooms.filter(room => 
      room.roomType === 'VIP' || room.roomType === 'IMAX' || room.roomType === '4DX'
    );
  }
};

export const getRoomsWithFeature = async (feature: 'has3D' | 'hasDolbyAtmos' | 'hasReclinerSeats'): Promise<CinemaRoom[]> => {
  try {
    let endpoint = '';
    switch (feature) {
      case 'has3D':
        endpoint = '/cinema-rooms/features/3d';
        break;
      case 'hasDolbyAtmos':
        endpoint = '/cinema-rooms/features/dolby-atmos';
        break;
      case 'hasReclinerSeats':
        endpoint = '/cinema-rooms/features/recliner';
        break;
    }
    const response = await axiosClient.get(endpoint);
    return response.data;
  } catch {
    return mockRooms.filter(room => room[feature]);
  }
};

export const getRoomsByCapacity = async (minSeats?: number, maxSeats?: number): Promise<CinemaRoom[]> => {
  try {
    const response = await axiosClient.get('/cinema-rooms/capacity', {
      params: { minSeats, maxSeats }
    });
    return response.data;
  } catch {
    return mockRooms.filter(room => {
      if (minSeats && room.seatQuantity < minSeats) return false;
      if (maxSeats && room.seatQuantity > maxSeats) return false;
      return true;
    });
  }
};

// Export mock data for testing
export { mockRooms };
