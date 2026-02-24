import { useCallback, useState } from "react";

import { httpClient } from "@/infrastructure/http/client";

export interface HotelSettings {
  tenantId: string;
  hotelName: string;
  address?: string;
  timezone: string;
  supportPhone?: string;
  checkInTime?: string;
}

export interface PlatformSettings {
  enableAuditAlerts: boolean;
  allowSelfOnboarding: boolean;
  defaultSubscriptionMonths: number;
  gracePeriodDays: number;
}

interface ApiHotelSettingsDTO {
  tenant_id: string;
  hotel_name: string;
  address?: string | null;
  timezone: string;
  support_phone?: string | null;
  check_in_time?: string | null;
}

const PLATFORM_SETTINGS_KEY = "hms_platform_settings_v1";

const toHotelEntity = (dto: ApiHotelSettingsDTO): HotelSettings => ({
  tenantId: dto.tenant_id,
  hotelName: dto.hotel_name,
  address: dto.address ?? undefined,
  timezone: dto.timezone,
  supportPhone: dto.support_phone ?? undefined,
  checkInTime: dto.check_in_time ?? undefined,
});

const defaultPlatformSettings: PlatformSettings = {
  enableAuditAlerts: true,
  allowSelfOnboarding: false,
  defaultSubscriptionMonths: 1,
  gracePeriodDays: 7,
};

export function useSettings() {
  const [hotelSettings, setHotelSettings] = useState<HotelSettings | null>(null);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => {
    if (typeof window === "undefined") return defaultPlatformSettings;
    try {
      const raw = window.localStorage.getItem(PLATFORM_SETTINGS_KEY);
      return raw
        ? { ...defaultPlatformSettings, ...(JSON.parse(raw) as PlatformSettings) }
        : defaultPlatformSettings;
    } catch {
      return defaultPlatformSettings;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHotelSettings = useCallback(async (tenantId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await httpClient.get<ApiHotelSettingsDTO>(
        `/api/hotels/${tenantId}/settings`,
      );
      setHotelSettings(toHotelEntity(data));
    } catch (err: any) {
      setError(err?.message || "Failed to fetch hotel settings");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateHotelSettings = useCallback(
    async (
      tenantId: string,
      payload: Partial<{
        hotelName: string;
        address: string;
        timezone: string;
        supportPhone: string;
        checkInTime: string;
      }>,
    ) => {
      const body: Record<string, unknown> = {};
      if (payload.hotelName !== undefined) body.hotel_name = payload.hotelName;
      if (payload.address !== undefined) body.address = payload.address;
      if (payload.timezone !== undefined) body.timezone = payload.timezone;
      if (payload.supportPhone !== undefined)
        body.support_phone = payload.supportPhone;
      if (payload.checkInTime !== undefined) body.check_in_time = payload.checkInTime;

      const data = await httpClient.patch<ApiHotelSettingsDTO>(
        `/api/hotels/${tenantId}/settings`,
        body,
      );
      const mapped = toHotelEntity(data);
      setHotelSettings(mapped);
      return mapped;
    },
    [],
  );

  const savePlatformSettings = useCallback((payload: PlatformSettings) => {
    setPlatformSettings(payload);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PLATFORM_SETTINGS_KEY, JSON.stringify(payload));
    }
  }, []);

  return {
    hotelSettings,
    platformSettings,
    loading,
    error,
    fetchHotelSettings,
    updateHotelSettings,
    savePlatformSettings,
  };
}
