import type { IBookingRepository } from '../../domain/contracts/IBookingRepository';
import type { Booking } from '../../domain/entities/Booking';
import { httpClient } from '../http/client';
import type { ApiBookingDTO } from '../dto/backend';

export class ApiBookingRepository implements IBookingRepository {
  private baseUrl(tenantId: string) {
    return `api/hotels/${tenantId}/bookings`;
  }

  private mapToEntity(d: ApiBookingDTO): Booking {
    return {
      id: d.id,
      tenantId: d.tenant_id,
      guestId: d.guest_id ?? undefined,
      guestName: d.guest_name,
      checkInDate: d.check_in_date,
      checkOutDate: d.check_out_date,
      adults: d.adults,
      children: d.children ?? undefined,
      nights: d.nights,
      totalPrice: d.total_price ?? undefined,
      sessionId: d.session_id ?? undefined,
      idempotencyKey: d.idempotency_key ?? undefined,
      paymentRef: d.payment_ref ?? undefined,
      status: d.status as Booking['status'],
      roomTypeId: d.room_type_id,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      roomTypeName: d.room_type_name ?? undefined,
    };
  }

  async getAll(tenantId: string, filters?: { statusFilter?: string }): Promise<Booking[]> {
    let url = this.baseUrl(tenantId);
    if (filters?.statusFilter) url += `?status_filter=${encodeURIComponent(filters.statusFilter)}`;
    const data = await httpClient.get<ApiBookingDTO[]>(url);
    return data.map((d) => this.mapToEntity(d));
  }

  async create(tenantId: string, data: Omit<Booking, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const payload = {
      guest_name: data.guestName,
      check_in_date: data.checkInDate,
      check_out_date: data.checkOutDate,
      adults: data.adults,
      children: data.children,
      nights: data.nights,
      total_price: data.totalPrice,
      room_type_id: data.roomTypeId,
      status: data.status,
      guest_id: data.guestId,
    };
    const result = await httpClient.post<ApiBookingDTO>(this.baseUrl(tenantId), payload);
    return this.mapToEntity(result);
  }

  async updateStatus(tenantId: string, id: string, status: string): Promise<Booking> {
    // Backend uses PATCH /{id}/status with { status } body
    const result = await httpClient.patch<ApiBookingDTO>(`${this.baseUrl(tenantId)}/${id}/status`, { status });
    return this.mapToEntity(result);
  }
}
