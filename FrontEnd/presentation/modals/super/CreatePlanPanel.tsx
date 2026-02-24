import React, { useState } from "react";
import ReactDOM from "react-dom";
import {
  X,
  Check,
  ChevronDown,
  Layout,
  Monitor,
  Headphones,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { useModalVisibility } from "../../hooks/useModalVisibility";
import GlassDropdown from "../../components/ui/GlassDropdown";
import type { PlanData } from "@/domain/entities/Plan";

interface CreatePlanPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<PlanData, "id">) => void;
}

const CreatePlanPanel: React.FC<CreatePlanPanelProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { isDarkMode } = useTheme();
  const { isVisible } = useModalVisibility(isOpen);
  const [supportLevel, setSupportLevel] = useState("Standard (Phone + Email)");
  const [planName, setPlanName] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState(0);
  const [maxRooms, setMaxRooms] = useState(0);
  const [maxKiosks, setMaxKiosks] = useState(0);
  const [maxUsers, setMaxUsers] = useState(5);
  const [maxRoles, setMaxRoles] = useState(2);

  const [availableModules] = useState([
    "Front Desk",
    "Guest Registry",
    "Room Management",
    "Basic Billing",
    "Advanced Reports",
    "Inventory Tracking",
    "Staff Management",
    "Multi-property Support",
    "API Access",
    "Custom Branding",
  ]);

  const [selectedModules, setSelectedModules] = useState<string[]>([
    "Front Desk",
    "Guest Registry",
  ]);

  const handleSave = () => {
    // Adapter: Map UI fields to backend PlanData
    onSave({
      name: planName,
      price: monthlyPrice,
      period_months: 1, // Defaulting to 1 month for UI
      max_rooms: maxRooms,
      max_users: maxUsers,
      max_roles: maxRoles,
      // The following are not in backend but kept for UI state if needed locally or ignored
      // kiosks: maxKiosks,
      // support: supportLevel,
      // included: selectedModules,
    });
    onClose();
  };

  if (!isVisible && !isOpen) return null;

  const toggleModule = (module: string) => {
    setSelectedModules((prev) =>
      prev.includes(module)
        ? prev.filter((m) => m !== module)
        : [...prev, module],
    );
  };

  const inputClass = `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-bold border
    ${
      isDarkMode
        ? "bg-black/40 border-white/10 text-white placeholder-gray-500 focus:border-accent/50"
        : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-accent/50"
    }`;

  const labelClass = `block text-[11px] font-bold uppercase tracking-wider mb-3 ${isDarkMode ? "text-gray-400" : "text-slate-500"}`;
  const screenshotHeaderClass = `text-[12px] font-bold uppercase tracking-[0.1em] flex items-center gap-3 mb-8 ${isDarkMode ? "text-gray-400" : "text-[#8292a2]"}`;

  return ReactDOM.createPortal(
    <>
      <div
        className={`fixed inset-0 z-[9998] transition-opacity duration-300 ${isOpen ? "opacity-100 bg-black/60 backdrop-blur-sm" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <div
        className={`
          fixed inset-y-0 right-0 z-[9999] w-full max-w-lg 
          transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) shadow-2xl
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          backdrop-blur-2xl
          ${
            isDarkMode
              ? "bg-[#050505]/95 border-l border-white/10"
              : "bg-white/95 border-l border-gray-200"
          }
        `}
      >
        <div className="h-full flex flex-col relative overflow-hidden">
          {/* Header */}
          <div
            className={`px-8 py-6 border-b shrink-0 flex items-center justify-between ${isDarkMode ? "border-white/10" : "border-gray-200/50"}`}
          >
            <div>
              <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">
                Define New Offering
              </h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                Catalog Entry Form
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-full hover:bg-white/10 transition-colors text-gray-400"
            >
              <X size={24} />
            </button>
          </div>

          {/* Scrollable Form */}
          <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
            {/* Identity & Price */}
            <section>
              <div className={screenshotHeaderClass}>
                <Sparkles size={16} className="text-accent" />
                <span>Identity & Price</span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className={labelClass}>Plan Public Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Starter, Premium, Ultimate"
                    className={inputClass}
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Monthly Price (INR) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      className={`${inputClass} pl-8`}
                      placeholder="0"
                      value={monthlyPrice}
                      onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Unit Limits */}
            <section>
              <div className={screenshotHeaderClass}>
                <Layout size={16} className="text-accent" />
                <span>Unit Limits</span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Max Rooms Capability *</label>
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="e.g. 50"
                    value={maxRooms}
                    onChange={(e) => setMaxRooms(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className={labelClass}>Max Users (Staff)</label>
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="e.g. 5"
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className={labelClass}>Max Roles</label>
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="e.g. 2"
                    value={maxRoles}
                    onChange={(e) => setMaxRoles(Number(e.target.value))}
                  />
                </div>
              </div>
            </section>

            {/* Included Modules Section (Visual Only for now) */}
            <section>
              <div className={screenshotHeaderClass}>
                <Monitor size={18} className="text-emerald-500" />
                <span>Modules Included (Visual Only)</span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                {availableModules.map((module) => (
                  <button
                    key={module}
                    onClick={() => toggleModule(module)}
                    className={`
                                    flex items-center justify-between px-5 py-4 rounded-xl transition-all text-[11px] font-bold uppercase tracking-wider
                                    ${
                                      selectedModules.includes(module)
                                        ? "bg-accent-strong text-white shadow-md"
                                        : "bg-[#f1f5f9] dark:bg-white/5 text-slate-500 hover:bg-[#e2e8f0] dark:hover:bg-white/10"
                                    }
                                `}
                  >
                    {module}
                    {selectedModules.includes(module) && (
                      <Check size={12} strokeWidth={4} />
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Logistics & Notes */}
            <section>
              <div className={screenshotHeaderClass}>
                <Headphones size={18} className="text-purple-500" />
                <span>Logistics & Notes</span>
              </div>
              <div className="space-y-8">
                <div>
                  <label className={labelClass}>Support Level Selection</label>
                  <GlassDropdown
                    align="left"
                    className="w-full"
                    trigger={
                      <div
                        className={`${inputClass} flex items-center justify-between cursor-pointer py-4 px-6 bg-white dark:bg-black/20`}
                      >
                        <span className="text-slate-900 dark:text-white">
                          {supportLevel}
                        </span>
                        <ChevronDown size={18} className="text-slate-400" />
                      </div>
                    }
                    items={[
                      {
                        label: "Email Only",
                        onClick: () => setSupportLevel("Email Only"),
                        variant:
                          supportLevel === "Email Only"
                            ? "selected"
                            : "default",
                      },
                      {
                        label: "Standard (Phone + Email)",
                        onClick: () =>
                          setSupportLevel("Standard (Phone + Email)"),
                        variant:
                          supportLevel === "Standard (Phone + Email)"
                            ? "selected"
                            : "default",
                      },
                      {
                        label: "Priority 24/7",
                        onClick: () => setSupportLevel("Priority 24/7"),
                        variant:
                          supportLevel === "Priority 24/7"
                            ? "selected"
                            : "default",
                      },
                      {
                        label: "Dedicated Account Manager",
                        onClick: () =>
                          setSupportLevel("Dedicated Account Manager"),
                        variant:
                          supportLevel === "Dedicated Account Manager"
                            ? "selected"
                            : "default",
                      },
                    ]}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div
            className={`px-8 py-6 border-t shrink-0 flex justify-end gap-3 ${isDarkMode ? "border-white/10 bg-black/20" : "border-gray-200/50 bg-white/50"}`}
          >
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
            >
              Discard Draft
            </button>
            <button
              onClick={handleSave}
              className="px-10 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest bg-gray-900 dark:bg-white text-white dark:text-black shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              Save & Publish Plan
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default CreatePlanPanel;
