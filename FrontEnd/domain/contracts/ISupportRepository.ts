import { SupportTicket, SupportMessage } from '../entities/Support';

export interface ISupportRepository {
  // Platform
  getAllTickets(): Promise<SupportTicket[]>;
  
  // Tenant
  getTenantTickets(tenantId: string): Promise<SupportTicket[]>;

  // Common
  getTicketById(ticketId: string): Promise<SupportTicket | null>;
  createTicket(tenantId: string, data: Partial<SupportTicket>): Promise<SupportTicket>;
  addMessage(ticketId: string, message: string, isInternal?: boolean): Promise<SupportMessage>;
  updateStatus(ticketId: string, status: string): Promise<SupportTicket>;
}
