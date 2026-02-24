import type { Kiosk } from '../entities/Kiosk';

export interface IKioskRepository {
  getAll(tenantId: string): Promise<Kiosk[]>;
  register(tenantId: string, data: { name: string }): Promise<Kiosk>;
  update(tenantId: string, id: string, data: { name?: string; firmwareVersion?: string; status?: string }): Promise<Kiosk>;
}
