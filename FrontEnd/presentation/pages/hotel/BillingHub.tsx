"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/application/hooks/useAuth";
import type { PlanData } from "@/domain/entities/Plan";
import type { Subscription } from "@/domain/entities/Subscription";
import { repositories } from "@/infrastructure/config/container";

export default function BillingHub() {
  const { user } = useAuth();
  const tenantId = user?.tenantId ?? "";
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadBillingData() {
      if (!tenantId) {
        setSubscription(null);
        setPlan(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [sub, plans] = await Promise.all([
          repositories.subscriptions.getByTenantId(tenantId),
          repositories.plans.getAll(),
        ]);

        if (!active) return;

        setSubscription(sub);
        setPlan(sub?.planId ? plans.find((p) => p.id === sub.planId) ?? null : null);
      } catch (err) {
        if (!active) return;
        setError("Failed to load billing information.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBillingData();
    return () => {
      active = false;
    };
  }, [tenantId]);

  const normalizedStatus = useMemo(
    () => (subscription?.status ?? "").trim().toLowerCase(),
    [subscription?.status],
  );

  const statusBadgeClass =
    normalizedStatus === "active"
      ? "bg-green-100 text-green-800"
      : normalizedStatus === "expired" || normalizedStatus === "cancelled"
        ? "bg-red-100 text-red-800"
        : "bg-yellow-100 text-yellow-800";

  if (!tenantId) {
    return <div className="p-8 text-gray-500">Missing tenant context.</div>;
  }

  if (loading) return <div className="p-8">Loading billing info...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Billing & Subscription</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-medium mb-4 border-b pb-2">
          Current Subscription
        </h2>
        {subscription ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Plan
              </label>
              <div className="text-lg font-bold">
                {plan?.name ?? subscription.planId ?? "Not assigned"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Status
              </label>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass}`}
              >
                {subscription.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Start Date
              </label>
              <div>
                {subscription.startDate
                  ? new Date(subscription.startDate).toLocaleDateString()
                  : "-"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                End Date
              </label>
              <div>
                {subscription.endDate
                  ? new Date(subscription.endDate).toLocaleDateString()
                  : "Auto-renew/Indefinite"}
              </div>
            </div>
            {plan && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Max Users
                  </label>
                  <div>{plan.max_users ?? "Unlimited"}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Max Rooms
                  </label>
                  <div>{plan.max_rooms ?? "Unlimited"}</div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-gray-500">
            No subscription is configured for this hotel.
          </div>
        )}
      </div>

      {/* Invoices section removed as per migration plan */}
      <div className="bg-gray-50 border border-gray-200 rounded p-6 text-center text-gray-500">
        Invoices and payment history features are currently disabled.
      </div>
    </div>
  );
}
