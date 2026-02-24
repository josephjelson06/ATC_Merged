import type { IKioskRepository } from '../../domain/contracts/IKioskRepository';
import type { Kiosk } from '../../domain/entities/Kiosk';
import { httpClient } from '../http/client';
import type { ApiKioskDTO } from '../dto/backend';

export class ApiKioskRepository implements IKioskRepository {
  private baseUrl(tenantId: string) {
    return `api/hotels/${tenantId}/kiosks`;
  }

  private mapToEntity(d: ApiKioskDTO): Kiosk {
    return {
      id: d.id,
      tenantId: d.tenant_id,
      name: d.name,
      apiKey: d.api_key,
      firmwareVersion: d.firmware_version ?? undefined,
      status: d.status as Kiosk['status'],
      lastHeartbeatAt: d.last_heartbeat_at ?? undefined,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    };
  }

  async getAll(tenantId: string): Promise<Kiosk[]> {
    const data = await httpClient.get<ApiKioskDTO[]>(this.baseUrl(tenantId));
    return data.map((d) => this.mapToEntity(d));
  }

  async register(tenantId: string, data: { name: string }): Promise<Kiosk> {
    const result = await httpClient.post<ApiKioskDTO>(this.baseUrl(tenantId), data);
    return this.mapToEntity(result);
  }

  async update(tenantId: string, id: string, data: { name?: string; firmwareVersion?: string; status?: string }): Promise<Kiosk> {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.firmwareVersion !== undefined) payload.firmware_version = data.firmwareVersion;
    if (data.status !== undefined) payload.status = data.status;
    // Backend uses PATCH /{id} for kiosk updates
    const result = await httpClient.patch<ApiKioskDTO>(`${this.baseUrl(tenantId)}/${id}`, payload);
    return this.mapToEntity(result);
  }
}
