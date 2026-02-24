export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId?: string;
  message: string;
  createdAt: Date;
  isInternal: boolean;
  isMe?: boolean; // UI helper
}

export interface SupportTicket {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string; // 'open', 'closed', 'resolved'
  createdAt: Date;
  messages: SupportMessage[];
}
