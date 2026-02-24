import type { RoomType, Room } from '../entities/Room';

export interface IRoomRepository {
  // Room Types
  getRoomTypes(tenantId: string): Promise<RoomType[]>;
  createRoomType(tenantId: string, data: Omit<RoomType, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<RoomType>;
  updateRoomType(tenantId: string, id: string, data: Partial<RoomType>): Promise<RoomType>;
  deleteRoomType(tenantId: string, id: string): Promise<void>;

  // Rooms
  getRooms(tenantId: string, filters?: { statusFilter?: string; roomTypeId?: string; availableOnly?: boolean }): Promise<Room[]>;
  createRoom(tenantId: string, data: Omit<Room, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<Room>;
  updateRoomStatus(tenantId: string, id: string, status: string): Promise<Room>;
}
