import { 
  getAllRooms, 
  searchRooms, 
  getRoomsByType, 
  getPremiumRooms, 
  getRoomsWithFeature, 
  getRoomsByCapacity,
  CinemaRoom,
  PaginatedResponse
} from '@/api/admin/getAllRooms';

interface AdvancedRoomFilters {
  searchTerm: string;
  filterType?: string;
  filterStatus?: string;
  minCapacity?: number;
  maxCapacity?: number;
  features?: string[];
  premiumOnly?: boolean;
}

export class RoomFilterService {
  static async getFilteredRooms(
    filters: AdvancedRoomFilters,
    page = 0,
    size = 10
  ): Promise<PaginatedResponse<CinemaRoom>> {
    try {
      // If search term is provided, use search API
      if (filters.searchTerm && filters.searchTerm.trim()) {
        return await searchRooms(filters.searchTerm.trim(), page, size);
      }

      // If premium only filter is active
      if (filters.premiumOnly) {
        const premiumRooms = await getPremiumRooms();
        return this.createPaginatedResponse(premiumRooms, page, size);
      }

      // If room type filter is active
      if (filters.filterType) {
        const roomsByType = await getRoomsByType(filters.filterType);
        return this.createPaginatedResponse(roomsByType, page, size);
      }

      // If capacity filter is active
      if (filters.minCapacity || filters.maxCapacity) {
        const roomsByCapacity = await getRoomsByCapacity(filters.minCapacity, filters.maxCapacity);
        return this.createPaginatedResponse(roomsByCapacity, page, size);
      }

      // If features filter is active
      if (filters.features && filters.features.length > 0) {
        const roomsByFeatures = await this.getRoomsByMultipleFeatures(filters.features);
        return this.createPaginatedResponse(roomsByFeatures, page, size);
      }

      // Default: get all rooms
      return await getAllRooms(page, size);
      
    } catch (error) {
      console.error('Error filtering rooms:', error);
      // Return empty response on error
      return this.createPaginatedResponse([], page, size);
    }
  }

  static async getRoomsByMultipleFeatures(features: string[]): Promise<CinemaRoom[]> {
    const featurePromises = features.map(feature => {
      switch (feature) {
        case 'has3D':
          return getRoomsWithFeature('has3D');
        case 'hasDolbyAtmos':
          return getRoomsWithFeature('hasDolbyAtmos');
        case 'hasReclinerSeats':
          return getRoomsWithFeature('hasReclinerSeats');
        default:
          return Promise.resolve([]);
      }
    });

    const featureResults = await Promise.all(featurePromises);
    
    // Find rooms that have ALL selected features (intersection)
    if (featureResults.length === 0) return [];
    
    let result = featureResults[0];
    for (let i = 1; i < featureResults.length; i++) {
      result = result.filter(room => 
        featureResults[i].some(r => r.cinemaRoomId === room.cinemaRoomId)
      );
    }
    
    return result;
  }

  static async getQuickFilterRooms(type: string): Promise<CinemaRoom[]> {
    switch (type) {
      case 'premium':
        return await getPremiumRooms();
      case 'has3D':
        return await getRoomsWithFeature('has3D');
      case 'dolbyAtmos':
        return await getRoomsWithFeature('hasDolbyAtmos');
      case 'recliner':
        return await getRoomsWithFeature('hasReclinerSeats');
      case 'standard':
        return await getRoomsByType('STANDARD');
      default:
        return [];
    }
  }

  static createPaginatedResponse<T>(
    items: T[], 
    page: number, 
    size: number
  ): PaginatedResponse<T> {
    const start = page * size;
    const end = start + size;
    const paginatedItems = items.slice(start, end);
    
    return {
      content: paginatedItems,
      page: {
        size,
        number: page,
        totalElements: items.length,
        totalPages: Math.ceil(items.length / size)
      },
      first: page === 0,
      last: end >= items.length,
      numberOfElements: paginatedItems.length,
      empty: paginatedItems.length === 0
    };
  }

  static countActiveFilters(filters: AdvancedRoomFilters): number {
    let count = 0;
    
    if (filters.searchTerm && filters.searchTerm.trim()) count++;
    if (filters.filterType) count++;
    if (filters.filterStatus) count++;
    if (filters.minCapacity) count++;
    if (filters.maxCapacity) count++;
    if (filters.features && filters.features.length > 0) count += filters.features.length;
    if (filters.premiumOnly) count++;
    
    return count;
  }

  static clearAllFilters(): AdvancedRoomFilters {
    return {
      searchTerm: '',
      filterType: undefined,
      filterStatus: undefined,
      minCapacity: undefined,
      maxCapacity: undefined,
      features: [],
      premiumOnly: false
    };
  }
}

export type { AdvancedRoomFilters };
