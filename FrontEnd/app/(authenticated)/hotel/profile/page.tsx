"use client";

import PermissionGate from "@/presentation/components/auth/PermissionGate";
import StaffProfile from "@/presentation/pages/hotel/StaffProfile";

export default function HotelProfilePage() {
  return (
    <PermissionGate requiredPermission="" alwaysAllow>
      <StaffProfile />
    </PermissionGate>
  );
}
