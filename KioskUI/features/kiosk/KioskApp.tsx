"use client";

import React, { useState, useEffect } from "react";
import { UIContext } from "../../state/uiContext";
// Agent Authority
import { AgentAdapter } from "../../agent/adapter";
import { UiState } from "../../agent/index";

// Feature slices
import { IdlePage } from "../welcome/IdlePage";
import { WelcomePage } from "../welcome/WelcomePage";
import { ScanIdPage } from "../checkin/ScanIdPage";
import { CheckInLookupPage } from "../checkin/CheckInLookupPage";
import { RoomSelectPage } from "../checkin/RoomSelectPage";
import { BookingCollectPage } from "../checkin/BookingCollectPage";
import { BookingSummaryPage } from "../checkin/BookingSummaryPage";
import { PaymentPage } from "../checkin/PaymentPage";
import { KeyDispensingPage } from "../checkin/KeyDispensingPage";
import { CompletePage } from "../completion/CompletePage";
import { LauncherPage } from "../launcher/LauncherPage";

// Components
import { ErrorBanner } from "../../components/ErrorBanner";
import { BackButton } from "../../components/BackButton";
import { CaptionsOverlay } from "../../components/CaptionsOverlay";
import { DevToolbar } from "../../components/DevToolbar";
import { getTenantSlug } from "../../services/tenant/tenantContext";

const App: React.FC = () => {
  // Local UI State (Renderer only)
  const [state, setState] = useState<UiState>("IDLE");
  const [forcedState, setForcedState] = useState<UiState | null>(null);
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tenantSelected, setTenantSelected] = useState<boolean>(false);

  // 1. CONNECT TO AGENT BRAIN
  useEffect(() => {
    // Subscribe to the Agent Adapter
    const unsubscribe = AgentAdapter.subscribe((newState, newData) => {
      console.log(
        `[APP RENDERER] Received State Update from Agent: ${newState}`,
      );
      setState(newState);
      // In a real app, 'data' would come from a View Model or State/Store mapped to the UiState.
      if (newData) {
        setData(newData);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 2. INTENT EMITTER (Forwarder to Agent)
  const emit = async (type: string, payload?: any) => {
    console.log(`[APP RENDERER] Emitting Intent: ${type}`);

    // UI Feedback: "Processing..."
    // Note: We don't disable UI for *every* intent, but for major transitions it's good practice.
    // However, since Agent is instantaneous (synchronous pure function), loading is minimal.
    // We'll keep it simple.

    if (type === "ERROR_DISMISSED") {
      setError(null);
      // If error clearing needs to change state, dispatch an intent.
      // Current design: ERROR state handles dismissal via BACK/TOUCH.
      return;
    }

    try {
      // Send to Authority
      AgentAdapter.dispatch(type as any, payload);
    } catch (e) {
      console.error("Agent Error", e);
      setError("System Error");
    }
  };

  const effectiveState = forcedState ?? state;
  const hasTenant = Boolean(getTenantSlug().trim()) || tenantSelected;

  const handleTenantSelected = () => {
    AgentAdapter.dispatch("RESET" as any);
    setTenantSelected(true);
  };

  // 3. DUMB ROUTER (State -> Component)
  // CRITICAL: This is a pure switch on Agent State. No logic allowed.
  const renderPage = () => {
    switch (effectiveState) {
      case "IDLE":
        return <IdlePage />;

      // WelcomePage handles both Voice and Manual visual modes
      case "WELCOME":
        return <WelcomePage visualMode="voice" />;
      case "AI_CHAT":
        return <WelcomePage visualMode="voice" />;
      case "MANUAL_MENU":
        return <WelcomePage visualMode="manual" />;

      case "SCAN_ID":
        return <ScanIdPage />;
      case "CHECKIN_LOOKUP":
        return <CheckInLookupPage />;
      case "ROOM_SELECT":
        return <RoomSelectPage />;
      case "BOOKING_COLLECT":
        return <BookingCollectPage />;
      case "BOOKING_SUMMARY":
        return <BookingSummaryPage />;
      case "PAYMENT":
        return <PaymentPage />;

      case "KEY_DISPENSING":
        return <KeyDispensingPage />;

      // Complete Page
      case "COMPLETE":
        return <CompletePage />;

      // Error State (Runtime)
      case "ERROR":
        return (
          <div
            className="h-screen w-full flex flex-col items-center justify-center bg-red-900/20 text-white"
            onClick={() => emit("TOUCH_SELECTED")}
          >
            <h2 className="text-3xl font-bold mb-4">System Error</h2>
            <p>Please touch to restart.</p>
          </div>
        );

      default:
        return <IdlePage />;
    }
  };

  return (
    <UIContext.Provider value={{ state, data, emit, loading, transcript: "" }}>
      {!hasTenant ? (
        <LauncherPage onTenantSelected={handleTenantSelected} />
      ) : (
        <div className="antialiased w-full h-full relative">
          {/* Global Navigation Controls (Visibility controlled implicitly by page rendering, backing is Agent driven) */}
          {/* <BackButton /> -- Removed global back button until Phase 7C data contract is ready. */}
          {/* <BackButton /> */}

          {error && (
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          )}

          <CaptionsOverlay />

          {renderPage()}

          {/* Debug Info (To prove state comes from Agent) */}
          <div className="fixed bottom-2 right-2 z-50 bg-black/50 text-white text-xs p-1 rounded opacity-30 hover:opacity-100 pointer-events-none">
            Authority: AgentAdapter | State: {state}
            {forcedState ? ` | Override: ${forcedState}` : ""}
          </div>

          {/* Development Toolbar */}
          <DevToolbar
            onForceState={(next) => setForcedState(next as UiState | null)}
            isUnlocked={Boolean(forcedState)}
            currentState={effectiveState as any}
          />
        </div>
      )}
    </UIContext.Provider>
  );
};

export default App;
