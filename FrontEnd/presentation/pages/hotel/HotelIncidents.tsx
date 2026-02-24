"use client";

import { useEffect, useMemo, useState } from "react";

import PageHeader from "@/presentation/components/ui/PageHeader";
import GlassCard from "@/presentation/components/ui/GlassCard";
import { useAuth } from "@/application/hooks/useAuth";
import {
  useIncidents,
  type IncidentPriority,
  type IncidentStatus,
} from "@/application/hooks/useIncidents";
import { useRooms } from "@/application/hooks/useRooms";
import { useKiosks } from "@/application/hooks/useKiosks";

const statusBadgeClass: Record<IncidentStatus, string> = {
  OPEN: "bg-red-500/10 text-red-500 border-red-500/20",
  IN_PROGRESS: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  RESOLVED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

const priorityBadgeClass: Record<IncidentPriority, string> = {
  LOW: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  MEDIUM: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  HIGH: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  CRITICAL: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function HotelIncidents() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? "";
  const {
    incidents,
    loading,
    error,
    fetchIncidents,
    createIncident,
    updateIncident,
    deleteIncident,
  } = useIncidents(tenantId);
  const { rooms, fetchRooms } = useRooms(tenantId);
  const { kiosks, fetchKiosks } = useKiosks(tenantId);

  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<IncidentPriority | "ALL">(
    "ALL",
  );

  const [form, setForm] = useState({
    reportedBy: user?.name ?? "",
    description: "",
    priority: "MEDIUM" as IncidentPriority,
    roomId: "",
    kioskId: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    fetchRooms();
    fetchKiosks();
  }, [tenantId, fetchRooms, fetchKiosks]);

  useEffect(() => {
    if (!tenantId) return;
    fetchIncidents({
      status: statusFilter === "ALL" ? undefined : statusFilter,
      priority: priorityFilter === "ALL" ? undefined : priorityFilter,
    });
  }, [tenantId, statusFilter, priorityFilter, fetchIncidents]);

  useEffect(() => {
    if (!form.reportedBy && user?.name) {
      setForm((prev) => ({ ...prev, reportedBy: user.name }));
    }
  }, [user?.name, form.reportedBy]);

  const sortedIncidents = useMemo(
    () =>
      [...incidents].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      ),
    [incidents],
  );

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createIncident({
        reportedBy: form.reportedBy,
        description: form.description,
        priority: form.priority,
        roomId: form.roomId || undefined,
        kioskId: form.kioskId || undefined,
      });
      setForm((prev) => ({
        ...prev,
        description: "",
        roomId: "",
        kioskId: "",
      }));
    } finally {
      setSubmitting(false);
    }
  };

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
        title="Incidents"
        subtitle="Maintenance, complaints, and device issues"
      />

      <GlassCard className="border-white/10">
        <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            value={form.reportedBy}
            onChange={(e) => setForm((prev) => ({ ...prev, reportedBy: e.target.value }))}
            placeholder="Reported by"
            className="px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 text-sm font-bold"
            required
          />
          <select
            value={form.priority}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                priority: e.target.value as IncidentPriority,
              }))
            }
            className="px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 text-sm font-bold"
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
          <select
            value={form.roomId}
            onChange={(e) => setForm((prev) => ({ ...prev, roomId: e.target.value }))}
            className="px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 text-sm font-bold"
          >
            <option value="">Room (optional)</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.roomNumber}
              </option>
            ))}
          </select>
          <select
            value={form.kioskId}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, kioskId: e.target.value }))
            }
            className="px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 text-sm font-bold"
          >
            <option value="">Kiosk (optional)</option>
            {kiosks.map((kiosk) => (
              <option key={kiosk.id} value={kiosk.id}>
                {kiosk.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-3 rounded-xl bg-accent-strong text-white text-sm font-black uppercase tracking-wider disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Report Incident"}
          </button>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Incident description"
            className="md:col-span-5 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 text-sm font-medium min-h-[100px]"
            required
          />
        </form>
      </GlassCard>

      <GlassCard className="border-white/10" noPadding clipContent>
        <div className="p-4 border-b border-white/10 flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | "ALL")}
            className="px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-white/10 text-xs font-black"
          >
            <option value="ALL">ALL STATUS</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as IncidentPriority | "ALL")
            }
            className="px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-white/10 text-xs font-black"
          >
            <option value="ALL">ALL PRIORITY</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
          {error && <p className="text-xs font-bold text-red-500">{error}</p>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Reported By</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {sortedIncidents.map((incident) => (
                <tr key={incident.id}>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500">
                    {new Date(incident.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold dark:text-white">
                    {incident.reportedBy}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-[420px]">
                    {incident.description}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full border text-[9px] font-black tracking-widest ${priorityBadgeClass[incident.priority]}`}
                    >
                      {incident.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full border text-[9px] font-black tracking-widest ${statusBadgeClass[incident.status]}`}
                    >
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <select
                      value={incident.status}
                      onChange={(e) =>
                        updateIncident(incident.id, {
                          status: e.target.value as IncidentStatus,
                        })
                      }
                      className="px-2 py-1 rounded-md bg-black/5 dark:bg-white/5 border border-white/10 text-[11px] font-bold"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                    <button
                      onClick={() => deleteIncident(incident.id)}
                      className="px-2 py-1 rounded-md text-[11px] font-bold text-red-500 hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && sortedIncidents.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-10 text-center text-sm font-medium text-gray-500"
                    colSpan={6}
                  >
                    No incidents found.
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
