import { useCallback, useState } from "react";

import { httpClient } from "@/infrastructure/http/client";

export type IncidentStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type IncidentPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Incident {
  id: string;
  tenantId: string;
  kioskId?: string;
  roomId?: string;
  reportedBy: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  createdAt: string;
  updatedAt: string;
}

interface ApiIncidentDTO {
  id: string;
  tenant_id: string;
  kiosk_id?: string | null;
  room_id?: string | null;
  reported_by: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  created_at: string;
  updated_at: string;
}

interface IncidentCreateInput {
  kioskId?: string;
  roomId?: string;
  reportedBy: string;
  description: string;
  priority: IncidentPriority;
}

interface IncidentUpdateInput {
  kioskId?: string | null;
  roomId?: string | null;
  description?: string;
  status?: IncidentStatus;
  priority?: IncidentPriority;
}

const toEntity = (dto: ApiIncidentDTO): Incident => ({
  id: dto.id,
  tenantId: dto.tenant_id,
  kioskId: dto.kiosk_id ?? undefined,
  roomId: dto.room_id ?? undefined,
  reportedBy: dto.reported_by,
  description: dto.description,
  status: dto.status,
  priority: dto.priority,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
});

export function useIncidents(tenantId: string) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(
    async (filters?: { status?: IncidentStatus; priority?: IncidentPriority }) => {
      if (!tenantId) return;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters?.status) params.set("status_filter", filters.status);
        if (filters?.priority) params.set("priority_filter", filters.priority);

        const suffix = params.toString() ? `?${params.toString()}` : "";
        const data = await httpClient.get<ApiIncidentDTO[]>(
          `/api/hotels/${tenantId}/incidents${suffix}`,
        );
        setIncidents(data.map(toEntity));
      } catch (err: any) {
        setError(err?.message || "Failed to fetch incidents");
      } finally {
        setLoading(false);
      }
    },
    [tenantId],
  );

  const createIncident = useCallback(
    async (payload: IncidentCreateInput) => {
      if (!tenantId) throw new Error("Missing tenant context");

      const body = {
        kiosk_id: payload.kioskId,
        room_id: payload.roomId,
        reported_by: payload.reportedBy,
        description: payload.description,
        priority: payload.priority,
      };
      const created = await httpClient.post<ApiIncidentDTO>(
        `/api/hotels/${tenantId}/incidents`,
        body,
      );
      const mapped = toEntity(created);
      setIncidents((prev) => [mapped, ...prev]);
      return mapped;
    },
    [tenantId],
  );

  const updateIncident = useCallback(
    async (incidentId: string, payload: IncidentUpdateInput) => {
      if (!tenantId) throw new Error("Missing tenant context");

      const body: Record<string, unknown> = {};
      if ("kioskId" in payload) body.kiosk_id = payload.kioskId;
      if ("roomId" in payload) body.room_id = payload.roomId;
      if (payload.description !== undefined) body.description = payload.description;
      if (payload.status !== undefined) body.status = payload.status;
      if (payload.priority !== undefined) body.priority = payload.priority;

      const updated = await httpClient.patch<ApiIncidentDTO>(
        `/api/hotels/${tenantId}/incidents/${incidentId}`,
        body,
      );
      const mapped = toEntity(updated);
      setIncidents((prev) =>
        prev.map((incident) => (incident.id === incidentId ? mapped : incident)),
      );
      return mapped;
    },
    [tenantId],
  );

  const deleteIncident = useCallback(
    async (incidentId: string) => {
      if (!tenantId) throw new Error("Missing tenant context");
      await httpClient.delete(`/api/hotels/${tenantId}/incidents/${incidentId}`);
      setIncidents((prev) => prev.filter((incident) => incident.id !== incidentId));
    },
    [tenantId],
  );

  return {
    incidents,
    loading,
    error,
    fetchIncidents,
    createIncident,
    updateIncident,
    deleteIncident,
  };
}
