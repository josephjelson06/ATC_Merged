"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuditLogs } from "@/application/hooks/useAuditLogs";
import { useTenants } from "@/application/hooks/useTenants";
import GlassCard from "@/presentation/components/ui/GlassCard";
import PageHeader from "@/presentation/components/ui/PageHeader";

export default function AuditLogs() {
  const { auditLogs, loading, error, fetchAuditLogs } = useAuditLogs();
  const { tenants, fetchTenants } = useTenants();
  const [actionFilter, setActionFilter] = useState("");
  const [tenantFilter, setTenantFilter] = useState("");

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  useEffect(() => {
    fetchAuditLogs({
      action: actionFilter || undefined,
      tenantId: tenantFilter || undefined,
    });
  }, [actionFilter, tenantFilter, fetchAuditLogs]);

  const tenantNameById = useMemo(() => {
    const map = new Map<string, string>();
    tenants.forEach((tenant) => map.set(tenant.id, tenant.name));
    return map;
  }, [tenants]);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <PageHeader title="Audit Logs" subtitle="Security and compliance trail" />

      <GlassCard className="border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            placeholder="Filter action (e.g. INVOICE_CREATED)"
            className="px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 text-sm font-bold"
          />
          <select
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            className="px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 text-sm font-bold"
          >
            <option value="">All tenants</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              fetchAuditLogs({
                action: actionFilter || undefined,
                tenantId: tenantFilter || undefined,
              })
            }
            className="px-4 py-3 rounded-xl bg-accent-strong text-white text-sm font-black uppercase tracking-wider"
          >
            Refresh
          </button>
        </div>
      </GlassCard>

      <GlassCard noPadding clipContent className="border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Tenant</th>
                <th className="px-6 py-4">Resource</th>
                <th className="px-6 py-4">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs font-black dark:text-white">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-gray-300">
                    {log.tenantId
                      ? tenantNameById.get(log.tenantId) || log.tenantId
                      : "Platform"}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">
                    {log.resourceType}:{log.resourceId}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">
                    {log.ipAddress || "-"}
                  </td>
                </tr>
              ))}
              {!loading && auditLogs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm font-medium text-gray-500"
                  >
                    No audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {(loading || error) && (
          <div className="p-4 border-t border-white/10">
            {loading && <p className="text-xs font-bold text-gray-500">Loading...</p>}
            {error && <p className="text-xs font-bold text-red-500">{error}</p>}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
