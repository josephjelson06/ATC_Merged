"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/application/hooks/useAuth";
import { useSettings } from "@/application/hooks/useSettings";
import GlassCard from "@/presentation/components/ui/GlassCard";
import PageHeader from "@/presentation/components/ui/PageHeader";

export default function HotelSettings() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? "";
  const {
    hotelSettings,
    loading,
    error,
    fetchHotelSettings,
    updateHotelSettings,
  } = useSettings();

  const [form, setForm] = useState({
    hotelName: "",
    address: "",
    timezone: "UTC",
    supportPhone: "",
    checkInTime: "",
  });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    fetchHotelSettings(tenantId);
  }, [tenantId, fetchHotelSettings]);

  useEffect(() => {
    if (!hotelSettings) return;
    setForm({
      hotelName: hotelSettings.hotelName || "",
      address: hotelSettings.address || "",
      timezone: hotelSettings.timezone || "UTC",
      supportPhone: hotelSettings.supportPhone || "",
      checkInTime: hotelSettings.checkInTime || "",
    });
  }, [hotelSettings]);

  const canSubmit = useMemo(
    () => Boolean(form.hotelName.trim() && form.timezone.trim()),
    [form.hotelName, form.timezone],
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !canSubmit) return;
    setSaving(true);
    try {
      await updateHotelSettings(tenantId, {
        hotelName: form.hotelName.trim(),
        address: form.address.trim(),
        timezone: form.timezone.trim(),
        supportPhone: form.supportPhone.trim(),
        checkInTime: form.checkInTime || undefined,
      });
      setSavedAt(new Date().toLocaleTimeString());
    } finally {
      setSaving(false);
    }
  };

  if (!tenantId) {
    return (
      <div className="p-8 text-sm font-bold text-red-500">
        Missing tenant context.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Hotel profile and operational configuration"
      />

      <GlassCard className="border-white/10 max-w-4xl">
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Hotel Name"
            value={form.hotelName}
            onChange={(value) => setForm((prev) => ({ ...prev, hotelName: value }))}
            required
          />
          <Input
            label="Timezone"
            value={form.timezone}
            onChange={(value) => setForm((prev) => ({ ...prev, timezone: value }))}
            required
          />
          <Input
            label="Support Phone"
            value={form.supportPhone}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, supportPhone: value }))
            }
          />
          <Input
            label="Check-in Time"
            value={form.checkInTime}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, checkInTime: value }))
            }
            type="time"
          />
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
              Address
            </label>
            <textarea
              value={form.address}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, address: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 text-sm font-medium min-h-[120px]"
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={!canSubmit || saving}
              className="px-4 py-3 rounded-xl bg-accent-strong text-white text-sm font-black uppercase tracking-wider disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
            {loading && <span className="text-xs font-bold text-gray-500">Loading...</span>}
            {savedAt && !saving && (
              <span className="text-xs font-bold text-emerald-500">
                Saved at {savedAt}
              </span>
            )}
            {error && <span className="text-xs font-bold text-red-500">{error}</span>}
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10 text-sm font-medium"
      />
    </div>
  );
}
