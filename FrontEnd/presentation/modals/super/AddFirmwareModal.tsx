import React, { useState, useEffect } from "react";
import {
  Binary,
  Cpu,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Upload,
  Zap,
  Terminal,
  Globe,
} from "lucide-react";
import ModalShell from "../../components/ui/ModalShell";
import Button from "../../components/ui/Button";

interface AddFirmwareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass = `w-full px-5 py-4 rounded-2xl outline-none transition-all duration-300 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-accent/50 focus:ring-4 focus:ring-accent/10`;

const AddFirmwareModal: React.FC<AddFirmwareModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  const labelClass = `block text-[10px] font-bold uppercase tracking-[0.2em] mb-3 text-gray-500 dark:text-gray-400`;

  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-10">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold transition-all duration-500 ${s === step ? "bg-accent-strong text-white shadow-xl scale-110" : s < step ? "bg-emerald-500 text-white" : "bg-black/5 dark:bg-white/5 text-gray-500"}`}
          >
            {s < step ? <CheckCircle2 size={18} strokeWidth={3} /> : s}
          </div>
          {s < totalSteps && (
            <div
              className={`flex-1 h-0.5 rounded-full ${s < step ? "bg-emerald-500" : "bg-black/5 dark:bg-white/5"}`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      headerContent={
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent-strong text-white flex items-center justify-center shadow-2xl shadow-accent-strong/40">
            <Binary size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase leading-none">
              New Firmware Release
            </h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1.5">
              Production Build Forge
            </p>
          </div>
        </div>
      }
    >
      <div className="p-10 min-h-[480px] flex flex-col">
        <StepIndicator />

        <div className="flex-1">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex items-center gap-3 text-accent">
                <Terminal size={20} strokeWidth={2.5} />
                <h3 className="text-sm font-bold uppercase tracking-[0.2em]">
                  Build Metadata
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Version Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. v2.3.0"
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Release Channel</label>
                  <select
                    className={inputClass}
                    defaultValue="Stable (Production)"
                  >
                    <option>Alpha (Internal)</option>
                    <option>Beta (Testing)</option>
                    <option>Stable (Production)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>
                    Firmware Binary (.BIN / .HEX)
                  </label>
                  <div className="p-10 rounded-[2.5rem] border-2 border-dashed border-white/10 bg-black/5 dark:bg-white/[0.01] hover:border-accent/50 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer group">
                    <Upload
                      size={32}
                      className="text-gray-500 group-hover:scale-110 transition-transform"
                    />
                    <span className="text-xs font-bold uppercase text-gray-500 tracking-widest">
                      Click to upload build artifact
                    </span>
                    <span className="text-[9px] font-medium text-gray-600 italic">
                      Max size: 128 MB
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex items-center gap-3 text-emerald-500">
                <Cpu size={20} strokeWidth={2.5} />
                <h3 className="text-sm font-bold uppercase tracking-[0.2em]">
                  Compatibility Mapping
                </h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Target Hardware Tier</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Gen 3 Floor Unit",
                      "Gen 3 Desktop",
                      "Legacy Hardware",
                      "Alpha Prototypes",
                    ].map((tier) => (
                      <label
                        key={tier}
                        className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-black/5 dark:bg-white/[0.02] cursor-pointer hover:bg-white/5 transition-all"
                      >
                        <span className="text-[11px] font-medium dark:text-gray-300 uppercase">
                          {tier}
                        </span>
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded-md border-white/10 bg-black text-accent-strong"
                          defaultChecked
                        />
                      </label>
                    ))}
                  </div>
                </div>
                <div className="p-6 rounded-[2.5rem] bg-accent/5 border border-accent/20 flex gap-4">
                  <ShieldCheck size={24} className="text-accent shrink-0" />
                  <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                    Checksum verification will be performed automatically after
                    upload. Deployment is restricted if checksum mismatches.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 rounded-[2.5rem] bg-accent-strong text-white flex items-center justify-center shadow-2xl shadow-accent-strong/40 relative">
                <Zap size={48} strokeWidth={2.5} fill="currentColor" />
                <div className="absolute inset-0 bg-accent-strong rounded-[2.5rem] animate-ping opacity-20"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">
                  Authorize Publication
                </h3>
                <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">
                  Firmware build verified and compatible with Gen 3 fleet.
                  Clicking publish will make it available for OTA deployment.
                </p>
              </div>
              <div className="w-full grid grid-cols-2 gap-4 p-8 rounded-[3rem] bg-black/5 dark:bg-white/[0.02] border border-white/5">
                <div className="text-left">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Build ID
                  </p>
                  <p className="text-sm font-bold dark:text-white uppercase font-mono">
                    HASH: 4X9F2A
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Global Availability
                  </p>
                  <p className="text-sm font-bold text-accent uppercase flex items-center justify-end gap-2">
                    <Globe size={14} /> Ready to Deploy
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="mt-12 flex justify-between items-center border-t border-white/5 pt-8">
          <Button
            variant="ghost"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            icon={<ChevronLeft size={16} strokeWidth={3} />}
          >
            Previous
          </Button>
          <Button
            variant={step === totalSteps ? "action" : "primary"}
            size="lg"
            onClick={() =>
              step === totalSteps ? onClose() : setStep(step + 1)
            }
            iconRight={<ChevronRight size={16} strokeWidth={3} />}
          >
            {step === totalSteps ? "Publish Release" : "Next Stage"}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
};

export default AddFirmwareModal;
