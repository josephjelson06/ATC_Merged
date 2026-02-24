"use client";

import { useEffect } from "react";

import { useAuth } from "@/application/hooks/useAuth";
import { useReports } from "@/application/hooks/useReports";
import GlassCard from "@/presentation/components/ui/GlassCard";
import PageHeader from "@/presentation/components/ui/PageHeader";

export default function HotelReports() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? "";
  const { tenantReport, loading, error, fetchTenantReport } = useReports();

  useEffect(() => {
    if (!tenantId) return;
    fetchTenantReport(tenantId);
  }, [tenantId, fetchTenantReport]);

  if (!tenantId) {
    return (
      <div className="p-8 text-sm font-bold text-red-500">
        Missing tenant context.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <PageHeader
        title="Reports"
        subtitle="Occupancy, booking revenue, and guest mix"
      />

      {error && (
        <GlassCard className="border-red-500/30">
          <p className="text-sm font-bold text-red-500">{error}</p>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Metric
          label="Occupancy"
          value={`${tenantReport?.occupancyRate.toFixed(2) ?? "0.00"}%`}
        />
        <Metric
          label="Bookings"
          value={String(tenantReport?.totalBookings ?? 0)}
        />
        <Metric
          label="Revenue"
          value={`$${(tenantReport?.revenueFromBookings ?? 0).toFixed(2)}`}
        />
        <Metric
          label="Rooms Occupied"
          value={`${tenantReport?.occupiedRooms ?? 0}/${tenantReport?.totalRooms ?? 0}`}
        />
      </div>

      <GlassCard noPadding clipContent className="border-white/10">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
            Guest Demographics
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                <th className="px-6 py-4">Segment</th>
                <th className="px-6 py-4">Guests</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {(tenantReport?.guestDemographics ?? []).map((row) => (
                <tr key={row.segment}>
                  <td className="px-6 py-4 text-sm font-bold dark:text-white">
                    {row.segment}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-600 dark:text-gray-300">
                    {row.count}
                  </td>
                </tr>
              ))}
              {!loading && (tenantReport?.guestDemographics?.length ?? 0) === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-6 py-10 text-center text-sm font-medium text-gray-500"
                  >
                    No guest demographics available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard className="border-white/10">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
        {label}
      </p>
      <p className="text-2xl font-black tracking-tight dark:text-white">{value}</p>
    </GlassCard>
  );
}
