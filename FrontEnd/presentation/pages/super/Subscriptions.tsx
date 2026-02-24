import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  RefreshCcw,
  AlertCircle,
  MoreVertical,
  ChevronDown,
  Zap,
  Ban,
} from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import GlassDropdown from "../../components/ui/GlassDropdown";
import Pagination from "../../components/ui/Pagination";
import PageHeader from "../../components/ui/PageHeader";
import ChangePlanModal from "../../modals/super/ChangePlanModal";
import ExtendSubscriptionModal from "../../modals/super/ExtendSubscriptionModal";
import InvoiceHistoryModal from "../../modals/super/InvoiceHistoryModal";
import type { Subscription } from "@/domain/entities/Subscription";
import { useSubscriptions } from "@/application/hooks/useSubscriptions";
import { usePlans } from "@/application/hooks/usePlans";
import { useTenants } from "@/application/hooks/useTenants";

// --- View Model Adapter ---
interface SubscriptionViewModel extends Subscription {
  hotel: string;
  plan: string;
  renewalDate: string;
  autoRenew: boolean;
  price: number;
}

const Subscriptions: React.FC = () => {
  const {
    subscriptions: apiSubscriptions,
    updateSubscription,
    fetchSubscriptions,
  } = useSubscriptions();
  const { plans: apiPlans, fetchPlans } = usePlans();
  const { tenants, fetchTenants } = useTenants();

  // Refresh data on mount
  useEffect(() => {
    fetchSubscriptions();
    fetchPlans();
    fetchTenants();
  }, [fetchSubscriptions, fetchPlans, fetchTenants]);

  // Adapt data to view model
  const allSubscriptions: SubscriptionViewModel[] = useMemo(() => {
    return apiSubscriptions.map((sub) => {
      const tenant = tenants.find((t) => t.id === sub.tenantId);
      const plan = apiPlans.find((p) => p.id === sub.planId);

      return {
        ...sub,
        hotel: tenant ? tenant.name : "Unknown Tenant",
        plan: plan ? plan.name : "Unknown Plan",
        renewalDate: sub.endDate || "N/A",
        startDate: sub.startDate || "N/A",
        autoRenew: true, // Mocked
        price: plan ? plan.price : 0,
      };
    });
  }, [apiSubscriptions, tenants, apiPlans]);

  const [filterPlan, setFilterPlan] = useState("All Plans");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal States
  const [activeSub, setActiveSub] = useState<SubscriptionViewModel | null>(
    null,
  );
  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [isInvoiceHistoryOpen, setIsInvoiceHistoryOpen] = useState(false);

  const filteredData = useMemo(() => {
    return allSubscriptions
      .filter((sub) => {
        const matchesSearch = sub.hotel
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesPlan =
          filterPlan === "All Plans" || sub.plan === filterPlan;
        return matchesSearch && matchesPlan;
      })
      .sort(
        (a, b) =>
          new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime(),
      );
  }, [allSubscriptions, search, filterPlan]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterPlan, itemsPerPage]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500 text-white";
      case "Expiring Soon":
        return "bg-amber-500 text-white";
      case "Expired":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleUpdateSubscription = async (
    id: string,
    data: Partial<Subscription>,
  ) => {
    await updateSubscription(id, data);
    // Refresh handled by hook state update usually, or we can trigger fetch
    fetchSubscriptions();
  };

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen pb-20 animate-in fade-in duration-500">
      <PageHeader
        title="Subscription Hub"
        subtitle="Active Entitlements Ledger"
      />

      <GlassCard
        noPadding
        clipContent
        className="overflow-hidden border-white/10 shadow-2xl"
      >
        <div className="px-8 py-4 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/5 dark:bg-white/[0.01]">
          <div className="relative group w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 border-none rounded-xl bg-black/5 dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none sm:text-xs font-bold"
              placeholder="Filter by Hotel Name..."
            />
          </div>
          <div className="flex items-center gap-2">
            <GlassDropdown
              trigger={
                <button className="flex items-center justify-between gap-3 px-5 py-2.5 bg-black/10 dark:bg-white/5 border border-white/10 rounded-xl hover:bg-black/20 dark:hover:bg-white/10 transition-all min-w-[140px]">
                  <span className="text-[10px] font-bold uppercase text-gray-700 dark:text-gray-300 tracking-widest">
                    {filterPlan}
                  </span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.03] text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 border-b border-white/10">
                <th className="px-8 py-3.5">Hotel Name</th>
                <th className="px-8 py-3.5">Plan</th>
                <th className="px-8 py-3.5">Start Date</th>
                <th className="px-8 py-3.5">Renewal</th>
                <th className="px-8 py-3.5">Status</th>
                <th className="px-8 py-3.5 text-center">Auto</th>
                <th className="px-8 py-3.5 text-right">Price</th>
                <th className="px-8 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedData.map((sub) => (
                <tr
                  key={sub.id}
                  className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                >
                  <td className="px-8 py-3 text-xs font-black dark:text-white uppercase truncate">
                    {sub.hotel}
                  </td>
                  <td className="px-8 py-3">
                    <span className="text-[9px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-white/5 text-gray-400">
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-8 py-3 text-[10px] font-mono font-medium text-gray-500">
                    {new Date(sub.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-3 text-[10px] font-mono font-black dark:text-gray-300">
                    {new Date(sub.renewalDate).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${getStatusStyle(sub.status)}`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-8 py-3 text-center">
                    <div
                      className={`w-1.5 h-1.5 rounded-full mx-auto ${sub.autoRenew ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" : "bg-gray-600"}`}
                    ></div>
                  </td>
                  <td className="px-8 py-3 text-right text-xs font-black dark:text-white">
                    ₹{sub.price.toLocaleString()}
                  </td>
                  <td className="px-8 py-3 text-center">
                    <GlassDropdown
                      trigger={
                        <button className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                          <MoreVertical size={14} />
                        </button>
                      }
                      items={[
                        {
                          icon: RefreshCcw,
                          label: "Change Plan",
                          onClick: () => {
                            setActiveSub(sub);
                            setIsChangePlanOpen(true);
                          },
                        },
                        {
                          icon: Zap,
                          label: "Extend",
                          onClick: () => {
                            setActiveSub(sub);
                            setIsExtendOpen(true);
                          },
                        },
                        {
                          icon: AlertCircle,
                          label: "View Invoices",
                          onClick: () => {
                            setActiveSub(sub);
                            setIsInvoiceHistoryOpen(true);
                          },
                        },
                        { icon: Ban, label: "Cancel", variant: "danger" }, // Cancel not implemented
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {activeSub && (
        <>
          <ChangePlanModal
            isOpen={isChangePlanOpen}
            onClose={() => setIsChangePlanOpen(false)}
            subscription={activeSub}
            onUpdate={handleUpdateSubscription}
          />
          <ExtendSubscriptionModal
            isOpen={isExtendOpen}
            onClose={() => setIsExtendOpen(false)}
            subscription={activeSub}
            onUpdate={handleUpdateSubscription}
          />
          <InvoiceHistoryModal
            isOpen={isInvoiceHistoryOpen}
            onClose={() => setIsInvoiceHistoryOpen(false)}
            subscription={activeSub}
          />
        </>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        totalItems={filteredData.length}
      />
    </div>
  );
};

export default Subscriptions;
