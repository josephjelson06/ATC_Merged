import { useState, useCallback } from 'react';
import type { Booking } from '../../domain/entities/Booking';
import { repositories } from '../../infrastructure/config/container';

export function useBookings(tenantId: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async (filters?: { statusFilter?: string }) => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await repositories.bookings.getAll(tenantId, filters);
      setBookings(data);
    } catch { setError('Failed to fetch bookings'); }
    finally { setLoading(false); }
  }, [tenantId]);

  const createBooking = async (data: Omit<Booking, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => {
    const created = await repositories.bookings.create(tenantId, data);
    setBookings((prev) => [...prev, created]);
    return created;
  };

  const updateBookingStatus = async (id: string, status: string) => {
    const updated = await repositories.bookings.updateStatus(tenantId, id, status);
    setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    return updated;
  };

  return {
    bookings, loading, error,
    fetchBookings, createBooking, updateBookingStatus,
  };
}
