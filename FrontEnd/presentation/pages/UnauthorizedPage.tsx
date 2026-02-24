import React from 'react';
import { ShieldOff, ArrowLeft } from 'lucide-react';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in-95 duration-700">
      
      {/* Icon */}
      <div className="w-28 h-28 rounded-[2.5rem] bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center mb-8 shadow-2xl shadow-red-500/10">
        <ShieldOff size={56} className="text-red-500" />
      </div>

      {/* Title */}
      <h1 className="text-4xl font-black dark:text-white uppercase tracking-tighter mb-3">
        Access Denied
      </h1>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest max-w-md mb-8">
        You do not have the required permissions to view this page. Contact your administrator for access.
      </p>

      {/* Error Code Badge */}
      <div className="px-6 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-10">
        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Error 403 — Forbidden</span>
      </div>

      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 text-sm font-bold dark:text-white hover:border-accent/30 transition-all group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Go Back
      </button>
    </div>
  );
};

export default UnauthorizedPage;
