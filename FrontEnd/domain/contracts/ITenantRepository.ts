import type { Tenant } from '../entities/Tenant';

export interface ITenantRepository {
  getAll(): Promise<Tenant[]>;
  getById(id: string): Promise<Tenant | null>;
  create(data: Omit<Tenant, 'id'>): Promise<Tenant>;
  update(id: string, data: Partial<Tenant>): Promise<Tenant>;
  delete(id: string): Promise<void>;
}
