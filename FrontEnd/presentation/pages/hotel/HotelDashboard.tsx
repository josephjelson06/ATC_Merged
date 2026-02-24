"use client";

import React, { useEffect, useMemo } from "react";
import { useAuth } from "@/application/hooks/useAuth";
import { useRooms } from "@/application/hooks/useRooms";
import { useBookings } from "@/application/hooks/useBookings";
import { useGuests } from "@/application/hooks/useGuests";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  CHECKED_IN: "bg-green-100 text-green-700",
  CHECKED_OUT: "bg-purple-100 text-purple-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function HotelDashboard() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? "";

  const {
    roomTypes,
    rooms,
    loading: roomsLoading,
    error: roomsError,
    fetchRoomTypes,
    fetchRooms,
  } = useRooms(tenantId);
  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
    fetchBookings,
  } = useBookings(tenantId);
  const {
    guests,
    loading: guestsLoading,
    error: guestsError,
    fetchGuests,
  } = useGuests(tenantId);

  useEffect(() => {
    if (!tenantId) return;
    fetchRoomTypes();
    fetchRooms();
    fetchBookings();
    fetchGuests();
  }, [tenantId, fetchRoomTypes, fetchRooms, fetchBookings, fetchGuests]);

  const occupiedRooms = useMemo(
    () => rooms.filter((room) => room.status === "occupied").length,
    [rooms],
  );
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;
  const activeBookings = useMemo(
    () =>
      bookings.filter((booking) =>
        ["DRAFT", "CONFIRMED", "CHECKED_IN"].includes(booking.status),
      ).length,
    [bookings],
  );
  const recentBookings = useMemo(
    () =>
      [...bookings]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    [bookings],
  );

  const isLoading = roomsLoading || bookingsLoading || guestsLoading;
  const error = roomsError || bookingsError || guestsError;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name}
        </h1>
        <p className="text-gray-500">
          Here's what's happening at your property today.
        </p>
      </div>

      {!tenantId && (
        <div className="mb-6 p-4 bg-amber-50 text-amber-800 border border-amber-200 rounded">
          Missing tenant context. Please sign in again.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">Rooms</h3>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? "--" : rooms.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {occupiedRooms} occupied
          </p>
        </div>

        <div className="bg-white rounded shadow p-6 border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Occupancy</h3>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? "--" : `${occupancyRate}%`}
          </p>
          <p className="text-xs text-gray-400 mt-1">Live room status ratio</p>
        </div>

        <div className="bg-white rounded shadow p-6 border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium">Bookings</h3>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? "--" : bookings.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">{activeBookings} active</p>
        </div>

        <div className="bg-white rounded shadow p-6 border-l-4 border-amber-500">
          <h3 className="text-gray-500 text-sm font-medium">Guests</h3>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? "--" : guests.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {roomTypes.length} room types configured
          </p>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Guest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Stay
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recentBookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {booking.guestName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {booking.checkInDate} to {booking.checkOutDate}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {booking.totalPrice != null ? `$${booking.totalPrice.toFixed(2)}` : "--"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status] ?? "bg-gray-100 text-gray-700"}`}
                  >
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
            {!isLoading && recentBookings.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  No bookings yet.
                </td>
              </tr>
            )}
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  Loading live hotel data...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
