"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import AppShell from "@/presentation/components/layout/AppShell";
import ImpersonationModal from "@/presentation/components/ui/ImpersonationModal";
import { useAuth } from "@/application/hooks/useAuth";

import {
  deleteCookie,
  getCookie,
  setCookie,
} from "@/infrastructure/browser/cookies";
import {
  legacyRouteToPath,
  pathnameToLegacyRoute,
  type ViewMode,
} from "@/application/navigation/legacyRouteMap";
import { ImpersonationProvider } from "./impersonation";

const AUTH_COOKIE = "hms_auth";
const ROLE_COOKIE = "hms_role";
const IMPERSONATING_COOKIE = "hms_impersonating";
const IMPERSONATED_HOTEL_COOKIE = "hms_impersonated_hotel";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [ready, setReady] = useState(false);
  const { user: authUser, loading: authLoading } = useAuth();

  // Layout state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Impersonation state
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedHotel, setImpersonatedHotel] = useState<string | null>(
    null,
  );
  const [isImpModalOpen, setIsImpModalOpen] = useState(false);

  const viewMode: ViewMode = pathname.startsWith("/hotel") ? "hotel" : "super";
  const currentRoute = useMemo(
    () => pathnameToLegacyRoute(pathname),
    [pathname],
  );

  useEffect(() => {
    // Close mobile menu on route change.
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (authLoading) return;

    const isAuthed = getCookie(AUTH_COOKIE) === "1";
    const role = getCookie(ROLE_COOKIE) as ViewMode;

    if (!isAuthed || !authUser) {
      deleteCookie(AUTH_COOKIE);
      deleteCookie(ROLE_COOKIE);
      deleteCookie(IMPERSONATING_COOKIE);
      deleteCookie(IMPERSONATED_HOTEL_COOKIE);
      window.location.href = `/login?from=${encodeURIComponent(pathname)}`;
      return;
    }

    // Role Enforcement: If user is in wrong section, redirect them to their correct dashboard
    if (role === "hotel" && viewMode === "super") {
      router.replace("/hotel/dashboard");
      return;
    }
    if (role === "super" && viewMode === "hotel") {
      // Allow 'super' to access hotel pages ONLY if they are impersonating.
      const isImp = getCookie(IMPERSONATING_COOKIE) === "1";
      if (!isImp) {
        router.replace("/super/dashboard");
        return;
      }
    }

    if (authUser?.isOrphan) {
      const profilePath =
        role === "hotel" ? "/hotel/profile" : "/super/profile";
      if (pathname !== profilePath) {
        router.replace(profilePath);
        return;
      }
    }

    const isImp = getCookie(IMPERSONATING_COOKIE) === "1";
    const hotel = getCookie(IMPERSONATED_HOTEL_COOKIE);
    setIsImpersonating(isImp && !!hotel);
    setImpersonatedHotel(hotel);

    setReady(true);
  }, [authLoading, authUser?.isOrphan, pathname, router, viewMode]);

  const startImpersonation = useCallback((hotelName: string) => {
    setImpersonatedHotel(hotelName);
    setIsImpModalOpen(true);
  }, []);

  const closeImpModal = useCallback(() => {
    setIsImpModalOpen(false);
  }, []);

  const confirmImpersonation = useCallback(() => {
    setIsImpModalOpen(false);
    if (!impersonatedHotel) return;

    setCookie(IMPERSONATING_COOKIE, "1", {
      maxAgeSeconds: 60 * 60 * 8,
      sameSite: "lax",
    });
    setCookie(IMPERSONATED_HOTEL_COOKIE, impersonatedHotel, {
      maxAgeSeconds: 60 * 60 * 8,
      sameSite: "lax",
    });
    setIsImpersonating(true);

    router.push("/hotel/dashboard");
  }, [impersonatedHotel, router]);

  const onNavigate = useCallback(
    (route: string) => {
      router.push(legacyRouteToPath(route, viewMode));
    },
    [router, viewMode],
  );

  const onLogout = useCallback(() => {
    deleteCookie(AUTH_COOKIE);
    deleteCookie(ROLE_COOKIE);
    deleteCookie(IMPERSONATING_COOKIE);
    deleteCookie(IMPERSONATED_HOTEL_COOKIE);
    router.replace("/login");
  }, [router]);

  if (!ready) {
    // Keep this visually neutral to avoid any layout flash.
    return (
      <div className="h-screen w-screen bg-theme-light dark:bg-theme-dark" />
    );
  }

  return (
    <>
      <ImpersonationProvider startImpersonation={startImpersonation}>
        <AppShell
          currentRoute={currentRoute}
          viewMode={viewMode}
          isSidebarCollapsed={isSidebarCollapsed}
          isMobileMenuOpen={isMobileMenuOpen}
          isImpersonating={isImpersonating}
          impersonatedHotel={impersonatedHotel}
          onNavigate={onNavigate}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onLogout={onLogout}
          permissions={authUser?.permissions || []}
          isAdmin={Boolean(authUser?.isAdmin)}
          isOrphan={Boolean(authUser?.isOrphan)}
        >
          {children}
        </AppShell>

        <ImpersonationModal
          isOpen={isImpModalOpen}
          onClose={closeImpModal}
          onConfirm={confirmImpersonation}
          hotelName={impersonatedHotel || ""}
        />
      </ImpersonationProvider>
    </>
  );
}
