import { CinemaRoomResponse, RoomFilters } from '../types';

// Mock data for offline mode
export const MOCK_ROOMS: CinemaRoomResponse[] = [
  {
    cinemaRoomId: 1,
    cinemaRoomName: "Theater 1",
    seatQuantity: 150,
    roomType: "STANDARD",
    isActive: true,
    description: "Standard theater with comfortable seating",
    rows: 15,
    columns: 10,
    has3D: false,
    hasDolbyAtmos: true,
    hasReclinerSeats: false,
    priceMultiplier: 1.0,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    availableSeats: 145,
    occupiedSeats: 5,
    maintenanceSeats: 0,
    scheduleCount: 12
  },
  {
    cinemaRoomId: 2,
    cinemaRoomName: "VIP Theater",
    seatQuantity: 50,
    roomType: "VIP",
    isActive: true,
    description: "Luxury VIP theater with premium seating",
    rows: 10,
    columns: 5,
    has3D: true,
    hasDolbyAtmos: true,
    hasReclinerSeats: true,
    priceMultiplier: 2.5,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    availableSeats: 48,
    occupiedSeats: 2,
    maintenanceSeats: 0,
    scheduleCount: 8
  },
  {
    cinemaRoomId: 3,
    cinemaRoomName: "IMAX Theater",
    seatQuantity: 200,
    roomType: "IMAX",
    isActive: false,
    description: "Large IMAX theater for premium movie experience",
    rows: 20,
    columns: 10,
    has3D: true,
    hasDolbyAtmos: true,
    hasReclinerSeats: false,
    priceMultiplier: 3.0,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    availableSeats: 0,
    occupiedSeats: 0,
    maintenanceSeats: 200,
    scheduleCount: 0
  }
];

export const filterRooms = (rooms: CinemaRoomResponse[], filters: RoomFilters): CinemaRoomResponse[] => {
  return rooms.filter(room => {
    const matchesSearch = !filters.searchTerm || 
      room.cinemaRoomName.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesType = !filters.filterType || room.roomType === filters.filterType;
    
    const matchesStatus = !filters.filterStatus || 
      (filters.filterStatus === 'active' && room.isActive) ||
      (filters.filterStatus === 'inactive' && !room.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });
};

export const calculateRoomStatistics = (rooms: CinemaRoomResponse[]) => {
  const totalRooms = rooms.length;
  const activeRooms = rooms.filter(room => room.isActive).length;
  const totalSeats = rooms.reduce((sum, room) => sum + room.seatQuantity, 0);
  const avgSeats = totalRooms > 0 ? Math.round(totalSeats / totalRooms) : 0;

  return {
    totalRooms,
    activeRooms,
    totalSeats,
    avgSeats
  };
};

export const formatRoomType = (type: string): string => {
  switch (type) {
    case 'STANDARD': return 'Standard';
    case 'VIP': return 'VIP';
    case 'IMAX': return 'IMAX';
    case '4DX': return '4DX';
    default: return type;
  }
};

export const getRoomTypeColor = (type: string): string => {
  switch (type) {
    case 'STANDARD': return 'blue';
    case 'VIP': return 'gold';
    case 'IMAX': return 'green';
    case '4DX': return 'purple';
    default: return 'default';
  }
};

export const validateRoomForm = (values: any): string[] => {
  const errors: string[] = [];
  
  if (!values.cinemaRoomName?.trim()) {
    errors.push('Room name is required');
  }
  
  if (!values.roomType) {
    errors.push('Room type is required');
  }
  
  if (!values.seatQuantity || values.seatQuantity <= 0) {
    errors.push('Seat quantity must be greater than 0');
  }
  
  if (!values.rows || values.rows <= 0) {
    errors.push('Number of rows must be greater than 0');
  }
  
  if (!values.columns || values.columns <= 0) {
    errors.push('Number of columns must be greater than 0');
  }
  
  if (values.rows * values.columns !== values.seatQuantity) {
    errors.push('Rows × Columns must equal Seat Quantity');
  }
  
  if (!values.priceMultiplier || values.priceMultiplier <= 0) {
    errors.push('Price multiplier must be greater than 0');
  }
  
  return errors;
};
