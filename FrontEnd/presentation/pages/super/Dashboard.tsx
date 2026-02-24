"use client";

import React, { useEffect, useState } from "react";
import GlassCard from "../../components/ui/GlassCard";
import PageHeader from "../../components/ui/PageHeader";
import {
  Building,
  Activity,
  Info,
  ShieldAlert,
  Monitor,
  FileText,
} from "lucide-react";
import TenantOnboardingTrend from "../../components/dashboard/charts/TenantOnboardingTrend";
import CriticalAlertsFeed from "../../components/dashboard/CriticalAlertsFeed";
import GlassDatePicker from "../../components/ui/GlassDatePicker";
import { useTheme } from "../../hooks/useTheme";
import { useTenants } from "../../../application/hooks/useTenants";
import { useSupport } from "../../../application/hooks/useSupport";
import { repositories } from "@/infrastructure/config/container";

const KPIBadge = ({
  value,
  trend,
}: {
  value: string;
  trend: "up" | "down" | "neutral";
}) => {
  const styles = {
    up: "bg-emerald-500/20 text-emerald-500",
    down: "bg-red-500/20 text-red-500",
    neutral: "bg-gray-500/20 text-gray-500",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${styles[trend]}`}
    >
      {trend === "up" ? "+" : trend === "down" ? "-" : ""}
      {value}
    </span>
  );
};

const WarRoomCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  state = "normal",
  badge,
  colorVariant,
}: any) => {
  const { isDarkMode } = useTheme();

  const colors = {
    blue: {
      border: "border-blue-500/30",
      bg: "bg-blue-500/5",
      footer: "bg-blue-500/10 text-accent-strong dark:text-blue-400",
      icon: "text-accent bg-blue-500/10",
    },
    emerald: {
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/5",
      footer: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      icon: "text-emerald-500 bg-emerald-500/10",
    },
    red: {
      border: "border-red-500/30",
      bg: "bg-red-500/5",
      footer: "bg-red-500/20 text-red-600 dark:text-red-400",
      icon: "text-red-500 bg-red-500/10",
    },
    amber: {
      border: "border-amber-500/30",
      bg: "bg-amber-500/5",
      footer: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      icon: "text-amber-500 bg-amber-500/10",
    },
    default: {
      border: "border-white/10",
      bg: "bg-white/5",
      footer: "bg-black/5 dark:bg-white/5 text-gray-500",
      icon: "text-gray-400 bg-black/5",
    },
  };

  const current = colors[colorVariant as keyof typeof colors] || colors.default;

  return (
    <GlassCard
      noPadding
      clipContent
      className={`flex flex-col h-44 relative group border transition-all duration-500 ${isDarkMode ? current.border + " " + current.bg : "bg-white border-slate-200"}`}
    >
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              {title}
            </p>
            <div className="flex items-center gap-3">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                {value}
              </h3>
              {badge}
            </div>
          </div>
          <div
            className={`p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300 ${current.icon}`}
          >
            <Icon size={22} />
          </div>
        </div>
        {state === "red" && (
          <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
        )}
      </div>

      <div
        className={`w-full py-3 px-6 border-t border-black/5 dark:border-white/5 ${current.footer}`}
      >
        <p className="text-[9px] font-bold uppercase tracking-[0.2em]">
          {subtext}
        </p>
      </div>
    </GlassCard>
  );
};

const Dashboard: React.FC = () => {
  const { tenants, loading: tenantsLoading, fetchTenants } = useTenants();
  const { tickets, loading: ticketsLoading, fetchTickets } = useSupport();
  const [kioskCount, setKioskCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [fleetLoading, setFleetLoading] = useState(false);

  useEffect(() => {
    fetchTenants();
    fetchTickets();
  }, [fetchTenants, fetchTickets]);

  useEffect(() => {
    let active = true;

    async function fetchFleetMetrics() {
      if (tenants.length === 0) {
        setKioskCount(0);
        setBookingCount(0);
        return;
      }

      setFleetLoading(true);

      try {
        const metrics = await Promise.all(
          tenants.map(async (tenant) => {
            const [kiosksResult, bookingsResult] = await Promise.allSettled([
              repositories.kiosks.getAll(tenant.id),
              repositories.bookings.getAll(tenant.id),
            ]);

            return {
              kiosks:
                kiosksResult.status === "fulfilled"
                  ? kiosksResult.value.length
                  : 0,
              bookings:
                bookingsResult.status === "fulfilled"
                  ? bookingsResult.value.length
                  : 0,
            };
          }),
        );

        if (!active) return;

        const totalKiosks = metrics.reduce((sum, item) => sum + item.kiosks, 0);
        const totalBookings = metrics.reduce(
          (sum, item) => sum + item.bookings,
          0,
        );

        setKioskCount(totalKiosks);
        setBookingCount(totalBookings);
      } finally {
        if (active) setFleetLoading(false);
      }
    }

    fetchFleetMetrics();
    return () => {
      active = false;
    };
  }, [tenants]);

  const normalizeTenantStatus = (status?: string) =>
    (status ?? "active").trim().toLowerCase();
  const activeTenants = tenants.filter(
    (tenant) => normalizeTenantStatus(tenant.status) === "active",
  ).length;
  const onboardingTenants = tenants.length - activeTenants;

  const openTickets = tickets.filter(
    (ticket) => (ticket.status ?? "").toLowerCase() === "open",
  ).length;
  const highPriorityTickets = tickets.filter(
    (ticket) =>
      (ticket.status ?? "").toLowerCase() === "open" &&
      (ticket.priority ?? "").toLowerCase() === "high",
  ).length;

  const avgKiosksPerTenant =
    tenants.length > 0 ? (kioskCount / tenants.length).toFixed(1) : "0.0";
  const avgBookingsPerTenant =
    tenants.length > 0 ? (bookingCount / tenants.length).toFixed(1) : "0.0";

  const isLoading = tenantsLoading || ticketsLoading || fleetLoading;
  const platformStatus =
    highPriorityTickets > 0 ? "Attention Required" : "Nominal";

  return (
    <div className="p-8 space-y-8 min-h-screen pb-20 animate-in fade-in duration-700">
      <PageHeader
        title="Business Overview"
        subtitle={`Platform Status: ${platformStatus}`}
        badge={
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 w-fit">
            <Info size={14} strokeWidth={3} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              {isLoading ? "Syncing Data" : "Live Repository Data"}
            </span>
          </div>
        }
      >
        <GlassDatePicker />
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <WarRoomCard
          title="Active Tenants"
          value={isLoading ? "--" : String(activeTenants)}
          subtext="Customer base health"
          icon={Building}
          colorVariant="blue"
          badge={
            <KPIBadge
              value={`${onboardingTenants} onboarding`}
              trend={onboardingTenants > 0 ? "up" : "neutral"}
            />
          }
        />
        <WarRoomCard
          title="Registered Kiosks"
          value={isLoading ? "--" : String(kioskCount)}
          subtext="Cross-tenant device fleet"
          icon={Monitor}
          colorVariant="emerald"
          badge={
            <KPIBadge
              value={`${avgKiosksPerTenant}/tenant`}
              trend={kioskCount > 0 ? "up" : "neutral"}
            />
          }
        />
        <WarRoomCard
          title="Total Bookings"
          value={isLoading ? "--" : String(bookingCount)}
          subtext="Cross-tenant reservation volume"
          icon={FileText}
          colorVariant="amber"
          badge={
            <KPIBadge
              value={`${avgBookingsPerTenant}/tenant`}
              trend={bookingCount > 0 ? "up" : "neutral"}
            />
          }
        />
        <WarRoomCard
          title="Open Support Tickets"
          value={isLoading ? "--" : String(openTickets)}
          subtext={
            highPriorityTickets > 0
              ? `${highPriorityTickets} High Priority`
              : "No critical issues"
          }
          icon={ShieldAlert}
          colorVariant={highPriorityTickets > 0 ? "red" : "default"}
          state={highPriorityTickets > 0 ? "red" : "normal"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard
          noPadding
          clipContent
          className="lg:col-span-1 flex flex-col h-[480px] shadow-2xl border-white/10"
        >
          <div className="p-8 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-black/5 dark:bg-white/[0.02]">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                Tenant Onboarding
              </h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                Growth Metrics
              </p>
            </div>
            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-gray-400">
              <Activity size={18} />
            </div>
          </div>
          <div className="flex-1 p-8 min-h-0">
            <TenantOnboardingTrend />
          </div>
        </GlassCard>

        <div className="lg:col-span-2 h-[480px]">
          <CriticalAlertsFeed />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

