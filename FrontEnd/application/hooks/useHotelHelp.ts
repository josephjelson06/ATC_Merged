import { useState, useEffect, useCallback } from 'react';
import type { DetachedHotelTicket as HotelTicket } from './_detachedTypes';
import { useAuth } from './useAuth';

export function useHotelHelp() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<HotelTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setTickets([]);
    setError(null);
    setLoading(false);
  }, [user?.hotelId]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const createTicket = useCallback(async (data: Omit<HotelTicket, 'id'>) => {
    if (!user?.hotelId) throw new Error('Unauthorized');
    throw new Error('Hotel help data linkage is disabled');
  }, [user?.hotelId]);

  const updateTicket = useCallback(async (id: string, data: Partial<HotelTicket>) => {
    throw new Error('Hotel help data linkage is disabled');
  }, []);

  return { tickets, loading, error, createTicket, updateTicket, refetch: fetchTickets };
}
