import type { TenantDTO } from "@contracts/api.contract";

export type TenantPayload = Partial<TenantDTO> & {
  slug: string;
  name: string;
  logo_url?: string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

let currentTenantSlug = (process.env.NEXT_PUBLIC_HOTEL_SLUG || "").trim();
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

export function clearTenantContext(): void {
  currentTenantSlug = "";
  currentTenant = null;
}

export function buildTenantApiUrl(route: "chat" | "chat/booking" | "tenant" | "rooms"): string {
  const slug = currentTenantSlug.trim();
  if (!slug) {
    return `${API_BASE_URL}/api/kiosk`;
  }

  const routeMap: Record<string, string> = {
    tenant: `${API_BASE_URL}/api/kiosk/${slug}/tenant`,
    rooms: `${API_BASE_URL}/api/kiosk/${slug}/rooms`,
    chat: `${API_BASE_URL}/api/kiosk/${slug}/chat`,
    "chat/booking": `${API_BASE_URL}/api/kiosk/${slug}/chat/booking`,
  };
  return routeMap[route] || `${API_BASE_URL}/api/kiosk/${slug}/${route}`;
}

export function buildKioskApiUrl(route: "tenants"): string {
  const routeMap: Record<string, string> = {
    tenants: `${API_BASE_URL}/api/kiosk/tenants`,
  };
  return routeMap[route] || `${API_BASE_URL}/api/kiosk/${route}`;
}

export function getTenantHeaders(): Record<string, string> {
  const slug = currentTenantSlug.trim();
  return slug ? { "x-tenant-slug": slug } : {};
}
