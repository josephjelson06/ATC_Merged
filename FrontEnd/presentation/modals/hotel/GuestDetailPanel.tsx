import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  X, ShieldCheck, ShieldAlert, CreditCard, Building2, 
  User, Clock, Calendar, ArrowRight, Printer, Mail, 
  Phone, Globe, MapPin, Edit3, Trash2, Camera, 
  ExternalLink, CheckCircle2, History, ChevronRight,
  Scan, FileText, IndianRupee, Users, Briefcase, Info,
  AlertCircle, RefreshCw
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { useModalVisibility } from '../../hooks/useModalVisibility';
import type { DetachedGuest as Guest, DetachedKYCStatus as KYCStatus } from '@/application/hooks/_detachedTypes';

interface GuestDetailPanelProps {
  isOpen: boolean;
  guest: Guest | null;
  onClose: () => void;
}

const GuestDetailPanel: React.FC<GuestDetailPanelProps> = ({ isOpen, guest, onClose }) => {
  const { isDarkMode } = useTheme();
  const { isVisible } = useModalVisibility(isOpen);
  const [isVerifying, setIsVerifying] = useState(false);
  const [localKycStatus, setLocalKycStatus] = useState<KYCStatus>('Pending');

  const normalizeKycStatus = (value?: string): KYCStatus => {
    if (value === 'Verified' || value === 'Pending' || value === 'Manual Review' || value === 'Failed') {
      return value;
    }
    return 'Pending';
  };

  useEffect(() => {
    if (isOpen) {
      setLocalKycStatus(normalizeKycStatus(guest?.kycStatus));
    }
  }, [isOpen, guest]);

  if (!isVisible && !isOpen) return null;

  // C-Form logic: Alert if Foreigner and Pending > 12h
  const isForeign = guest?.nationality === 'Foreign';
  const isCFormOverdue = isForeign && localKycStatus === 'Pending';

  const InfoField = ({ label, value, mono = false }: { label: string, value?: string, mono?: boolean }) => (
    <div>
      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-sm font-bold dark:text-white ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  );

  const simulateKyc = () => {
    setIsVerifying(true);
    setTimeout(() => {
        setIsVerifying(false);
        setLocalKycStatus('Verified');
    }, 2500);
  };

  return ReactDOM.createPortal(
    <>
      <div 
        className={`fixed inset-0 z-[9998] transition-opacity duration-300 ${isOpen ? 'opacity-100 bg-black/60 backdrop-blur-md' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div 
        className={`
          fixed inset-y-0 right-0 z-[9999] w-full max-w-5xl 
          transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) shadow-2xl
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          backdrop-blur-2xl
          ${isDarkMode ? 'bg-[#050505]/95 border-l border-white/10' : 'bg-white/95 border-l border-gray-200'}
        `}
      >
        <div className="h-full flex flex-col relative overflow-hidden">
            
            {/* 1. Booking Header Strip */}
            <div className={`px-8 py-6 border-b shrink-0 flex items-center justify-between ${isDarkMode ? 'border-white/10' : 'border-gray-200/50'} bg-black/5`}>
                <div className="flex items-center gap-6">
                    <div>
                        <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">{guest?.refId}</p>
                        <h2 className="text-2xl font-black dark:text-white tracking-tighter uppercase">{guest?.room} — {guest?.roomCategory}</h2>
                    </div>
                    <div className="h-10 w-px bg-white/10 hidden md:block"></div>
                    <div className="hidden md:flex flex-col">
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Stay Duration</p>
                        <p className="text-xs font-black dark:text-white uppercase flex items-center gap-2">
                           {guest?.checkIn} <ArrowRight size={12} className="text-gray-500" /> {guest?.checkOut} (2 Nights)
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {guest?.status === 'Reserved' && (
                        <button className="bg-accent-strong text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Check-In Now</button>
                    )}
                    {guest?.status === 'Checked-In' && (
                        <>
                            <button className="bg-accent-strong text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Complete Stay</button>
                            <button className="bg-white/5 border border-white/10 text-gray-400 p-3 rounded-2xl hover:text-white transition-all"><Clock size={20} /></button>
                        </>
                    )}
                    <button onClick={onClose} className="p-3 rounded-full hover:bg-white/10 transition-colors text-gray-400"><X size={24} /></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-12">
                        
                        {/* 2. Primary Guest Information */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-blue-500/10 text-accent"><User size={20} /></div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] dark:text-white">Primary Guest Profile</h3>
                                </div>
                                {guest?.isReturning && (
                                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-accent text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500/20 transition-all">
                                        <History size={12} /> View 3 Past Stays
                                    </button>
                                )}
                            </div>
                            <div className="p-8 rounded-[2.5rem] bg-black/5 dark:bg-white/[0.02] border border-white/5 grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-8">
                                <div className="col-span-2">
                                    <InfoField label="Full Legal Name" value={guest?.name} />
                                </div>
                                <InfoField label="Nationality" value={guest?.nationality} />
                                <InfoField label="Contact Number" value={guest?.mobile} />
                                <InfoField label="Email Address" value={guest?.email} />
                                <InfoField label="Gender / DOB" value="Male / 12 July 1992" />
                            </div>
                        </section>

                        {/* 3. KYC / Identity Verification - THE COMPLIANCE BLOCK */}
                        <section className={`rounded-[3rem] overflow-hidden border-2 transition-all ${isCFormOverdue ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.15)]' : 'border-white/5'}`}>
                            <div className={`px-8 py-5 flex items-center justify-between ${localKycStatus === 'Verified' ? 'bg-emerald-500' : 'bg-red-600'} text-white`}>
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={20} />
                                    <span className="text-xs font-black uppercase tracking-widest">Regulatory Status: {localKycStatus}</span>
                                </div>
                                {localKycStatus !== 'Verified' && (
                                    <button 
                                        onClick={simulateKyc}
                                        disabled={isVerifying}
                                        className="flex items-center gap-2 bg-white text-red-600 px-5 py-2 rounded-xl text-[10px] font-bold uppercase shadow-lg disabled:opacity-50"
                                    >
                                        {isVerifying ? <RefreshCw size={14} className="animate-spin" /> : <Scan size={14} />}
                                        {isVerifying ? 'Scanning Docs...' : 'Perform Verification Now'}
                                    </button>
                                )}
                            </div>

                            <div className="p-10 bg-black/5 dark:bg-white/[0.03]">
                                {guest?.nationality === 'Indian' ? (
                                    /* INDIAN NATIONAL KYC */
                                    <div className="grid grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Digitized Documents</p>
                                                <div className="flex gap-4">
                                                    <div className="aspect-[4/3] w-32 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center justify-center text-gray-600 hover:text-white transition-all cursor-pointer group relative">
                                                        <FileText size={28} className="group-hover:scale-110 transition-transform mb-2" />
                                                        <span className="text-[8px] font-bold uppercase">ID Front</span>
                                                        {localKycStatus === 'Verified' && <CheckCircle2 size={16} className="absolute top-2 right-2 text-emerald-500" />}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <InfoField label="ID Type" value="Aadhaar Card" />
                                                <InfoField label="ID Number" value="**** **** 4532" mono />
                                            </div>
                                        </div>
                                        <div className="space-y-8">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Live Check-in Photo</p>
                                                <div className="w-32 h-32 rounded-[2rem] bg-black/40 border border-white/10 overflow-hidden relative group cursor-pointer shadow-2xl">
                                                    <img src={`https://ui-avatars.com/api/?name=${guest?.name}&background=0D8ABC&color=fff&size=128`} alt="Guest" />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                        <Camera size={24} className="text-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* FOREIGN NATIONAL COMPLIANCE (C-FORM) */
                                    <div className="space-y-10">
                                        <div className="flex items-center justify-between pb-6 border-b border-white/5">
                                            <div className="flex items-center gap-3">
                                                <Globe size={20} className="text-accent" />
                                                <h4 className="text-sm font-black uppercase tracking-[0.2em] dark:text-white">C-Form FRRO Registry</h4>
                                            </div>
                                            {isCFormOverdue ? (
                                                <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                                                    <Clock size={14} className="animate-pulse" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Timer Active: 08:22:11 Left</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                    <CheckCircle2 size={14} />
                                                    <span className="text-[10px] font-bold uppercase tracking-tighter">ID: FRRO-MH-2026-00891</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8">
                                            <InfoField label="Passport Number" value="***4821" mono />
                                            <InfoField label="Issuing Country" value="United Kingdom" />
                                            <InfoField label="Visa Number" value="V-28374651" mono />
                                            <InfoField label="Visa Type" value="Tourist" />
                                        </div>

                                        <button className="w-full py-4 rounded-2xl bg-accent-strong text-white text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3">
                                            <FileText size={18} /> Re-Submit C-Form to Portal
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Area */}
                    <div className="lg:col-span-4 space-y-10">
                        
                        <section>
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">Stay Context</h3>
                            <GlassCard className="border-white/5 bg-black/10 dark:bg-white/[0.01]">
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-gray-500">Reserved Tier</span>
                                        <span className="dark:text-white">{guest?.roomCategory}</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-4 border-t border-white/5">
                                        <span className="text-[10px] font-bold uppercase text-gray-400">Source Channel</span>
                                        <span className="text-sm font-black dark:text-white uppercase">{guest?.source}</span>
                                    </div>
                                </div>
                            </GlassCard>
                        </section>

                        <div className="pt-10 border-t border-white/5 flex flex-col gap-4">
                             <button className="w-full py-5 rounded-3xl bg-accent-strong text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-accent-strong/20">
                                <History size={18} /> Full Stay History Report
                             </button>
                        </div>

                    </div>
                </div>
            </div>
            
        </div>
      </div>
    </>
  , document.body);
};

export default GuestDetailPanel;
