import React from 'react';
import { Shield, Key, Lock, Globe, Eye, History, Smartphone, AlertCircle } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import { useTheme } from '../hooks/useTheme';

const Access: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className="p-8 space-y-8 min-h-screen pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security & Access</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Configure authentication and API entitlement settings</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold uppercase flex items-center gap-2">
          <Shield size={16} />
          System Secure
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-accent-muted text-accent"><Lock size={20} /></div>
              <h3 className="font-bold dark:text-white">Authentication Settings</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold dark:text-white">Two-Factor Authentication</h4>
                  <p className="text-xs text-gray-500">Require an OTP code for all admin logins</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className={`w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-accent after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold dark:text-white">Device Whitelisting</h4>
                  <p className="text-xs text-gray-500">Limit access to recognized hardware only</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className={`w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-accent after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-500/10 text-accent"><Key size={20} /></div>
              <h3 className="font-bold dark:text-white">API Keys</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/10 text-center">
                <p className="text-xs text-gray-500 mb-2">Primary Production Key</p>
                <code className="text-sm font-mono dark:text-white">atc_live_••••••••••••••••7x2f</code>
                <div className="flex justify-center gap-2 mt-4">
                  <button className="p-2 rounded-lg hover:bg-white dark:hover:bg-white/10 transition-colors text-gray-400"><Eye size={16} /></button>
                  <button className="p-2 rounded-lg hover:bg-white dark:hover:bg-white/10 transition-colors text-gray-400"><History size={16} /></button>
                </div>
              </div>
              <button className="w-full py-3 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-all">Generate New Token</button>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="bg-blue-600/5 border-accent-strong/20">
            <h3 className="text-lg font-black dark:text-white uppercase mb-4">Identity Verification</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              All administrative sessions are verified against your registered device signature. Unauthorized access attempts trigger a platform-wide lockdown of your individual node.
            </p>
            <button className="w-full py-3 bg-accent-strong text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">Verify Current Node</button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Access;