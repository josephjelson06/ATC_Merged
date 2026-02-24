import { useCallback, useState } from "react";

import { httpClient } from "@/infrastructure/http/client";

export interface AuditLogEntry {
  id: string;
  tenantId?: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

interface ApiAuditLogDTO {
  id: string;
  tenant_id?: string | null;
  user_id?: string | null;
  action: string;
  resource_type: string;
  resource_id: string;
  details?: Record<string, unknown> | null;
  ip_address?: string | null;
  created_at: string;
}

const toEntity = (dto: ApiAuditLogDTO): AuditLogEntry => ({
  id: dto.id,
  tenantId: dto.tenant_id ?? undefined,
  userId: dto.user_id ?? undefined,
  action: dto.action,
  resourceType: dto.resource_type,
  resourceId: dto.resource_id,
  details: dto.details ?? undefined,
  ipAddress: dto.ip_address ?? undefined,
  createdAt: dto.created_at,
});

export function useAuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLogs = useCallback(
    async (filters?: { tenantId?: string; action?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters?.tenantId) params.set("tenant_id", filters.tenantId);
        if (filters?.action) params.set("action", filters.action);
        params.set("limit", "300");
        const suffix = params.toString() ? `?${params.toString()}` : "";

        const data = await httpClient.get<ApiAuditLogDTO[]>(
          `/api/platform/audit-logs${suffix}`,
        );
        setAuditLogs(data.map(toEntity));
      } catch (err: any) {
        setError(err?.message || "Failed to fetch audit logs");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    auditLogs,
    loading,
    error,
    fetchAuditLogs,
  };
}
