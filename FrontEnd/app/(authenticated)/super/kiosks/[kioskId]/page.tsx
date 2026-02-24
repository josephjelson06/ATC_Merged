"use client";

import { useParams } from "next/navigation";
import KioskDetail from "@/presentation/pages/super/KioskDetail";

export default function SuperKioskDetailPage() {
  const params = useParams();
  const raw = params?.kioskId;
  const kioskId = Array.isArray(raw) ? raw[0] : raw;

  if (!kioskId) {
    return <div className="p-8 text-gray-500">Missing kiosk ID.</div>;
  }

  return <KioskDetail kioskId={kioskId} />;
}
