import type { ITenantRepository } from '../../domain/contracts/ITenantRepository';
import type { Tenant } from '../../domain/entities/Tenant';
import { httpClient } from '../http/client';
import type { ApiTenantDTO } from '../dto/backend';

export class ApiTenantRepository implements ITenantRepository {
  private baseUrl = 'api/tenants/';

  private mapToEntity(data: ApiTenantDTO): Tenant {
    return {
      id: String(data.id),
      name: data.hotel_name,
      address: data.address ?? undefined,
      planId: data.plan_id ?? undefined,
      ownerId: data.owner_user_id ?? undefined,
      gstin: data.gstin ?? undefined,
      pan: data.pan ?? undefined,
      status: data.status ?? undefined,
    };
  }

  private toPayload(data: Partial<Tenant>): Record<string, unknown> {
    return {
      hotel_name: data.name,
      address: data.address,
      plan_id: data.planId,
      owner_user_id: data.ownerId,
      gstin: data.gstin,
      pan: data.pan,
      status: data.status,
    };
  }

  async getAll(): Promise<Tenant[]> {
    const result = await httpClient.get<ApiTenantDTO[]>(this.baseUrl);
    return result.map((item) => this.mapToEntity(item));
  }

  async getById(id: string): Promise<Tenant | null> {
    try {
      const result = await httpClient.get<ApiTenantDTO>(`${this.baseUrl}${id}`);
      return this.mapToEntity(result);
    } catch (error) {
      return null;
    }
  }

  async create(data: Omit<Tenant, 'id'>): Promise<Tenant> {
    const payload = this.toPayload(data);
    const result = await httpClient.post<ApiTenantDTO>(this.baseUrl, payload);
    return this.mapToEntity(result);
  }

  async update(id: string, data: Partial<Tenant>): Promise<Tenant> {
    const payload = this.toPayload(data);
    const result = await httpClient.patch<ApiTenantDTO>(`${this.baseUrl}${id}`, payload);
    return this.mapToEntity(result);
  }

  async delete(id: string): Promise<void> {
    return httpClient.delete(`${this.baseUrl}${id}`);
  }
}
