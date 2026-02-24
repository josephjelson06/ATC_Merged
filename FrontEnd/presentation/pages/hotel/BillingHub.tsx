"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/application/hooks/useAuth";
import { useSubscriptions } from "@/application/hooks/useSubscriptions";

export default function BillingHub() {
  const { user } = useAuth();
  // In a real app we might fetch specific sub for this tenant
  const { subscriptions, loading, fetchSubscriptions } = useSubscriptions();

  // Filter for THIS tenant's subscription (mock logic mostly since we use getAll currently)
  const mySub = subscriptions.find((s) => s.tenantId === user?.tenantId);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  if (loading) return <div className="p-8">Loading billing info...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Billing & Subscription</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-medium mb-4 border-b pb-2">
          Current Subscription
        </h2>
        {mySub ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Plan
              </label>
              <div className="text-lg font-bold">
                {mySub.planId || "Unknown Pllan"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Status
              </label>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  mySub.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {mySub.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Start Date
              </label>
              <div>
                {mySub.startDate
                  ? new Date(mySub.startDate).toLocaleDateString()
                  : "-"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                End Date
              </label>
              <div>
                {mySub.endDate
                  ? new Date(mySub.endDate).toLocaleDateString()
                  : "Auto-renew/Indefinite"}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">No active subscription found.</div>
        )}
      </div>

      {/* Invoices section removed as per migration plan */}
      <div className="bg-gray-50 border border-gray-200 rounded p-6 text-center text-gray-500">
        Invoices and payment history features are currently disabled.
      </div>
    </div>
  );
}
