export interface Concession {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  stockQuantity: number;
  isAvailable: boolean;
  isActive: boolean;
  size?: string;
  flavor?: string;
  displayOrder?: number;
} 