export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  address: string;
  images: string[];
  rooms: number;
  area: number;
  floor?: number;
  totalFloors?: number;
}

export interface User {
  id: number;
  telegramId: string;
  username?: string;
  firstName?: string;
}

export interface Booking {
  id: number;
  userId: number;
  propertyId: number;
  checkIn: string;
  checkOut: string;
  status: string;
  property?: Property;
}