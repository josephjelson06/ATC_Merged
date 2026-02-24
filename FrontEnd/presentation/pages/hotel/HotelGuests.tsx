"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/application/hooks/useAuth";
import { useGuests } from "@/application/hooks/useGuests";

export default function HotelGuests() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? "";
  const { guests, loading, error, fetchGuests, createGuest } =
    useGuests(tenantId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    idType: "",
    idNumber: "",
  });

  useEffect(() => {
    if (tenantId) fetchGuests();
  }, [tenantId, fetchGuests]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createGuest({
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      idType: form.idType || undefined,
      idNumber: form.idNumber || undefined,
    });
    setForm({ name: "", email: "", phone: "", idType: "", idNumber: "" });
    setShowForm(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guests</h1>
          <p className="text-gray-500">Guest registry for your property</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Guest"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded shadow p-6 mb-6 grid grid-cols-2 gap-4"
        >
          <input
            className="border rounded px-3 py-2"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="ID Type (passport, license)"
            value={form.idType}
            onChange={(e) => setForm({ ...form, idType: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="ID Number"
            value={form.idNumber}
            onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
          />
          <button
            type="submit"
            className="col-span-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Create Guest
          </button>
        </form>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Registered
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {guests.map((g) => (
              <tr key={g.id}>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {g.name}
                </td>
                <td className="px-6 py-4 text-gray-500">{g.email ?? "—"}</td>
                <td className="px-6 py-4 text-gray-500">{g.phone ?? "—"}</td>
                <td className="px-6 py-4 text-gray-500">
                  {g.idType ? `${g.idType}: ${g.idNumber}` : "—"}
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {new Date(g.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {guests.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  No guests registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
