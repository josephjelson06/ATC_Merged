"use client";

import { useParams, useRouter } from "next/navigation";

import HotelDetails from "@/presentation/pages/super/HotelDetails";
import { legacyRouteToPath } from "@/application/navigation/legacyRouteMap";
import { useStartImpersonation } from "../../../impersonation";

export default function SuperHotelDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const startImpersonation = useStartImpersonation();
  const raw = params?.hotelId;
  const hotelId = Array.isArray(raw) ? raw[0] : raw;
  // const parsedHotelId = Number(hotelIdString);
  // const hotelId = Number.isFinite(parsedHotelId) ? parsedHotelId : undefined;

  return (
    <HotelDetails
      hotelId={hotelId}
      onNavigate={(route) => router.push(legacyRouteToPath(route, "super"))}
      onLoginAsAdmin={startImpersonation}
    />
  );
}
