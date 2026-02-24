
import React from 'react';
import { ShieldAlert, LogOut, Zap } from 'lucide-react';

interface ImpersonationBannerProps {
  hotelName: string;
  onExit: () => void;
}

const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({ hotelName, onExit }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-12 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 shadow-xl border-b border-white/20 animate-in slide-in-from-top duration-500">
      <div className="h-full max-w-[1920px] mx-auto flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-white/20 text-white animate-pulse">
              <ShieldAlert size={14} strokeWidth={3} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Security Alert</span>
           </div>
           <p className="text-[11px] font-black text-white uppercase tracking-wider">
              ⚠ IMPERSONATION MODE — You are viewing <span className="underline decoration-white/40 decoration-2 underline-offset-2">{hotelName}</span> as Hotel Manager. All actions are logged.
           </p>
        </div>

        <button 
          onClick={onExit}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white text-red-600 text-[10px] font-bold uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <LogOut size={14} strokeWidth={3} />
          Exit Impersonation
        </button>
      </div>
      
      {/* Decorative scanning line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/40 animate-[pulse_1.5s_infinite]"></div>
    </div>
  );
};

export default ImpersonationBanner;
