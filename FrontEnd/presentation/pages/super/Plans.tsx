import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  Archive,
  Check,
  Monitor,
  Layout,
  IndianRupee,
  HelpCircle,
  BarChart,
  ChevronRight,
  Zap,
  Users,
  ShieldCheck,
  ArchiveRestore,
  Layers,
  Trash2,
} from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import CreatePlanPanel from "../../modals/super/CreatePlanPanel";
import UpdatePlanPanel from "../../modals/super/UpdatePlanPanel";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { useTheme } from "../../hooks/useTheme";
import type { PlanData } from "@/domain/entities/Plan";
import { usePlans } from "@/application/hooks/usePlans";

// --- View Model Adapter ---
// The UI was designed for a richer data model. We map current backend data to this structure.
interface PlanViewModel extends PlanData {
  theme: "blue" | "purple" | "orange";
  included: string[];
  support: string;
  subscribers: number;
  isArchived: boolean;
  kiosks: number;
  rooms: number; // mapped from max_rooms
}

const mapToViewModel = (plan: PlanData): PlanViewModel => {
  // Deterministic visual properties based on plan attributes
  let theme: "blue" | "purple" | "orange" = "blue";
  if (plan.name.toLowerCase().includes("pro") || plan.price > 100)
    theme = "purple";
  if (plan.name.toLowerCase().includes("enterprise") || plan.price > 500)
    theme = "orange";

  // Mock features based on tier
  const basicFeatures = ["Front Desk", "Guest Registry"];
  const proFeatures = [...basicFeatures, "Room Management", "Advanced Reports"];
  const entFeatures = [...proFeatures, "API Access", "Custom Branding"];

  let included = basicFeatures;
  if (theme === "purple") included = proFeatures;
  if (theme === "orange") included = entFeatures;

  return {
    ...plan,
    theme,
    included,
    support:
      theme === "orange"
        ? "Dedicated Manager"
        : theme === "purple"
          ? "Priority 24/7"
          : "Standard",
    subscribers: 0, // Not available in current API
    isArchived: plan.is_archived ?? false,
    kiosks: 0, // Not available
    rooms: plan.max_rooms || 0,
  };
};

const PlanCard: React.FC<{
  plan: PlanViewModel;
  onEdit: (plan: PlanData) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ plan, onEdit, onArchive, onDelete }) => {
  const { isDarkMode } = useTheme();

  const themeStyles = {
    blue: {
      accent: "bg-accent-strong",
      text: "text-accent-strong dark:text-blue-400",
      bg: "bg-blue-500/5",
      border: "border-accent/20",
      shadow: "shadow-accent/10",
    },
    purple: {
      accent: "bg-purple-600",
      text: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/5",
      border: "border-purple-500/20",
      shadow: "shadow-purple-500/10",
    },
    orange: {
      accent: "bg-accent-strong",
      text: "text-accent-strong dark:text-orange-400",
      bg: "bg-accent/5",
      border: "border-accent/20",
      shadow: "shadow-accent/10",
    },
  };

  const style = themeStyles[plan.theme] ?? themeStyles.blue;

  return (
    <GlassCard
      noPadding
      clipContent
      className={`flex flex-col h-full border-2 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 ${style.border} ${style.shadow} ${plan.isArchived ? "opacity-50 grayscale" : ""}`}
    >
      {/* Plan Header */}
      <div className={`p-8 border-b border-white/5 ${style.bg} relative`}>
        {plan.isArchived && (
          <div className="absolute top-0 left-0 w-full bg-red-500/80 text-white text-[8px] font-bold uppercase text-center py-1 tracking-widest z-10">
            Archived / Legacy Offering
          </div>
        )}
        <div className="flex justify-between items-start mb-6">
          <div
            className={`w-14 h-14 rounded-2xl ${style.accent} text-white flex items-center justify-center shadow-xl`}
          >
            <Zap size={28} fill="currentColor" />
          </div>
          <div className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[9px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-300">
            ID: {plan.id.substring(0, 6).toUpperCase()}
          </div>
        </div>
        <h3 className="text-3xl font-black dark:text-white tracking-tighter uppercase mb-2">
          {plan.name}
        </h3>
        <div className="flex items-baseline gap-1">
          <span
            className={`text-4xl font-black dark:text-white tracking-tighter`}
          >
            ₹{plan.price.toLocaleString()}
          </span>
          <span className="text-sm font-bold text-gray-500">/ mo</span>
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">
          + 18% GST Applicable
        </p>
      </div>

      {/* Limits Strip */}
      <div className="px-8 py-5 border-b border-white/5 flex gap-8">
        <div className="flex items-center gap-2">
          <Layout size={16} className="text-gray-400" />
          <div className="flex flex-col">
            <span className="text-[11px] font-black dark:text-white leading-none">
              {plan.rooms}
            </span>
            <span className="text-[8px] font-bold text-gray-500 uppercase">
              Max Rooms
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} className="text-gray-400" />
          <div className="flex flex-col">
            <span className="text-[11px] font-black dark:text-white leading-none">
              {plan.max_users}
            </span>
            <span className="text-[8px] font-bold text-gray-500 uppercase">
              Max Users
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <HelpCircle size={16} className="text-gray-400" />
          <div className="flex flex-col">
            <span className="text-[11px] font-black dark:text-white leading-none truncate max-w-[60px]">
              {plan.support.split(" ")[0]}
            </span>
            <span className="text-[8px] font-bold text-gray-500 uppercase">
              Support
            </span>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="p-8 flex-1 space-y-4">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
          Entitlements (Visual Only):
        </p>
        <div className="space-y-4">
          {plan.included.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className={`mt-0.5 p-0.5 rounded-full ${style.accent} text-white`}
              >
                <Check size={10} strokeWidth={4} />
              </div>
              <span className="text-xs font-bold dark:text-gray-300 leading-tight">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Stats */}
      <div className="p-8 pt-0 mt-auto">
        <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/[0.02] border border-white/5 flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Users size={18} className="text-gray-500" />
            <div>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">
                Active Tenants
              </p>
              <p className="text-lg font-black dark:text-white tracking-tighter">
                {plan.subscribers}
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-600" />
        </div>

        <div className="flex gap-2">
          {!plan.isArchived && (
            <button
              onClick={() => onEdit(plan)}
              className="flex-1 py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Edit3 size={14} /> Update Catalog
            </button>
          )}
          <button
            onClick={() => onArchive(plan.id)}
            disabled={plan.isArchived}
            className={`px-4 py-4 rounded-xl transition-all border shadow-sm flex items-center justify-center ${
              plan.isArchived
                ? "bg-black/5 dark:bg-white/5 border-white/5 text-gray-500 cursor-not-allowed hidden"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white"
            }`}
            title={
              plan.isArchived ? "Plan is already archived" : "Archive Plan"
            }
          >
            <Archive size={16} />
          </button>
          {!plan.isArchived && (
            <button
              onClick={() => onDelete(plan.id)}
              className="px-4 py-4 rounded-xl bg-red-500/10 text-red-500 transition-all border border-red-500/20 hover:bg-red-500 hover:text-white"
              title="Delete Plan"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

const Plans: React.FC = () => {
  const {
    plans: hookPlans,
    createPlan,
    updatePlan,
    deletePlan,
    fetchPlans,
  } = usePlans();
  const [plans, setPlans] = useState<PlanViewModel[]>([]);
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const [isUpdatePanelOpen, setIsUpdatePanelOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Sync and map hook plans to view models
  useEffect(() => {
    setPlans(hookPlans.map(mapToViewModel));
  }, [hookPlans]);

  const handleArchivePlan = async (id: string) => {
    try {
      await updatePlan(id, { is_archived: true } as any);
    } catch (error) {
      console.error("Failed to archive plan", error);
    }
  };

  const handleEditPlan = (plan: PlanData) => {
    setSelectedPlan(plan);
    setIsUpdatePanelOpen(true);
  };

  const handleUpdatePlan = async (updatedPlan: PlanData) => {
    const { id, ...data } = updatedPlan;
    await updatePlan(id, data);
  };

  const handleCreatePlan = async (data: Omit<PlanData, "id">) => {
    await createPlan(data);
  };

  const handleDeletePlan = async (id: string) => {
    setPlanToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeletePlan = async () => {
    if (planToDelete) {
      await deletePlan(planToDelete);
      setIsConfirmDeleteOpen(false);
      setPlanToDelete(null);
    }
  };

  const totalRevenue = plans.reduce(
    (acc, curr) => acc + curr.price * curr.subscribers,
    0,
  );
  const activeTenants = plans.reduce((acc, curr) => acc + curr.subscribers, 0);
  const activeOfferingsCount = plans.filter((p) => !p.isArchived).length;

  return (
    <div className="p-4 md:p-8 space-y-10 min-h-screen pb-24 animate-in fade-in duration-500">
      {/* Header Area */}
      <PageHeader
        title="Product Catalog"
        subtitle="Commercial Configuration & Tier Management"
      >
        <Button
          size="lg"
          onClick={() => setIsCreatePanelOpen(true)}
          icon={<Plus size={20} strokeWidth={3} />}
        >
          Create New Offering
        </Button>
      </PageHeader>

      {/* Summary Analytics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GlassCard className="border-l-4 border-l-accent-strong">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
                Total Recurring Yield
              </p>
              <h3 className="text-3xl font-black dark:text-white tracking-tighter">
                ₹{(totalRevenue / 100000).toFixed(2)}L{" "}
                <span className="text-xs font-bold text-gray-500">/ mo</span>
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/10 text-accent">
              <IndianRupee size={24} />
            </div>
          </div>
        </GlassCard>
        <GlassCard className="border-l-4 border-l-purple-600">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
                Active Subscriptions
              </p>
              <h3 className="text-3xl font-black dark:text-white tracking-tighter">
                {activeTenants} Tenants
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
              <Users size={24} />
            </div>
          </div>
        </GlassCard>
        <GlassCard className="border-l-4 border-l-emerald-600">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
                Active Offerings
              </p>
              <h3 className="text-3xl font-black dark:text-white tracking-tighter">
                {activeOfferingsCount} Plans
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Layers size={24} />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* The Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-6 duration-700">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onEdit={handleEditPlan}
            onArchive={handleArchivePlan}
            onDelete={handleDeletePlan}
          />
        ))}
      </div>

      <CreatePlanPanel
        isOpen={isCreatePanelOpen}
        onClose={() => setIsCreatePanelOpen(false)}
        onSave={handleCreatePlan}
      />
      {selectedPlan && (
        <UpdatePlanPanel
          isOpen={isUpdatePanelOpen}
          onClose={() => setIsUpdatePanelOpen(false)}
          plan={selectedPlan}
          onUpdate={handleUpdatePlan}
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={confirmDeletePlan}
        title="Delete Plan Offering"
        message="Are you sure you want to delete this plan? This action cannot be undone and may affect active subscriptions."
        variant="danger"
        confirmLabel="Delete Forever"
      />
    </div>
  );
};

export default Plans;
