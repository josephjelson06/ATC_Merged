"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/application/hooks/useAuth";
import { useRooms } from "@/application/hooks/useRooms";

export default function HotelRooms() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? "";
  const {
    roomTypes,
    rooms,
    loading,
    error,
    fetchRoomTypes,
    fetchRooms,
    createRoomType,
    deleteRoomType,
    createRoom,
    updateRoomStatus,
  } = useRooms(tenantId);

  const [showTypeForm, setShowTypeForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [roomTypeForm, setRoomTypeForm] = useState({
    name: "",
    code: "",
    price: "",
    amenities: "",
  });
  const [roomForm, setRoomForm] = useState({
    roomTypeId: "",
    roomNumber: "",
    floor: "",
    status: "available",
  });

  useEffect(() => {
    if (tenantId) {
      fetchRoomTypes();
      fetchRooms();
    }
  }, [tenantId, fetchRoomTypes, fetchRooms]);

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRoomType({
      name: roomTypeForm.name,
      code: roomTypeForm.code,
      price: parseFloat(roomTypeForm.price),
      amenities: roomTypeForm.amenities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setRoomTypeForm({ name: "", code: "", price: "", amenities: "" });
    setShowTypeForm(false);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRoom({
      roomTypeId: roomForm.roomTypeId,
      roomNumber: roomForm.roomNumber,
      floor: roomForm.floor ? parseInt(roomForm.floor, 10) : undefined,
      status: roomForm.status as
        | "available"
        | "occupied"
        | "housekeeping"
        | "maintenance",
      roomTypeName: undefined,
    });
    setRoomForm({
      roomTypeId: "",
      roomNumber: "",
      floor: "",
      status: "available",
    });
    setShowRoomForm(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Rooms & Room Types
          </h1>
          <p className="text-gray-500">Manage your property's room inventory</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTypeForm(!showTypeForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showTypeForm ? "Cancel" : "+ Add Room Type"}
          </button>
          <button
            onClick={() => setShowRoomForm(!showRoomForm)}
            disabled={roomTypes.length === 0}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {showRoomForm ? "Cancel" : "+ Add Room"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}

      {showTypeForm && (
        <form
          onSubmit={handleCreateType}
          className="bg-white rounded shadow p-6 mb-6 grid grid-cols-2 gap-4"
        >
          <input
            className="border rounded px-3 py-2"
            placeholder="Name (e.g. Deluxe Suite)"
            value={roomTypeForm.name}
            onChange={(e) =>
              setRoomTypeForm({ ...roomTypeForm, name: e.target.value })
            }
            required
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Code (e.g. DELUXE)"
            value={roomTypeForm.code}
            onChange={(e) =>
              setRoomTypeForm({ ...roomTypeForm, code: e.target.value })
            }
            required
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Price per night"
            type="number"
            step="0.01"
            value={roomTypeForm.price}
            onChange={(e) =>
              setRoomTypeForm({ ...roomTypeForm, price: e.target.value })
            }
            required
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Amenities (comma separated)"
            value={roomTypeForm.amenities}
            onChange={(e) =>
              setRoomTypeForm({ ...roomTypeForm, amenities: e.target.value })
            }
          />
          <button
            type="submit"
            className="col-span-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Create Room Type
          </button>
        </form>
      )}

      {showRoomForm && (
        <form
          onSubmit={handleCreateRoom}
          className="bg-white rounded shadow p-6 mb-6 grid grid-cols-2 gap-4"
        >
          <select
            className="border rounded px-3 py-2"
            value={roomForm.roomTypeId}
            onChange={(e) =>
              setRoomForm({ ...roomForm, roomTypeId: e.target.value })
            }
            required
          >
            <option value="">Select Room Type</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name} ({rt.code})
              </option>
            ))}
          </select>
          <input
            className="border rounded px-3 py-2"
            placeholder="Room number (e.g. 101)"
            value={roomForm.roomNumber}
            onChange={(e) =>
              setRoomForm({ ...roomForm, roomNumber: e.target.value })
            }
            required
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Floor (optional)"
            type="number"
            value={roomForm.floor}
            onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
          />
          <select
            className="border rounded px-3 py-2"
            value={roomForm.status}
            onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="housekeeping">Housekeeping</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button
            type="submit"
            className="col-span-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Create Room
          </button>
        </form>
      )}

      {/* Room Types */}
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Room Types ({roomTypes.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {loading && <p className="text-gray-400 col-span-3">Loading...</p>}
        {roomTypes.map((rt) => (
          <div
            key={rt.id}
            className="bg-white rounded shadow p-5 border-l-4 border-blue-500"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900">{rt.name}</h3>
                <p className="text-xs text-gray-400 font-mono">{rt.code}</p>
              </div>
              <span className="text-lg font-bold text-blue-600">
                ${rt.price}/night
              </span>
            </div>
            {rt.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {rt.amenities.map((a, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {a}
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={() => deleteRoomType(rt.id)}
              className="mt-3 text-xs text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Individual Rooms */}
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Rooms ({rooms.length})
      </h2>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Room #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Floor
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
            {rooms.map((room) => (
              <tr key={room.id}>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {room.roomNumber}
                </td>
                <td className="px-6 py-4 text-gray-500">{room.floor ?? "--"}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      room.status === "available"
                        ? "bg-green-100 text-green-700"
                        : room.status === "occupied"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {room.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={room.status}
                    onChange={(e) => updateRoomStatus(room.id, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </td>
              </tr>
            ))}
            {rooms.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  No rooms yet. Create a Room Type first, then add rooms.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
