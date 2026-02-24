"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/application/hooks/useAuth";
import { useKiosks } from "@/application/hooks/useKiosks";
import { repositories } from "@/infrastructure/config/container";
import type { Tenant } from "@/domain/entities/Tenant";

const STATUS_COLORS: Record<string, string> = {
  online: "bg-green-100 text-green-700",
  offline: "bg-gray-100 text-gray-700",
  maintenance: "bg-yellow-100 text-yellow-700",
};

export default function SuperKiosks() {
  const { user } = useAuth();
  // Platform (super) users don't have a tenantId — they must select a hotel first
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    user?.tenantId ?? "",
  );
  const { kiosks, loading, error, fetchKiosks, registerKiosk, updateKiosk } =
    useKiosks(selectedTenantId);

  const [showForm, setShowForm] = useState(false);
  const [kioskName, setKioskName] = useState("");

  // For super admins, fetch the list of hotels to choose from
  useEffect(() => {
    if (!user?.tenantId) {
      repositories.tenants
        .getAll()
        .then(setTenants)
        .catch(() => {});
    }
  }, [user?.tenantId]);

  useEffect(() => {
    if (selectedTenantId) fetchKiosks();
  }, [selectedTenantId, fetchKiosks]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerKiosk(kioskName);
    setKioskName("");
    setShowForm(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kiosk Fleet</h1>
          <p className="text-gray-500">
            Manage kiosk devices across properties
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={!selectedTenantId}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {showForm ? "Cancel" : "+ Register Kiosk"}
        </button>
      </div>

      {/* Hotel selector for platform admins */}
      {!user?.tenantId && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <label className="block text-sm font-medium text-amber-800 mb-2">
            Select a hotel to manage kiosks
          </label>
          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="w-full max-w-md border rounded px-3 py-2 text-sm"
          >
            <option value="">— Choose Hotel —</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}

      {showForm && selectedTenantId && (
        <form
          onSubmit={handleRegister}
          className="bg-white rounded shadow p-6 mb-6 flex gap-4"
        >
          <input
            className="flex-1 border rounded px-3 py-2"
            placeholder="Kiosk Name (e.g. Lobby Kiosk 1)"
            value={kioskName}
            onChange={(e) => setKioskName(e.target.value)}
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Register
          </button>
        </form>
      )}

      {!selectedTenantId && (
        <div className="bg-white rounded shadow p-12 text-center text-gray-400">
          Select a hotel above to view and manage its kiosks.
        </div>
      )}

      {selectedTenantId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading && <p className="text-gray-400 col-span-3">Loading...</p>}
          {kiosks.map((k) => (
            <div
              key={k.id}
              className="bg-white rounded shadow p-5 border-l-4 border-purple-500"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-gray-900">{k.name}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[k.status] ?? "bg-gray-100 text-gray-700"}`}
                >
                  {k.status}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-500">
                <p>Firmware: {k.firmwareVersion ?? "—"}</p>
                <p>
                  Last Heartbeat:{" "}
                  {k.lastHeartbeatAt
                    ? new Date(k.lastHeartbeatAt).toLocaleString()
                    : "Never"}
                </p>
                <p className="font-mono text-xs text-gray-400 truncate">
                  API Key: {k.apiKey}
                </p>
              </div>
              <div className="mt-3">
                <select
                  value={k.status}
                  onChange={(e) =>
                    updateKiosk(k.id, { status: e.target.value })
                  }
                  className="text-sm border rounded px-2 py-1 w-full"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          ))}
          {kiosks.length === 0 && !loading && (
            <div className="col-span-3 bg-white rounded shadow p-12 text-center text-gray-400">
              No kiosks registered. Click &quot;Register Kiosk&quot; to add your
              first device.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
