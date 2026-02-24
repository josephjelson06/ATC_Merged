"use client";

import React from "react";
import { useAuth } from "@/application/hooks/useAuth";

export default function HotelDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name}
        </h1>
        <p className="text-gray-500">
          Here's what's happening at your property today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Simplified Metrics for now */}
        <div className="bg-white rounded shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">Occupancy</h3>
          <p className="text-2xl font-bold text-gray-900">--%</p>
          <p className="text-xs text-gray-400 mt-1">
            Room management module disabled
          </p>
        </div>

        <div className="bg-white rounded shadow p-6 border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Revenue (MTD)</h3>
          <p className="text-2xl font-bold text-gray-900">$0.00</p>
          <p className="text-xs text-gray-400 mt-1">Invoice module disabled</p>
        </div>

        <div className="bg-white rounded shadow p-6 border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium">Active Staff</h3>
          <p className="text-2xl font-bold text-gray-900">--</p>
        </div>
      </div>

      <div className="bg-white rounded shadow p-12 text-center text-gray-500">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Getting Started
        </h3>
        <p>
          Use the sidebar to manage your staff (Users & Roles) and view your
          Subscription details.
        </p>
      </div>
    </div>
  );
}
