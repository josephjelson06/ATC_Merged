"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/application/hooks/useAuth";
import { useBookings } from "@/application/hooks/useBookings";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  CHECKED_IN: "bg-green-100 text-green-700",
  CHECKED_OUT: "bg-purple-100 text-purple-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function HotelBookings() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? "";
  const { bookings, loading, error, fetchBookings, updateBookingStatus } =
    useBookings(tenantId);

  useEffect(() => {
    if (tenantId) fetchBookings();
  }, [tenantId, fetchBookings]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-500">View and manage all reservations</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Guest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Check-in
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Check-out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nights
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {bookings.map((b) => (
              <tr key={b.id}>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {b.guestName}
                </td>
                <td className="px-6 py-4 text-gray-500">{b.checkInDate}</td>
                <td className="px-6 py-4 text-gray-500">{b.checkOutDate}</td>
                <td className="px-6 py-4 text-gray-500">{b.nights}</td>
                <td className="px-6 py-4 text-gray-900 font-semibold">
                  {b.totalPrice != null ? `$${b.totalPrice.toFixed(2)}` : "—"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] ?? "bg-gray-100 text-gray-700"}`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={b.status}
                    onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CHECKED_IN">Checked In</option>
                    <option value="CHECKED_OUT">Checked Out</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
