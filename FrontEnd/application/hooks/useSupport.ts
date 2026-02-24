import { useState, useCallback } from 'react';
import { repositories } from '@/infrastructure/config/container';
import { SupportTicket, SupportMessage } from '@/domain/entities/Support';

export function useSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      // Assuming Super Admin context for now, fetching ALL tickets
      // If we need logic for Tenant vs Platform, we can pass an arg or use a different hook/context
      // But Helpdesk.tsx is Super Admin page.
      const data = await repositories.support.getAllTickets();
      setTickets(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveTicket = useCallback(async (ticketId: string) => {
    try {
      await repositories.support.updateStatus(ticketId, 'resolved');
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'resolved' } : t));
    } catch (err: any) {
      setError(err.message || 'Failed to resolve ticket');
      throw err;
    }
  }, []);

  const addMessage = useCallback(async (ticketId: string, message: string, isInternal: boolean) => {
    try {
      const newMsg = await repositories.support.addMessage(ticketId, message, isInternal);
      // We might want to refresh the ticket or update local state
      // For now, refresher logic is handled by UI re-fetching or optimistic updates
      return newMsg;
    } catch (err: any) {
      throw err;
    }
  }, []);

  const fetchTicketDetails = useCallback(async (ticketId: string) => {
    return await repositories.support.getTicketById(ticketId);
  }, []);

  const fetchTenantTickets = useCallback(async (tenantId: string) => {
    setLoading(true);
    try {
      const data = await repositories.support.getTenantTickets(tenantId);
      setTickets(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tenant tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTicket = useCallback(async (tenantId: string, data: Partial<SupportTicket>) => {
    try {
      const newTicket = await repositories.support.createTicket(tenantId, data);
      setTickets(prev => [newTicket, ...prev]);
      return newTicket;
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket');
      throw err;
    }
  }, []);

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    fetchTenantTickets,
    createTicket,
    resolveTicket,
    addMessage,
    fetchTicketDetails,
  };
}
