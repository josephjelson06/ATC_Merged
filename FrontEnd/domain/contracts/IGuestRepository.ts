import type { Guest } from '../entities/Guest';

export interface IGuestRepository {
  getAll(tenantId: string, filters?: { q?: string }): Promise<Guest[]>;
  create(tenantId: string, data: Omit<Guest, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<Guest>;
  update(tenantId: string, id: string, data: Partial<Guest>): Promise<Guest>;
}
