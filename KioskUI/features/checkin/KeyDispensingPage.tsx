import React, { useEffect, useState } from "react";
import { useUIState } from "../../state/uiContext";
import { ProgressBar } from "../../components/ProgressBar";
import { Key, ServerCog } from "lucide-react";

export const KeyDispensingPage: React.FC = () => {
  const { emit, data } = useUIState();
  const [status, setStatus] = useState("ENCODING");

  const progress = data.progress || {
    currentStep: 4,
    totalSteps: 4,
    steps: ["Key"],
  };

  useEffect(() => {
    // Sequence of animations for key dispensing
    const timer1 = setTimeout(() => setStatus("DISPENSING"), 2000);
    const timer2 = setTimeout(() => {
      setStatus("COMPLETE");
      emit("DISPENSE_COMPLETE");
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [emit]);

  return (
    <div className="h-screen w-full flex flex-col p-8 bg-slate-900">
      <ProgressBar
        currentStep={progress.currentStep}
        totalSteps={progress.totalSteps}
        labels={progress.steps}
      />

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div
          className={`w-40 h-40 rounded-full flex items-center justify-center mb-12 shadow-2xl transition-all duration-700
          ${status === "ENCODING" ? "bg-slate-800 shadow-blue-500/20" : ""}
          ${status === "DISPENSING" ? "bg-slate-800 shadow-purple-500/40" : ""}
          ${status === "COMPLETE" ? "bg-blue-600 shadow-blue-500/60" : ""}
        `}
        >
          {status === "ENCODING" && (
            <ServerCog size={64} className="text-blue-400 animate-pulse" />
          )}
          {status === "DISPENSING" && (
            <div className="relative">
              <Key size={64} className="text-purple-400 animate-bounce" />
              <div className="absolute top-0 w-full h-full border-t-2 border-purple-500 animate-ping rounded-full opacity-50"></div>
            </div>
          )}
          {status === "COMPLETE" && (
            <Key
              size={64}
              className="text-white transform scale-125 transition-transform duration-500"
            />
          )}
        </div>

        <h2 className="text-4xl font-light text-white mb-4 tracking-tight">
          {status === "ENCODING" && "Encoding Your Room Key"}
          {status === "DISPENSING" && "Dispensing Key Card"}
          {status === "COMPLETE" && "Key Ready!"}
        </h2>

        <p className="text-slate-400 h-6">
          {status === "ENCODING" && "Programming security access..."}
          {status === "DISPENSING" &&
            "Please take the physical card from the slot below."}
          {status === "COMPLETE" && "Completing check-in..."}
        </p>

        {/* Progress bar visual */}
        <div className="mt-16 w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-[4.5s] ease-linear"
            style={{ width: status === "COMPLETE" ? "100%" : "0%" }}
          ></div>
        </div>
      </div>
    </div>
  );
};
