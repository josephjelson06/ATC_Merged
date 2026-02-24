import { useState, useCallback } from 'react';
import type { RoomType, Room } from '../../domain/entities/Room';
import { repositories } from '../../infrastructure/config/container';

export function useRooms(tenantId: string) {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoomTypes = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await repositories.rooms.getRoomTypes(tenantId);
      setRoomTypes(data);
    } catch { setError('Failed to fetch room types'); }
    finally { setLoading(false); }
  }, [tenantId]);

  const fetchRooms = useCallback(async (filters?: { statusFilter?: string; roomTypeId?: string; availableOnly?: boolean }) => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await repositories.rooms.getRooms(tenantId, filters);
      setRooms(data);
    } catch { setError('Failed to fetch rooms'); }
    finally { setLoading(false); }
  }, [tenantId]);

  const createRoomType = async (data: Omit<RoomType, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => {
    const created = await repositories.rooms.createRoomType(tenantId, data);
    setRoomTypes((prev) => [...prev, created]);
    return created;
  };

  const updateRoomType = async (id: string, data: Partial<RoomType>) => {
    const updated = await repositories.rooms.updateRoomType(tenantId, id, data);
    setRoomTypes((prev) => prev.map((rt) => (rt.id === id ? updated : rt)));
    return updated;
  };

  const deleteRoomType = async (id: string) => {
    await repositories.rooms.deleteRoomType(tenantId, id);
    setRoomTypes((prev) => prev.filter((rt) => rt.id !== id));
  };

  const createRoom = async (data: Omit<Room, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => {
    const created = await repositories.rooms.createRoom(tenantId, data);
    setRooms((prev) => [...prev, created]);
    return created;
  };

  const updateRoomStatus = async (id: string, status: string) => {
    const updated = await repositories.rooms.updateRoomStatus(tenantId, id, status);
    setRooms((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  return {
    roomTypes, rooms, loading, error,
    fetchRoomTypes, fetchRooms,
    createRoomType, updateRoomType, deleteRoomType,
    createRoom, updateRoomStatus,
  };
}
