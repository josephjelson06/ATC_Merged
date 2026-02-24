"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Booking } from "@/domain/entities/Booking";
import type { Kiosk } from "@/domain/entities/Kiosk";
import type { Tenant } from "@/domain/entities/Tenant";
import { repositories } from "@/infrastructure/config/container";

interface KioskDetailProps {
  kioskId: string;
}

interface KioskDetailData {
  kiosk: Kiosk;
  tenant: Tenant;
  recentCheckIns: Booking[];
  totalCheckIns: number;
  activeCheckIns: number;
}

const STATUS_COLORS: Record<string, string> = {
  online: "bg-green-100 text-green-700",
  offline: "bg-gray-100 text-gray-700",
  maintenance: "bg-yellow-100 text-yellow-700",
};

const CHECK_IN_STATUSES = new Set(["CHECKED_IN", "CHECKED_OUT"]);

export default function KioskDetail({ kioskId }: KioskDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<KioskDetailData | null>(null);

  useEffect(() => {
    let active = true;

    async function loadKioskDetail() {
      if (!kioskId) {
        setError("Invalid kiosk ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const tenants = await repositories.tenants.getAll();
        const kioskCandidates = await Promise.all(
          tenants.map(async (tenant) => {
            try {
              const kiosks = await repositories.kiosks.getAll(tenant.id);
              const kiosk = kiosks.find((item) => item.id === kioskId);
              return kiosk ? { tenant, kiosk } : null;
            } catch {
              return null;
            }
          }),
        );

        const kioskContext = kioskCandidates.find(
          (candidate): candidate is { tenant: Tenant; kiosk: Kiosk } =>
            candidate !== null,
        );

        if (!kioskContext) {
          throw new Error("Kiosk not found.");
        }

        const tenantBookings = await repositories.bookings.getAll(
          kioskContext.tenant.id,
        );
        const checkInBookings = tenantBookings.filter((booking) =>
          CHECK_IN_STATUSES.has(booking.status),
        );

        const recentCheckIns = [...checkInBookings]
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          )
          .slice(0, 8);

        const activeCheckIns = tenantBookings.filter(
          (booking) => booking.status === "CHECKED_IN",
        ).length;

        if (!active) return;
        setData({
          kiosk: kioskContext.kiosk,
          tenant: kioskContext.tenant,
          recentCheckIns,
          totalCheckIns: checkInBookings.length,
          activeCheckIns,
        });
      } catch (err) {
        if (!active) return;
        const message =
          err instanceof Error ? err.message : "Failed to load kiosk details.";
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadKioskDetail();
    return () => {
      active = false;
    };
  }, [kioskId]);

  if (loading) {
    return <div className="p-8 text-gray-500">Loading kiosk details...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <button
          onClick={() => router.push("/super/kiosks")}
          className="mb-4 text-sm text-blue-600 hover:text-blue-700"
        >
          Back to Kiosks
        </button>
        <div className="p-6 rounded border border-red-200 bg-red-50 text-red-700">
          {error ?? "Kiosk not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button
        onClick={() => router.push("/super/kiosks")}
        className="mb-6 text-sm text-blue-600 hover:text-blue-700"
      >
        Back to Kiosks
      </button>

      <div className="bg-white rounded shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{data.kiosk.name}</h1>
            <p className="text-gray-500">Kiosk ID: {data.kiosk.id}</p>
          </div>
          <span
            className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[data.kiosk.status] ?? "bg-gray-100 text-gray-700"}`}
          >
            {data.kiosk.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Hotel</p>
            <p className="font-semibold text-gray-900">{data.tenant.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Firmware Version</p>
            <p className="font-semibold text-gray-900">
              {data.kiosk.firmwareVersion ?? "Not reported"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Last Heartbeat</p>
            <p className="font-semibold text-gray-900">
              {data.kiosk.lastHeartbeatAt
                ? new Date(data.kiosk.lastHeartbeatAt).toLocaleString()
                : "Never"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">API Key</p>
            <p className="font-mono text-xs break-all text-gray-700">
              {data.kiosk.apiKey}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded shadow p-6 border-l-4 border-blue-500">
          <h2 className="text-sm font-medium text-gray-500">Recent Check-ins</h2>
          <p className="text-2xl font-bold text-gray-900">{data.totalCheckIns}</p>
          <p className="text-xs text-gray-400 mt-1">
            Based on booking statuses CHECKED_IN/CHECKED_OUT
          </p>
        </div>
        <div className="bg-white rounded shadow p-6 border-l-4 border-green-500">
          <h2 className="text-sm font-medium text-gray-500">Active Stays</h2>
          <p className="text-2xl font-bold text-gray-900">{data.activeCheckIns}</p>
          <p className="text-xs text-gray-400 mt-1">Current CHECKED_IN bookings</p>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Check-in Activity
          </h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Guest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Room Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Check-in
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Check-out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.recentCheckIns.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {booking.guestName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {booking.roomTypeName ?? "--"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {booking.checkInDate}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {booking.checkOutDate}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-700">
                  {booking.status}
                </td>
              </tr>
            ))}
            {data.recentCheckIns.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  No check-in activity yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

