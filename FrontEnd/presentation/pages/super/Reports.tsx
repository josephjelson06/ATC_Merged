"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  CreditCard,
  FileText,
  Users,
  ArrowRight,
  TrendingUp,
  Monitor,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import GlassCard from "../../components/ui/GlassCard";
import PageHeader from "../../components/ui/PageHeader";
import { useTenants } from "@/application/hooks/useTenants";
import { useSubscriptions } from "@/application/hooks/useSubscriptions";
import { useInvoices } from "@/application/hooks/useInvoices";
import { useUsers } from "@/application/hooks/useUsers";
import { useReports } from "@/application/hooks/useReports";
import ReportDataView from "../../components/domain/ReportDataView";

// --- SUB-COMPONENTS ---

const FormatBadge: React.FC<{ label: string }> = ({ label }) => (
  <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
    {label}
  </span>
);

const ReportSummaryCard = ({
  icon: Icon,
  title,
  preview,
  formats,
  color,
  onClick,
}: any) => {
  const colorStyles: Record<string, string> = {
    blue: "text-accent bg-blue-500/10 dark:bg-blue-500/20",
    cyan: "text-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20",
    purple: "text-purple-500 bg-purple-500/10 dark:bg-purple-500/20",
  };

  return (
    <button
      onClick={onClick}
      className="group text-center h-full transition-all w-full outline-none"
    >
      <GlassCard className="h-full flex flex-col items-center hover:border-accent/30 transition-all relative overflow-hidden p-8">
        <div
          className={`p-5 rounded-2xl ${colorStyles[color]} mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner`}
        >
          <Icon size={32} />
        </div>

        <h3 className="text-xl font-black dark:text-white mb-3 tracking-tight uppercase">
          {title}
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6 px-2">
          {preview}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 mt-auto">
          {formats.map((f: string) => (
            <FormatBadge key={f} label={f} />
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white group-hover:text-accent-strong transition-colors">
          View & Export{" "}
          <ArrowRight
            size={14}
            className="group-hover:translate-x-1 transition-transform"
          />
        </div>
      </GlassCard>
    </button>
  );
};

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: any;
}) {
  return (
    <GlassCard className="border-white/10 hover:-translate-y-1 transition-transform group">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          {label}
        </p>
        {Icon && (
          <Icon
            size={16}
            className="text-gray-300 dark:text-white/20 group-hover:text-accent transition-colors"
          />
        )}
      </div>
      <p className="text-2xl font-black tracking-tight dark:text-white group-hover:text-accent transition-colors">
        {value}
      </p>
    </GlassCard>
  );
}

export default function Reports() {
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const {
    tenants: hotels,
    loading: hotelsLoading,
    fetchTenants: fetchHotels,
  } = useTenants();
  const {
    subscriptions,
    loading: subscriptionsLoading,
    fetchSubscriptions,
  } = useSubscriptions();
  const {
    invoices,
    loading: invoicesLoading,
    fetchPlatformInvoices,
  } = useInvoices();
  const { users, loading: usersLoading, fetchUsers } = useUsers();

  const {
    platformReport,
    loading: reportLoading,
    error: reportError,
    fetchPlatformReport,
  } = useReports();

  useEffect(() => {
    fetchHotels();
    fetchSubscriptions();
    fetchPlatformInvoices();
    fetchUsers();
    fetchPlatformReport();
  }, [
    fetchHotels,
    fetchSubscriptions,
    fetchPlatformInvoices,
    fetchUsers,
    fetchPlatformReport,
  ]);

  const isLoading =
    hotelsLoading ||
    subscriptionsLoading ||
    invoicesLoading ||
    usersLoading ||
    reportLoading;

  // Configuration for each report type
  const reportConfigs: Record<
    string,
    { title: string; data: any[]; cols: any[] }
  > = {
    hotels: {
      title: "Hotels Registry",
      data: hotels,
      cols: [
        {
          key: "name",
          label: "Hotel Name",
          render: (row: any) => <span className="font-bold">{row.name}</span>,
        },
        {
          key: "status",
          label: "Status",
          render: (row: any) => (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                row.status === "ACTIVE" || row.status === "Active"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-gray-500/10 text-gray-500"
              }`}
            >
              {row.status || "ACTIVE"}
            </span>
          ),
        },
        {
          key: "plan",
          label: "Plan",
          render: (row: any) => (
            <span className="uppercase text-[10px] font-bold">
              {row.activePlanId || "Free"}
            </span>
          ),
        },
        {
          key: "email",
          label: "Contact",
          render: (row: any) => (
            <div className="flex flex-col text-xs">
              <span>{row.ownerEmail}</span>
            </div>
          ),
        },
        {
          key: "createdAt",
          label: "Onboarded",
          render: (row: any) =>
            new Date(row.createdAt || Date.now()).toLocaleDateString(),
        },
      ],
    },
    subscriptions: {
      title: "Subscription Ledger",
      data: subscriptions,
      cols: [
        {
          key: "id",
          label: "Sub ID",
          render: (row: any) => (
            <span className="font-mono text-xs">#{row.id.substring(0, 8)}</span>
          ),
        },
        {
          key: "tenantId",
          label: "Hotel ID",
          render: (row: any) => (
            <span className="font-bold font-mono text-xs">
              {row.tenantId.substring(0, 8)}
            </span>
          ),
        },
        {
          key: "planId",
          label: "Current Plan",
          render: (row: any) => (
            <span className="uppercase text-[10px] font-bold">
              {row.planId}
            </span>
          ),
        },
        {
          key: "status",
          label: "Status",
          render: (row: any) => (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                row.status === "active" || row.status === "Active"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {row.status}
            </span>
          ),
        },
        {
          key: "currentPeriodEnd",
          label: "Renewal",
          render: (row: any) =>
            row.currentPeriodEnd
              ? new Date(row.currentPeriodEnd).toLocaleDateString()
              : "—",
        },
      ],
    },
    invoices: {
      title: "Financial Invoices",
      data: invoices,
      cols: [
        {
          key: "id",
          label: "Invoice #",
          render: (row: any) => (
            <span className="font-mono text-xs">{row.id.substring(0, 8)}</span>
          ),
        },
        {
          key: "createdAt",
          label: "Date Issued",
          render: (row: any) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
          key: "tenantId",
          label: "Hotel ID",
          render: (row: any) => (
            <span className="font-bold font-mono text-xs">
              {row.tenantId.substring(0, 8)}
            </span>
          ),
        },
        {
          key: "totalAmount",
          label: "Total",
          render: (row: any) => `$${row.totalAmount}`,
        },
        {
          key: "status",
          label: "Payment",
          render: (row: any) => (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                row.status === "paid" || row.status === "Paid"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-orange-500/10 text-orange-500"
              }`}
            >
              {row.status}
            </span>
          ),
        },
      ],
    },
    users: {
      title: "User Access Log",
      data: users,
      cols: [
        {
          key: "name",
          label: "User Name",
          render: (row: any) => (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">
                {row.name?.charAt(0) || "U"}
              </div>
              <span className="font-bold">{row.name}</span>
            </div>
          ),
        },
        {
          key: "role",
          label: "Role",
          render: (row: any) => (
            <span className="uppercase text-[10px] font-bold text-gray-500">
              {row.role || "USER"}
            </span>
          ),
        },
        { key: "email", label: "Email" },
        {
          key: "status",
          label: "Status",
          render: (row: any) => (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-500`}
            >
              Active
            </span>
          ),
        },
      ],
    },
  };

  const reports = [
    {
      id: "hotels",
      icon: Building2,
      title: "Hotels Report",
      preview:
        "Comprehensive registry of all onboarded properties, including operational status, licensing details, and tax identifiers.",
      formats: ["CSV", "PDF", "XLSX"],
      color: "blue",
      rows: hotels.length,
    },
    {
      id: "subscriptions",
      icon: CreditCard,
      title: "Subscriptions Report",
      preview:
        "Detailed breakdown of active recurring billing plans, renewal schedules, and commercial tier assignments across the network.",
      formats: ["CSV", "PDF", "XLSX"],
      color: "cyan",
      rows: subscriptions.length,
    },
    {
      id: "invoices",
      icon: FileText,
      title: "Invoices Report",
      preview:
        "Complete financial ledger of generated invoices, tracking payment statuses, overdue receivables, and revenue realization.",
      formats: ["CSV", "PDF", "XLSX"],
      color: "emerald",
      rows: invoices.length,
    },
    {
      id: "users",
      icon: Users,
      title: "Users Report",
      preview:
        "Audit log of all system access privileges, role assignments, and user identity metadata across the platform.",
      formats: ["CSV", "XLSX"],
      color: "purple",
      rows: users.length,
    },
  ];

  if (activeReport) {
    const config = reportConfigs[activeReport];

    if (config) {
      return (
        <div className="p-4 md:p-8 min-h-screen pb-24">
          <ReportDataView
            title={config.title}
            data={config.data}
            columns={config.cols}
            onBack={() => setActiveReport(null)}
            isLoading={isLoading}
          />
        </div>
      );
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-10 min-h-screen pb-24 animate-in fade-in duration-500">
      {/* Header Section */}
      <PageHeader
        title="Intelligence Hub"
        subtitle={
          isLoading
            ? "Analytical Insight & Data Export Engine | Syncing..."
            : "Analytical Insight & Data Export Engine | Live Repository Data"
        }
      />

      {reportError && (
        <GlassCard className="border-red-500/30">
          <p className="text-sm font-bold text-red-500">{reportError}</p>
        </GlassCard>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Metric
          label="Total MRR"
          value={`$${(platformReport?.totalMrr ?? 0).toFixed(2)}`}
          icon={TrendingUp}
        />
        <Metric
          label="Active Tenants"
          value={String(platformReport?.activeTenants ?? 0)}
          icon={Building2}
        />
        <Metric
          label="Total Kiosks"
          value={String(platformReport?.totalKiosks ?? 0)}
          icon={Monitor}
        />
        <Metric
          label="Paid Revenue"
          value={`$${(platformReport?.paidInvoiceRevenue ?? 0).toFixed(2)}`}
          icon={CheckCircle2}
        />
        <Metric
          label="Overdue Amount"
          value={`$${(platformReport?.overdueInvoiceAmount ?? 0).toFixed(2)}`}
          icon={AlertTriangle}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {reports.map((r) => (
          <ReportSummaryCard
            key={r.id}
            {...r}
            onClick={() => setActiveReport(r.id)}
          />
        ))}
      </div>
    </div>
  );
}
