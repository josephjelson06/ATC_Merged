import type { ISubscriptionRepository } from '../../domain/contracts/ISubscriptionRepository';
import type { Subscription } from '../../domain/entities/Subscription';
import { httpClient } from '../http/client';
import type { ApiSubscriptionDTO } from '../dto/backend';

export class ApiSubscriptionRepository implements ISubscriptionRepository {
  private getBaseUrl(hotelId?: string) {
     // NOTE: Backend endpoint might be /api/subscriptions (all) OR /api/hotels/{id}/subscription
     // Assuming we want to fetch mostly by logic that knows the context
     // But interface says `getAll`. 
     // Let's assume /api/subscriptions returns ALL for platform admin
     return 'api/subscriptions/';
  }

  private mapToEntity(data: ApiSubscriptionDTO): Subscription {
    return {
      id: String(data.id),
      tenantId: data.tenant_id,
      planId: data.plan_id,
      startDate: data.start_date ?? undefined,
      endDate: data.end_date ?? undefined,
      status: data.status,
    };
  }

  async getAll(): Promise<Subscription[]> {
    const data = await httpClient.get<ApiSubscriptionDTO[]>('api/subscriptions');
    return data.map((item) => this.mapToEntity(item));
  }

  async getById(id: string): Promise<Subscription | null> {
    // If we have an endpoint for single sub by ID
    try {
        const result = await httpClient.get<ApiSubscriptionDTO>(`api/subscriptions/${id}`);
        return this.mapToEntity(result);
    } catch {
        return null;
    }
  }

  async update(id: string, data: Partial<Subscription>): Promise<Subscription> {
    const payload: any = {};
    if (data.planId !== undefined) payload.plan_id = data.planId;
    if (data.status !== undefined) payload.status = data.status;
    if (data.endDate !== undefined) payload.end_date = data.endDate;

    const result = await httpClient.patch<ApiSubscriptionDTO>(`api/subscriptions/${id}`, payload);
    return this.mapToEntity(result);
  }
}
