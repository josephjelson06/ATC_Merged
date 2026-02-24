import React, { useState, useEffect } from "react";
import { Shield, Zap, ArrowRight, Copy, Check } from "lucide-react";
import ModalShell from "../../components/ui/ModalShell";
import GlassInput from "../../components/ui/GlassInput";
import Button from "../../components/ui/Button";
import { useHotelStaff } from "@/application/hooks/useHotelStaff";

interface CreateHotelRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (roleName: string) => void;
  tenantId?: string;
}

const textareaClass = `w-full px-4 py-4 rounded-2xl outline-none transition-all duration-200 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-accent/50 focus:ring-4 focus:ring-accent/10 resize-none`;

const CreateHotelRoleModal: React.FC<CreateHotelRoleModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  tenantId,
}) => {
  const { createRole } = useHotelStaff(tenantId || "");
  const [step, setStep] = useState(1);
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [cloneFrom, setCloneFrom] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templates = [
    "Front Desk",
    "Housekeeping",
    "Maintenance",
    "Night Auditor",
  ];

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setRoleName("");
      setRoleDesc("");
      setCloneFrom(null);
      setError(null);
    }
  }, [isOpen]);

  const handleInitialize = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setStep(2);

      const newRole = await createRole({
        name: roleName || "New Property Role",
        description:
          roleDesc || "Custom property role created via admin entry.",
        color: "blue",
        status: "Active",
      });

      setTimeout(() => {
        onCreated?.(newRole.name);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || "Failed to create role");
      setStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      headerContent={
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent-strong/20">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black dark:text-white tracking-tighter uppercase leading-none">
              New Property Role
            </h2>
            <p className="text-[10px] font-bold text-accent-strong uppercase tracking-widest mt-1">
              Operational Policy Setup
            </p>
          </div>
        </div>
      }
      footer={
        step === 1 ? (
          <div className="flex justify-end gap-3 p-6 pt-0">
            <Button variant="ghost" onClick={onClose}>
              Discard
            </Button>
            <Button
              variant="action"
              size="lg"
              disabled={!roleName || isSubmitting}
              onClick={handleInitialize}
              iconRight={
                !isSubmitting ? (
                  <ArrowRight size={16} strokeWidth={3} />
                ) : undefined
              }
            >
              {isSubmitting ? "Generating..." : "Generate & Customize Rights"}
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="p-8 min-h-[400px] flex flex-col">
        {step === 1 ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 flex-1">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest">
                {error}
              </div>
            )}

            <GlassInput
              label="Role Functional Name *"
              placeholder="e.g. Concierge Supervisor"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              autoFocus
            />

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-500 dark:text-gray-400">
                Work Scope Description
              </label>
              <textarea
                rows={2}
                className={textareaClass}
                placeholder="Describe what this role is authorized to perform..."
                value={roleDesc}
                onChange={(e) => setRoleDesc(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Clone From Template
                </label>
                <span className="text-[9px] font-bold text-gray-400 uppercase bg-black/5 px-2 py-0.5 rounded">
                  Optional
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((tpl) => (
                  <button
                    key={tpl}
                    onClick={() => setCloneFrom(tpl === cloneFrom ? null : tpl)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${cloneFrom === tpl ? "bg-accent-strong border-accent-strong text-white shadow-xl" : "bg-black/5 dark:bg-white/5 border-white/5 text-gray-500 hover:border-white/10"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Copy
                        size={14}
                        className={
                          cloneFrom === tpl ? "text-white" : "text-gray-400"
                        }
                      />
                      <span className="text-xs font-bold uppercase tracking-tighter">
                        {tpl}
                      </span>
                    </div>
                    {cloneFrom === tpl && <Check size={14} strokeWidth={4} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-[2.5rem] bg-accent text-white flex items-center justify-center shadow-2xl shadow-accent-strong/40 border-4 border-white/20">
              <Zap size={48} fill="currentColor" className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">
                Deploying Blueprint
              </h3>
              <p className="text-sm font-medium text-gray-500 mt-2">
                Initializing logical schema for{" "}
                <span className="text-accent font-bold">"{roleName}"</span>...
              </p>
            </div>
            <div className="w-full max-w-xs h-1.5 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-accent animate-[loading_1.5s_ease-in-out_infinite]"></div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes loading {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 100%; transform: translateX(0%); }
          100% { width: 0%; transform: translateX(100%); }
        }
      `}</style>
    </ModalShell>
  );
};

export default CreateHotelRoleModal;
