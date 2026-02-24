"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSearchParams } from "next/navigation";

import Login from "@/presentation/pages/Login";
import {
  deleteCookie,
  getCookie,
  setCookie,
} from "@/infrastructure/browser/cookies";

const AUTH_COOKIE = "hms_auth";
const ROLE_COOKIE = "hms_role";
const IMPERSONATING_COOKIE = "hms_impersonating";
const IMPERSONATED_HOTEL_COOKIE = "hms_impersonated_hotel";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  useEffect(() => {
    const isAuthed = getCookie(AUTH_COOKIE) === "1";
    const role = getCookie(ROLE_COOKIE);
    if (!isAuthed) return;

    // Verify the session is actually valid with the backend before redirecting
    fetch("http://localhost:8000/auth/me", {
      credentials: "include",
      headers: {
        ...(getCookie("access_token")
          ? { Authorization: getCookie("access_token")! }
          : {}),
      },
    })
      .then((res) => {
        if (res.ok) {
          // Session is genuinely valid — redirect to dashboard
          router.replace(
            from ||
              (role === "hotel" ? "/hotel/dashboard" : "/super/dashboard"),
          );
        } else {
          // Backend rejected the session — clear stale cookies, stay on login
          deleteCookie(AUTH_COOKIE);
          deleteCookie(ROLE_COOKIE);
          deleteCookie("access_token");
          deleteCookie(IMPERSONATING_COOKIE);
          deleteCookie(IMPERSONATED_HOTEL_COOKIE);
        }
      })
      .catch(() => {
        // Backend unreachable — clear stale cookies, stay on login
        deleteCookie(AUTH_COOKIE);
        deleteCookie(ROLE_COOKIE);
        deleteCookie("access_token");
        deleteCookie(IMPERSONATING_COOKIE);
        deleteCookie(IMPERSONATED_HOTEL_COOKIE);
      });
  }, [router, from]);

  return (
    <Login
      onLogin={(role) => {
        setCookie(AUTH_COOKIE, "1", {
          maxAgeSeconds: 60 * 60 * 8,
          sameSite: "lax",
        });
        setCookie(ROLE_COOKIE, role, {
          maxAgeSeconds: 60 * 60 * 8,
          sameSite: "lax",
        });
        deleteCookie(IMPERSONATING_COOKIE);
        deleteCookie(IMPERSONATED_HOTEL_COOKIE);

        router.replace(
          from || (role === "hotel" ? "/hotel/dashboard" : "/super/dashboard"),
        );
      }}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
