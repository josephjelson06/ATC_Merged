"use client";

import React, { useState, useEffect } from "react";
import { Shield, Zap, Copy, ArrowRight, Check, Info } from "lucide-react";
import ModalShell from "../../components/ui/ModalShell";
import GlassInput from "../../components/ui/GlassInput";
import Button from "../../components/ui/Button";
import { useUsers } from "@/application/hooks/useUsers";

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (roleName: string) => void;
}

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { createRole } = useUsers();
  const [step, setStep] = useState(1);
  const [roleName, setRoleName] = useState("");
  const [cloneFrom, setCloneFrom] = useState<string | null>(null);

  const existingRoles = ["Super Admin", "Finance", "Operations", "Support"];

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setRoleName("");
      setCloneFrom(null);
    }
  }, [isOpen]);

  const handleInitialize = async () => {
    if (!roleName) return;
    setStep(2);
    try {
      await createRole({
        name: roleName,
        description: `Custom role based on ${cloneFrom || "scratch"}.`,
        color: "blue",
        status: "Active",
        permissions: [], // Default empty permissions
      } as any);
      setTimeout(() => {
        onCreated?.(roleName);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Failed to create role", err);
      setStep(1);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      headerContent={
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-strong text-white flex items-center justify-center shadow-lg shadow-accent-strong/20">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase leading-none">
              New Security Role
            </h2>
            <p className="text-[10px] font-bold text-accent-strong uppercase tracking-widest mt-1">
              Configure Custom Entitlements
            </p>
          </div>
        </div>
      }
      footer={
        step === 1 ? (
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Discard
            </Button>
            <Button
              variant="primary"
              size="lg"
              disabled={!roleName}
              onClick={handleInitialize}
              iconRight={<ArrowRight size={16} strokeWidth={3} />}
            >
              Generate & Edit Matrix
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="p-8 min-h-[400px] flex flex-col">
        {step === 1 ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 flex-1">
            <GlassInput
              label="Role Public Designation *"
              placeholder="e.g. Regional Auditor"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              autoFocus
            />

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Clone Permissions From (Optional)
                </label>
                <span className="text-[9px] font-bold text-gray-400 uppercase bg-black/5 px-2 py-0.5 rounded">
                  Speed up setup
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {existingRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() =>
                      setCloneFrom(role === cloneFrom ? null : role)
                    }
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${cloneFrom === role ? "bg-accent-strong border-accent-strong text-white shadow-xl" : "bg-black/5 dark:bg-white/5 border-white/5 text-gray-500 hover:border-white/10"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Copy
                        size={14}
                        className={
                          cloneFrom === role ? "text-white" : "text-gray-400"
                        }
                      />
                      <span className="text-xs font-bold uppercase tracking-tighter">
                        {role}
                      </span>
                    </div>
                    {cloneFrom === role && <Check size={14} strokeWidth={4} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-dashed border-amber-500/20 flex gap-4 items-start">
              <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                Custom roles are assigned at the platform level. To manage
                property-specific roles, use the **Hotel Panel** configuration.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-[2.5rem] bg-accent-strong text-white flex items-center justify-center shadow-2xl shadow-accent-strong/40 border-4 border-white/20">
              <Zap size={48} fill="currentColor" className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">
                Initializing Blueprint
              </h3>
              <p className="text-sm font-medium text-gray-500 mt-2">
                Deploying schema for{" "}
                <span className="text-accent-strong font-bold">
                  "{roleName}"
                </span>
                ...
              </p>
            </div>
            <div className="w-full max-w-xs h-1.5 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-accent-strong animate-[loading_1.5s_ease-in-out_infinite]"></div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes loading {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 100%; transform: translateX(0%); }
          100% { width: 100%; transform: translateX(100%); }
        }
      `}</style>
    </ModalShell>
  );
};

export default CreateRoleModal;
