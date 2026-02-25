interface TenantApi {
  id: string;
  hotel_name: string;
  slug: string;
}

export interface KioskSession {
  sessionId: string;
  startedAt: string;
  tenant: {
    id: string;
    hotelName: string;
    slug: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

let activeSession: KioskSession | null = null;

function resolveSlug(slug?: string): string {
  const effectiveSlug = slug || process.env.NEXT_PUBLIC_HOTEL_SLUG;
  if (!effectiveSlug) {
    throw new Error('Missing hotel slug. Set NEXT_PUBLIC_HOTEL_SLUG or pass slug to initSession().');
  }
  return effectiveSlug;
}

function createSessionId(): string {
  return `kiosk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const SessionService = {
  async initSession(slug?: string): Promise<KioskSession> {
    const tenantSlug = resolveSlug(slug);
    const response = await fetch(`${API_BASE_URL}/api/kiosk/${tenantSlug}/tenant`);
    if (!response.ok) {
      throw new Error(`Failed to initialize session (${response.status})`);
    }

    const tenant: TenantApi = await response.json();
    activeSession = {
      sessionId: createSessionId(),
      startedAt: new Date().toISOString(),
      tenant: {
        id: tenant.id,
        hotelName: tenant.hotel_name,
        slug: tenant.slug,
      },
    };
    return activeSession;
  },

  endSession(): { ended: true } {
    activeSession = null;
    return { ended: true };
  },

  getActiveSession(): KioskSession | null {
    return activeSession;
  },
};
