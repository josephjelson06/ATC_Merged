"use client";

import React, { useState, useEffect } from "react";
import { Users, Globe, ArrowRight } from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import PageHeader from "../../components/ui/PageHeader";
import { useGuests } from "@/application/hooks/useGuests";
import { useHotelStaff } from "@/application/hooks/useHotelStaff";
import { useAuth } from "@/application/hooks/useAuth";
import ReportDataView, { Column } from "../../components/domain/ReportDataView";

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
    accent: "text-accent bg-accent-muted",
    purple: "text-purple-500 bg-purple-500/10 dark:bg-purple-500/20",
  };

  return (
    <button
      onClick={onClick}
      className="group text-center h-full transition-all w-full outline-none"
    >
      <GlassCard className="h-full flex flex-col items-center hover:border-accent/30 transition-all relative overflow-hidden p-8">
        {/* Icon Container */}
        <div
          className={`p-5 rounded-2xl ${colorStyles[color]} mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner`}
        >
          <Icon size={32} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-black dark:text-white mb-3 tracking-tight uppercase">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6 px-2">
          {preview}
        </p>

        {/* Format Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 mt-auto">
          {formats.map((f: string) => (
            <FormatBadge key={f} label={f} />
          ))}
        </div>

        {/* Export Link */}
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

const HotelReports: React.FC = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? "";

  const [activeReport, setActiveReport] = useState<string | null>(null);
  const { guests, loading: guestsLoading, fetchGuests } = useGuests(tenantId);
  const { staff, loading: staffLoading, fetchStaff } = useHotelStaff(tenantId);

  useEffect(() => {
    if (tenantId) {
      fetchGuests();
      fetchStaff();
    }
  }, [tenantId, fetchGuests, fetchStaff]);

  const isLoading = guestsLoading || staffLoading;
  const foreignGuests = guests.filter(
    (guest: any) => guest.nationality === "Foreign",
  ).length;

  const reportConfigs: any = {
    gst: {
      title: "Guest Log",
      data: guests,
      cols: [
        {
          key: "name",
          label: "Guest Name",
          render: (row: any) => <span className="font-bold">{row.name}</span>,
        },
        { key: "nationality", label: "Nationality" },
        {
          key: "checkInDate",
          label: "Check-In",
          render: (row: any) => (
            <span>{new Date(row.createdAt).toLocaleDateString()}</span>
          ),
        },
        {
          key: "roomNumber",
          label: "Room #",
          render: (row: any) => (
            <span className="font-mono text-xs">{row.roomNumber || "—"}</span>
          ),
        },
        { key: "mobile", label: "Mobile" },
        { key: "email", label: "Email" },
        {
          key: "idType",
          label: "ID Type",
          render: (row: any) => (
            <span className="uppercase text-[10px] font-bold">
              {row.idType || "—"}
            </span>
          ),
        },
      ],
    },
    usr: {
      title: "User & Staff Log",
      data: staff,
      cols: [
        {
          key: "name",
          label: "User Name",
          render: (row: any) => (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-bold">
                {row.name.charAt(0)}
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
              {row.role || row.roleName || "STAFF"}
            </span>
          ),
        },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        {
          key: "status",
          label: "Status",
          render: (row: any) => (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                row.status === "Active" || !row.status
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-gray-500/10 text-gray-500"
              }`}
            >
              {row.status || "Active"}
            </span>
          ),
        },
        {
          key: "id",
          label: "Employee ID",
          render: (row: any) => (
            <span className="font-mono text-xs">{row.id.substring(0, 8)}</span>
          ),
        },
      ],
    },
  };

  const reports = [
    {
      id: "gst",
      icon: Globe,
      title: "Guest Report",
      preview: `Guest demographics from ${guests.length} profiles including ${foreignGuests} foreign nationals.`,
      formats: ["CSV", "PDF", "XLSX"],
      color: "accent",
      rows: guests.length,
    },
    {
      id: "usr",
      icon: Users,
      title: "User Report",
      preview: `Audit log of hotel users and staff actions across ${staff.length} active accounts.`,
      formats: ["CSV", "XLSX"],
      color: "purple",
      rows: staff.length,
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
    <div className="p-4 md:p-8 space-y-12 min-h-screen pb-32 animate-in fade-in duration-700">
      {/* Header Section */}
      <PageHeader
        title="Intelligence Hub"
        subtitle="Property Performance & Data Export Engine"
        badge={isLoading ? "Syncing Data" : "Live Repository Data"}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
};

export default HotelReports;
