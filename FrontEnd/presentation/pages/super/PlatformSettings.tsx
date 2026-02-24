"use client";

import { useMemo, useState } from "react";

import { useSettings } from "@/application/hooks/useSettings";
import GlassCard from "@/presentation/components/ui/GlassCard";
import PageHeader from "@/presentation/components/ui/PageHeader";

export default function PlatformSettings() {
  const { platformSettings, savePlatformSettings } = useSettings();
  const [form, setForm] = useState(platformSettings);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const canSave = useMemo(
    () =>
      form.defaultSubscriptionMonths > 0 &&
      form.gracePeriodDays >= 0 &&
      Number.isFinite(form.defaultSubscriptionMonths) &&
      Number.isFinite(form.gracePeriodDays),
    [form.defaultSubscriptionMonths, form.gracePeriodDays],
  );

  const onSave = () => {
    if (!canSave) return;
    savePlatformSettings(form);
    setSavedAt(new Date().toLocaleTimeString());
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <PageHeader
        title="Platform Settings"
        subtitle="Global feature toggles and default terms"
      />

      <GlassCard className="border-white/10 max-w-4xl">
        <div className="space-y-6">
          <Toggle
            label="Enable Audit Alerts"
            checked={form.enableAuditAlerts}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, enableAuditAlerts: value }))
            }
          />
          <Toggle
            label="Allow Self Onboarding"
            checked={form.allowSelfOnboarding}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, allowSelfOnboarding: value }))
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Default Subscription (months)"
              type="number"
              value={String(form.defaultSubscriptionMonths)}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  defaultSubscriptionMonths: Number(value || 0),
                }))
              }
            />
            <Input
              label="Grace Period (days)"
              type="number"
              value={String(form.gracePeriodDays)}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  gracePeriodDays: Number(value || 0),
                }))
              }
            />
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-white/10 flex items-center gap-3">
          <button
            onClick={onSave}
            disabled={!canSave}
            className="px-4 py-3 rounded-xl bg-accent-strong text-white text-sm font-black uppercase tracking-wider disabled:opacity-50"
          >
            Save Settings
          </button>
          {savedAt && (
            <span className="text-xs font-bold text-emerald-500">
              Saved at {savedAt}
            </span>
          )}
          <span className="text-xs font-medium text-gray-500">
            Stored in browser for now.
          </span>
        </div>
      </GlassCard>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black/5 dark:bg-white/5 px-4 py-3">
      <span className="text-sm font-bold dark:text-white">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
    </label>
  );
}

function Input({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 text-sm font-medium"
      />
    </div>
  );
}
