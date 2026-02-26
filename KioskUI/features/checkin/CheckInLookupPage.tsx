import React, { useState } from "react";
import { useUIState } from "../../state/uiContext";
import { Search, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

export const CheckInLookupPage: React.FC = () => {
  const { emit } = useUIState();
  const [guestId, setGuestId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = guestId.toUpperCase().trim();

    // Very basic format validation GS-XXXX-XX
    if (!cleanId.startsWith("GS-") || cleanId.length < 8) {
      setError("Invalid Guest ID format. Expected GS-XXXX-XX");
      return;
    }

    setError("");
    emit("CHECKIN_VERIFIED", { guestId: cleanId });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-900 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/40 text-blue-400 mb-6 border border-blue-500/30">
            <UserCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Find Your Booking</h1>
          <p className="text-slate-400">Enter the Guest ID provided to you.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Guest ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <Search size={20} />
              </div>
              <input
                type="text"
                autoFocus
                value={guestId}
                onChange={(e) => setGuestId(e.target.value)}
                placeholder="e.g. GS-1234-AB"
                className={`block w-full pl-12 pr-4 py-4 bg-slate-800 border ${
                  error ? "border-red-500/50" : "border-slate-700"
                } rounded-xl text-lg text-white placeholder-slate-500 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-400 animate-in slide-in-from-top-1">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!guestId.trim()}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all flex justify-center items-center shadow-lg shadow-blue-500/20"
          >
            Locate Booking
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => emit("CANCEL_REQUESTED")}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};
