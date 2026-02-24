"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  User,
  Smartphone,
  CreditCard,
  LogIn,
  ExternalLink,
  ShieldAlert,
  ChevronDown,
  Building2,
  MapPin,
  Phone,
  IndianRupee,
  Mail,
  Trash2,
} from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import GlassDropdown from "../../components/ui/GlassDropdown";
import AddHotelModal from "../../modals/super/AddHotelModal";
import Pagination from "../../components/ui/Pagination";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import SharedStatusBadge, {
  statusToVariant,
} from "../../components/ui/StatusBadge";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { useTenants } from "@/application/hooks/useTenants"; // Migrated hook
import { usePlans } from "@/application/hooks/usePlans";
import type { PlanData } from "@/domain/entities/Plan";
import { useUsers } from "@/application/hooks/useUsers"; // To get owner details if needed or we use tenants data

// --- ViewModel Adapter ---
interface TenantViewModel {
  id: string;
  name: string;
  address: string;
  status: string;
  plan: string;
  gstin: string;
  owner: string;
  mobile: string;
  email: string;
  kiosks: number;
  mrr: number;
  ownerId?: string;
}

const PlanBadge = ({ plan, plans }: { plan: string; plans: PlanData[] }) => {
  const currentPlan = plans.find((p) => p.name === plan);
  const theme = currentPlan?.id.includes("pro")
    ? "purple"
    : currentPlan?.id.includes("ent")
      ? "orange"
      : "blue"; // Approximate theme derived from ID or name if theme missing

  const styles: Record<string, string> = {
    blue: "bg-blue-500/10 text-accent-strong border-accent/20",
    purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    orange: "bg-accent-muted text-accent-strong border-accent/20",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    cyan: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    slate: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${styles[theme] || styles.blue}`}
    >
      {plan}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => (
  <SharedStatusBadge label={status} variant={statusToVariant(status)} />
);

const Tenants: React.FC = () => {
  const {
    tenants: apiTenants,
    updateTenant,
    deleteTenant,
    createTenant,
    fetchTenants,
  } = useTenants();
  const { plans: apiPlans, fetchPlans } = usePlans();
  const { users: apiUsers, fetchUsers } = useUsers(); // Fetch users to map owner details

  // Refresh data
  useEffect(() => {
    fetchTenants();
    fetchPlans();
    fetchUsers();
  }, [fetchTenants, fetchPlans, fetchUsers]);

  // Adapt to ViewModel
  const allHotels: TenantViewModel[] = useMemo(() => {
    return apiTenants.map((t) => {
      const plan = apiPlans.find((p) => p.id === t.planId);
      const ownerUser = apiUsers.find((u) => u.id === t.ownerId);

      return {
        id: t.id,
        name: t.name,
        address: t.address || "Startups Tower, Bangalore",
        status: t.status || "Active",
        plan: plan ? plan.name : "Standard",
        gstin: t.gstin || "N/A",
        owner: ownerUser ? ownerUser.name : "Unknown Manager",
        mobile: ownerUser
          ? ownerUser.mobile || ownerUser.phone || "N/A"
          : "N/A",
        email: ownerUser ? ownerUser.email : "N/A",
        kiosks: 2, // Mocked
        mrr: plan ? plan.price : 0,
        ownerId: t.ownerId,
      };
    });
  }, [apiTenants, apiPlans, apiUsers]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("All Plans");
  const [filterStatus, setFilterStatus] = useState("All Status");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
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

  const openConfirm = (config: Omit<typeof modalConfig, "isOpen">) => {
    setModalConfig({ ...config, isOpen: true });
  };

  const closeConfirm = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSuspend = (hotel: TenantViewModel) => {
    const isSuspended = hotel.status === "Suspended";
    openConfirm({
      title: isSuspended ? "Activate Hotel" : "Suspend Hotel",
      message: isSuspended
        ? `Are you sure you want to activate ${hotel.name}?`
        : `Are you sure you want to suspend ${hotel.name}? This will suspend the account and all associated services.`,
      variant: "warning",
      confirmLabel: isSuspended ? "Activate" : "Suspend",
      onConfirm: async () => {
        const newStatus = isSuspended ? "Active" : "Suspended";
        await updateTenant(hotel.id, { status: newStatus } as any);
        fetchTenants();
      },
    });
  };

  const handleDelete = (id: string) => {
    openConfirm({
      title: "Delete Hotel",
      message:
        "Are you sure you want to delete this hotel? This action cannot be undone.",
      variant: "danger",
      confirmLabel: "Delete Forever",
      onConfirm: async () => {
        await deleteTenant(id);
        fetchTenants();
      },
    });
  };

  // Helper for status filtering
  const filteredHotels = useMemo(() => {
    return allHotels.filter((hotel) => {
      const searchStr = search.toLowerCase();
      const matchesSearch =
        hotel.name.toLowerCase().includes(searchStr) ||
        hotel.gstin.toLowerCase().includes(searchStr) ||
        hotel.owner.toLowerCase().includes(searchStr) ||
        hotel.mobile.includes(search);

      const matchesPlan =
        filterPlan === "All Plans" || hotel.plan === filterPlan;
      const matchesStatus =
        filterStatus === "All Status" || hotel.status === filterStatus;

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [allHotels, search, filterPlan, filterStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterPlan, filterStatus, itemsPerPage]);

  const paginatedHotels = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredHotels.slice(start, start + itemsPerPage);
  }, [filteredHotels, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);

  const navigateToHotelDetails = (hotelId: string) => {
    // Navigation placeholder
    window.location.href = `/super/tenants/${hotelId}`;
  };

  return (
    <div className="p-4 md:p-8 space-y-10 min-h-screen pb-24 animate-in fade-in duration-500">
      {/* Page Header */}
      <PageHeader
        title="Hotels Registry"
        subtitle={`Core Tenant Ecosystem • ${filteredHotels.length} Accounts`}
      >
        <Button
          size="lg"
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus size={20} strokeWidth={3} />}
        >
          Onboard Hotel
        </Button>
      </PageHeader>

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
                className="block w-full pl-16 pr-6 py-5 border-none rounded-2xl bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none sm:text-sm font-bold"
                placeholder="Search by Hotel Name, GSTIN or Manager..."
              />
            </div>

            <div className="flex items-center gap-3 px-4">
              <GlassDropdown
                trigger={
                  <div className="flex items-center justify-between gap-4 px-6 py-3.5 bg-black/5 dark:bg-white/5 rounded-2xl cursor-pointer hover:bg-black/10 transition-all min-w-[160px]">
                    <span className="text-[11px] font-bold uppercase text-gray-700 dark:text-gray-300 tracking-widest">
                      {filterPlan}
                    </span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                }
                items={[
                  {
                    label: "All Plans",
                    onClick: () => setFilterPlan("All Plans"),
                    variant: (filterPlan === "All Plans"
                      ? "selected"
                      : "default") as any,
                  },
                  ...apiPlans.map((p) => ({
                    label: p.name,
                    onClick: () => setFilterPlan(p.name),
                    variant: (filterPlan === p.name
                      ? "selected"
                      : "default") as any,
                  })),
                ]}
              />

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
                    label: "All Status",
                    onClick: () => setFilterStatus("All Status"),
                    variant:
                      filterStatus === "All Status" ? "selected" : "default",
                  },
                  {
                    label: "Active",
                    onClick: () => setFilterStatus("Active"),
                    variant: filterStatus === "Active" ? "selected" : "default",
                  },
                  {
                    label: "Past Due",
                    onClick: () => setFilterStatus("Past Due"),
                    variant:
                      filterStatus === "Past Due" ? "selected" : "default",
                  },
                  {
                    label: "Suspended",
                    onClick: () => setFilterStatus("Suspended"),
                    variant:
                      filterStatus === "Suspended" ? "selected" : "default",
                  },
                  {
                    label: "Onboarding",
                    onClick: () => setFilterStatus("Onboarding"),
                    variant:
                      filterStatus === "Onboarding" ? "selected" : "default",
                  },
                ]}
              />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Registry View Area */}
      <div className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {paginatedHotels.map((hotel) => (
            <GlassCard
              key={hotel.id}
              noPadding
              clipContent
              className="group flex flex-col h-full border-white/10 hover:border-accent/30 overflow-hidden shadow-2xl"
            >
              {/* UNIFIED CONTAINER: Full-Bleed Image Header */}
              <div className="aspect-[16/9] w-full bg-black/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                  <Building2
                    size={120}
                    className="text-white group-hover:scale-110 transition-transform duration-1000"
                  />
                </div>
                <div
                  className={`absolute inset-0 opacity-40 bg-cover bg-center transition-all duration-1000 ${hotel.status === "Suspended" ? "grayscale opacity-20" : "grayscale group-hover:grayscale-0 group-hover:scale-105"}`}
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=60')`,
                  }}
                ></div>

                <div className="absolute top-5 right-5 z-20">
                  <PlanBadge plan={hotel.plan} plans={apiPlans} />
                </div>

                <div className="absolute bottom-5 left-6 right-6 z-20">
                  <div className="space-y-3">
                    <StatusBadge status={hotel.status} />
                    <h3 className="text-2xl font-black text-white leading-none tracking-tight group-hover:text-accent transition-colors">
                      {hotel.name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* UNIFIED CONTAINER: Flush Content Area (0px margin to image) */}
              <div className="p-8 flex-1 flex flex-col justify-between space-y-8 bg-black/5 dark:bg-white/[0.01]">
                <div className="space-y-6">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.address + ", " + hotel.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-500 hover:text-accent transition-all group/loc"
                  >
                    <MapPin size={16} className="shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] truncate border-b border-transparent group-hover/loc:border-current">
                      {hotel.address}
                    </span>
                  </a>

                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                    <div className="space-y-3">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                        Property Manager
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm font-bold dark:text-gray-200 truncate">
                          {hotel.owner}
                        </p>
                        <div className="flex items-center gap-4">
                          <a
                            href={`tel:${hotel.mobile}`}
                            title="Call Manager"
                            className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 hover:bg-accent-muted hover:text-accent transition-all"
                          >
                            <Phone size={14} />
                          </a>
                          <a
                            href={`mailto:${hotel.email}`}
                            title="Email Manager"
                            className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-gray-500 hover:bg-accent-muted hover:text-accent transition-all"
                          >
                            <Mail size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">
                        Tax Identifier
                      </p>
                      <p className="text-[11px] font-mono font-bold dark:text-gray-400 uppercase tracking-tighter bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg border border-white/5 inline-block">
                        {hotel.gstin}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex gap-8">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                          Kiosks
                        </span>
                        <span className="text-xl font-black dark:text-white flex items-center gap-2 mt-1">
                          <Smartphone size={16} className="text-accent" />{" "}
                          {hotel.kiosks}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                          MRR
                        </span>
                        <span className="text-xl font-black text-emerald-500 flex items-center gap-1 mt-1">
                          <IndianRupee size={16} />{" "}
                          {(hotel.mrr || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <GlassDropdown
                      trigger={
                        <button className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                          <MoreHorizontal size={22} />
                        </button>
                      }
                      items={[
                        {
                          icon: LogIn,
                          label: "Impersonate Admin",
                          onClick: () => alert("Impersonation disabled"),
                          variant: "primary",
                          hasSeparatorAfter: true,
                        },
                        {
                          icon: ExternalLink,
                          label: "View Profile",
                          onClick: () => navigateToHotelDetails(hotel.id),
                        },
                        {
                          icon: ShieldAlert,
                          label:
                            hotel.status === "Suspended"
                              ? "Activate Account"
                              : "Suspend Account",
                          onClick: () => handleSuspend(hotel),
                          variant: "warning",
                        },
                        {
                          icon: Trash2,
                          label: "Delete Registry",
                          onClick: () => handleDelete(hotel.id),
                          variant: "danger",
                        },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      <AddHotelModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreateHotel={createTenant}
      />

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={closeConfirm}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        confirmLabel={modalConfig.confirmLabel}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        totalItems={filteredHotels.length}
      />
    </div>
  );
};

export default Tenants;
