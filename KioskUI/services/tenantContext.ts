import type { TenantDTO } from "@contracts/api.contract";

export type TenantPayload = TenantDTO;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

let currentTenantSlug = import.meta.env.VITE_HOTEL_SLUG || "grand-hotel";
let currentTenant: TenantPayload | null = null;

export function setTenantContext(tenantSlug: string, tenant: TenantPayload | null): void {
  currentTenantSlug = tenantSlug;
  currentTenant = tenant;
}

export function getTenantSlug(): string {
  return currentTenantSlug;
}

export function getTenant(): TenantPayload | null {
  return currentTenant;
}

export function buildTenantApiUrl(route: "chat" | "chat/booking" | "tenant" | "rooms"): string {
  const routeMap: Record<string, string> = {
    tenant: `${API_BASE_URL}/api/kiosk/${currentTenantSlug}/tenant`,
    rooms: `${API_BASE_URL}/api/kiosk/${currentTenantSlug}/rooms`,
    chat: `${API_BASE_URL}/api/kiosk/${currentTenantSlug}/chat`,
    "chat/booking": `${API_BASE_URL}/api/kiosk/${currentTenantSlug}/chat/booking`,
  };
  return routeMap[route] || `${API_BASE_URL}/api/kiosk/${currentTenantSlug}/${route}`;
}

export function getTenantHeaders(): Record<string, string> {
  return {
    "x-tenant-slug": currentTenantSlug,
  };
}
