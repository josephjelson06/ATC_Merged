import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  X,
  DoorOpen,
  Brush,
  Wrench,
  Ban,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldAlert,
  UserPlus,
  AlertCircle,
  Edit3,
  MapPin,
  Bed,
  Snowflake,
  Wind,
  Landmark,
  Activity,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import GlassDropdown from "../../components/ui/GlassDropdown";
import { useTheme } from "../../hooks/useTheme";
import { useModalVisibility } from "../../hooks/useModalVisibility";
import { Room, RoomStatus } from "../../../domain/entities/Room";

interface RoomDetailPanelProps {
  isOpen: boolean;
  room: Room | null;
  onClose: () => void;
}

const RoomDetailPanel: React.FC<RoomDetailPanelProps> = ({
  isOpen,
  room,
  onClose,
}) => {
  const { isDarkMode } = useTheme();
  const { isVisible } = useModalVisibility(isOpen);
  const [currentStatus, setCurrentStatus] = useState<RoomStatus>("available");
  const [housekeeper, setHousekeeper] = useState("Unassigned");

  // Typecast room for UI dummy fields
  const r: any = room;

  const normalizeRoomStatus = (value?: string): RoomStatus => {
    if (
      value === "available" ||
      value === "occupied" ||
      value === "housekeeping" ||
      value === "maintenance"
    ) {
      return value as RoomStatus;
    }
    return "available";
  };

  useEffect(() => {
    if (isOpen && room) {
      setCurrentStatus(normalizeRoomStatus(room.status));
      setHousekeeper(r?.housekeeper || "Unassigned");
    }
  }, [isOpen, room]);

  if (!isVisible && !isOpen) return null;

  const FeatureChip = ({ icon: Icon, label }: any) => (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-white/5">
      <Icon size={14} className="text-gray-500" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-300">
        {label}
      </span>
    </div>
  );

  const inputClass = `w-full px-5 py-4 rounded-2xl outline-none transition-all duration-200 text-sm font-black border
    ${
      isDarkMode
        ? "bg-black/5 border-white/10 text-white focus:border-accent/50"
        : "bg-gray-50 border-gray-200 text-gray-900 focus:border-accent/50"
    }`;

  return ReactDOM.createPortal(
    <>
      <div
        className={`fixed inset-0 z-[9998] transition-opacity duration-300 ${isOpen ? "opacity-100 bg-black/60 backdrop-blur-sm" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <div
        className={`
          fixed inset-y-0 right-0 z-[9999] w-full max-w-2xl 
          transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) shadow-2xl
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          backdrop-blur-2xl
          ${isDarkMode ? "bg-[#050505]/95 border-l border-white/10" : "bg-white/95 border-l border-gray-200"}
        `}
      >
        <div className="h-full flex flex-col relative overflow-hidden">
          {/* 1. Header Area */}
          <div
            className={`px-8 py-8 border-b shrink-0 flex items-center justify-between ${isDarkMode ? "border-white/10" : "border-gray-200/50"} bg-black/5`}
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-accent-strong flex items-center justify-center text-white shadow-2xl">
                <DoorOpen size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
                  Room Inventory
                </p>
                <h2 className="text-3xl font-black dark:text-white tracking-tighter uppercase">
                  Room #{r?.roomNumber || r?.id}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-full hover:bg-white/10 transition-colors text-gray-400"
            >
              <X size={28} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            {/* 2. Room Profile */}
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                <MapPin size={14} /> Property Metadata
              </h3>
              <div className="p-8 rounded-[2.5rem] bg-black/5 dark:bg-white/[0.02] border border-white/5 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">
                      Room Category
                    </p>
                    <p className="text-sm font-black dark:text-white">
                      {r?.roomTypeName || r?.category || "Standard"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">
                      Location
                    </p>
                    <p className="text-sm font-black dark:text-white">
                      Floor {r?.floor || "1"} • North Wing
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <FeatureChip icon={Bed} label="King Bed" />
                  <FeatureChip icon={Snowflake} label="Central AC" />
                  <FeatureChip icon={Wind} label="Balcony" />
                  <FeatureChip icon={Landmark} label="City View" />
                </div>
                <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-black text-gray-500 uppercase">
                      Standard Rack Rate
                    </p>
                    <p className="text-xl font-black dark:text-white">
                      ₹5,500{" "}
                      <span className="text-xs font-bold text-gray-500">
                        / night
                      </span>
                    </p>
                  </div>
                  <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-white transition-all">
                    <Edit3 size={18} />
                  </button>
                </div>
              </div>
            </section>

            {/* 3. Current Operational Status */}
            <section className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                <Activity size={14} /> Live Controls
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Housekeeping Dropdown */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">
                    Housekeeping Status
                  </label>
                  <GlassDropdown
                    align="left"
                    className="w-full"
                    trigger={
                      <div
                        className={`${inputClass} flex items-center justify-between cursor-pointer`}
                      >
                        <span className="uppercase">{currentStatus}</span>
                        <ChevronDown size={16} className="text-gray-500" />
                      </div>
                    }
                    items={[
                      {
                        label: "AVAILABLE",
                        onClick: () => setCurrentStatus("available"),
                        variant:
                          currentStatus === "available"
                            ? "selected"
                            : "default",
                      },
                      {
                        label: "OCCUPIED",
                        onClick: () => setCurrentStatus("occupied"),
                        variant:
                          currentStatus === "occupied" ? "selected" : "default",
                      },
                      {
                        label: "HOUSEKEEPING",
                        onClick: () => setCurrentStatus("housekeeping"),
                        variant:
                          currentStatus === "housekeeping"
                            ? "selected"
                            : "default",
                      },
                      {
                        label: "MAINTENANCE",
                        onClick: () => setCurrentStatus("maintenance"),
                        variant:
                          currentStatus === "maintenance"
                            ? "selected"
                            : "default",
                      },
                    ]}
                  />
                </div>

                {/* Staff Assignment Dropdown */}
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">
                    Assigned Housekeeper
                  </label>
                  <GlassDropdown
                    align="left"
                    className="w-full"
                    trigger={
                      <div
                        className={`${inputClass} flex items-center justify-between cursor-pointer`}
                      >
                        <div className="flex items-center gap-3">
                          <UserPlus size={16} className="text-gray-500" />
                          <span>{housekeeper}</span>
                        </div>
                        <ChevronDown size={16} className="text-gray-500" />
                      </div>
                    }
                    items={[
                      {
                        label: "Unassigned",
                        onClick: () => setHousekeeper("Unassigned"),
                        variant:
                          housekeeper === "Unassigned" ? "selected" : "default",
                      },
                      {
                        label: "Suresh K.",
                        onClick: () => setHousekeeper("Suresh K."),
                        variant:
                          housekeeper === "Suresh K." ? "selected" : "default",
                      },
                      {
                        label: "Meera L.",
                        onClick: () => setHousekeeper("Meera L."),
                        variant:
                          housekeeper === "Meera L." ? "selected" : "default",
                      },
                      {
                        label: "Rahul V.",
                        onClick: () => setHousekeeper("Rahul V."),
                        variant:
                          housekeeper === "Rahul V." ? "selected" : "default",
                      },
                    ]}
                  />
                </div>
              </div>

              {/* Secondary Toggles */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${r?.isDND ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-black/5 border-white/5 text-gray-500"}`}
                >
                  <div className="flex items-center gap-3">
                    <Ban size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      DND Active
                    </span>
                  </div>
                  <div
                    className={`w-9 h-5 rounded-full relative transition-colors ${r?.isDND ? "bg-red-500" : "bg-gray-300 dark:bg-white/10"}`}
                  >
                    <div
                      className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${r?.isDND ? "left-5" : "left-1"}`}
                    ></div>
                  </div>
                </button>
                <button className="flex items-center justify-between p-5 rounded-2xl border bg-black/5 border-white/5 text-gray-500 hover:text-white hover:border-orange-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <ShieldAlert size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Report Incident
                    </span>
                  </div>
                  <ChevronRight size={16} className="opacity-30" />
                </button>
              </div>
            </section>

            {/* 4. Maintenance / OOO Section */}
            <section>
              <div className="p-8 rounded-[2.5rem] border-2 border-dashed border-zinc-500/30 bg-zinc-500/5 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wrench size={20} className="text-zinc-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">
                      Maintenance Deck
                    </h3>
                  </div>
                  {r?.status === "maintenance" ||
                  r?.status === "MAINTENANCE" ? (
                    <span className="px-3 py-1 rounded-lg bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest animate-pulse">
                      Out of Order
                    </span>
                  ) : (
                    <button className="text-[10px] font-black text-accent-strong uppercase tracking-[0.2em] hover:underline">
                      Mark for maintenance
                    </button>
                  )}
                </div>

                {(r?.status === "maintenance" ||
                  r?.status === "MAINTENANCE") && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[9px] font-black text-gray-500 uppercase mb-1">
                          Issue Reported
                        </p>
                        <p className="text-sm font-bold dark:text-gray-300">
                          {r?.maintenanceNote || "Routine Inspection"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-500 uppercase mb-1">
                          Estimated Resolution
                        </p>
                        <p className="text-sm font-bold text-accent">
                          {r?.maintenanceETA || "2 hours"}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-2xl bg-black/20 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-500/20 flex items-center justify-center text-[10px] font-black text-zinc-500">
                          SK
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-gray-500 uppercase leading-none mb-1">
                            Reported By
                          </p>
                          <p className="text-xs font-black dark:text-white leading-none">
                            Suresh Kumar (Lead)
                          </p>
                        </div>
                      </div>
                      <button className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">
                        Resolve Issue
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Bottom Actions */}
          <div
            className={`px-8 py-6 border-t shrink-0 flex gap-3 ${isDarkMode ? "border-white/10 bg-black/20" : "border-gray-200/50 bg-white/50"}`}
          >
            <button className="flex-1 py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
              Update Room Blueprint
            </button>
            <button className="px-6 py-4 rounded-2xl bg-accent-strong text-white text-[10px] font-bold uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default RoomDetailPanel;
