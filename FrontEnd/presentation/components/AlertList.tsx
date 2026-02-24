import React from 'react';
import { AlertTriangle, Clock, WifiOff, CreditCard, FileWarning } from 'lucide-react';
import GlassCard from './ui/GlassCard';

const AlertItem = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  time, 
  color 
}: { 
  icon: any, 
  title: string, 
  subtitle: string, 
  time: string, 
  color: string 
}) => (
  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group">
    <div className={`p-2 rounded-lg ${color} bg-opacity-10 shrink-0`}>
      <Icon size={18} className={color.replace('bg-', 'text-')} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-0.5">
        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate pr-2">{title}</h4>
        {time && (
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 gap-1 whitespace-nowrap">
            <Clock size={10} />
            <span>{time}</span>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-700 dark:text-gray-400 truncate mb-1">{subtitle}</p>
      {time.includes('Action needed') && (
         <span className="text-[10px] font-medium text-accent-strong bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">Action needed</span>
      )}
    </div>
  </div>
);

const AlertList: React.FC = () => {
  return (
    <GlassCard className="h-full flex flex-col" noPadding>
      <div className="px-6 py-5 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Attention Required</h3>
        </div>
        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-md">3</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <AlertItem 
          icon={WifiOff}
          title="Kiosk Offline > 24hrs"
          subtitle="ATC-SN-7766 at Lemon Tree Premier"
          time="2 hours ago"
          color="bg-red-500"
        />
        <AlertItem 
          icon={CreditCard}
          title="Payment Overdue"
          subtitle="Lemon Tree Premier - ₹25,000"
          time="9 days overdue"
          color="bg-amber-500"
        />
        <AlertItem 
          icon={FileWarning}
          title="Contract Expiring"
          subtitle="Ginger Hotel - expires in 15 days"
          time="Action needed"
          color="bg-accent"
        />
      </div>
    </GlassCard>
  );
};

export default AlertList;