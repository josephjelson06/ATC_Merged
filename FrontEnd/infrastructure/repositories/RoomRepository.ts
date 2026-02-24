import type { IRoomRepository } from '../../domain/contracts/IRoomRepository';
import type { RoomType, Room } from '../../domain/entities/Room';
import { httpClient } from '../http/client';
import type { ApiRoomTypeDTO, ApiRoomDTO } from '../dto/backend';

export class ApiRoomRepository implements IRoomRepository {
  private baseUrl(tenantId: string) {
    return `api/hotels/${tenantId}`;
  }

  private mapRoomType(d: ApiRoomTypeDTO): RoomType {
    return {
      id: d.id,
      tenantId: d.tenant_id,
      name: d.name,
      code: d.code,
      price: d.price,
      amenities: d.amenities ?? [],
      imageUrl: d.image_url ?? undefined,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    };
  }

  private mapRoom(d: ApiRoomDTO): Room {
    return {
      id: d.id,
      tenantId: d.tenant_id,
      roomTypeId: d.room_type_id,
      roomNumber: d.room_number,
      floor: d.floor ?? undefined,
      status: d.status as Room['status'],
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      roomTypeName: d.room_type_name ?? undefined,
    };
  }

  // --- Room Types ---
  async getRoomTypes(tenantId: string): Promise<RoomType[]> {
    const data = await httpClient.get<ApiRoomTypeDTO[]>(`${this.baseUrl(tenantId)}/room-types`);
    return data.map((d) => this.mapRoomType(d));
  }

  async createRoomType(tenantId: string, data: Omit<RoomType, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<RoomType> {
    const payload = { name: data.name, code: data.code, price: data.price, amenities: data.amenities, image_url: data.imageUrl };
    const result = await httpClient.post<ApiRoomTypeDTO>(`${this.baseUrl(tenantId)}/room-types`, payload);
    return this.mapRoomType(result);
  }

  async updateRoomType(tenantId: string, id: string, data: Partial<RoomType>): Promise<RoomType> {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.code !== undefined) payload.code = data.code;
    if (data.price !== undefined) payload.price = data.price;
    if (data.amenities !== undefined) payload.amenities = data.amenities;
    if (data.imageUrl !== undefined) payload.image_url = data.imageUrl;
    // Backend uses PUT for room type updates
    const result = await httpClient.put<ApiRoomTypeDTO>(`${this.baseUrl(tenantId)}/room-types/${id}`, payload);
    return this.mapRoomType(result);
  }

  async deleteRoomType(tenantId: string, id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl(tenantId)}/room-types/${id}`);
  }

  // --- Rooms ---
  async getRooms(tenantId: string, filters?: { statusFilter?: string; roomTypeId?: string; availableOnly?: boolean }): Promise<Room[]> {
    let url = `${this.baseUrl(tenantId)}/rooms`;
    const params = new URLSearchParams();
    if (filters?.statusFilter) params.set('status_filter', filters.statusFilter);
    if (filters?.roomTypeId) params.set('room_type_id', filters.roomTypeId);
    if (filters?.availableOnly) params.set('available_only', 'true');
    if (params.toString()) url += `?${params.toString()}`;
    const data = await httpClient.get<ApiRoomDTO[]>(url);
    return data.map((d) => this.mapRoom(d));
  }

  async createRoom(tenantId: string, data: Omit<Room, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<Room> {
    const payload = { room_type_id: data.roomTypeId, room_number: data.roomNumber, floor: data.floor, status: data.status };
    const result = await httpClient.post<ApiRoomDTO>(`${this.baseUrl(tenantId)}/rooms`, payload);
    return this.mapRoom(result);
  }

  async updateRoomStatus(tenantId: string, id: string, status: string): Promise<Room> {
    // Backend uses PATCH /{id}/status with { status } body
    const result = await httpClient.patch<ApiRoomDTO>(`${this.baseUrl(tenantId)}/rooms/${id}/status`, { status });
    return this.mapRoom(result);
  }
}
