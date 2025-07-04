export interface Seat {
  seatId: number;
  seatNumber: string;
  seatRow: string | number;
  seatColumn?: number;
  status: string; // AVAILABLE | OCCUPIED | TEMPORARILY_RESERVED
  seatType: string; // STANDARD | VIP | COUPLE
  reservedBySession?: string;
  reservationExpiry?: string;
  isActive?: boolean;
  priceMultiplier?: number;
  isRecliner?: boolean;
  hasTable?: boolean;
  cinemaRoomId?: number;
  cinemaRoomName?: string;
  rowLetter?: string;
  displayName?: string;
  isAvailable?: boolean;
  isOccupied?: boolean;
  isTemporarilyReserved?: boolean;
  isVIP?: boolean;
  isCouple?: boolean;
  isWheelchair?: boolean;
  isPremium?: boolean;
}
