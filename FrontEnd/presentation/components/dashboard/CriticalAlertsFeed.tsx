import React from "react";
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  Zap,
} from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { useTheme } from "../../hooks/useTheme";

const AlertItem = ({ type, message, time, onAction }: any) => {
  const isCritical = type === "critical";

  return (
    <div className="flex items-center gap-4 p-5 hover:bg-black/5 dark:hover:bg-white/5 transition-all group border-b border-white/5 last:border-b-0">
      <div
        className={`p-2.5 rounded-xl shrink-0 ${isCritical ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"}`}
      >
        {isCritical ? <AlertCircle size={20} /> : <AlertTriangle size={20} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 pr-4 leading-snug">
            {message}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase whitespace-nowrap">
            <Clock size={12} />
            {time}
          </div>
        </div>
      </div>

      <button
        onClick={onAction}
        className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-accent-strong transition-colors flex items-center gap-1"
      >
        View
        <ChevronRight size={12} />
      </button>
    </div>
  );
};

const CriticalAlertsFeed: React.FC = () => {
  return (
    <GlassCard
      noPadding
      clipContent
      className="h-full flex flex-col shadow-2xl border-white/10"
    >
      {/* UNIFIED CONTAINER: Full-bleed flush header */}
      <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-black/5 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent text-white shadow-lg shadow-orange-500/30">
            <Zap size={18} fill="currentColor" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Critical Alerts
            </h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
              Live Incident Feed
            </p>
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-[9px] font-bold uppercase tracking-widest animate-pulse shadow-lg shadow-red-500/20">
          3 Unresolved
        </span>
      </div>

      {/* UNIFIED CONTAINER: Full-bleed scrollable list with no side padding */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col">
          <AlertItem
            type="critical"
            message="Kiosk ATC-K-0402 at Hotel Sapphire — No heartbeat detected."
            time="2h 14m ago"
          />
          <AlertItem
            type="amber"
            message="Hotel Grandeur subscription payment failed — retry exhausted."
            time="07:42 AM today"
          />
          <AlertItem
            type="amber"
            message="Hotel Bliss account suspended — 15 days past due."
            time="Yesterday"
          />
          <AlertItem
            type="critical"
            message="Firmware update failed on ATC-SN-7766."
            time="Feb 09"
          />
        </div>
      </div>

      {/* UNIFIED CONTAINER: Full-bleed anchored footer bar */}
    </GlassCard>
  );
};

export default CriticalAlertsFeed;
