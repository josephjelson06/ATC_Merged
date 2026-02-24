"use client";

import React from "react";
import HotelUsers from "./HotelUsers";
import { useHotelStaff } from "../../../application/hooks/useHotelStaff";
import { useAuth } from "@/application/hooks/useAuth";

export default function HotelRoles() {
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  useHotelStaff(tenantId || "");

  return <HotelUsers initialTab="ROLES" />;
}
