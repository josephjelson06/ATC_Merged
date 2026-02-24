"use client";

import { useEffect, useMemo } from "react";

import { useAuth } from "@/application/hooks/useAuth";
import { useRooms } from "@/application/hooks/useRooms";
import PageHeader from "@/presentation/components/ui/PageHeader";
import GlassCard from "@/presentation/components/ui/GlassCard";

export default function HotelRates() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? "";
  const { roomTypes, loading, error, fetchRoomTypes } = useRooms(tenantId);

  useEffect(() => {
    if (!tenantId) return;
    fetchRoomTypes();
  }, [tenantId, fetchRoomTypes]);

  const stats = useMemo(() => {
    if (roomTypes.length === 0) return { count: 0, avg: 0, min: 0, max: 0 };
    const prices = roomTypes.map((r) => Number(r.price || 0));
    const total = prices.reduce((a, b) => a + b, 0);
    return {
      count: roomTypes.length,
      avg: total / prices.length,
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [roomTypes]);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <PageHeader
        title="Rates"
        subtitle="Current base prices by room type"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Metric label="Room Types" value={String(stats.count)} />
        <Metric label="Average Rate" value={`$${stats.avg.toFixed(2)}`} />
        <Metric label="Min Rate" value={`$${stats.min.toFixed(2)}`} />
        <Metric label="Max Rate" value={`$${stats.max.toFixed(2)}`} />
      </div>

      <GlassCard noPadding clipContent className="border-white/10">
        <div className="p-4 border-b border-white/10">
          {error && <p className="text-xs font-bold text-red-500">{error}</p>}
          {loading && <p className="text-xs font-bold text-gray-500">Loading rates...</p>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                <th className="px-6 py-4">Room Type</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Base Rate</th>
                <th className="px-6 py-4">Amenities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {roomTypes.map((roomType) => (
                <tr key={roomType.id}>
                  <td className="px-6 py-4 text-sm font-bold dark:text-white">
                    {roomType.name}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono font-bold text-gray-500">
                    {roomType.code}
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-emerald-500">
                    ${Number(roomType.price).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(roomType.amenities || []).map((amenity) => (
                        <span
                          key={amenity}
                          className="px-2 py-1 rounded-md text-[10px] font-bold bg-black/5 dark:bg-white/5 text-gray-500"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && roomTypes.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-sm font-medium text-gray-500"
                  >
                    No room types found.
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
