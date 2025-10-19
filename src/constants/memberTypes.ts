// Member role types
export const MEMBER_ROLES = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
} as const;

export type MemberRole = typeof MEMBER_ROLES[keyof typeof MEMBER_ROLES];

// Member interface
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  points: number;
  joinDate: string;
  birthDate?: string;
  sex?: 'Male' | 'Female' | 'Other';
  address?: string;
  account: string;
}

// Booking interface
export interface Booking {
  id: string;
  movieTitle: string;
  moviePoster: string;
  cinema: string;
  showtime: string;
  seats: string[];
  totalPrice: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  bookingDate: string;
  qrCode?: string;
}

// Reward interface
export interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  image: string;
  expiryDate: string;
  category: 'discount' | 'freebie' | 'upgrade';
  isUsed: boolean;
}

// Member benefits by role
export const MEMBER_BENEFITS = {
  [MEMBER_ROLES.BRONZE]: {
    discountPercent: 5,
    pointsMultiplier: 1,
    earlyBooking: false,
    freeSnacks: false,
  },
  [MEMBER_ROLES.SILVER]: {
    discountPercent: 10,
    pointsMultiplier: 1.2,
    earlyBooking: true,
    freeSnacks: false,
  },
  [MEMBER_ROLES.GOLD]: {
    discountPercent: 15,
    pointsMultiplier: 1.5,
    earlyBooking: true,
    freeSnacks: true,
  },
  [MEMBER_ROLES.PLATINUM]: {
    discountPercent: 20,
    pointsMultiplier: 2,
    earlyBooking: true,
    freeSnacks: true,
  },
};

// Points thresholds for each role
export const ROLE_THRESHOLDS = {
  [MEMBER_ROLES.BRONZE]: 0,
  [MEMBER_ROLES.SILVER]: 1000,
  [MEMBER_ROLES.GOLD]: 5000,
  [MEMBER_ROLES.PLATINUM]: 15000,
};

// Member navigation tabs
export const MEMBER_TABS = [
  { key: 'account', label: 'Account Information', icon: 'user' },
  { key: 'history', label: 'History', icon: 'history' },
  { key: 'booked', label: 'Booked ticket', icon: 'ticket' },
  { key: 'managed', label: 'Managed ticket', icon: 'setting' },
] as const; 