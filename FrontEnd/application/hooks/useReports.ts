import { useCallback, useState } from "react";

import { httpClient } from "@/infrastructure/http/client";

export interface TenantGuestDemographic {
  segment: string;
  count: number;
}

export interface TenantReport {
  tenantId: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  totalBookings: number;
  revenueFromBookings: number;
  guestDemographics: TenantGuestDemographic[];
}

export interface PlatformRevenueReport {
  totalMrr: number;
  activeTenants: number;
  totalKiosks: number;
  paidInvoiceRevenue: number;
  overdueInvoiceAmount: number;
}

interface ApiTenantReportDTO {
  tenant_id: string;
  total_rooms: number;
  occupied_rooms: number;
  occupancy_rate: number;
  total_bookings: number;
  revenue_from_bookings: number;
  guest_demographics: { segment: string; count: number }[];
}

interface ApiPlatformReportDTO {
  total_mrr: number;
  active_tenants: number;
  total_kiosks: number;
  paid_invoice_revenue: number;
  overdue_invoice_amount: number;
}

const mapTenantReport = (dto: ApiTenantReportDTO): TenantReport => ({
  tenantId: dto.tenant_id,
  totalRooms: dto.total_rooms,
  occupiedRooms: dto.occupied_rooms,
  occupancyRate: Number(dto.occupancy_rate),
  totalBookings: dto.total_bookings,
  revenueFromBookings: Number(dto.revenue_from_bookings),
  guestDemographics: dto.guest_demographics ?? [],
});

const mapPlatformReport = (dto: ApiPlatformReportDTO): PlatformRevenueReport => ({
  totalMrr: Number(dto.total_mrr),
  activeTenants: dto.active_tenants,
  totalKiosks: dto.total_kiosks,
  paidInvoiceRevenue: Number(dto.paid_invoice_revenue),
  overdueInvoiceAmount: Number(dto.overdue_invoice_amount),
});

export function useReports() {
  const [tenantReport, setTenantReport] = useState<TenantReport | null>(null);
  const [platformReport, setPlatformReport] =
    useState<PlatformRevenueReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTenantReport = useCallback(async (tenantId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await httpClient.get<ApiTenantReportDTO>(
        `/api/reports/tenant/${tenantId}/occupancy`,
      );
      setTenantReport(mapTenantReport(data));
    } catch (err: any) {
      setError(err?.message || "Failed to fetch tenant report");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlatformReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await httpClient.get<ApiPlatformReportDTO>(
        "/api/reports/platform/revenue",
      );
      setPlatformReport(mapPlatformReport(data));
    } catch (err: any) {
      setError(err?.message || "Failed to fetch platform report");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tenantReport,
    platformReport,
    loading,
    error,
    fetchTenantReport,
    fetchPlatformReport,
  };
}
