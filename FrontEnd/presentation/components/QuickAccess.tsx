import React from 'react';
import { Building2, MonitorSmartphone, CreditCard, BarChart3, Users, Settings } from 'lucide-react';
import GlassCard from './ui/GlassCard';

const QuickAction = ({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-white/10 hover:bg-white/40 dark:hover:bg-white/5 transition-all cursor-pointer group">
    <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
      <Icon size={20} className={color.replace('bg-', 'text-')} />
    </div>
    <div>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-emerald-700 dark:group-hover:text-accent transition-colors">{title}</h4>
      <p className="text-xs text-gray-700 dark:text-gray-400">{desc}</p>
    </div>
  </div>
);

const QuickAccess: React.FC = () => {
  return (
    <GlassCard className="h-full flex flex-col">
       <div className="mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Quick Access</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
        <QuickAction 
            icon={Building2} 
            title="Hotels" 
            desc="Manage hotel registry" 
            color="bg-accent" 
        />
        <QuickAction 
            icon={MonitorSmartphone} 
            title="Kiosk Fleet" 
            desc="Monitor device health" 
            color="bg-emerald-500" 
        />
        <QuickAction 
            icon={CreditCard} 
            title="Subscriptions" 
            desc="View entitlements" 
            color="bg-amber-500" 
        />
        <QuickAction 
            icon={BarChart3} 
            title="Reports" 
            desc="Analytics & insights" 
            color="bg-purple-500" 
        />
        <QuickAction 
            icon={Users} 
            title="Team & Users" 
            desc="Manage access" 
            color="bg-indigo-500" 
        />
        <QuickAction 
            icon={Settings} 
            title="Settings" 
            desc="System configuration" 
            color="bg-gray-500" 
        />
      </div>
    </GlassCard>
  );
};

export default QuickAccess;