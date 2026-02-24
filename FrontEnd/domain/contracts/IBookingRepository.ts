import type { Booking } from '../entities/Booking';

export interface IBookingRepository {
  getAll(tenantId: string, filters?: { statusFilter?: string }): Promise<Booking[]>;
  create(tenantId: string, data: Omit<Booking, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<Booking>;
  updateStatus(tenantId: string, id: string, status: string): Promise<Booking>;
}
