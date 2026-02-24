import { useState, useCallback } from 'react';
import type { Guest } from '../../domain/entities/Guest';
import { repositories } from '../../infrastructure/config/container';

export function useGuests(tenantId: string) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGuests = useCallback(async (filters?: { q?: string }) => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await repositories.guests.getAll(tenantId, filters);
      setGuests(data);
    } catch { setError('Failed to fetch guests'); }
    finally { setLoading(false); }
  }, [tenantId]);

  const createGuest = async (data: Omit<Guest, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => {
    const created = await repositories.guests.create(tenantId, data);
    setGuests((prev) => [...prev, created]);
    return created;
  };

  const updateGuest = async (id: string, data: Partial<Guest>) => {
    const updated = await repositories.guests.update(tenantId, id, data);
    setGuests((prev) => prev.map((g) => (g.id === id ? updated : g)));
    return updated;
  };

  return {
    guests, loading, error,
    fetchGuests, createGuest, updateGuest,
  };
}
