// Kiosk domain entity

export type KioskStatus = 'online' | 'offline' | 'maintenance';

export interface Kiosk {
  id: string;
  tenantId: string;
  name: string;
  apiKey: string;
  firmwareVersion?: string;
  status: KioskStatus;
  lastHeartbeatAt?: string;
  createdAt: string;
  updatedAt: string;
}
