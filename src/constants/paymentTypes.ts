// Payment method types
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  MOMO: 'momo',
  ZALOPAY: 'zalopay',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

// Payment status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// Payment interfaces
export interface PaymentInfo {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  transactionId?: string;
}

export interface BookingDetails {
  movieTitle: string;
  moviePoster?: string;
  cinema: string;
  showtime: string;
  seats: string[];
  ticketPrice: number;
  quantity: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

export interface CreditCardInfo {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

export interface BillingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
}

// Payment method configurations
export const PAYMENT_METHOD_CONFIG = {
  [PAYMENT_METHODS.CREDIT_CARD]: {
    name: 'Credit Card',
    icon: '💳',
    description: 'Pay with Visa, Mastercard, or other credit cards',
    fees: 0,
  },
  [PAYMENT_METHODS.DEBIT_CARD]: {
    name: 'Debit Card',
    icon: '💳',
    description: 'Pay directly from your bank account',
    fees: 0,
  },
  [PAYMENT_METHODS.MOMO]: {
    name: 'MoMo',
    icon: '📱',
    description: 'Pay with MoMo e-wallet',
    fees: 0,
  },
  [PAYMENT_METHODS.ZALOPAY]: {
    name: 'ZaloPay',
    icon: '📱',
    description: 'Pay with ZaloPay e-wallet',
    fees: 0,
  },
  [PAYMENT_METHODS.BANK_TRANSFER]: {
    name: 'Bank Transfer',
    icon: '🏦',
    description: 'Transfer money directly from your bank',
    fees: 0,
  },
  [PAYMENT_METHODS.CASH]: {
    name: 'Cash at Cinema',
    icon: '💵',
    description: 'Pay with cash when you arrive at the cinema',
    fees: 0,
  },
}; 