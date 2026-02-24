"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Mail,
  Edit,
  LogIn,
  Building2,
  FileText,
  CreditCard,
  Monitor,
  ArrowUpRight,
  Server,
  Download,
} from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { useTheme } from "../../hooks/useTheme";
import { useTenants } from "@/application/hooks/useTenants";
import type { Tenant } from "@/domain/entities/Tenant";

interface HotelDetailsProps {
  hotelId?: string;
  onNavigate: (route: string) => void;
  onLoginAsAdmin: (tenantId: string) => void;
}

const statusClasses: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Suspended: "bg-red-500/10 text-red-500 border-red-500/20",
  "Past Due": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Onboarding: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

export default function HotelDetails({
  hotelId,
  onNavigate,
  onLoginAsAdmin,
}: HotelDetailsProps) {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("Overview");
  const { getTenant, updateTenant, deleteTenant } = useTenants();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "danger" | "warning" | "primary";
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "primary",
    confirmLabel: "Confirm",
    onConfirm: () => {},
  });

  useEffect(() => {
    if (hotelId) {
      setLoading(true);
      getTenant(hotelId)
        .then(setTenant)
        .catch(() => setError("Failed to load tenant details"))
        .finally(() => setLoading(false));
    }
  }, [hotelId, getTenant]);

  const openConfirm = (config: Omit<typeof modalConfig, "isOpen">) => {
    setModalConfig({ ...config, isOpen: true });
  };

  const closeConfirm = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const isMissingRequestedHotel =
    !loading && hotelId !== undefined && !tenant && !error;

  const hotelName = tenant?.name ?? "Hotel";
  const hotelAddress = tenant?.address ?? "Address unavailable";
  const hotelStatus = tenant?.status ?? "Unknown";
  const hotelPlan = tenant?.planId ?? "None";
  const hotelGstin = tenant?.gstin ?? "N/A";
  const hotelPan =
    tenant?.pan || (hotelGstin.length >= 12 ? hotelGstin.slice(2, 12) : "N/A");
  const hotelStateCode =
    hotelGstin.length >= 2 ? `${hotelGstin.slice(0, 2)} (IN)` : "N/A";

  const statusClassName =
    statusClasses[hotelStatus] ??
    "bg-gray-500/10 text-gray-500 border-gray-500/20";

  const tabs = [
    { name: "Overview", icon: FileText },
    { name: "System Info", icon: Server },
    { name: "Invoices", icon: CreditCard },
  ];

  if (isMissingRequestedHotel || error) {
    return (
      <div className="p-4 md:p-8 space-y-6 min-h-screen pb-20 animate-in fade-in duration-500">
        <button
          onClick={() => onNavigate("tenants")}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Registry
        </button>
        <GlassCard className="p-8 text-center">
          <h2 className="text-xl font-black dark:text-white tracking-tight">
            {error ? "Error loading" : "Tenant not found"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {error || `No tenant exists for ID: ${hotelId}`}
          </p>
        </GlassCard>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-gray-500">Loading tenant details...</div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen pb-20 animate-in fade-in duration-500">
      <button
        onClick={() => onNavigate("tenants")}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back to Registry
      </button>

      {/* UNIFIED CONTAINER: Header Info Section */}
      <GlassCard noPadding clipContent className="relative">
        <div
          className={`absolute top-0 right-0 w-96 h-96 bg-accent/5 dark:bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none ${hotelStatus === "Suspended" ? "grayscale opacity-10" : ""}`}
        ></div>
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 p-8 relative z-10">
          <div className="flex items-start gap-5">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-xl ${isDarkMode ? "bg-white/10 border border-white/10" : "bg-emerald-500 text-white"} ${hotelStatus === "Suspended" ? "grayscale opacity-50" : ""}`}
            >
              <Building2
                size={32}
                className={isDarkMode ? "text-emerald-400" : "text-white"}
              />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter">
                  {hotelName}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusClassName}`}
                >
                  {hotelStatus}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotelAddress + ", " + hotelName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-accent-strong transition-colors"
                >
                  <MapPin size={14} />
                  <span>{hotelAddress}</span>
                </a>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (tenant?.id) {
                  onLoginAsAdmin(tenant.id);
                }
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-accent/20 bg-gray-900 dark:bg-accent text-white hover:scale-105 transition-all flex items-center gap-2"
            >
              <LogIn size={16} /> Login as Admin
            </button>
          </div>
        </div>
      </GlassCard>

      {/* UNIFIED CONTAINER: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            label: "Subscription",
            value: hotelPlan,
            color: "text-accent",
            footer: "Active plan assigned",
          },
          {
            label: "Status",
            value: hotelStatus,
            sub: loading ? "Loading..." : "Current account state",
            color: "text-emerald-500",
            footer: "Operational status",
          },
          {
            label: "Tenant ID",
            value: tenant?.id?.split("-")?.[0] || "Unknown",
            color: "text-accent",
            footer: "Unique identity block",
          },
        ].map((m, i) => (
          <GlassCard
            key={i}
            noPadding
            clipContent
            className="flex flex-col h-32 border-white/5 dark:border-white/10"
          >
            <div className="flex-1 px-6 flex flex-col justify-center">
              <p className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                {m.label}
              </p>
              <div className="flex items-baseline gap-2 overflow-hidden">
                <h3 className="text-2xl font-black dark:text-white tracking-tighter truncate leading-none py-1">
                  {m.value}
                </h3>
                <span className={`text-[10px] font-semibold ${m.color}`}>
                  {m.sub}
                </span>
              </div>
            </div>
            <div className="bg-black/5 dark:bg-white/[0.03] px-6 py-2 border-t border-white/5">
              <p className="text-[8px] font-bold uppercase text-gray-500 tracking-wider">
                {m.footer}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Tabs Switcher */}
      <div className="flex overflow-x-auto pb-1 gap-2 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab.name ? "bg-gray-900 text-white dark:bg-white dark:text-black shadow-lg scale-105" : "text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10"}`}
          >
            <tab.icon size={14} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="w-full space-y-6">
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GlassCard
              noPadding
              clipContent
              className="border-white/5 dark:border-white/10 flex flex-col"
            >
              <div className="p-8 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/[0.02]">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                  Tenant Profile
                </h3>
              </div>
              <div className="p-8 space-y-4 text-sm flex-1">
                {[
                  { l: "Trade Name", v: hotelName },
                  { l: "GSTIN", v: hotelGstin, mono: true },
                  { l: "PAN", v: hotelPan, mono: true },
                  { l: "Registered Address", v: hotelAddress },
                  { l: "State Code", v: hotelStateCode },
                ].map((it, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1 border-b border-white/5 pb-2 last:border-0"
                  >
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      {it.l}
                    </span>
                    <span
                      className={`font-bold dark:text-white ${it.mono ? "font-mono" : ""}`}
                    >
                      {it.v || "-"}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
            <GlassCard
              noPadding
              clipContent
              className="border-white/5 dark:border-white/10 flex flex-col"
            >
              <div className="p-8 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/[0.02]">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                  Subscription Info
                </h3>
              </div>
              <div className="p-8 space-y-4 text-sm flex-1">
                {[
                  {
                    l: "Current Plan",
                    v: `${hotelPlan} Plan`,
                    badge: "Orange",
                  },
                  { l: "Billing Cycle", v: `Active` },
                  { l: "Tenant ID", v: tenant?.id || "-" },
                  { l: "Owner ID", v: tenant?.ownerId || "-", mono: true },
                ].map((it, i) => (
                  <div
                    key={i}
                    className="flex justify-between flex-wrap gap-2 items-center py-4 border-b border-white/5 last:border-0"
                  >
                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                      {it.l}
                    </span>
                    <span
                      className={`font-black dark:text-white uppercase tracking-tighter ${it.mono ? "font-mono tracking-normal text-xs font-bold w-1/2 text-right truncate" : ""}`}
                      title={it.v}
                    >
                      {it.v}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === "System Info" && (
          <GlassCard
            noPadding
            clipContent
            className="overflow-hidden border-white/5 dark:border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Server size={32} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-1">
                Architecture Node
              </h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                This tenant is provisioned onto standard infrastructure
                processing lanes.
              </p>
            </div>
          </GlassCard>
        )}

        {activeTab === "Invoices" && (
          <GlassCard
            noPadding
            clipContent
            className="overflow-hidden border-white/5 dark:border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <table className="w-full text-left">
              <thead className="bg-black/5 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <tr>
                  <th className="px-8 py-6">Number</th>
                  <th className="px-8 py-6">Period</th>
                  <th className="px-8 py-6 text-right">Amount</th>
                  <th className="px-8 py-6 text-center">Status</th>
                  <th className="px-8 py-6 text-right pr-10">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  {
                    id: "INV-2024-006",
                    p: "Jan 2025",
                    a: 15000,
                    s: "paid",
                    d: "Jan 10",
                  },
                ].map((inv, i) => (
                  <tr
                    key={i}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-6 text-sm font-mono font-bold text-accent-strong">
                      {inv.id}
                    </td>
                    <td className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest dark:text-gray-400">
                      {inv.p}
                    </td>
                    <td className="px-8 py-6 text-sm font-black text-right dark:text-white tracking-tighter">
                      ₹{inv.a.toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${inv.s === "paid" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}
                      >
                        {inv.s}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right pr-10">
                      <button className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        )}
      </div>

      {/* Danger Zone */}
      <GlassCard className="border-red-500/20 bg-red-500/5 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-lg font-bold text-red-500 mb-1">Danger Zone</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Irreversible actions for this tenant account. Proceed with
              caution.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                const isSuspended = hotelStatus === "Suspended";
                openConfirm({
                  title: isSuspended ? "Activate Tenant" : "Suspend Tenant",
                  message: isSuspended
                    ? `Are you sure you want to activate ${hotelName}? This will restore access to all services.`
                    : `Are you sure you want to suspend ${hotelName}? This will immediately suspend the account and restrict all involved services.`,
                  variant: "warning",
                  confirmLabel: isSuspended ? "Activate" : "Suspend",
                  onConfirm: async () => {
                    const newStatus = isSuspended ? "Active" : "Suspended";
                    if (tenant?.id) {
                      const updated = await updateTenant(tenant.id, {
                        status: newStatus,
                      });
                      setTenant(updated);
                    }
                  },
                });
              }}
              className="px-5 py-2.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-bold"
            >
              {hotelStatus === "Suspended"
                ? "Activate Tenant"
                : "Suspend Tenant"}
            </button>
            <button
              onClick={() => {
                openConfirm({
                  title: "Delete Tenant",
                  message: `Are you sure you want to permanently delete ${hotelName}? This action cannot be undone and will remove all associated data including users and invoices.`,
                  variant: "danger",
                  confirmLabel: "Delete Forever",
                  onConfirm: async () => {
                    if (tenant?.id) {
                      await deleteTenant(tenant.id);
                      onNavigate("tenants");
                    }
                  },
                });
              }}
              className="px-5 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-bold shadow-lg shadow-red-500/20"
            >
              Delete Tenant
            </button>
          </div>
        </div>
      </GlassCard>

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={closeConfirm}
        onConfirm={() => {
          modalConfig.onConfirm();
          closeConfirm();
        }}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        confirmLabel={modalConfig.confirmLabel}
      />
    </div>
  );
}
