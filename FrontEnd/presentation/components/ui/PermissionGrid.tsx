import React, { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Check,
  X,
  Save,
  RotateCcw,
  ArrowLeft,
  Search,
  Info,
  Layout,
  Eye,
  Edit3,
  Trash2,
  PlusCircle,
  FileOutput,
  Zap,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import GlassCard from "./GlassCard";
import { useHotelStaff } from "@/application/hooks/useHotelStaff";

interface PermissionGridProps {
  roleName: string;
  roleId: string;
  onBack: () => void;
  type: "super" | "hotel";
  fetchAvailable: () => Promise<{ key: string; description?: string }[]>;
  fetchRolePerms: (id: string) => Promise<{ permissions: string[] }>;
  saveRolePerms: (id: string, perms: string[]) => Promise<void>;
}

// Action metadata — maps a suffix (read, write, etc.) to an icon
const ACTION_META: Record<
  string,
  { label: string; icon: any; isHighRisk?: boolean }
> = {
  read: { label: "View", icon: Eye },
  write: { label: "Manage", icon: Edit3 },
  delete: { label: "Delete", icon: Trash2, isHighRisk: true },
  create: { label: "Create", icon: PlusCircle },
  export: { label: "Export", icon: FileOutput },
  special: { label: "Override", icon: Zap, isHighRisk: true },
};

/**
 * Groups flat permission keys like "hotel:rooms:read", "hotel:rooms:write"
 * into a { resource → Set<action> } map.
 */
function groupPermissions(keys: string[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const key of keys) {
    const parts = key.split(":");
    if (parts.length < 3) continue;
    const resource = parts[1]; // e.g. "rooms"
    const action = parts[2]; // e.g. "read"
    if (!map.has(resource)) map.set(resource, new Set());
    map.get(resource)!.add(action);
  }
  return map;
}

/** Pretty-print a resource key */
function prettyResource(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
}

const PermissionGrid: React.FC<PermissionGridProps> = ({
  roleName,
  roleId,
  onBack,
  type,
  fetchAvailable,
  fetchRolePerms,
  saveRolePerms,
}) => {
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingPerms, setLoadingPerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Available permission keys from DB (grouped by resource)
  const [allResources, setAllResources] = useState<Map<string, Set<string>>>(
    new Map(),
  );
  // Current role's enabled permissions (flat set of keys)
  const [enabledPerms, setEnabledPerms] = useState<Set<string>>(new Set());
  // Original state (to detect changes / reset)
  const [originalPerms, setOriginalPerms] = useState<Set<string>>(new Set());

  // The scope prefix to filter by (hotel vs platform)
  const scope = type === "super" ? "platform" : "hotel";

  // ── Load from API ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingPerms(true);
        setError(null);

        console.log(
          "Fetching permissions for roleId:",
          roleId,
          "scope:",
          scope,
        );
        try {
          const [available, rolePerm] = await Promise.all([
            fetchAvailable(),
            fetchRolePerms(roleId),
          ]);

          if (cancelled) return;

          // Filter to current scope
          const scopedKeys = available
            .map((p) => p.key)
            .filter((k) => k.startsWith(scope + ":"));

          setAllResources(groupPermissions(scopedKeys));
          const roleSet = new Set(rolePerm.permissions);
          setEnabledPerms(roleSet);
          setOriginalPerms(new Set(roleSet));
        } catch (err: any) {
          console.error("Permission fetch error:", err);
          throw err;
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load permissions");
      } finally {
        if (!cancelled) setLoadingPerms(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roleId, scope]);

  // ── Derived values ─────────────────────────────────────────
  const resources = Array.from(allResources.entries())
    .filter(([res]) =>
      prettyResource(res).toLowerCase().includes(search.toLowerCase()),
    )
    .sort(([a], [b]) => a.localeCompare(b));

  // All unique actions across resources
  const allActions = Array.from(
    new Set(Array.from(allResources.values()).flatMap((s) => Array.from(s))),
  ).sort();

  const hasChanges = (() => {
    if (enabledPerms.size !== originalPerms.size) return true;
    for (const k of enabledPerms) if (!originalPerms.has(k)) return true;
    return false;
  })();

  // ── Toggle helpers ─────────────────────────────────────────
  const makeKey = (resource: string, action: string) =>
    `${scope}:${resource}:${action}`;

  const togglePermission = (resource: string, action: string) => {
    const key = makeKey(resource, action);
    setEnabledPerms((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleRow = (resource: string) => {
    const actions = allResources.get(resource);
    if (!actions) return;
    const keys = Array.from(actions).map((a) => makeKey(resource, a));
    const allEnabled = keys.every((k) => enabledPerms.has(k));
    setEnabledPerms((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => (allEnabled ? next.delete(k) : next.add(k)));
      return next;
    });
  };

  const handleReset = () => setEnabledPerms(new Set(originalPerms));

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      await saveRolePerms(roleId, Array.from(enabledPerms));
      setOriginalPerms(new Set(enabledPerms));
      setSuccessMsg("Permissions saved successfully");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  }, [roleId, enabledPerms, saveRolePerms]);

  // ── Loading / Error states ─────────────────────────────────
  if (loadingPerms) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-accent-strong" />
        <span className="ml-3 text-gray-400 text-sm font-bold">
          Loading permissions matrix…
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Actions Only */}
      <div className="flex justify-end pt-2">
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 text-gray-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest disabled:opacity-30"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2 px-10 py-3 rounded-2xl bg-accent-strong text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-accent-strong/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Feedback messages */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
          <AlertTriangle size={18} /> {error}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold">
          <Check size={18} /> {successMsg}
        </div>
      )}

      {/* Control Bar */}
      <GlassCard
        className="flex flex-col md:flex-row items-center justify-between gap-4 border-white/10"
        noPadding
      >
        <div className="relative w-full md:flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-accent transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-16 pr-6 py-5 border-none rounded-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none sm:text-sm font-bold"
            placeholder="Search module or action keyword..."
          />
        </div>
        <div className="px-6 py-2 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              High Risk Action
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Info size={14} className="text-gray-400" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Permissions Propagate in Real-Time
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Main Grid */}
      <GlassCard
        noPadding
        clipContent
        className="overflow-hidden shadow-2xl border-white/10"
      >
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/10 dark:bg-white/[0.03] text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-white/10">
                <th className="px-8 py-6 w-[350px] sticky left-0 z-20 bg-gray-100 dark:bg-[#121212] border-r border-white/5">
                  Module Identity
                </th>
                {allActions.map((actionId) => {
                  const meta = ACTION_META[actionId] || {
                    label: actionId,
                    icon: Eye,
                  };
                  const Icon = meta.icon;
                  return (
                    <th
                      key={actionId}
                      className="px-6 py-6 text-center min-w-[120px]"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`p-2 rounded-xl bg-black/5 dark:bg-white/5 ${meta.isHighRisk ? "text-red-500" : "text-gray-400"}`}
                        >
                          <Icon size={18} />
                        </div>
                        <span>{meta.label}</span>
                      </div>
                    </th>
                  );
                })}
                <th className="px-8 py-6 text-right pr-10">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {resources.map(([resource, availableActions]) => {
                const enabledCount = allActions.filter(
                  (a) =>
                    availableActions.has(a) &&
                    enabledPerms.has(makeKey(resource, a)),
                ).length;
                const totalAvailable = Array.from(availableActions).filter(
                  (a) => allActions.includes(a),
                ).length;

                return (
                  <tr
                    key={resource}
                    className="group hover:bg-black/5 dark:hover:bg-white/[0.01] transition-all"
                  >
                    <td className="px-8 py-6 sticky left-0 z-20 bg-gray-50 dark:bg-[#0a0a0a] group-hover:bg-gray-100 dark:group-hover:bg-[#121212] border-r border-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleRow(resource)}
                          className={`
                             w-8 h-8 rounded-lg flex items-center justify-center transition-all border-2
                             ${
                               enabledCount === totalAvailable
                                 ? "bg-accent-strong border-accent-strong text-white"
                                 : enabledCount > 0
                                   ? "bg-accent-strong/20 border-accent-strong text-accent-strong"
                                   : "bg-transparent border-white/10 text-transparent hover:border-white/30"
                             }
                           `}
                          title="Toggle All Module Actions"
                        >
                          {enabledCount === totalAvailable ? (
                            <Check size={16} strokeWidth={4} />
                          ) : enabledCount > 0 ? (
                            <div className="w-3 h-0.5 bg-current rounded-full" />
                          ) : (
                            <Check
                              size={16}
                              strokeWidth={4}
                              className="opacity-0"
                            />
                          )}
                        </button>
                        <div>
                          <h3 className="text-sm font-black dark:text-white leading-none mb-1.5 uppercase">
                            {prettyResource(resource)}
                          </h3>
                          <p className="text-[10px] font-medium text-gray-500 leading-tight">
                            {scope}:{resource}
                          </p>
                        </div>
                      </div>
                    </td>
                    {allActions.map((actionId) => {
                      const isAvailable = availableActions.has(actionId);
                      const isEnabled = enabledPerms.has(
                        makeKey(resource, actionId),
                      );
                      const meta = ACTION_META[actionId] || {};

                      return (
                        <td key={actionId} className="px-6 py-6 text-center">
                          {isAvailable ? (
                            <button
                              onClick={() =>
                                togglePermission(resource, actionId)
                              }
                              className={`
                              w-8 h-8 rounded-lg mx-auto flex items-center justify-center transition-all duration-200 border-2
                              ${
                                isEnabled
                                  ? "bg-accent-strong border-accent-strong text-white shadow-lg shadow-accent-strong/20 scale-105"
                                  : "bg-transparent border-white/10 text-transparent hover:border-white/30"
                              }
                              ${(meta as any).isHighRisk && isEnabled ? "bg-red-500 border-red-500 shadow-red-900/40" : ""}
                            `}
                            >
                              <Check
                                size={16}
                                strokeWidth={4}
                                className={
                                  isEnabled ? "opacity-100" : "opacity-0"
                                }
                              />
                            </button>
                          ) : (
                            <div className="w-10 h-10 mx-auto flex items-center justify-center text-gray-300 dark:text-zinc-800">
                              <X
                                size={16}
                                strokeWidth={3}
                                className="opacity-20"
                              />
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-8 py-6 text-right pr-10">
                      <div className="flex justify-end">
                        <div
                          className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter border ${
                            enabledCount === totalAvailable
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : enabledCount === 0
                                ? "bg-red-500/10 text-red-500 border-red-500/20"
                                : "bg-blue-500/10 text-accent border-accent/20"
                          }`}
                        >
                          {enabledCount === totalAvailable
                            ? "FULL ACCESS"
                            : enabledCount === 0
                              ? "RESTRICTED"
                              : "PARTIAL"}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default PermissionGrid;
