// Room domain entities

export type RoomStatus = 'available' | 'occupied' | 'housekeeping' | 'maintenance';

export interface RoomType {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  price: number;
  amenities: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  tenantId: string;
  roomTypeId: string;
  roomNumber: string;
  floor?: number;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
  // Populated on read
  roomTypeName?: string;
}
