"use client";

import { useEffect, useMemo, useState } from "react";

import { useInvoices, type InvoiceStatus } from "@/application/hooks/useInvoices";
import { useTenants } from "@/application/hooks/useTenants";
import GlassCard from "@/presentation/components/ui/GlassCard";
import PageHeader from "@/presentation/components/ui/PageHeader";

const badgeClassByStatus: Record<InvoiceStatus, string> = {
  DRAFT: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  PAID: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  OVERDUE: "bg-red-500/10 text-red-500 border-red-500/20",
  CANCELLED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export default function Invoices() {
  const {
    invoices,
    loading,
    error,
    fetchPlatformInvoices,
    markInvoicePaid,
  } = useInvoices();
  const { tenants, fetchTenants } = useTenants();

  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">("ALL");
  const [tenantFilter, setTenantFilter] = useState("");

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  useEffect(() => {
    fetchPlatformInvoices({
      status: statusFilter === "ALL" ? undefined : statusFilter,
      tenantId: tenantFilter || undefined,
    });
  }, [statusFilter, tenantFilter, fetchPlatformInvoices]);

  const tenantNameById = useMemo(() => {
    const map = new Map<string, string>();
    tenants.forEach((tenant) => map.set(tenant.id, tenant.name));
    return map;
  }, [tenants]);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <PageHeader title="Invoices" subtitle="Cross-tenant billing ledger" />

      <GlassCard className="border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | "ALL")}
            className="px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 text-sm font-bold"
          >
            <option value="ALL">All status</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PAID">PAID</option>
            <option value="OVERDUE">OVERDUE</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
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
              fetchPlatformInvoices({
                status: statusFilter === "ALL" ? undefined : statusFilter,
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
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Tenant</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">
                    {invoice.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold dark:text-white">
                    {tenantNameById.get(invoice.tenantId) || invoice.tenantId}
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-emerald-500">
                    {invoice.currency} {invoice.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full border text-[9px] font-black tracking-widest ${badgeClassByStatus[invoice.status]}`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      disabled={invoice.status === "PAID"}
                      onClick={() => markInvoicePaid(invoice.id)}
                      className="px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Mark Paid
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && invoices.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm font-medium text-gray-500"
                  >
                    No invoices found.
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
