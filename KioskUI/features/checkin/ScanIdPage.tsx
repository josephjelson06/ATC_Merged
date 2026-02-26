import React, { useState } from "react";
import { useUIState } from "../../state/uiContext";
import { WebcamScanner } from "../../components/WebcamScanner";
import { ShieldCheck, User } from "lucide-react";

export const ScanIdPage: React.FC = () => {
  const { emit } = useUIState();
  const [status, setStatus] = useState<"IDLE" | "ANALYZING" | "APPROVED">(
    "IDLE",
  );
  const [guestId, setGuestId] = useState<string | null>(null);

  const generateGuestId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomChars =
      chars.charAt(Math.floor(Math.random() * chars.length)) +
      chars.charAt(Math.floor(Math.random() * chars.length));
    const randomNums = Math.floor(1000 + Math.random() * 9000);
    return `GS-${randomNums}-${randomChars}`;
  };

  const handleCapture = (imageSrc: string) => {
    setStatus("ANALYZING");
    console.log("[ScanPage] Image captured (simulated upload)");

    setTimeout(() => {
      const newId = generateGuestId();
      setGuestId(newId);
      setStatus("APPROVED");

      // Give them 3 seconds to read their new ID before advancing
      setTimeout(() => {
        emit("SCAN_COMPLETED", { guestId: newId });
      }, 3000);
    }, 1500);
  };

  const handleDemoSkip = () => {
    const newId = generateGuestId();
    emit("SCAN_COMPLETED", { guestId: newId });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in zoom-in duration-500 bg-slate-900 text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Identity Verification
        </h1>
        <p className="text-slate-400 text-lg">
          Please hold your ID card or Passport up to the camera.
        </p>
      </div>

      {/* The Scanner */}
      <div className="w-full max-w-xl mb-8">
        {status === "APPROVED" ? (
          <div className="bg-emerald-900/40 border-2 border-emerald-500/50 p-12 rounded-2xl text-emerald-100 flex flex-col items-center animate-in zoom-in shadow-2xl shadow-emerald-900/20">
            <ShieldCheck size={64} className="mb-4 text-emerald-400" />
            <h2 className="text-2xl font-bold mb-2">Verification Successful</h2>
            <div className="bg-emerald-950 px-6 py-4 rounded-xl border border-emerald-800/50 text-center mt-2">
              <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-1">
                Your Guest ID
              </p>
              <p className="text-4xl font-mono text-white tracking-widest">
                {guestId}
              </p>
              <p className="text-emerald-300/60 text-xs mt-3 max-w-[200px] leading-relaxed">
                Please note this down. You will need it for Quick Check-In.
              </p>
            </div>
          </div>
        ) : (
          <WebcamScanner onCapture={handleCapture} />
        )}
      </div>

      {/* Status Text */}
      {status === "ANALYZING" && (
        <p className="text-blue-400 font-mono animate-pulse">
          Extracting Data... verifying hologram...
        </p>
      )}

      {/* Fallback for Demo (Director Safety Net) */}
      <button
        onClick={handleDemoSkip}
        className="mt-8 text-xs text-slate-600 hover:text-slate-400 underline transition-colors"
      >
        (Demo: Skip Camera)
      </button>
    </div>
  );
};
