import React, { useState, useEffect } from 'react';
import { Monitor, Cpu, MapPin, Building2, CheckCircle2, ShieldCheck, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import ModalShell from '../../components/ui/ModalShell';
import GlassInput from '../../components/ui/GlassInput';
import Button from '../../components/ui/Button';

interface AddKioskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass = `w-full px-5 py-4 rounded-2xl outline-none transition-all duration-300 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-accent/50 focus:ring-4 focus:ring-accent/10`;

const selectClass = `w-full px-5 py-4 rounded-2xl outline-none transition-all duration-300 text-sm font-medium border bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-accent/50 focus:ring-4 focus:ring-accent/10 appearance-none pr-12`;

const AddKioskModal: React.FC<AddKioskModalProps> = ({ isOpen, onClose }) => {
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
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold transition-all duration-500 ${s === step ? 'bg-accent text-white shadow-xl scale-110' : s < step ? 'bg-emerald-500 text-white' : 'bg-black/5 dark:bg-white/5 text-gray-500'}`}>
            {s < step ? <CheckCircle2 size={18} strokeWidth={3} /> : s}
          </div>
          {s < totalSteps && <div className={`flex-1 h-0.5 rounded-full ${s < step ? 'bg-emerald-500' : 'bg-black/5 dark:bg-white/5'}`}></div>}
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
          <div className="w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center shadow-2xl shadow-accent-strong/40">
            <Monitor size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase leading-none">Register Kiosk Node</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1.5">Hardware Provisioning Terminal</p>
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
                  <Cpu size={20} strokeWidth={2.5} />
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em]">Hardware Identity</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                      <label className={labelClass}>Kiosk Asset ID (Public Tag)</label>
                      <input type="text" placeholder="e.g. ATC-K-0902" className={inputClass} />
                  </div>
                  <div>
                      <label className={labelClass}>Serial Number</label>
                      <input type="text" placeholder="SN-2026-XXXX" className={`${inputClass} font-mono uppercase`} />
                  </div>
                  <div>
                      <label className={labelClass}>MAC Address</label>
                      <input type="text" placeholder="00:00:00:00:00:00" className={`${inputClass} font-mono uppercase`} />
                  </div>
                  <div className="col-span-2">
                     <label className={labelClass}>Hardware Model Tier</label>
                     <div className="grid grid-cols-3 gap-3">
                        {['Floor Standing', 'Desktop', 'Wall Mount'].map(type => (
                          <button key={type} className="p-4 rounded-2xl border border-white/5 bg-black/5 dark:bg-white/[0.02] text-[10px] font-bold uppercase text-gray-500 hover:text-white hover:border-accent/50 transition-all">
                             {type}
                          </button>
                        ))}
                     </div>
                  </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex items-center gap-3 text-accent">
                  <Building2 size={20} strokeWidth={2.5} />
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em]">Property Assignment</h3>
              </div>
              <div className="space-y-6">
                  <div>
                     <label className={labelClass}>Target Hotel Account</label>
                     <div className="relative">
                        <select className={selectClass}>
                           <option>Select a property...</option>
                           <option>Royal Orchid Bangalore</option>
                           <option>Lemon Tree Premier</option>
                           <option>Ginger Hotel, Panjim</option>
                           <option>Taj Palace, Delhi</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                     </div>
                  </div>
                  <div>
                      <label className={labelClass}>Specific Deployment Location</label>
                      <div className="relative group">
                         <input type="text" placeholder="e.g. Main Lobby - North Wing" className={`${inputClass} pl-12`} />
                         <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors z-10" />
                      </div>
                  </div>
                  <div className="p-6 rounded-[2.5rem] bg-accent/5 border border-accent/20 flex gap-4">
                     <ShieldCheck size={24} className="text-accent shrink-0" />
                     <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                        Mapping this kiosk to a hotel will immediately sync its branding, UI settings, and PMS integration logic.
                     </p>
                  </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-500">
               <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-900/40 relative">
                  <CheckCircle2 size={48} strokeWidth={2.5} />
                  <div className="absolute inset-0 bg-emerald-500 rounded-[2.5rem] animate-ping opacity-20"></div>
               </div>
               <div className="space-y-2">
                  <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Ready for Boot</h3>
                  <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">
                     Hardware identity verified. Hotel mapping complete. Click below to initialize the terminal heartbeat.
                  </p>
               </div>
               <div className="w-full grid grid-cols-2 gap-4 p-8 rounded-[3rem] bg-black/5 dark:bg-white/[0.02] border border-white/5">
                  <div className="text-left">
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Asset Assigned</p>
                     <p className="text-sm font-bold dark:text-white uppercase">ATC-K-XXXX</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Status</p>
                     <p className="text-sm font-bold text-emerald-500 uppercase">Provisioned</p>
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
            Re-Check
          </Button>
          <Button
            variant={step === totalSteps ? 'action' : 'primary'}
            size="lg"
            onClick={() => step === totalSteps ? onClose() : setStep(step + 1)}
            iconRight={<ChevronRight size={16} strokeWidth={3} />}
          >
            {step === totalSteps ? 'Activate Terminal' : 'Next Stage'}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
};

export default AddKioskModal;