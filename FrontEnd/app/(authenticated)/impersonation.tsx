"use client";

import { createContext, useContext } from "react";

export type StartImpersonation = (hotelName: string) => void;

const ImpersonationContext = createContext<StartImpersonation | null>(null);

export function ImpersonationProvider({
  children,
  startImpersonation,
}: {
  children: React.ReactNode;
  startImpersonation: StartImpersonation;
}) {
  return (
    <ImpersonationContext.Provider value={startImpersonation}>
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useStartImpersonation(): StartImpersonation {
  const ctx = useContext(ImpersonationContext);
  if (!ctx) {
    throw new Error("useStartImpersonation must be used within ImpersonationProvider");
  }
  return ctx;
}

