"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Monitor,
  Wifi,
  WifiOff,
  Battery,
  Activity,
  Search,
  Filter,
  Signal,
  MoreVertical,
  ExternalLink,
  LayoutGrid,
  List,
  Printer,
  Clock,
  ShieldCheck,
  Download,
  CheckSquare,
  Square,
  ChevronDown,
  Plus,
  Cpu,
  Zap,
  Binary,
} from "lucide-react";

import GlassCard from "../../components/ui/GlassCard";
import GlassDropdown from "../../components/ui/GlassDropdown";
import Pagination from "../../components/ui/Pagination";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import { useTheme } from "../../hooks/useTheme";
import AddKioskModal from "../../modals/super/AddKioskModal";
import KioskFirmware from "../../modals/super/KioskFirmware";

import { useKiosks } from "@/application/hooks/useKiosks";
import { useAuth } from "@/application/hooks/useAuth";
import { repositories } from "@/infrastructure/config/container";
import type { Tenant } from "@/domain/entities/Tenant";

type FleetTab = "DEVICES" | "FIRMWARE";

const PaperLevel = ({
  level,
  compact = false,
}: {
  level: number;
  compact?: boolean;
}) => {
  const color =
    level < 10 ? "bg-red-500" : level < 20 ? "bg-amber-500" : "bg-emerald-500";

  if (compact) {
    return (
      <div className="flex items-center gap-3 w-full">
        <div className="h-1.5 flex-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} transition-all duration-1000`}
            style={{ width: `${level}%` }}
          ></div>
        </div>
        <span className="text-[10px] font-black dark:text-gray-300 whitespace-nowrap">
          {level}%
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1 text-[8px] font-black text-gray-500 uppercase tracking-widest">
          <Printer size={10} />
          Paper
        </div>
        <span className="text-[9px] font-black dark:text-gray-300">
          {level}%
        </span>
      </div>
      <div className="h-1 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-1000`}
          style={{ width: `${level}%` }}
        ></div>
      </div>
    </div>
  );
};

export default function SuperKiosks({
  onNavigateDetail,
}: {
  onNavigateDetail?: (id: string) => void;
}) {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    user?.tenantId ?? "",
  );

  useEffect(() => {
    if (!user?.tenantId) {
      repositories.tenants
        .getAll()
        .then(setTenants)
        .catch(() => {});
    }
  }, [user?.tenantId]);

  const {
    kiosks: backendKiosks,
    loading,
    fetchKiosks,
    registerKiosk,
    updateKiosk,
  } = useKiosks(selectedTenantId);

  useEffect(() => {
    if (selectedTenantId) fetchKiosks();
  }, [selectedTenantId, fetchKiosks]);

  const [activeTab, setActiveTab] = useState<FleetTab>("DEVICES");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL STATUS");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Mapped list of UI kiosks
  const allKiosks = useMemo(() => {
    const hotelName =
      tenants.find((t) => t.id === selectedTenantId)?.name || "Unknown Hotel";
    return backendKiosks.map((k: any) => ({
      ...k,
      hotel: hotelName,
      status: k.status?.toUpperCase() || "OFFLINE",
      signal: k.signal || Math.floor(Math.random() * 40 + 60),
      paper: k.paper || Math.floor(Math.random() * 80 + 20),
      lastSeen: k.lastHeartbeatAt
        ? new Date(k.lastHeartbeatAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Never",
      firmware: k.firmwareVersion || "v1.0.0",
      update: false,
    }));
  }, [backendKiosks, tenants, selectedTenantId]);

  const filteredData = useMemo(() => {
    return allKiosks.filter((k) => {
      const matchesSearch =
        k.name?.toLowerCase().includes(search.toLowerCase()) ||
        k.id?.toLowerCase().includes(search.toLowerCase()) ||
        k.hotel.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        filterStatus === "ALL STATUS" || k.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [allKiosks, search, filterStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, selectedTenantId, itemsPerPage, activeTab]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const tenantOptions = useMemo(() => {
    const defaultOption = {
      label: "ALL HOTELS",
      onClick: () => setSelectedTenantId(""),
      variant: !selectedTenantId ? ("selected" as const) : ("default" as const),
    };
    const maps = tenants.map((t) => ({
      label: t.name,
      onClick: () => setSelectedTenantId(t.id),
      variant:
        selectedTenantId === t.id
          ? ("selected" as const)
          : ("default" as const),
    }));
    return [defaultOption, ...maps];
  }, [tenants, selectedTenantId]);

  const currentHotelName = useMemo(() => {
    if (!selectedTenantId) return "ALL HOTELS";
    return (
      tenants.find((t) => t.id === selectedTenantId)?.name || "HOTEL SELECTED"
    );
  }, [selectedTenantId, tenants]);

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen pb-20 animate-in fade-in duration-500">
      {/* Top Header & Tab Switcher */}
      <PageHeader
        title="Kiosk Fleet"
        subtitle={
          activeTab === "DEVICES"
            ? `Hardware Command Center • ${allKiosks.length} Devices Active`
            : "Software Versioning & Firmware Deployment"
        }
      >
        <div className="flex p-1.5 rounded-[1.5rem] bg-black/5 dark:bg-white/5 border border-white/5 w-fit">
          <button
            onClick={() => setActiveTab("DEVICES")}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "DEVICES" ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
          >
            <Monitor size={14} /> Device Registry
          </button>
          <button
            onClick={() => setActiveTab("FIRMWARE")}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "FIRMWARE" ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
          >
            <Binary size={14} /> Firmware Forge
          </button>
        </div>
        {activeTab === "DEVICES" && (
          <Button
            size="lg"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus size={20} strokeWidth={3} />}
          >
            Add New Kiosk
          </Button>
        )}
      </PageHeader>

      {activeTab === "DEVICES" && (
        <div className="flex flex-wrap items-center gap-3">
          {[
            {
              label: `${allKiosks.filter((k) => k.status === "ONLINE").length} ONLINE`,
              color:
                "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20",
            },
            {
              label: `${allKiosks.filter((k) => k.status === "OFFLINE").length} OFFLINE`,
              color:
                "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
            },
            {
              label: `${allKiosks.filter((k) => k.status === "CRITICAL").length} CRITICAL`,
              color:
                "bg-red-600 text-white shadow-lg shadow-red-900/40 animate-pulse",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border shadow-sm ${stat.color}`}
            >
              {stat.label}
            </div>
          ))}
        </div>
      )}

      {activeTab === "DEVICES" ? (
        <>
          {/* Control Bar */}
          <div className="relative z-30">
            <GlassCard
              className="flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl border-white/10"
              noPadding
            >
              <div className="p-3 w-full flex-1 flex flex-col md:flex-row gap-3">
                <div className="relative group flex-1">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-focus-within:text-accent transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-16 pr-4 py-4 border-none rounded-2xl bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none sm:text-sm font-bold"
                    placeholder="Search Device Name or ID..."
                  />
                </div>

                <div className="flex items-center gap-3 px-4">
                  {tenants.length > 0 && (
                    <GlassDropdown
                      trigger={
                        <div className="flex items-center justify-between gap-4 px-6 py-3.5 bg-black/5 dark:bg-white/5 rounded-2xl cursor-pointer hover:bg-black/10 transition-all min-w-[160px]">
                          <span className="text-[11px] font-bold uppercase text-accent-strong dark:text-accent tracking-widest truncate max-w-[120px]">
                            {currentHotelName}
                          </span>
                          <ChevronDown
                            size={16}
                            className="text-gray-400 shrink-0"
                          />
                        </div>
                      }
                      items={tenantOptions}
                    />
                  )}

                  <GlassDropdown
                    trigger={
                      <div className="flex items-center justify-between gap-4 px-6 py-3.5 bg-black/5 dark:bg-white/5 rounded-2xl cursor-pointer hover:bg-black/10 transition-all min-w-[160px]">
                        <span className="text-[11px] font-bold uppercase text-gray-700 dark:text-gray-300 tracking-widest">
                          {filterStatus}
                        </span>
                        <ChevronDown size={16} className="text-gray-400" />
                      </div>
                    }
                    items={[
                      {
                        label: "ALL STATUS",
                        onClick: () => setFilterStatus("ALL STATUS"),
                        variant:
                          filterStatus === "ALL STATUS"
                            ? "selected"
                            : "default",
                      },
                      {
                        label: "ONLINE",
                        onClick: () => setFilterStatus("ONLINE"),
                        variant:
                          filterStatus === "ONLINE" ? "selected" : "default",
                      },
                      {
                        label: "OFFLINE",
                        onClick: () => setFilterStatus("OFFLINE"),
                        variant:
                          filterStatus === "OFFLINE" ? "selected" : "default",
                      },
                      {
                        label: "CRITICAL",
                        onClick: () => setFilterStatus("CRITICAL"),
                        variant:
                          filterStatus === "CRITICAL" ? "selected" : "default",
                      },
                    ]}
                  />
                </div>
              </div>
            </GlassCard>
          </div>

          {!selectedTenantId && (
            <div className="py-24 flex flex-col items-center justify-center text-center opacity-70">
              <Monitor size={64} className="text-gray-300 mb-6" />
              <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">
                Select A Hotel
              </h3>
              <p className="text-sm font-bold text-gray-400 uppercase mt-2">
                To view active kiosk terminals
              </p>
            </div>
          )}

          {/* Main Content View */}
          {selectedTenantId && (
            <div className="relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {paginatedData.map((kiosk) => {
                  const isCritical = kiosk.status === "CRITICAL";
                  const isOffline = kiosk.status === "OFFLINE";
                  const statusColor = isCritical
                    ? "border-red-600"
                    : isOffline
                      ? "border-red-500"
                      : "border-emerald-500";

                  return (
                    <div
                      key={kiosk.id}
                      onClick={() => onNavigateDetail?.(kiosk.id)}
                      className={`
                        group relative glass-card p-8 rounded-[2.5rem] border-l-4 cursor-pointer transition-all duration-300 shadow-2xl hover:scale-[1.02]
                        ${statusColor} ${isCritical ? "animate-[pulse_2.5s_infinite]" : ""}
                      `}
                    >
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <h3 className="text-xl font-black dark:text-white tracking-tighter uppercase">
                            {kiosk.name || kiosk.id}
                          </h3>
                          <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest truncate max-w-[140px] mt-1.5">
                            {kiosk.hotel}
                          </p>
                        </div>
                        <div
                          className={`p-3 rounded-2xl ${isOffline || isCritical ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}
                        >
                          {isOffline || isCritical ? (
                            <WifiOff size={22} />
                          ) : (
                            <Wifi size={22} />
                          )}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center justify-between py-3 border-y border-white/5">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-400" />
                            <span
                              className={`text-[10px] font-bold uppercase tracking-widest ${isCritical || isOffline ? "text-red-500" : "text-emerald-500"}`}
                            >
                              {kiosk.lastSeen}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Signal
                              size={14}
                              className={
                                kiosk.signal > 50
                                  ? "text-emerald-500"
                                  : "text-amber-500"
                              }
                            />
                            <span className="text-[11px] font-black dark:text-white">
                              {kiosk.signal}%
                            </span>
                          </div>
                        </div>

                        <PaperLevel level={kiosk.paper} />

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-widest">
                            {kiosk.firmware}
                          </span>
                          {kiosk.update && (
                            <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[8px] font-bold uppercase tracking-widest border border-amber-500/20">
                              Update Ready
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Render new Firmware Management Tab */
        <KioskFirmware />
      )}

      {/* Empty State for Devices */}
      {activeTab === "DEVICES" &&
        selectedTenantId &&
        filteredData.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-center opacity-40">
            <Monitor size={64} className="text-gray-500 mb-6" />
            <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">
              No Devices Found
            </h3>
            <p className="text-sm font-bold text-gray-500 uppercase mt-2">
              Adjust your filters or try a different hotel.
            </p>
          </div>
        )}

      <AddKioskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
