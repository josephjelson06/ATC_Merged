import type { IGuestRepository } from '../../domain/contracts/IGuestRepository';
import type { Guest } from '../../domain/entities/Guest';
import { httpClient } from '../http/client';
import type { ApiGuestDTO } from '../dto/backend';

export class ApiGuestRepository implements IGuestRepository {
  private baseUrl(tenantId: string) {
    return `api/hotels/${tenantId}/guests`;
  }

  private mapToEntity(d: ApiGuestDTO): Guest {
    return {
      id: d.id,
      tenantId: d.tenant_id,
      name: d.name,
      email: d.email ?? undefined,
      phone: d.phone ?? undefined,
      idType: d.id_type ?? undefined,
      idNumber: d.id_number ?? undefined,
      idScanUrl: d.id_scan_url ?? undefined,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    };
  }

  async getAll(tenantId: string, filters?: { q?: string }): Promise<Guest[]> {
    let url = this.baseUrl(tenantId);
    if (filters?.q) url += `?q=${encodeURIComponent(filters.q)}`;
    const data = await httpClient.get<ApiGuestDTO[]>(url);
    return data.map((d) => this.mapToEntity(d));
  }

  async create(tenantId: string, data: Omit<Guest, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<Guest> {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      id_type: data.idType,
      id_number: data.idNumber,
    };
    const result = await httpClient.post<ApiGuestDTO>(this.baseUrl(tenantId), payload);
    return this.mapToEntity(result);
  }

  async update(tenantId: string, id: string, data: Partial<Guest>): Promise<Guest> {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.email !== undefined) payload.email = data.email;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.idType !== undefined) payload.id_type = data.idType;
    if (data.idNumber !== undefined) payload.id_number = data.idNumber;
    // Backend uses PUT for guest updates
    const result = await httpClient.put<ApiGuestDTO>(`${this.baseUrl(tenantId)}/${id}`, payload);
    return this.mapToEntity(result);
  }
}
