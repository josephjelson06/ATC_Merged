"use client";

import { useEffect } from "react";

import { useReports } from "@/application/hooks/useReports";
import GlassCard from "@/presentation/components/ui/GlassCard";
import PageHeader from "@/presentation/components/ui/PageHeader";

export default function Reports() {
  const { platformReport, loading, error, fetchPlatformReport } = useReports();

  useEffect(() => {
    fetchPlatformReport();
  }, [fetchPlatformReport]);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <PageHeader
        title="Platform Reports"
        subtitle="MRR, tenants, kiosks, and invoice health"
      />

      {error && (
        <GlassCard className="border-red-500/30">
          <p className="text-sm font-bold text-red-500">{error}</p>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <Metric
          label="Total MRR"
          value={`$${(platformReport?.totalMrr ?? 0).toFixed(2)}`}
        />
        <Metric
          label="Active Tenants"
          value={String(platformReport?.activeTenants ?? 0)}
        />
        <Metric
          label="Total Kiosks"
          value={String(platformReport?.totalKiosks ?? 0)}
        />
        <Metric
          label="Paid Revenue"
          value={`$${(platformReport?.paidInvoiceRevenue ?? 0).toFixed(2)}`}
        />
        <Metric
          label="Overdue Amount"
          value={`$${(platformReport?.overdueInvoiceAmount ?? 0).toFixed(2)}`}
        />
      </div>

      {loading && (
        <GlassCard className="border-white/10">
          <p className="text-xs font-bold text-gray-500">Loading report metrics...</p>
        </GlassCard>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard className="border-white/10">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
        {label}
      </p>
      <p className="text-2xl font-black tracking-tight dark:text-white">{value}</p>
    </GlassCard>
  );
}
