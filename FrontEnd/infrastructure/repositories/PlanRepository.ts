import type { IPlanRepository, PlanCreateInput, PlanUpdateInput } from '../../domain/contracts/IPlanRepository';
import type { PlanData } from '../../domain/entities/Plan';
import { httpClient } from '../http/client';
import type { ApiPlanDTO } from '../dto/backend';

export class ApiPlanRepository implements IPlanRepository {
  private readonly baseUrl = '/api/plans';

  async getAll(): Promise<PlanData[]> {
    const result = await httpClient.get<ApiPlanDTO[]>(this.baseUrl);
    return result.map(this.mapToEntity);
  }

  async getById(id: string): Promise<PlanData | null> {
    try {
      const result = await httpClient.get<ApiPlanDTO>(`${this.baseUrl}/${id}`);
      return this.mapToEntity(result);
    } catch (err) {
      return null;
    }
  }

  async create(data: PlanCreateInput): Promise<PlanData> {
    const payload = {
      name: data.name,
      price: data.price,
      period_months: data.period_months,
      max_users: data.max_users,
      max_roles: data.max_roles,
      max_rooms: data.max_rooms,
    };
    const result = await httpClient.post<ApiPlanDTO>(this.baseUrl, payload);
    return this.mapToEntity(result);
  }

  async update(id: string, data: PlanUpdateInput): Promise<PlanData> {
    // Only send what's present
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.price !== undefined) payload.price = data.price;
    if (data.period_months !== undefined) payload.period_months = data.period_months;
    if (data.max_users !== undefined) payload.max_users = data.max_users;
    if (data.max_roles !== undefined) payload.max_roles = data.max_roles;
    if (data.max_rooms !== undefined) payload.max_rooms = data.max_rooms;

    const result = await httpClient.patch<ApiPlanDTO>(`${this.baseUrl}/${id}`, payload);
    return this.mapToEntity(result);
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/${id}`);
  }

  private mapToEntity(data: ApiPlanDTO): PlanData {
    return {
      id: String(data.id),
      name: data.name,
      price: data.price,
      period_months: data.period_months ?? undefined,
      max_users: data.max_users ?? undefined,
      max_roles: data.max_roles ?? undefined,
      max_rooms: data.max_rooms ?? undefined,
    };
  }
}
